import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Copy, RefreshCcw, CheckCircle2 } from 'lucide-react';

export default function PasswordGenerator() {
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(16);
  const [copied, setCopied] = useState<boolean>(false);

  const generate = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(retVal);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-20 bg-slate-50 min-h-screen flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
        <div className="card-minimal bg-white p-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Password Generator</h1>
            <p className="text-sm font-medium text-slate-500">Create ultra-secure passwords in one click with mathematical randomness.</p>
          </div>

          <div className="space-y-8">
            <div className="relative group">
              <input 
                readOnly 
                value={password} 
                className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-xl font-mono text-center tracking-wider focus:outline-none text-slate-900"
                placeholder="Click Generate..."
              />
              {password && (
                <button 
                  onClick={copyToClipboard}
                  className="absolute inset-y-0 right-4 flex items-center text-primary group-hover:scale-110 transition-transform"
                >
                  {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Length: <span className="text-slate-900">{length}</span></label>
                <input 
                  type="range" 
                  min="8" 
                  max="32" 
                  value={length} 
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  className="w-1/2 accent-slate-900 h-1 rounded-full appearance-none bg-slate-100 cursor-pointer" 
                />
              </div>
              <button 
                onClick={generate} 
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshCcw className="h-5 w-5" /> Generate Password
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Security Recommendation</p>
              <p className="text-xs text-indigo-600/70 font-medium leading-relaxed italic">
                Aim for passwords with at least 16 characters for maximum protection against modern brute-force attacks.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
