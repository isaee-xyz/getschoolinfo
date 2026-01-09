"use client";

import React, { useEffect } from 'react';
import { FilterState } from '../types';
import { SlidersHorizontal } from 'lucide-react';
import { useLocations } from '../hooks/useLocations';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters }) => {
  const { districts, blocks, fetchBlocks } = useLocations();

  // Fetch blocks when district changes
  useEffect(() => {
    if (filters.district) {
      fetchBlocks(filters.district);
    } else {
      // Clear blocks if no district is selected
      if (filters.blocks && filters.blocks.length > 0) {
        setFilters(prev => ({ ...prev, blocks: [] }));
      }
    }
  }, [filters.district]);

  // Auto-select all blocks when they define/change (and we have a district)
  // Check if we already have blocks selected to avoid overriding user un-selection
  // For now, let's auto-select only if the blocks list changes and is non-empty, 
  // ensuring we populate the initial view.
  // Auto-select all blocks when they define/change (and we have a district)
  useEffect(() => {
    // 1. Normalize District Case: URL might be 'bhopal', DB might be 'BHOPAL'
    if (districts.length > 0 && filters.district) {
      const match = districts.find(d => d.toLowerCase() === filters.district.toLowerCase());
      if (match && match !== filters.district) {
        setFilters(prev => ({ ...prev, district: match }));
      }
    }

    // 2. Auto-select blocks
    if (filters.district && blocks.length > 0) {
      setFilters(prev => {
        // Only auto-select if we have 0 selected blocks, implies fresh fetch
        if (!prev.blocks || prev.blocks.length === 0) {
          return { ...prev, blocks: blocks };
        }
        return prev;
      });
    }
  }, [blocks, districts, filters.district]);

  const handleCheckboxChange = (key: keyof FilterState) => {
    // @ts-ignore - simple toggle for boolean keys
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBlockToggle = (block: string) => {
    setFilters(prev => {
      const currentBlocks = prev.blocks || [];
      if (currentBlocks.includes(block)) {
        return { ...prev, blocks: currentBlocks.filter(b => b !== block) };
      } else {
        return { ...prev, blocks: [...currentBlocks, block] };
      }
    });
  };

  const toggleAllBlocks = () => {
    setFilters(prev => {
      const allSelected = blocks.every(b => prev.blocks?.includes(b));
      if (allSelected) {
        return { ...prev, blocks: [] };
      } else {
        return { ...prev, blocks: [...blocks] };
      }
    });
  };

  const isAllBlocksSelected = blocks.length > 0 && blocks.every(b => filters.blocks?.includes(b));

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal className="w-5 h-5 text-blue-600" />
        <h2 className="font-bold text-slate-900">Pin Point Filters</h2>
      </div>

      <div className="space-y-6">
        {/* Location Filters */}
        <div className="pb-4 border-b border-gray-100">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Location</h3>

          {/* District Select */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">District</label>
            <select
              value={filters.district}
              onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value, blocks: [] }))}
              className="w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select District</option>
              {districts.map((d: string) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Block Multi-Select */}
          {filters.district && blocks.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Blocks</label>

              <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-100 p-2 rounded bg-gray-50">
                {/* Select All Option */}
                <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={isAllBlocksSelected}
                    onChange={toggleAllBlocks}
                    className="w-3 h-3 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-xs font-bold text-slate-800">Select All</span>
                </label>

                {blocks.map((block: string) => (
                  <label key={block} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.blocks?.includes(block) || false}
                      onChange={() => handleBlockToggle(block)}
                      className="w-3 h-3 text-blue-600 rounded border-gray-300"
                    />
                    <span className="text-xs text-slate-700">{block}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

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