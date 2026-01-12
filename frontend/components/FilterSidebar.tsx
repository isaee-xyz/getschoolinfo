"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { FilterState } from '../types';
import { SlidersHorizontal, ChevronDown, Search, X } from 'lucide-react';
import { useLocations } from '../hooks/useLocations';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters }) => {
  const { districts, states, blocks, fetchBlocks } = useLocations();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for Searchable Dropdown
  const [districtSearch, setDistrictSearch] = useState("");
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const districtDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target as Node)) {
        setIsDistrictOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch blocks when district changes
  useEffect(() => {
    if (filters.district) {
      fetchBlocks(filters.district);
    } else {
      if (filters.blocks && filters.blocks.length > 0) {
        setFilters(prev => ({ ...prev, blocks: [] }));
      }
    }
  }, [filters.district]);

  // Logic: Auto-select State when District is chosen
  useEffect(() => {
    if (filters.district && districts.length > 0) {
      const match = districts.find(d => d.name.toLowerCase() === filters.district.toLowerCase());

      // Auto-select State if not already selected or different
      if (match && match.state && filters.state !== match.state) {
        setFilters(prev => ({ ...prev, state: match.state }));
      }
    }
  }, [filters.district, districts]);

  // Logic: Filter Districts based on Selected State
  const filteredDistricts = useMemo(() => {
    let d = districts;

    // 1. Filter by State
    if (filters.state) {
      d = d.filter(item => item.state === filters.state);
    }

    // 2. Filter by Search Text (in dropdown)
    if (districtSearch) {
      d = d.filter(item => item.name.toLowerCase().includes(districtSearch.toLowerCase()));
    }

    // 3. Sort Alphabetically
    return d.sort((a, b) => a.name.localeCompare(b.name));
  }, [districts, filters.state, districtSearch]);


  // Auto-select all blocks when available
  useEffect(() => {
    if (filters.district && blocks.length > 0) {
      setFilters(prev => ({ ...prev, blocks: blocks }));
    }
  }, [blocks, filters.district]);


  // Handlers
  const handleCheckboxChange = (key: keyof FilterState) => {
    // @ts-ignore
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setFilters(prev => ({ ...prev, state: newState, district: '', blocks: [] })); // Reset district when state changes
    updateUrl({ state: newState, district: '' });
  };

  const handleDistrictSelect = (districtName: string) => {
    setFilters(prev => ({ ...prev, district: districtName, blocks: [] }));
    setDistrictSearch(""); // Reset search
    setIsDistrictOpen(false); // Close dropdown
    updateUrl({ district: districtName });
  };

  const clearDistrict = () => {
    setFilters(prev => ({ ...prev, district: '', blocks: [] }));
    setDistrictSearch("");
    updateUrl({ district: '' });
  };

  const updateUrl = (updates: Partial<Record<string, string>>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/search?${params.toString()}`);
  };

  const handleBlockToggle = (block: string) => {
    setFilters(prev => {
      const currentBlocks = prev.blocks || [];
      return currentBlocks.includes(block)
        ? { ...prev, blocks: currentBlocks.filter(b => b !== block) }
        : { ...prev, blocks: [...currentBlocks, block] };
    });
  };

  const toggleAllBlocks = () => {
    setFilters(prev => {
      const allSelected = blocks.every(b => prev.blocks?.includes(b));
      return { ...prev, blocks: allSelected ? [] : [...blocks] };
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
        <div className="pb-4 border-b border-gray-100 space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Location</h3>

          {/* State Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
            <div className="relative">
              <select
                value={filters.state || ''}
                onChange={handleStateChange}
                className="w-full text-sm p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
              >
                <option value="">All States</option>
                {states.sort().map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Searchable District Dropdown */}
          <div ref={districtDropdownRef} className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1">District</label>

            {/* Trigger / Input */}
            <div
              className="relative w-full border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-400"
              onClick={() => setIsDistrictOpen(!isDistrictOpen)}
            >
              <div className="flex items-center justify-between p-2">
                <span className={`text-sm ${filters.district ? 'text-slate-900 font-medium' : 'text-gray-500'}`}>
                  {filters.district || "Select District"}
                </span>
                <div className="flex items-center gap-1">
                  {filters.district && (
                    <button
                      onClick={(e) => { e.stopPropagation(); clearDistrict(); }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDistrictOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 flex flex-col">
                {/* Search Input */}
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-500 outline-none"
                      placeholder="Search..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()} // Prevent closing
                      autoFocus
                    />
                  </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1">
                  {filteredDistricts.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 text-center">No districts found</div>
                  ) : (
                    filteredDistricts.map((d) => (
                      <div
                        key={d.name}
                        onClick={() => handleDistrictSelect(d.name)}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex justify-between items-center ${filters.district === d.name ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                      >
                        {d.name}
                        {/* Optional: Show state name if state filter not active to help disambiguate */}
                        {!filters.state && <span className="text-[10px] text-gray-400">{d.state}</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Block Multi-Select */}
          {filters.district && blocks.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Blocks</label>

              <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-100 p-2 rounded bg-gray-50 custom-scrollbar">
                {/* Select All */}
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

        {/* RTE & Policy Benchmarks */}
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