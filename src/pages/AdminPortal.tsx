import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  getDoc, 
  doc,
  updateDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'motion/react';
import { 
  Loader2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Settings,
  QrCode
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Booking, PlatformSettings, WorkerProfile, CommissionBill } from '../types';

export default function AdminPortal() {
  // ... current state ...
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [bills, setBills] = useState<CommissionBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [editSettings, setEditSettings] = useState<Partial<PlatformSettings>>({});
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeWorkers: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email?.toLowerCase() !== 'manitt.kedia@gmail.com') {
        navigate('/dashboard');
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          if (userData.role !== 'admin') {
            await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
          }
          await fetchAdminData();
          await fetchSettings();
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user?.uid}`);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchSettings = async () => {
    const sDoc = await getDoc(doc(db, 'settings', 'platform'));
    if (sDoc.exists()) {
      const data = sDoc.data() as PlatformSettings;
      setSettings(data);
      setEditSettings(data);
    } else {
      const defaultSettings: PlatformSettings = {
        adminUpiId: 'manitt.kedia@okaxis',
        commissionPercentage: 5,
        adminEmails: ['manitt.kedia@gmail.com']
      };
      await setDoc(doc(db, 'settings', 'platform'), defaultSettings);
      setSettings(defaultSettings);
      setEditSettings(defaultSettings);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'platform'), editSettings, { merge: true });
      setSettings(editSettings as PlatformSettings);
      alert('Settings updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/platform');
    }
  };

  const fetchAdminData = async () => {
    try {
      const uSnap = await getDocs(collection(db, 'users'));
      const uList = uSnap.docs.map(d => d.data() as UserProfile);
      setUsers(uList);

      const bSnap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
      const bList = bSnap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      setBookings(bList);

      const wSnap = await getDocs(collection(db, 'workers'));
      const wList = wSnap.docs.map(d => d.data() as WorkerProfile);
      setWorkers(wList);

      const billSnap = await getDocs(query(collection(db, 'commissionBills'), orderBy('createdAt', 'desc')));
      setBills(billSnap.docs.map(d => ({ id: d.id, ...d.data() } as CommissionBill)));

      const totalGmv = bList.reduce((acc, b) => b.status === 'completed' ? acc + b.amount : acc, 0);

      setStats({
        totalUsers: uList.length,
        totalBookings: bList.length,
        totalRevenue: totalGmv,
        activeWorkers: wList.length
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'admin_collections');
    }
  };

  const handleMonthlyBillRun = async () => {
    if (!settings) return;
    setLoading(true);
    try {
      const monthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      
      for (const worker of workers) {
        const workerId = worker.uid;
        const workerBookings = bookings.filter(b => b.workerId === workerId && b.status === 'completed');
        const revenue = workerBookings.reduce((acc, b) => acc + b.amount, 0);
        
        if (revenue > 0) {
          const commission = Math.round(revenue * (settings.commissionPercentage / 100));
          await addDoc(collection(db, 'commissionBills'), {
            workerId,
            month: monthStr,
            totalRevenue: revenue,
            commissionAmount: commission,
            status: 'unpaid',
            dueDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
            createdAt: serverTimestamp()
          });
          
          await updateDoc(doc(db, 'users', workerId), { commissionLock: true });

          // Send Email Notification (Server proxy)
          await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: `Platform Commission Bill Generated - ${monthStr}`,
              body: `Hello,\n\nA new commission bill of ₹${commission} has been generated for ${monthStr}. Your dashboard is temporarily locked until payment is settled via UPI QR in your portal.\n\nThank you,\nManittech Admin`
            })
          });
        }
      }
      alert('Monthly bill run completed. Dashboards locked.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'monthly_bills');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (uid: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole as any } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const verifyCommissionPayment = async (billId: string, workerId: string) => {
    try {
      await updateDoc(doc(db, 'commissionBills', billId), { status: 'paid' });
      setBills(prev => prev.map(b => b.id === billId ? { ...b, status: 'paid' } : b));
      
      const stillUnpaid = bills.filter(b => b.workerId === workerId && b.id !== billId && (b.status === 'unpaid' || b.status === 'pending_verification')).length > 0;
      if (!stillUnpaid) {
        await updateDoc(doc(db, 'users', workerId), { commissionLock: false });
      }
      alert('Payment verified and unlocked if applicable.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `commissionBills/${billId}`);
    }
  };
  const updateWorkerPII = async (uid: string, field: string, value: string) => {
    try {
      await updateDoc(doc(db, 'workers', uid), { [field]: value });
      setWorkers(prev => prev.map(w => w.uid === uid ? { ...w, [field]: value } : w));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `workers/${uid}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-12">
        <div className="space-y-4">
          <div className="badge-minimal">Central Administration</div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">
            Command <br />
            <span className="text-indigo-600">Center.</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleMonthlyBillRun}
            className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
          >
            <Calendar size={14} /> Run Monthly Bills
          </button>
          <div className="text-right border-l pl-6 border-slate-200">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status</p>
             <div className="flex items-center gap-2 text-green-500 font-bold italic">
               <ShieldCheck size={16} /> Operational
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="card-minimal bg-white p-8 space-y-6">
          <div className="flex items-center gap-2 text-indigo-600">
            <Settings size={20} />
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Platform Config</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin UPI ID (for commissions)</label>
              <input 
                value={editSettings.adminUpiId}
                onChange={(e) => setEditSettings({...editSettings, adminUpiId: e.target.value})}
                className="input-minimal w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Commission %</label>
              <input 
                type="number"
                value={editSettings.commissionPercentage}
                onChange={(e) => setEditSettings({...editSettings, commissionPercentage: parseInt(e.target.value)})}
                className="input-minimal w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">QR Logo (Upload file)</label>
              <div className="flex items-center gap-4">
                {editSettings.qrLogoUrl && (
                  <img src={editSettings.qrLogoUrl} alt="Logo Preview" className="w-12 h-12 rounded-lg object-contain border border-slate-200 bg-slate-50" />
                )}
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 200000) {
                        alert("File is too large. Please use a logo under 200KB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditSettings({...editSettings, qrLogoUrl: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                />
              </div>
              <p className="text-[8px] text-slate-400 italic">Recommended: Square PNG with transparent background.</p>
            </div>
            <button 
              onClick={handleUpdateSettings}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Update Settings
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-minimal bg-white p-6 space-y-2">
            <p className="text-3xl font-black text-slate-900 italic">{stats.totalUsers}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Users</p>
          </div>
          <div className="card-minimal bg-white p-6 space-y-2 relative group">
            <p className="text-3xl font-black text-slate-900 italic">{stats.activeWorkers}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Workers</p>
          </div>
          <div className="card-minimal bg-slate-900 text-white p-6 space-y-2">
            <p className="text-3xl font-black text-white italic">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GMV Completed</p>
          </div>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Needs Verification ({bills.filter(b => b.status === 'pending_verification').length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.filter(b => b.status === 'pending_verification').map(bill => (
            <div key={bill.id} className="card-minimal bg-white p-6 border-l-4 border-amber-500 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Worker ID</p>
                  <p className="text-xs font-black italic">{bill.workerId.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Bill Month</p>
                  <p className="text-xs font-black italic">{bill.month}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg space-y-1">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Transaction / Ref ID</p>
                <p className="text-sm font-black text-indigo-600 font-mono tracking-tighter">{bill.transactionId}</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <p className="text-lg font-black italic">₹{bill.commissionAmount}</p>
                <button 
                  onClick={() => verifyCommissionPayment(bill.id!, bill.workerId)}
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-sm"
                >
                  Verify & Unlock
                </button>
              </div>
            </div>
          ))}
          {bills.filter(b => b.status === 'pending_verification').length === 0 && (
            <div className="lg:col-span-3 py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Queue Clear / No pending payments</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Worker Management (PII) */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Worker Directory & PII</h3>
          <div className="space-y-4">
            {workers.map(w => (
              <div key={w.uid} className="card-minimal bg-white p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 uppercase italic">ID: {w.uid.slice(0, 8)}</h4>
                  <span className="badge-minimal bg-indigo-50 text-indigo-600">{w.skill}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase text-slate-400">Phone</p>
                    <input 
                      value={w.phone || ''}
                      onChange={(e) => updateWorkerPII(w.uid, 'phone', e.target.value)}
                      className="text-[10px] w-full bg-slate-50 border-none rounded-md px-2 py-1"
                      placeholder="Assign Phone"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase text-slate-400">Address</p>
                    <input 
                      value={w.address || ''}
                      onChange={(e) => updateWorkerPII(w.uid, 'address', e.target.value)}
                      className="text-[10px] w-full bg-slate-50 border-none rounded-md px-2 py-1"
                      placeholder="Assign Address"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Roles */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">User Permissions</h3>
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.uid} className="card-minimal bg-white p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold">
                    {u.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{u.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                  </div>
                </div>
                <select 
                  value={u.role} 
                  onChange={(e) => updateUserRole(u.uid, e.target.value)}
                  className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 border-none rounded-lg px-3 py-1.5 focus:outline-none"
                >
                  <option value="customer">Customer</option>
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
