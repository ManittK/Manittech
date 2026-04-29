import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { collection, query, getDocs, where, addDoc, serverTimestamp, Timestamp, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Search, Star, MapPin, Briefcase, Filter, Loader2, ArrowRight, CheckCircle2, AlertCircle, IndianRupee } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { WorkerProfile } from '../types';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function Services() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [user, setUser] = useState<any>(null);
  
  // Booking Modal State
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [serviceDetails, setServiceDetails] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [bookingStep, setBookingStep] = useState<'details' | 'payment'>('details');

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
    fetchWorkers();
  }, [category]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      let q = collection(db, 'workers');
      if (category !== 'all') {
        const workersQuery = query(q, where('skill', '==', category));
        const querySnapshot = await getDocs(workersQuery);
        setWorkers(querySnapshot.docs.map(doc => doc.data() as WorkerProfile));
      } else {
        const querySnapshot = await getDocs(q);
        setWorkers(querySnapshot.docs.map(doc => doc.data() as WorkerProfile));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'workers');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!user || !selectedWorker || !visitDate || !visitTime || !transactionId) return;
    setBookingLoading(true);
    try {
      const visitTimestamp = Timestamp.fromDate(new Date(`${visitDate}T${visitTime}`));
      
      const bookingData = {
        customerId: user.uid,
        workerId: selectedWorker.uid,
        serviceType: selectedWorker.skill,
        amount: selectedWorker.rate,
        status: 'confirmed',
        paymentStatus: 'paid',
        transactionId: transactionId,
        bookingTime: visitTimestamp,
        visitTime: visitTimestamp,
        serviceDetails: serviceDetails,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      setBookingSuccess(true);
      
      // Get worker email for notification
      const workerUserDoc = await getDoc(doc(db, 'users', selectedWorker.uid));
      const workerEmail = workerUserDoc.exists() ? workerUserDoc.data().email : null;

      // Notify Worker via Email (Server proxy)
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: workerEmail, 
          subject: 'New Service Booking & Payment Received!',
          body: `Hello,\n\nYou have a new confirmed booking for ${selectedWorker.skill} on ${visitDate} at ${visitTime}.\n\nCustomer Transaction ID: ${transactionId}\nDetails: ${serviceDetails}\n\nPlease check your portal to confirm the visit.`
        })
      });

      // Also notify Admin about the new booking
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `New Marketplace Booking: ${selectedWorker.skill}`,
          body: `A new booking has been confirmed.\n\nWorker: Provider ${selectedWorker.uid.slice(0, 4)}\nCustomer: ${user.email}\nAmount: ₹${selectedWorker.rate}\nTransaction: ${transactionId}`
        })
      });

      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedWorker(null);
        setBookingStep('details');
        setVisitDate('');
        setVisitTime('');
        setServiceDetails('');
        setTransactionId('');
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bookings');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.skill?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    "Plumbing", "Electrical", "Carpentry", "Cleaning", 
    "Web Development", "Mobile Apps", "Graphic Design",
    "Photography", "Yoga Trainer", "Tuition"
  ];

  return (
    <div className="container mx-auto px-4 py-20 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-12">
        <div className="space-y-4 max-w-2xl">
          <div className="badge-minimal">Service Marketplace</div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">
            Expert <br /> <span className="text-primary italic">Specialists.</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Top rated specialists based on your profile. Verified expertise and secure booking.
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Search specialists..." 
              className="input-minimal pl-10 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select onValueChange={setCategory} defaultValue="all">
            <SelectTrigger className="w-full md:w-[200px] h-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        </div>
      ) : filteredWorkers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
          {filteredWorkers.map((worker, idx) => (
            <motion.div
              key={worker.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="card-minimal flex flex-col hover:border-primary/30 transition-all cursor-pointer p-6 gap-6 group">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 flex-shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.uid}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover grayscale" 
                    />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{worker.skill}</div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 italic uppercase truncate">
                      Provider {worker.uid.slice(0, 4)}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-500 leading-relaxed italic line-clamp-2">
                    {worker.description || 'Experienced professional providing high-quality services tailored to your needs.'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-200">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Hourly Rate</div>
                      <div className="text-xl font-bold italic text-slate-900">₹{worker.rate} <span className="text-[10px] font-normal text-slate-400">/hr</span></div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Avg. Rating</div>
                       <div className="flex items-center gap-1 font-bold text-indigo-600">
                         <Star className="h-4 w-4 fill-current" />
                         {worker.rating || '4.8'}
                       </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => user ? setSelectedWorker(worker) : navigate('/dashboard')}
                  className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-sm mt-auto group-hover:bg-primary transition-all"
                >
                  {user ? 'Book Professional' : 'Sign in to Book'} &rarr;
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-4">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
          <p className="text-lg font-medium text-muted-foreground italic">No professionals found for this criteria.</p>
          <Button variant="link" onClick={() => {setCategory('all'); setSearchTerm('');}}>Clear filters</Button>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={!!selectedWorker} onOpenChange={(open) => !open && setSelectedWorker(null)}>
        <DialogContent className="max-w-md bg-white rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          {bookingSuccess ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase italic">Request Sent!</h2>
              <p className="text-slate-500 font-medium italic">
                Your service request has been sent to the professional. You can track its status in your dashboard.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">Confirm Booking</p>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                    {selectedWorker?.skill} <span className="text-primary">Service.</span>
                  </h2>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mb-16 -mr-16"></div>
              </div>

              <div className="p-8 space-y-6">
                {bookingStep === 'details' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visit Date</label>
                        <input 
                          type="date"
                          value={visitDate} 
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="input-minimal w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preferred Time</label>
                        <input 
                          type="time" 
                          value={visitTime}
                          onChange={(e) => setVisitTime(e.target.value)}
                          className="input-minimal w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Service Details</label>
                      <textarea 
                        value={serviceDetails}
                        onChange={(e) => setServiceDetails(e.target.value)}
                        placeholder="Describe the issue or work required..."
                        className="input-minimal w-full min-h-[80px] text-sm"
                      />
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Rate</p>
                        <p className="text-2xl font-black text-slate-900 italic">₹{selectedWorker?.rate}/hr</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <IndianRupee size={18} className="text-slate-900" />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (visitDate && visitTime) setBookingStep('payment');
                        else alert('Please fill in date and time');
                      }}
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      Proceed to Payment &rarr;
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center space-y-4">
                      <div className="bg-slate-50 p-6 rounded-[32px] flex flex-col items-center gap-4 border-2 border-slate-100">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Scan to Pay Specialist</label>
                        {selectedWorker?.qrCodeUrl ? (
                          <img src={selectedWorker.qrCodeUrl} alt="Worker QR" className="w-40 h-40 object-contain rounded-xl shadow-sm bg-white p-2" />
                        ) : (
                          <QRCodeSVG 
                            value={`upi://pay?pa=${selectedWorker?.upiId || ''}&pn=Specialist&am=${selectedWorker?.rate}&cu=INR`} 
                            size={160}
                          />
                        )}
                        <p className="text-sm font-black text-slate-900 italic">{selectedWorker?.upiId}</p>
                        <p className="text-3xl font-black text-primary italic">₹{selectedWorker?.rate}</p>
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Transaction ID / Ref No.</label>
                        <input 
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter 12-digit UPI Ref No."
                          className="input-minimal w-full text-center font-mono tracking-tighter"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <button 
                        disabled={bookingLoading}
                        onClick={handleBook}
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                      >
                        {bookingLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Payment & Book'}
                      </button>
                      <button 
                        onClick={() => setBookingStep('details')}
                        className="w-full bg-white text-slate-400 font-bold py-4 rounded-xl text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all"
                      >
                        Change Details
                      </button>
                    </div>
                  </>
                )}

                <button 
                  onClick={() => {
                    setSelectedWorker(null);
                    setBookingStep('details');
                  }}
                  className="w-full text-slate-300 font-bold py-2 text-[8px] uppercase tracking-widest hover:text-red-400 transition-all"
                >
                  Cancel Booking
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
