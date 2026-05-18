/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PropertyForm } from './components/PropertyForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { PropertyData, ValuationResult } from './types';
import { getValuation, generatePropertyImage } from './lib/gemini';
import { Layout, Search, Sparkles, BrainCircuit, Github, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ValuationResult | null>(null);
  const [propertyImage, setPropertyImage] = React.useState<string | null>(null);
  const [lastData, setLastData] = React.useState<PropertyData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Persistence: Load last result on mount
  React.useEffect(() => {
    const cached = localStorage.getItem('last_valuation');
    const cachedData = localStorage.getItem('last_property');
    const cachedImage = localStorage.getItem('last_image');
    if (cached && cachedData) {
      setResult(JSON.parse(cached));
      setLastData(JSON.parse(cachedData));
      if (cachedImage) setPropertyImage(cachedImage);
    }
  }, []);

  const handleValuation = async (data: PropertyData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setPropertyImage(null);
    setLastData(data);
    
    try {
      const [valuationResult, image] = await Promise.all([
        getValuation(data),
        generatePropertyImage(data)
      ]);
      setResult(valuationResult);
      setPropertyImage(image);

      // Persistence: Cache successful result
      localStorage.setItem('last_valuation', JSON.stringify(valuationResult));
      localStorage.setItem('last_property', JSON.stringify(data));
      if (image) localStorage.setItem('last_image', image);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorDetails = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes('quota') || lower.includes('exhausted') || lower.includes('429')) {
      return {
        title: "Rate Limit Reached",
        description: "Bangalore's market is busy! We've hit our safe AI generation limit. Please wait about 60 seconds and try again.",
        icon: <Clock className="w-12 h-12 text-amber-500 mb-4" />,
        bg: "bg-amber-50",
        border: "border-amber-100",
        text: "text-amber-900",
        sub: "text-amber-700",
        btn: "bg-amber-600 hover:bg-amber-700"
      };
    }
    return {
      title: "Prediction Error",
      description: msg || "The valuation engine encountered an issue while analyzing the property. This might be due to extreme inputs or localized server downtime.",
      icon: <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />,
      bg: "bg-rose-50",
      border: "border-rose-100",
      text: "text-rose-900",
      sub: "text-rose-700",
      btn: "bg-rose-600 hover:bg-rose-700"
    };
  };

  return (
    <div className="min-h-screen font-sans selection:bg-neutral-900 selection:text-white">
      {/* Navigation Header */}
      <nav className="border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-neutral-900 p-1.5 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tighter text-xl text-neutral-900">
              www.<span className="text-neutral-400">real estate price predictor.com</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors">Engine V2.1</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors">Methodology</a>
            <button className="bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-neutral-800 transition-all">
              API Access
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full mb-6"
          >
            <Sparkles className="w-3 h-3 text-neutral-900" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">Next-Gen Real Estate Analysis</span>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.85] mb-6 whitespace-pre-line">
            Real Estate <br />
            <span className="text-neutral-300 italic font-serif -ml-2">Price Predictor</span>
          </h1>
          <p className="max-w-xl text-neutral-500 text-lg font-medium leading-relaxed">
            Professional-grade valuation engine powered by advanced AI. Get pinpoint property estimates with deep feature-level analysis and market velocity data.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Section */}
          <aside className="lg:col-span-4">
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm sticky top-28">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                  <Search className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">Property Details</h3>
                  <p className="text-xs text-neutral-400">Provide input features</p>
                </div>
              </div>
              <PropertyForm onSubmit={handleValuation} isLoading={isLoading} />
            </div>
          </aside>

          {/* Results Section */}
          <section className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-neutral-50 rounded-3xl border border-dashed border-neutral-200 h-[600px] flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-16 h-16 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mb-8" />
                  <h2 className="text-2xl font-bold mb-2">Analyzing Data Streams...</h2>
                  <p className="text-neutral-400 max-w-sm">Comparing local census data, historical sales, and property features to calculate estimated market value.</p>
                </motion.div>
              ) : result && lastData ? (
                <ResultsDisplay 
                  result={result} 
                  propertyImage={propertyImage} 
                  propertyData={lastData} 
                />
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`${getErrorDetails(error).bg} border ${getErrorDetails(error).border} p-12 rounded-[2rem] text-center flex flex-col items-center justify-center max-w-2xl mx-auto`}
                >
                  {getErrorDetails(error).icon}
                  <h3 className={`${getErrorDetails(error).text} font-black text-3xl mb-4 tracking-tight`}>
                    {getErrorDetails(error).title}
                  </h3>
                  <p className={`${getErrorDetails(error).sub} mb-8 leading-relaxed font-medium`}>
                    {getErrorDetails(error).description}
                  </p>
                  <button 
                    onClick={() => lastData && handleValuation(lastData)} 
                    className={`${getErrorDetails(error).btn} text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg flex items-center gap-3 transition-all active:scale-95`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Analysis Again
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-3xl border border-neutral-100 h-[600px] flex flex-col items-center justify-center text-center p-12 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 scale-150 pointer-events-none">
                    <Layout className="w-96 h-96" />
                  </div>
                  <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-8 border border-neutral-100">
                    <BrainCircuit className="w-10 h-10 text-neutral-300" />
                  </div>
                  <h2 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">Ready for analysis</h2>
                  <p className="text-neutral-500 max-w-sm mb-8 leading-relaxed font-medium">
                    Enter the property attributes on the left to wake up the engine. We'll generate a full report including visual previews and value drivers.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-300">
                    <span>Live Market Indices</span>
                    <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                    <span>Proprietary SHAP Engine</span>
                    <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                    <span>Real-time Trends</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      <footer className="border-t border-neutral-100 mt-24 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <BrainCircuit className="w-5 h-5" />
            <span className="font-bold tracking-tighter text-xl">real estate price predictor.com</span>
          </div>
          <div className="flex items-center gap-8 text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-neutral-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Data Collection</a>
          </div>
          <div className="flex items-center gap-4">
             <button className="text-neutral-400 hover:text-neutral-900 transition-colors">
               <Github className="w-5 h-5" />
             </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 flex justify-center">
          <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
            &copy; 2026 REAL ESTATE PREDICTOR AI • ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
}
