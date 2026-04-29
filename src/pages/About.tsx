import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, Shield, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-20 space-y-32 bg-slate-50">
      {/* Hero */}
      <section className="max-w-5xl space-y-8">
        <div className="badge-minimal">Our Story</div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">
          We Build <br /> <span className="text-primary italic">The Future</span> <br /> of Utility.
        </h1>
        <p className="text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed">
          ManitTech was founded on a simple principle: technology should be a multiplier for real-world efficiency. We combine human expertise with digital automation.
        </p>
      </section>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: "Trust First", icon: Shield, desc: "Rigorous vetting for every worker on our platform." },
          { title: "Precision", icon: Target, desc: "Tools built with mathematical accuracy and reliability." },
          { title: "User Centric", icon: Users, desc: "Designed for the human experience, not just servers." },
          { title: "Innovation", icon: Sparkles, desc: "Leveraging AI to solve repetitive daily tasks." }
        ].map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="card-minimal h-full bg-white p-8 space-y-6 flex flex-col group hover:border-primary/30">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 uppercase italic">{v.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{v.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Team/Mission */}
      <section className="bg-slate-900 rounded-3xl overflow-hidden text-white shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-12 md:p-24 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight uppercase italic">A mission to connect & empower.</h2>
            <p className="text-xl text-slate-400 font-medium leading-relaxed italic">
              Started by Manit Kedia, ManitTech aims to bridge the gap between digital convenience and real-world needs. We strive to create a platform where services are transparent and tools are accessible to everyone.
            </p>
            <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
              <div>
                <p className="text-4xl font-black tracking-tight text-white italic">10K+</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Happy Users</p>
              </div>
              <div>
                <p className="text-4xl font-black tracking-tight text-white italic">500+</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Verified Pros</p>
              </div>
            </div>
          </div>
          <div className="h-[400px] lg:h-auto overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
              alt="team" 
              className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
