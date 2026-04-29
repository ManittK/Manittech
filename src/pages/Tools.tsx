import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Percent, 
  FileText, 
  QrCode, 
  Key, 
  UserPlus, 
  FileUp,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Tools() {
  const toolCategories = [
    {
      title: "Health & Vitality",
      tools: [
        {
          name: "BMI Calculator",
          description: "Calculate your Body Mass Index and understand your health status.",
          icon: Calculator,
          link: "/tools/bmi-calculator",
          badge: "Quick"
        }
      ]
    },
    {
      title: "Finance & Tax",
      tools: [
        {
          name: "GST Calculator",
          description: "Swiftly calculate Goods and Services Tax for your business.",
          icon: Percent,
          link: "/tools/gst-calculator",
          badge: "Essential"
        },
        {
          name: "EMI Calculator",
          description: "Plan your loans with precise Equated Monthly Installment calculations.",
          icon: Calculator,
          link: "/tools/emi-calculator",
          badge: "Finance"
        }
      ]
    },
    {
      title: "Productivity",
      tools: [
        {
          name: "Invoice Generator",
          description: "Create professional invoices for your clients in seconds.",
          icon: FileText,
          link: "/tools/invoice-generator",
          badge: "Popular"
        },
        {
          name: "Password Generator",
          description: "Generate ultra-secure, random passwords for your security.",
          icon: Key,
          link: "/tools/password-generator",
          badge: "Security"
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-20 space-y-20 bg-slate-50">
      <section className="max-w-4xl space-y-6">
        <div className="badge-minimal w-fit">All-in-one Toolkit</div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">
          Daily Use <br /> <span className="text-primary">Utility Tools.</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-xl">
          Everything you need to work faster and smarter. Simple, accurate, and completely free to use.
        </p>
      </section>

      <div className="space-y-24">
        {toolCategories.map((category, idx) => (
          <div key={idx} className="space-y-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 italic">
              {category.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.tools.map((tool, tIdx) => (
                <motion.div
                  key={tIdx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: tIdx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="card-minimal h-full p-8 flex flex-col group hover:border-primary/30 hover:translate-y-[-4px]">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        <tool.icon className="h-6 w-6" />
                      </div>
                      <span className="px-2 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider">{tool.badge}</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight mb-2 text-slate-900 uppercase italic">{tool.name}</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 flex-1">
                      {tool.description}
                    </p>
                    <Link to={tool.link} className="text-primary font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                      Open Tool <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
