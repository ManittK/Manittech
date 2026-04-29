import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-20 space-y-20 bg-slate-50 min-h-screen">
      <section className="max-w-4xl space-y-6">
        <div className="badge-minimal">Get in touch</div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">
          Let's Start <br /> <span className="text-primary italic">A Conversation.</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium">
          Have a project in mind or need help with our tools? We're here for you.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="card-minimal bg-white p-8 md:p-12 space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                <input placeholder="John Doe" className="input-minimal w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                <input placeholder="john@example.com" className="input-minimal w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Message</label>
              <textarea placeholder="Tell us how we can help..." className="input-minimal w-full min-h-[150px] resize-none" />
            </div>
            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2">
              Send Message <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 italic">Office Headquarters</h3>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900"><MapPin size={22} /></div>
                <div>
                  <p className="font-bold tracking-tight text-slate-900 text-lg italic">Main Office</p>
                  <p className="text-slate-500 font-medium">123 Digital Square, Tech Hub, Mumbai, 400001</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900"><Mail size={22} /></div>
                <div>
                  <p className="font-bold tracking-tight text-slate-900 text-lg italic">Support Email</p>
                  <p className="text-slate-500 font-medium">support@manittech.solutions</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900"><Phone size={22} /></div>
                <div>
                  <p className="font-bold tracking-tight text-slate-900 text-lg italic">Customer Care</p>
                  <p className="text-slate-500 font-medium">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 rounded-2xl bg-slate-900 text-white space-y-4 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <h4 className="text-2xl font-bold tracking-tight italic uppercase">Work with us</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Are you a skilled professional looking to join our marketplace? Create your profile today and start reaching new clients.
              </p>
              <button className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">Apply as a Worker &rarr;</button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
