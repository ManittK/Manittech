import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2, Download, Printer } from 'lucide-react';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
}

export default function InvoiceGenerator() {
  const [items, setItems] = useState<InvoiceItem[]>([{ id: Date.now(), description: '', quantity: 1, price: 0 }]);
  const [clientName, setClientName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = calculateSubtotal() * 0.18; // 18% GST example
  const total = calculateSubtotal() + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-20 bg-slate-50 min-h-screen flex flex-col items-center gap-8">
      <div className="w-full max-w-5xl flex justify-between items-end gap-6 border-b border-slate-200 pb-8 no-print">
        <div className="space-y-2">
          <div className="badge-minimal">Business Utility</div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Invoice Generator</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
            <Printer className="h-4 w-4" /> Save as PDF
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
        <div className="bg-white p-8 md:p-16 space-y-16 rounded-2xl border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="space-y-6">
              <h2 className="text-4xl font-black tracking-tighter text-indigo-600 italic uppercase">ManitTech.</h2>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                <p>123 Digital Square</p>
                <p>Tech Hub, India 400001</p>
                <p>contact@manittech.solutions</p>
              </div>
            </div>
            <div className="text-right space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Invoice Reference</p>
                <input 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)} 
                  className="h-10 text-right font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 no-print w-32 focus:outline-none"
                />
                <p className="font-bold font-mono print-only">{invoiceNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Issue Date</p>
                <p className="font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-l-4 border-indigo-600 pl-6 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bill To Customer</p>
            <input 
              placeholder="Name or Organization" 
              value={clientName} 
              onChange={(e) => setClientName(e.target.value)}
              className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic bg-transparent border-none w-full focus:outline-none no-print"
            />
            <p className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic print-only">{clientName}</p>
          </div>

          <div className="space-y-6">
            <div className="hidden md:grid grid-cols-12 gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-4">
              <div className="col-span-6">Line Item Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center group border-b border-slate-50 pb-3">
                  <div className="col-span-12 md:col-span-6">
                    <input 
                      placeholder="Service or product name..." 
                      value={item.description} 
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full bg-transparent border-none font-bold text-slate-900 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                      className="w-full bg-transparent border-none text-center font-mono font-bold text-slate-900 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                      className="w-full bg-transparent border-none text-right font-mono font-bold text-slate-900 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2 text-slate-900">
                    <p className="font-bold font-mono text-sm">₹{(item.quantity * item.price).toFixed(2)}</p>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 no-print hover:underline">
              <Plus className="h-3 w-3" /> Add item
            </button>
          </div>

          <div className="flex justify-end pt-12">
            <div className="w-full md:w-80 space-y-4">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-900 font-mono">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>Tax (18% GST)</span>
                <span className="text-slate-900 font-mono">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-slate-900">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Due</span>
                <span className="text-4xl font-black tracking-tighter text-slate-900 italic">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="pt-24 text-[10px] text-center font-bold uppercase tracking-[0.3em] text-slate-300">
            Digital Authenticated Document — ManitTech Productivity Suite
          </div>
        </div>
      </motion.div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .container { max-width: 100% !important; padding: 0 !important; }
          .shadow-2xl { box-shadow: none !important; }
          nav, footer { display: none !important; }
        }
        .print-only { display: none; }
      `}</style>
    </div>
  );
}
