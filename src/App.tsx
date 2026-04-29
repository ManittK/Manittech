import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Tools from './pages/Tools';
import AITools from './pages/AITools';
import Portfolio from './pages/Portfolio';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import WorkerPortal from './pages/WorkerPortal';
import AdminPortal from './pages/AdminPortal';
import BMICalculator from './pages/tools/BMICalculator';
import GSTCalculator from './pages/tools/GSTCalculator';
import PasswordGenerator from './pages/tools/PasswordGenerator';
import EMICalculator from './pages/tools/EMICalculator';
import InvoiceGenerator from './pages/tools/InvoiceGenerator';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background text-foreground font-sans antialiased">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/bmi-calculator" element={<BMICalculator />} />
            <Route path="/tools/gst-calculator" element={<GSTCalculator />} />
            <Route path="/tools/emi-calculator" element={<EMICalculator />} />
            <Route path="/tools/password-generator" element={<PasswordGenerator />} />
            <Route path="/tools/invoice-generator" element={<InvoiceGenerator />} />
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/worker-portal" element={<WorkerPortal />} />
            <Route path="/admin" element={<AdminPortal />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
