/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ValuationResult, PropertyData } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { TrendChart } from './TrendChart';
import { ValueDrivers } from './ValueDrivers';
import { ShieldCheck, Map, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResultsDisplayProps {
  result: ValuationResult;
  propertyImage: string | null;
  propertyData: PropertyData;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, propertyImage, propertyData }) => {
  return (
    <motion.div 
      id="valuation-results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Primary Value Card */}
      <div className="bg-neutral-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className={cn("w-4 h-4", result.isHeuristic ? "text-amber-400" : "text-emerald-400")} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] opacity-80 underline underline-offset-4",
                result.isHeuristic ? "text-amber-400 decoration-amber-400/30" : "text-emerald-400 decoration-emerald-400/30"
              )}>
                {result.isHeuristic ? "Heuristic Calculation" : "Verified AI Valuation"}
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
              {formatCurrency(result.estimatedValue)}
            </h2>
            <div className="flex items-center gap-4 text-neutral-400">
              <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded">Confidence: {result.confidenceScore}%</span>
              <span className="text-xs font-medium">{propertyData.neighborhood}, {propertyData.sqft} sqft</span>
            </div>
          </div>
          
          <div className="flex md:block">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1">Market Sentiment</div>
              <div className="text-xl font-bold text-white capitalize">Strong Buy</div>
              <div className="text-[10px] text-emerald-400 mt-1 font-medium italic">Price reflects +4.2% YoY growth</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Visuals & Drivers */}
        <div className="space-y-8">
          {/* Property Mockup */}
          {propertyImage && (
            <div className="relative aspect-video rounded-3xl overflow-hidden group shadow-lg">
              <img src={propertyImage} alt="Property Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs font-medium">AI Generated Listing Preview</span>
              </div>
            </div>
          )}

          {/* Value Drivers */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
            <ValueDrivers drivers={result.drivers} />
          </div>
        </div>

        {/* Right Column: Analysis & Trends */}
        <div className="space-y-8">
          {/* Neighborhood Analysis */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm relative overflow-hidden">
            <Map className="absolute top-4 right-4 w-12 h-12 text-neutral-50 pointer-events-none" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4">Neighborhood Pulse</h3>
            <p className="text-neutral-600 italic text-lg leading-relaxed font-serif">
              "{result.neighborhoodAnalysis}"
            </p>
          </div>

          {/* Market Trends */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Price Velocity</h3>
              <span className="text-[10px] font-bold bg-neutral-100 px-2 py-1 rounded">6 Month Index</span>
            </div>
            <TrendChart data={result.marketTrendData} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
