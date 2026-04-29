import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';

export default function Portfolio() {
  const projects = [
    { title: "E-Commerce Suite", category: "Web App", img: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1200" },
    { title: "SaaS Dashboard", category: "Digital", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" },
    { title: "AI Content Platform", category: "AI Tool", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200" },
    { title: "Booking System", category: "Business", img: "https://images.unsplash.com/photo-1551288049-bbbda536ad0a?auto=format&fit=crop&q=80&w=1200" }
  ];

  return (
    <div className="container mx-auto px-4 py-20 space-y-20 bg-slate-50 min-h-screen">
      <section className="max-w-4xl space-y-6">
        <div className="badge-minimal">Showcase</div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">
          Digital <br /> <span className="text-primary italic">Masterpieces.</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-xl italic">
          Explore our latest work in web development, app design, and digital business solutions.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {projects.map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl border border-slate-200"
          >
            <img src={project.img} alt={project.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-10 left-10 right-10 text-white space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary italic">0{idx + 1} / {project.category}</span>
              <h3 className="text-4xl font-black tracking-tighter leading-none uppercase italic">{project.title}</h3>
              <p className="text-xs text-slate-300 font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors">
                View Case Study <ArrowRight size={14} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="py-24 text-center space-y-8 bg-slate-900 rounded-[3rem] text-white overflow-hidden relative">
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic">Ready to scale?</h2>
          <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto italic">
            We're currently accepting new projects. Let's build something exceptional together.
          </p>
          <button className="bg-white text-slate-900 font-bold py-4 px-10 rounded-xl text-sm uppercase tracking-widest hover:bg-slate-100 transition-all shadow-2xl" onClick={() => window.location.href = '/contact'}>
            Book a Consultation
          </button>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      </section>
    </div>
  );
}
