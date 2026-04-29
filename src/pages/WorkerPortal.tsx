import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Loader2, 
  Calendar, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  IndianRupee, 
  Edit3, 
  Save,
  AlertCircle,
  QrCode,
  CheckCircle
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, WorkerProfile, Booking, CommissionBill, PlatformSettings } from '../types';

export default function WorkerPortal() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bills, setBills] = useState<CommissionBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Partial<WorkerProfile>>({});
  const [showQrModal, setShowQrModal] = useState<{ open: boolean; upi?: string; amount?: number; label?: string; billId?: string }>({ open: false });
  const [transactionIdInput, setTransactionIdInput] = useState('');
  
  // Commission Locking
  const [isLocked, setIsLocked] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/');
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          if (!userData.isWorkerActive && userData.role !== 'admin') {
            navigate('/dashboard');
            return;
          }
          setProfile(userData);
          setIsLocked(!!userData.commissionLock);
          
          await fetchWorkerData(user.uid);
          await fetchBills(user.uid);
          await fetchPlatformSettings();
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPlatformSettings = async () => {
    try {
      const sDoc = await getDoc(doc(db, 'settings', 'platform'));
      if (sDoc.exists()) setPlatformSettings(sDoc.data() as PlatformSettings);
    } catch (e) {
      console.warn("Failed to fetch platform settings", e);
    }
  };

  const notifyAdmin = async (subject: string, body: string) => {
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body })
      });
    } catch (e) {
      console.warn("Notification failed", e);
    }
  };

  const fetchWorkerData = async (uid: string) => {
    try {
      // Fetch worker profile
      const workerDoc = await getDoc(doc(db, 'workers', uid));
      if (workerDoc.exists()) {
        const data = workerDoc.data() as WorkerProfile;
        setWorkerProfile(data);
        setEditValues(data);
      } else {
        // Default initial worker profile
        const defaultProfile: WorkerProfile = {
          uid,
          skill: '',
          description: '',
          rate: 500,
          experience: 0,
          location: '',
          rating: 5,
          reviewCount: 0,
          availability: 'Mon-Sun, 9AM-6PM',
          status: 'active',
          upiId: ''
        };
        setWorkerProfile(defaultProfile);
        setEditValues(defaultProfile);
      }

      // Fetch bookings for this worker
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef, 
        where('workerId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const bSnap = await getDocs(q);
      setBookings(bSnap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'workers_or_bookings');
    }
  };

  const fetchBills = async (uid: string) => {
    try {
      const q = query(collection(db, 'commissionBills'), where('workerId', '==', uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setBills(snap.docs.map(d => ({ id: d.id, ...d.data() } as CommissionBill)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'commissionBills');
    }
  };

  const handlePayCommission = async (billId: string, amount: number) => {
    if (!platformSettings?.adminUpiId) return alert('Platform UPI not configured by admin');
    setShowQrModal({ open: true, upi: platformSettings.adminUpiId, amount, label: 'Platform Commission', billId });
  };

  const confirmBillPayment = async (billId: string, transactionId: string) => {
    if (!transactionId) return alert('Please enter the Transaction ID / Ref No.');
    try {
      await updateDoc(doc(db, 'commissionBills', billId), { 
        status: 'pending_verification',
        transactionId: transactionId
      });
      setBills(prev => prev.map(b => b.id === billId ? { ...b, status: 'pending_verification', transactionId } : b));
      setShowQrModal({ open: false });
      
      await notifyAdmin("Commission Payment Submitted for Verification", `Worker ${profile?.name} (${profile?.email}) has submitted transaction ID ${transactionId} for a commission bill of ₹${bills.find(b => b.id === billId)?.commissionAmount}.`);
      alert('Payment info submitted. Admin will verify and unlock your dashboard shortly.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `commissionBills/${billId}`);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const finalValues = {
        ...editValues,
        rate: Number(editValues.rate) || 0,
        experience: Number(editValues.experience) || 0,
        uid: profile.uid,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'workers', profile.uid), finalValues, { merge: true });
      
      setWorkerProfile(finalValues as WorkerProfile);
      setIsEditing(false);
      alert('Profile updated successfully!');
      await notifyAdmin("Worker Profile Updated", `Worker ${profile.name} updated their profile info.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'workers');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus as any } : b));
      await notifyAdmin("Booking Status Change", `Booking ${bookingId} was updated to ${newStatus} by the worker.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 bg-slate-50 min-h-screen relative">
      {/* Commission Lock Overlay */}
      {isLocked && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center space-y-8 shadow-2xl">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Dashboard Locked</h2>
              <p className="text-slate-500 font-medium italic">
                Your worker dashboard has been locked due to unpaid platform commissions. Please settle your outstanding bills to resume services.
              </p>
            </div>
            
            <div className="space-y-4">
              {bills.filter(b => b.status === 'unpaid').map(bill => (
                <div key={bill.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bill.month} Commission</p>
                    <p className="text-2xl font-black text-slate-900 italic">₹{bill.commissionAmount}</p>
                  </div>
                  <button 
                    onClick={() => handlePayCommission(bill.id!, bill.commissionAmount)}
                    className="bg-primary text-white font-bold py-3 px-6 rounded-xl text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg"
                  >
                    Pay via QR
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-all underline underline-offset-4"
            >
              Return to Customer Dashboard
            </button>
          </div>
        </motion.div>
      )}

      {/* QR Modal */}
      {showQrModal.open && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 flex items-center justify-center p-6 backdrop-blur-sm">
           <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center space-y-8 shadow-2xl"
           >
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{showQrModal.label}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scan with any UPI App</p>
              </div>

              <div className="bg-slate-50 p-8 rounded-[32px] flex flex-col items-center gap-6 border-2 border-slate-100">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <QRCodeSVG 
                    value={`upi://pay?pa=${showQrModal.upi}&pn=Manittech&am=${showQrModal.amount}&cu=INR`} 
                    size={200}
                    imageSettings={platformSettings?.qrLogoUrl ? {
                      src: platformSettings.qrLogoUrl,
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    } : undefined}
                  />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Paying To</p>
                   <p className="text-sm font-black text-slate-900 italic">{showQrModal.upi}</p>
                   <p className="text-3xl font-black text-primary italic mt-2">₹{showQrModal.amount}</p>
                </div>
              </div>

              <div className="space-y-4 text-left">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enter Transaction ID / Ref No.</label>
                    <input 
                      value={transactionIdInput}
                      onChange={(e) => setTransactionIdInput(e.target.value)}
                      placeholder="e.g. 30291827xxxx"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                 </div>
                 <button 
                    onClick={() => {
                      if (showQrModal.billId) {
                        confirmBillPayment(showQrModal.billId, transactionIdInput);
                      }
                    }}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                 >
                   <CheckCircle size={16} /> Submit Payment Info
                 </button>
                 <button 
                  onClick={() => setShowQrModal({ open: false })}
                  className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all"
                 >
                   Cancel
                 </button>
              </div>
           </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-12">
        <div className="space-y-4">
          <div className="badge-minimal">Worker Portal</div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">
            Professional <br />
            <span className="text-primary">Dashboard.</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white text-slate-900 font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            {isEditing ? <XCircle size={14} /> : <Edit3 size={14} />}
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          {isEditing && (
            <button 
              onClick={handleUpdateProfile}
              className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
            >
              <Save size={14} /> Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Card */}
        <div className="space-y-8">
          <div className="card-minimal bg-white p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden ring-4 ring-slate-50">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`} 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{profile?.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{workerProfile?.skill || 'General Contractor'}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Skill</label>
                    <input 
                      value={editValues.skill} 
                      onChange={(e) => setEditValues({ ...editValues, skill: e.target.value })}
                      className="input-minimal w-full"
                      placeholder="e.g. Plumbing"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hourly Rate (₹)</label>
                      <input 
                        type="number"
                        value={editValues.rate || ''} 
                        onChange={(e) => setEditValues({ ...editValues, rate: Number(e.target.value) })}
                        className="input-minimal w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Experience (Years)</label>
                      <input 
                        type="number"
                        value={editValues.experience || ''} 
                        onChange={(e) => setEditValues({ ...editValues, experience: Number(e.target.value) })}
                        className="input-minimal w-full"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
                      <input 
                        value={editValues.phone || ''} 
                        onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                        className="input-minimal w-full"
                        placeholder="+91 ..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</label>
                      <input 
                        value={editValues.location} 
                        onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                        className="input-minimal w-full"
                        placeholder="e.g. Mumbai, Maharashtra"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Address</label>
                    <textarea 
                      value={editValues.address || ''} 
                      onChange={(e) => setEditValues({ ...editValues, address: e.target.value })}
                      className="input-minimal w-full min-h-[60px] text-xs"
                      placeholder="Enter your service address..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Availability</label>
                    <input 
                      value={editValues.availability} 
                      onChange={(e) => setEditValues({ ...editValues, availability: e.target.value })}
                      className="input-minimal w-full"
                      placeholder="e.g. Mon-Fri, 10AM-5PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">UPI ID (for receiving payments)</label>
                    <input 
                      value={editValues.upiId} 
                      onChange={(e) => setEditValues({ ...editValues, upiId: e.target.value })}
                      className="input-minimal w-full border-indigo-200"
                      placeholder="e.g. yourname@okaxis"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Personal QR Code (Upload image)</label>
                    <div className="flex items-center gap-4">
                      {editValues.qrCodeUrl && (
                        <img src={editValues.qrCodeUrl} alt="QR Preview" className="w-16 h-16 rounded-lg object-contain border border-slate-200 bg-slate-100" />
                      )}
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 300000) {
                              alert("Logo too large (max 300KB)");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => setEditValues({...editValues, qrCodeUrl: reader.result as string});
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-[10px] file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</label>
                    <textarea 
                      value={editValues.description} 
                      onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                      className="input-minimal w-full min-h-[100px] text-sm"
                      placeholder="Tell customers about your expertise..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rate /hr</p>
                      <p className="text-xl font-black text-slate-900 italic">₹{workerProfile?.rate}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rating</p>
                      <p className="text-xl font-black text-indigo-600 italic">{workerProfile?.rating} ★</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-500">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="text-xs font-bold uppercase tracking-widest">{workerProfile?.location || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Clock size={16} className="text-slate-400" />
                      <span className="text-xs font-bold uppercase tracking-widest">{workerProfile?.availability}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Referral & Credits */}
          <div className="card-minimal bg-white p-8 space-y-6">
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Refer & Earn</h3>
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referral Code</p>
                <p className="text-xl font-black text-slate-900 tracking-wider font-mono">{profile?.referralCode}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Credits</p>
                <p className="text-xl font-black text-indigo-600 italic">₹{profile?.credits || 0}</p>
              </div>
            </div>
            {((profile?.credits || 0) > 0) && (
              <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">
                Burn Credits (Apply to Bills)
              </button>
            )}
            <p className="text-[10px] text-slate-400 font-medium italic text-center">
              Earn ₹100 for every professional who joins using your link.
            </p>
          </div>

          {/* Platform Performance (Bills) */}
          <div className="card-minimal bg-white p-8 space-y-6">
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Platform Bills</h3>
            <div className="space-y-4">
              {bills.slice(0, 3).map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-[10px] font-bold text-slate-900 uppercase">{bill.month}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">₹{bill.commissionAmount} (5%)</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${bill.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {bill.status}
                  </span>
                </div>
              ))}
              {bills.length === 0 && <p className="text-[10px] text-slate-400 italic text-center">No bills generated yet.</p>}
            </div>
          </div>

          {/* Payment Note */}
          <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
            <IndianRupee className="text-indigo-600 shrink-0 mt-1" size={20} />
            <div className="space-y-1">
              <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Service Payment Policy</p>
              <p className="text-[11px] text-indigo-600/70 font-medium leading-relaxed italic">
                Customers pay you directly via your UPI QR code. Always verify the Transaction ID shown in the booking card before starting work.
              </p>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Recent Requests</h3>
            <div className="bg-slate-200 h-[1px] flex-1 mx-6 opacity-50"></div>
          </div>

          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <motion.div 
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card-minimal bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary/30"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 group-hover:bg-primary group-hover:text-white transition-all">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold tracking-tight text-slate-900 text-lg uppercase italic">{booking.serviceType}</h4>
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${
                          booking.status === 'completed' ? 'bg-green-50 text-green-600' : 
                          booking.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                          'bg-indigo-50 text-indigo-600'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Customer ID: {booking.customerId.slice(-6)} • {new Date(booking.bookingTime.toDate()).toLocaleString()}
                      </p>
                      {booking.transactionId && (
                        <div className="mt-2 text-[10px] bg-slate-50 border border-slate-100 p-2 rounded-lg font-mono text-indigo-600">
                          <span className="font-bold text-slate-400">TXN:</span> {booking.transactionId}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-10">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Yield</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter italic">₹{booking.amount}</p>
                    </div>

                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => updateBookingStatus(booking.id!, 'confirmed')}
                          className="w-10 h-10 rounded-xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="Confirm Request"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => updateBookingStatus(booking.id!, 'completed')}
                          className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          title="Mark as Completed"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button 
                          onClick={() => updateBookingStatus(booking.id!, 'cancelled')}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Reject Request"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 space-y-4">
                <AlertCircle className="h-12 w-12 mx-auto text-slate-300" />
                <p className="text-slate-500 font-medium italic">No service requests yet. Make sure your profile is active.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
