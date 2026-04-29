import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Briefcase, 
  Calculator, 
  Settings, 
  History, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Booking, ToolUsage, WorkerProfile, PlatformSettings } from '../types';

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [toolStats, setToolStats] = useState<ToolUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState<{ open: boolean; upi?: string; amount?: number; label?: string; bookingId?: string }>({ open: false });
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/');
        return;
      }
      
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
          await fetchDashboardData(user.uid);
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
      console.warn("Failed to fetch settings", e);
    }
  };

  const fetchDashboardData = async (uid: string) => {
    try {
      // Fetch recent bookings
      const bookingsRef = collection(db, 'bookings');
      const bQuery = query(
        bookingsRef, 
        where('customerId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const bSnap = await getDocs(bQuery);
      setRecentBookings(bSnap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));

      // Fetch tool usage history
      const toolsRef = collection(db, 'toolUsage');
      const tQuery = query(
        toolsRef,
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const tSnap = await getDocs(tQuery);
      setToolStats(tSnap.docs.map(d => d.data() as ToolUsage));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'bookings_or_toolUsage');
    }
  };

  const handlePayUPI = async (booking: Booking) => {
    try {
      const workerDoc = await getDoc(doc(db, 'workers', booking.workerId));
      if (workerDoc.exists()) {
        const workerData = workerDoc.data() as WorkerProfile;
        if (workerData.upiId) {
          setShowQrModal({ 
            open: true, 
            upi: workerData.upiId, 
            amount: booking.amount, 
            label: `${booking.serviceType} Payment`,
            bookingId: booking.id
          });
        } else {
          alert('This worker has not configured their UPI ID yet. Please pay via cash.');
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `workers/${booking.workerId}`);
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
    <div className="container mx-auto px-4 py-12 space-y-8 bg-slate-50 min-h-screen relative">
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
                    value={`upi://pay?pa=${showQrModal.upi}&pn=Worker&am=${showQrModal.amount}&cu=INR`} 
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

              <div className="space-y-4">
                 <button 
                  onClick={() => setShowQrModal({ open: false })}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                 >
                   <CheckCircle size={16} /> I have paid successfully
                 </button>
                 <p className="text-[10px] text-slate-400 font-medium">This will notify the worker to confirm your payment.</p>
              </div>
           </motion.div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-12">
        <div className="space-y-4">
          <div className="badge-minimal">Consumer Dashboard</div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">
            Welcome back,<br />
            <span className="text-primary">{profile?.name.split(' ')[0]}.</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-slate-900 font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
            <Settings className="h-4 w-4" /> Preferences
          </button>
          <button className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg" onClick={() => navigate('/services')}>
            Book Service
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-slate-200 bg-transparent h-auto p-0 mb-8 space-x-10">
              <TabsTrigger 
                value="bookings" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-0 py-4 text-xs font-bold tracking-widest uppercase transition-all text-slate-400 data-[state=active]:text-slate-900"
              >
                Booking History
              </TabsTrigger>
              <TabsTrigger 
                value="tools" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-0 py-4 text-xs font-bold tracking-widest uppercase transition-all text-slate-400 data-[state=active]:text-slate-900"
              >
                Recent activity
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookings" className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="card-minimal bg-white p-6 flex items-center justify-between group hover:border-primary/30 cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 group-hover:bg-primary group-hover:text-white transition-all">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold tracking-tight text-slate-900 text-lg uppercase italic">{booking.serviceType}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(booking.bookingTime.toDate()).toLocaleDateString('en-IN', { dateStyle: 'full' })}
                        </p>
                      </div>
                    </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-xl tracking-tighter italic">₹{booking.amount}</p>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${booking.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                              {booking.status}
                            </span>
                            {booking.status === 'completed' && booking.paymentStatus === 'unpaid' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePayUPI(booking);
                                }}
                                className="text-[10px] font-black uppercase text-indigo-600 hover:underline tracking-widest flex items-center gap-1"
                              >
                                <CreditCard size={10} /> Pay UPI QR
                              </button>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                      </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                  <Briefcase className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium italic">No active requests or past bookings found.</p>
                  <button className="text-primary font-bold text-xs uppercase tracking-widest mt-4 hover:underline" onClick={() => navigate('/services')}>Start Browsing Experts &rarr;</button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              {toolStats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {toolStats.map((usage, idx) => (
                    <div key={idx} className="card-minimal bg-white p-6 flex items-center gap-4 hover:border-slate-300 cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-bold tracking-tight text-slate-900 uppercase italic">{usage.toolName}</h4>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          Last used: {new Date(usage.createdAt.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                  <Calculator className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium italic">You haven't explored our utility toolkit yet.</p>
                  <button className="text-primary font-bold text-xs uppercase tracking-widest mt-4 hover:underline" onClick={() => navigate('/tools')}>Launch Toolkit &rarr;</button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-10 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Service Credits</p>
                <h3 className="text-5xl font-black tracking-tighter italic">₹0.00</h3>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Note:</p>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                  Payments are handled directly via cash. Wallet balance has been disabled for improved transparency.
                </p>
              </div>
              <button className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all mt-6 shadow-xl opacity-50 cursor-not-allowed">
                Digital Wallet Disabled
              </button>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mb-16 -mr-16"></div>
          </div>

          {/* Referral & Earn */}
          <div className="card-minimal bg-white p-8 space-y-6">
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Refer & Earn</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Code</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-2xl font-black text-slate-900 tracking-wider font-mono">{profile?.referralCode || 'GENERATING...'}</p>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-widest px-3 border border-slate-200">Copy</Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Rewards Earned</p>
                <p className="text-2xl font-black text-indigo-600 italic">₹{profile?.credits || 0}</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed text-center">
              Invite friends to hire professionals. Get ₹200 credits for every first successful booking they make!
            </p>
          </div>

          <div className="card-minimal bg-white p-8 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 italic">Account Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Premium tier</p>
                  <p className="text-sm font-bold text-indigo-600 italic">Early Adopter</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                Get 24/7 priority support and discounted rates on all premium service bookings.
              </p>
              <button className="text-slate-900 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline">
                Contact Concierge <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
