"use client";

import React from 'react';
import { FilterState } from '../types';
import { SlidersHorizontal } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters }) => {
  const handleCheckboxChange = (key: keyof FilterState) => {
    // @ts-ignore - simple toggle for boolean keys
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal className="w-5 h-5 text-blue-600" />
        <h2 className="font-bold text-slate-900">Pin Point Filters</h2>
      </div>

      <div className="space-y-6">
        {/* Budget */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Max Annual Fee (₹{(filters.maxFee / 1000).toFixed(0)}k)
          </label>
          <input
            type="range"
            min="0"
            max="200000"
            step="5000"
            value={filters.maxFee}
            onChange={(e) => setFilters(prev => ({ ...prev, maxFee: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₹0</span>
            <span>₹2L+</span>
          </div>
        </div>

        {/* RTE & Policy Benchmarks (New) */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Govt. Standards</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.rteCompliant}
                onChange={() => handleCheckboxChange('rteCompliant')}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div className="flex flex-col">
                <span className="text-sm text-slate-700 font-medium">RTE Compliant</span>
                <span className="text-[10px] text-gray-400">STR ≤ 30 & Basic Hygiene</span>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.genderBalanced}
                onChange={() => handleCheckboxChange('genderBalanced')}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div className="flex flex-col">
                <span className="text-sm text-slate-700 font-medium">Gender Balanced</span>
                <span className="text-[10px] text-gray-400">GPI 0.9 - 1.1</span>
              </div>
            </label>
          </div>
        </div>

        {/* Quality Filters */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Quality & Infrastructure</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.smartClass}
                onChange={() => handleCheckboxChange('smartClass')}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Smart Classrooms</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.qualifiedStaff}
                onChange={() => handleCheckboxChange('qualifiedStaff')}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Qualified Staff</span>
            </label>
          </div>
        </div>

        {/* Safety */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Safety & Inclusion</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.securePerimeter}
                onChange={() => handleCheckboxChange('securePerimeter')}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Perimeter Secure</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.disabilityFriendly}
                onChange={() => handleCheckboxChange('disabilityFriendly')}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Disability Friendly</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;