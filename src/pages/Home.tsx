import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Briefcase, 
  Calculator, 
  Settings, 
  Sparkles, 
  Users, 
  Globe, 
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const features = [
    {
      title: "Service Marketplace",
      description: "Connect with skilled workers for home, tech, or business needs.",
      icon: Users,
      link: "/services",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: "Utility Tools",
      description: "Fast, accurate calculators and generators for everyday tasks.",
      icon: Calculator,
      link: "/tools",
      color: "bg-green-500/10 text-green-500"
    },
    {
      title: "AI Assistants",
      description: "Smart AI tools for resumes, coding, and content creation.",
      icon: Sparkles,
      link: "/ai-tools",
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      title: "Business Solutions",
      description: "Scalable web and app development services for your brand.",
      icon: Briefcase,
      link: "/portfolio",
      color: "bg-orange-500/10 text-orange-500"
    }
  ];

  return (
    <div className="flex flex-col gap-24 pb-20 bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 flex items-center overflow-hidden bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl space-y-8"
          >
            <div className="badge-minimal mx-auto w-fit">
              The Utility-First Platform
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight text-slate-900 uppercase">
              Smart Tools. <br />
              <span className="text-primary italic">Real Results.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium tracking-tight">
              ManitTech connects you with professional services and provides powerful utility tools to supercharge your daily productivity.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button className="bg-slate-900 text-white font-bold py-4 px-10 rounded-2xl text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                <Link to="/services" className="flex items-center gap-2">
                  Explore Services <ArrowRight className="h-5 w-5" />
                </Link>
              </button>
              <button className="bg-white text-slate-900 border border-slate-200 font-bold py-4 px-10 rounded-2xl text-lg hover:bg-slate-50 transition-all">
                <Link to="/tools">Utility Tools</Link>
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 opacity-50 -z-10 translate-x-1/2 rounded-full blur-[120px]" />
      </section>

      {/* Stats/Feature Grid */}
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <div className="card-minimal h-full p-8 flex flex-col group hover:border-primary/30 hover:translate-y-[-4px]">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2 text-slate-900 italic uppercase">{feature.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 flex-1">
                  {feature.description}
                </p>
                <Link to={feature.link} className="text-primary font-bold text-sm flex items-center gap-2 group-hover:underline">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Services Highlight */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-12">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase italic">Recommended Specialists</h2>
            <p className="text-lg text-slate-500 font-medium">
              Top rated specialists based on your profile and professional needs.
            </p>
          </div>
          <Link to="/services" className="text-primary font-bold hover:underline mb-2">
            Browse All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Home Maintenance", count: "120+ Active", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800" },
            { name: "Tech Support", count: "85+ Active", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" },
            { name: "Events & Media", count: "45+ Active", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800" }
          ].map((cat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative h-[350px] rounded-2xl overflow-hidden cursor-pointer border border-slate-200 shadow-sm"
            >
              <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-300">{cat.count}</p>
                <h3 className="text-2xl font-bold tracking-tight uppercase italic">{cat.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Banner / Stats */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col gap-2">
            <div className="text-4xl font-bold italic text-slate-900 tracking-tighter">1,284</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Workers</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-4xl font-bold italic text-slate-900 tracking-tighter">42.5k</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Transactions</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-4xl font-bold italic text-slate-900 tracking-tighter">98%</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Satisfaction</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-4xl font-bold italic text-slate-900 tracking-tighter">24/7</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Support</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-indigo-600 rounded-2xl p-12 md:p-24 text-white relative overflow-hidden text-center space-y-8 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)]" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-200">AI Enabled Platform</h3>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight uppercase italic">Ready to level up your business?</h2>
            <p className="text-xl opacity-90 font-medium">Join thousand of users who trust ManitTech for their productivity.</p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button className="bg-white text-indigo-600 font-bold py-4 px-10 rounded-2xl text-lg hover:bg-slate-100 transition-all shadow-xl">
                <Link to="/signup">Get Started Now</Link>
              </button>
              <button className="bg-indigo-500/50 border border-indigo-400/30 text-white font-bold py-4 px-10 rounded-2xl text-lg hover:bg-indigo-500 transition-all">
                <Link to="/contact">Contact Support</Link>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
