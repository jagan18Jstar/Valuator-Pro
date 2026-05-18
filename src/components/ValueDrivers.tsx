/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ValueDriver } from '../types';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface ValueDriversProps {
  drivers: ValueDriver[];
}

export const ValueDrivers: React.FC<ValueDriversProps> = ({ drivers }) => {
  return (
    <div id="value-drivers" className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
          <Info className="w-4 h-4" /> Value Drivers (AI SHAP)
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {drivers.map((driver, index) => (
          <div 
            key={index} 
            className="group relative bg-neutral-50 border border-neutral-100 p-4 rounded-xl flex items-center gap-4 transition-all hover:bg-white hover:shadow-md hover:border-neutral-200"
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              driver.type === 'positive' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {driver.type === 'positive' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 overflow-hidden">
                <span className="font-semibold text-neutral-900 truncate">{driver.feature}</span>
                <span className={cn(
                  "font-mono text-xs font-bold whitespace-nowrap",
                  driver.type === 'positive' ? "text-emerald-600" : "text-rose-600"
                )}>
                  {driver.type === 'positive' ? '+' : ''}{driver.impact}%
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                {driver.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
