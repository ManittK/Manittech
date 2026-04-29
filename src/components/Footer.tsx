import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Services",
      links: [
        { name: "Marketplace", path: "/services" },
        { name: "Become a Worker", path: "/signup" },
        { name: "Worker Profiles", path: "/services" },
        { name: "Booking Status", path: "/dashboard" },
      ]
    },
    {
      title: "Utilities",
      links: [
        { name: "BMI Calculator", path: "/tools/bmi-calculator" },
        { name: "GST Calculator", path: "/tools/gst-calculator" },
        { name: "Invoice Maker", path: "/tools/invoice-generator" },
        { name: "QR Generator", path: "/tools/qr-generator" },
      ]
    },
    {
      title: "AI Tools",
      links: [
        { name: "Resume Assistant", path: "/ai-tools" },
        { name: "Idea Generator", path: "/ai-tools" },
        { name: "Code Helper", path: "/ai-tools" },
        { name: "Text Summarizer", path: "/ai-tools" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Portfolio", path: "/portfolio" },
        { name: "Contact", path: "/contact" },
        { name: "Blog", path: "/blog" },
      ]
    }
  ];

  return (
    <footer className="border-t border-slate-200 bg-white pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6 mb-20">
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
              ManitTech.
            </Link>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
              Building utility-first digital solutions for real-world problems. Smart tools, AI, and services all in one place.
            </p>
            <div className="flex gap-6">
              <Link to="#" className="text-slate-400 hover:text-primary transition-colors"><Twitter size={20} /></Link>
              <Link to="#" className="text-slate-400 hover:text-primary transition-colors"><Instagram size={20} /></Link>
              <Link to="#" className="text-slate-400 hover:text-primary transition-colors"><Facebook size={20} /></Link>
              <Link to="#" className="text-slate-400 hover:text-primary transition-colors"><Github size={20} /></Link>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h3 className="font-bold text-[10px] tracking-[0.3em] uppercase text-slate-400 italic">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-sm text-slate-500 font-bold uppercase tracking-widest hover:text-primary transition-colors hover:translate-x-1 inline-block transform">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">© {currentYear} ManitTech — Professional Utility Suite</p>
          <div className="flex gap-10">
            <Link to="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Privacy</Link>
            <Link to="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Terms</Link>
            <Link to="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
