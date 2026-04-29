import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function Blog() {
  const posts = [
    { title: "Top 10 Utility Tools for Freelancers in 2024", date: "Oct 24, 2024", category: "Resources" },
    { title: "How AI is Changing the Service Marketplace", date: "Oct 20, 2024", category: "Technology" },
    { title: "Managing Your Business Finances with Simple Tools", date: "Oct 15, 2024", category: "Finance" },
    { title: "The Rise of On-Demand Expert Services", date: "Oct 10, 2024", category: "Marketplace" }
  ];

  return (
    <div className="container mx-auto px-4 py-20 space-y-20 bg-slate-50 min-h-screen">
      <section className="max-w-4xl space-y-6">
        <div className="badge-minimal">Insights</div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">
          The ManitTech <br /> <span className="text-primary italic">Chronicles.</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-xl italic">
          Thoughts, tutorials, and trends from the intersection of technology and utility.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {posts.map((post, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="card-minimal bg-white group cursor-pointer overflow-hidden flex flex-col h-full border border-slate-200">
              <div className="h-64 bg-slate-100 relative overflow-hidden group-hover:bg-slate-200 transition-colors">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 font-black text-8xl italic uppercase text-slate-900 select-none">
                  {post.category[0]}
                </div>
              </div>
              <div className="p-8 space-y-6 flex-grow flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] italic border-b border-primary/30 pb-0.5">{post.category}</span>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
                      <Calendar size={12} /> {post.date}
                    </div>
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                    Exploring how modern digital solutions are transforming the way we work and live in a connected economy.
                  </p>
                </div>
                <div className="pt-6">
                  <p className="text-xs text-slate-900 font-bold uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                    Read Article <ArrowRight size={14} />
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
