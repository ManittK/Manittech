import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, RefreshCcw, FileText, Code, Lightbulb, AlignLeft, ArrowRight } from 'lucide-react';
import { generateResumeFeedback, generateWebsiteIdea, explainCode, summarizeText } from '../services/gemini';

export default function AITools() {
  const [activeTool, setActiveTool] = useState<string>('resume');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const tools = [
    { id: 'resume', name: 'Resume Assistant', icon: FileText, placeholder: 'Paste your resume text here...', action: generateResumeFeedback },
    { id: 'website', name: 'Website Idea Gen', icon: Lightbulb, placeholder: 'Enter an industry (e.g., "Health & Fitness")', action: generateWebsiteIdea },
    { id: 'code', name: 'Code Helper', icon: Code, placeholder: 'Paste code to explain...', action: explainCode },
    { id: 'summarizer', name: 'Text Summarizer', icon: AlignLeft, placeholder: 'Paste long text to summarize...', action: summarizeText },
  ];

  const handleRun = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const currentTool = tools.find(t => t.id === activeTool);
      if (currentTool) {
        const out = await currentTool.action(input);
        setResult(out || 'No response from AI.');
      }
    } catch (error) {
      console.error(error);
      setResult('An error occurred. Please check your console.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setInput('');
    setResult('');
  };

  return (
    <div className="container mx-auto px-4 py-20 bg-slate-50">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Sidebar - Tool Selection */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <div className="badge-minimal">Powered by Gemini AI</div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight text-slate-900 uppercase italic">
              AI Business <br /> <span className="text-primary italic">Helper.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              Simple AI-powered utilities to help you build, create, and optimize your work.
            </p>
          </div>

          <div className="flex flex-col gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  reset();
                }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all font-bold tracking-tight text-sm uppercase ${
                  activeTool === tool.id 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tool.icon className={`h-5 w-5 ${activeTool === tool.id ? 'text-white' : 'opacity-40'}`} />
                {tool.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Input/Result */}
        <div className="lg:col-span-8">
          <div className="card-minimal h-full flex flex-col overflow-hidden bg-white">
            <div className="p-6 md:p-12 space-y-8 bg-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-100">AI Assistant Active</h3>
                </div>
                <Button variant="ghost" onClick={reset} disabled={loading} className="text-white hover:bg-white/10">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              <h4 className="text-3xl font-bold leading-tight italic">
                {tools.find(t => t.id === activeTool)?.name}? <br />
                <span className="text-indigo-200">What can I build for you today?</span>
              </h4>
              
              <div className="relative">
                <Textarea 
                  placeholder={tools.find(t => t.id === activeTool)?.placeholder}
                  className="w-full bg-indigo-500/50 border border-indigo-400/30 rounded-2xl px-6 py-6 text-lg placeholder-indigo-200 focus:outline-none focus:ring-0 resize-none min-h-[150px]"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button 
                onClick={handleRun} 
                disabled={loading || !input.trim()} 
                className="w-full h-16 rounded-2xl bg-white text-indigo-600 text-lg font-bold tracking-tight hover:bg-slate-100 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Generate Result <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </button>
            </div>

            {result && (
              <div className="p-8 md:p-12 bg-white border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 italic">Analysis Result</div>
                <div className="prose prose-slate max-w-none font-medium text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                  {result}
                </div>
              </div>
            )}
            
            <div className="mt-auto p-6 border-t border-slate-50 text-[10px] text-slate-400 uppercase tracking-widest flex justify-between">
              <span>Security Verified</span>
              <span>Processing via Gemini 1.5 Pro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
