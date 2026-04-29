import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, RefreshCcw, TrendingUp } from 'lucide-react';

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [tenure, setTenure] = useState<string>('');
  const [result, setResult] = useState<any>(null);

  const calculateEMI = () => {
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / (12 * 100); // monthly interest rate
    const n = parseFloat(tenure) * 12; // tenure in months

    if (p > 0 && r > 0 && n > 0) {
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = emi * n;
      const totalInterest = totalPayment - p;

      setResult({
        emi: Math.round(emi).toLocaleString('en-IN'),
        totalInterest: Math.round(totalInterest).toLocaleString('en-IN'),
        totalPayment: Math.round(totalPayment).toLocaleString('en-IN'),
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 bg-slate-50 min-h-screen flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl">
        <div className="card-minimal bg-white p-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">EMI Calculator</h1>
            <p className="text-sm font-medium text-slate-500">Plan your finances with professional-grade precision.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loan Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="500000" 
                  value={loanAmount} 
                  onChange={(e) => setLoanAmount(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Interest Rate (% p.a)</label>
                  <input 
                    type="number" 
                    placeholder="8.5" 
                    value={interestRate} 
                    onChange={(e) => setInterestRate(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tenure (Years)</label>
                  <input 
                    type="number" 
                    placeholder="5" 
                    value={tenure} 
                    onChange={(e) => setTenure(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={calculateEMI} 
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
            >
              Calculate EMI
            </button>

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-8 border-t border-slate-100 space-y-8">
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Monthly EMI Due</p>
                  <h3 className="text-7xl font-black text-slate-900 tracking-tighter italic">₹{result.emi}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Total Interest</p>
                    <p className="text-xl font-bold tracking-tight text-slate-900">₹{result.totalInterest}</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-indigo-400">Total Repayment</p>
                    <p className="text-xl font-bold tracking-tight text-indigo-600">₹{result.totalPayment}</p>
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
