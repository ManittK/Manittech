import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Percent, RefreshCcw } from 'lucide-react';

export default function GSTCalculator() {
  const [amount, setAmount] = useState<string>('');
  const [gstRate, setGstRate] = useState<string>('18');
  const [type, setType] = useState<string>('exclusive');
  const [result, setResult] = useState<any>(null);

  const calculateGST = () => {
    const amt = parseFloat(amount);
    const rate = parseFloat(gstRate);

    if (amt > 0) {
      if (type === 'exclusive') {
        const gstAmount = (amt * rate) / 100;
        const total = amt + gstAmount;
        setResult({
          base: amt.toFixed(2),
          gst: gstAmount.toFixed(2),
          total: total.toFixed(2),
          cgst: (gstAmount / 2).toFixed(2),
          sgst: (gstAmount / 2).toFixed(2),
        });
      } else {
        const basePrice = amt / (1 + rate / 100);
        const gstAmount = amt - basePrice;
        setResult({
          base: basePrice.toFixed(2),
          gst: gstAmount.toFixed(2),
          total: amt.toFixed(2),
          cgst: (gstAmount / 2).toFixed(2),
          sgst: (gstAmount / 2).toFixed(2),
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 bg-slate-50 min-h-screen flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl">
        <div className="card-minimal bg-white p-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">GST Calculator</h1>
            <p className="text-sm font-medium text-slate-500">Simplify your tax calculations instantly with precision.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Base Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="1000" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">GST Rate (%)</label>
                  <Select onValueChange={setGstRate} defaultValue="18">
                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                  <Select onValueChange={setType} defaultValue="exclusive">
                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                      <SelectItem value="inclusive">Inclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <button 
              onClick={calculateGST} 
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
            >
              Calculate GST
            </button>

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-8 border-t border-slate-100 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Base Price</p>
                    <p className="text-xl font-bold tracking-tight text-slate-900">₹{result.base}</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-indigo-400">GST Amount</p>
                    <p className="text-xl font-bold tracking-tight text-indigo-600">₹{result.gst}</p>
                  </div>
                </div>
                
                <div className="p-8 bg-slate-900 rounded-2xl text-white flex justify-between items-center shadow-xl">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Final Total</p>
                    <h3 className="text-4xl font-black tracking-tighter italic">₹{result.total}</h3>
                  </div>
                  <div className="text-right text-[10px] font-bold text-slate-400 uppercase space-y-1">
                    <p>CGST: ₹{result.cgst}</p>
                    <p>SGST: ₹{result.sgst}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
