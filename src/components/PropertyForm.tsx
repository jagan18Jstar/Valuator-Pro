/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PropertyData } from '../types';
import { Home, Bed, Bath, History, MapPin, Building2, Calculator } from 'lucide-react';
import { motion } from 'motion/react';

interface PropertyFormProps {
  onSubmit: (data: PropertyData) => void;
  isLoading: boolean;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = React.useState<PropertyData>({
    sqft: 1800,
    beds: 3,
    baths: 2,
    age: 5,
    neighborhood: 'Indiranagar',
    zoningType: 'Residential',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'neighborhood' || name === 'zoningType') ? value : Number(value),
    }));
  };

  return (
    <form id="property-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Neighborhood */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
            <MapPin className="w-3 h-3" /> Neighborhood
          </label>
          <input
            id="neighborhood"
            name="neighborhood"
            type="text"
            list="bangalore-localities"
            value={formData.neighborhood}
            onChange={handleChange}
            placeholder="e.g. Indiranagar, Whitefield..."
            className="w-full bg-white border border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
            required
          />
          <datalist id="bangalore-localities">
            <option value="Indiranagar" />
            <option value="Whitefield" />
            <option value="Koramangala" />
            <option value="HSR Layout" />
            <option value="Jayanagar" />
            <option value="Electronic City" />
            <option value="Sarjapur Road" />
            <option value="Hebbal" />
            <option value="JP Nagar" />
            <option value="Bannerghatta Road" />
            <option value="Frazer Town" />
            <option value="Malleshwaram" />
            <option value="Yelahanka" />
          </datalist>
        </div>

        {/* Zoning */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
            <Building2 className="w-3 h-3" /> Zoning Type
          </label>
          <select
            id="zoningType"
            name="zoningType"
            value={formData.zoningType}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-sm appearance-none"
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Mixed-Use">Mixed-Use</option>
          </select>
        </div>

        {/* SqFt */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
            <Home className="w-3 h-3" /> Area (Sq.Ft.)
          </label>
          <input
            id="sqft"
            name="sqft"
            type="number"
            value={formData.sqft}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
            required
          />
        </div>

        {/* Beds/Baths */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <Bed className="w-3 h-3" /> Beds
            </label>
            <input
              id="beds"
              name="beds"
              type="number"
              value={formData.beds}
              onChange={handleChange}
              className="w-full bg-white border border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
              step="1"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <Bath className="w-3 h-3" /> Baths
            </label>
            <input
              id="baths"
              name="baths"
              type="number"
              value={formData.baths}
              onChange={handleChange}
              className="w-full bg-white border border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
              step="0.5"
              required
            />
          </div>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
            <History className="w-3 h-3" /> Property Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            className="w-full bg-white border border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
            required
          />
        </div>
      </div>

      <motion.button
        id="submit-valuation"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="w-full bg-neutral-900 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neutral-200 transition-all"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Calculator className="w-5 h-5" />
            Analyze Market Value
          </>
        )}
      </motion.button>
    </form>
  );
};
