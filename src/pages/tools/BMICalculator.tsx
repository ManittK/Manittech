import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, RefreshCcw } from 'lucide-react';

export default function BMICalculator() {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // convert cm to m

    if (w > 0 && h > 0) {
      const result = w / (h * h);
      setBmi(parseFloat(result.toFixed(1)));
      
      if (result < 18.5) setStatus('Underweight');
      else if (result < 25) setStatus('Normal weight');
      else if (result < 30) setStatus('Overweight');
      else setStatus('Obese');
    }
  };

  const reset = () => {
    setWeight('');
    setHeight('');
    setBmi(null);
    setStatus('');
  };

  return (
    <div className="container mx-auto px-4 py-20 bg-slate-50 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="card-minimal bg-white p-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">BMI Calculator</h1>
            <p className="text-sm font-medium text-slate-500">
              Calculate your Body Mass Index and understand your health status in seconds.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Weight (kg)</label>
                <input 
                  type="number" 
                  placeholder="70" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Height (cm)</label>
                <input 
                  type="number" 
                  placeholder="175" 
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={calculateBMI} 
                className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
              >
                Calculate BMI
              </button>
              <button 
                onClick={reset}
                className="px-6 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
              >
                <RefreshCcw className="h-5 w-5" />
              </button>
            </div>

            {bmi && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-8 border-t border-slate-100 space-y-6 text-center"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Your Calculated BMI</p>
                  <h3 className="text-7xl font-black text-slate-900 tracking-tighter italic">{bmi}</h3>
                </div>
                
                <div className="inline-block px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest border border-indigo-100">
                  {status}
                </div>
                
                <div className="grid grid-cols-4 gap-2 pt-4">
                  <div className={`p-3 rounded-xl text-[10px] font-bold uppercase ${status === 'Underweight' ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 opacity-50'}`}>Under</div>
                  <div className={`p-3 rounded-xl text-[10px] font-bold uppercase ${status === 'Normal weight' ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 opacity-50'}`}>Normal</div>
                  <div className={`p-3 rounded-xl text-[10px] font-bold uppercase ${status === 'Overweight' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 opacity-50'}`}>Over</div>
                  <div className={`p-3 rounded-xl text-[10px] font-bold uppercase ${status === 'Obese' ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 opacity-50'}`}>Obese</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
