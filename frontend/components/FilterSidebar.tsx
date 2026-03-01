"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { FilterState } from '../types';
import { SlidersHorizontal, ChevronDown, Search, X, MapPin, IndianRupee } from 'lucide-react';
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

  const feeLabel = filters.maxFee >= 200000
    ? '₹2L+ (Any)'
    : `₹${(filters.maxFee / 1000).toFixed(0)}k`;

  return (
    <div className="rounded-xl shadow-sm sticky top-24 overflow-hidden" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4" style={{ background: 'var(--gsi-primary-50)', borderBottom: '1px solid var(--gsi-border-light)' }}>
        <SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--gsi-primary)' }} />
        <h2 className="text-sm font-bold tracking-tight font-display" style={{ color: 'var(--gsi-text)' }}>Refine Results</h2>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Location Section ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--gsi-text-muted)' }} />
            <h3 className="text-[11px] uppercase tracking-wider font-bold" style={{ color: 'var(--gsi-text-muted)' }}>Location</h3>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--gsi-text-secondary)' }}>State</label>
            <div className="relative">
              <select
                value={filters.state || ''}
                onChange={handleStateChange}
                className="w-full text-sm p-2.5 pr-8 rounded-lg outline-none appearance-none transition-colors"
                style={{
                  background: 'var(--gsi-surface)',
                  border: '1px solid var(--gsi-border)',
                  color: 'var(--gsi-text-secondary)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--gsi-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--gsi-border)'}
              >
                <option value="">All States</option>
                {states.sort().map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 pointer-events-none" style={{ color: 'var(--gsi-text-muted)' }} />
            </div>
          </div>

          {/* Searchable District Dropdown */}
          <div ref={districtDropdownRef} className="relative">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--gsi-text-secondary)' }}>District</label>

            {/* Trigger / Input */}
            <div
              className="relative w-full rounded-lg cursor-pointer transition-colors"
              onClick={() => setIsDistrictOpen(!isDistrictOpen)}
              style={{
                background: 'var(--gsi-surface)',
                border: `1px solid ${isDistrictOpen ? 'var(--gsi-primary)' : 'var(--gsi-border)'}`,
              }}
            >
              <div className="flex items-center justify-between p-2.5">
                <span className="text-sm" style={{ color: filters.district ? 'var(--gsi-text)' : 'var(--gsi-text-muted)', fontWeight: filters.district ? 500 : 400 }}>
                  {filters.district || "Select District"}
                </span>
                <div className="flex items-center gap-1">
                  {filters.district && (
                    <button
                      onClick={(e) => { e.stopPropagation(); clearDistrict(); }}
                      className="p-1 rounded-full transition-colors"
                      style={{ color: 'var(--gsi-text-muted)' }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDistrictOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--gsi-text-muted)' }} />
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDistrictOpen && (
              <div className="absolute z-10 w-full mt-1.5 rounded-lg shadow-lg max-h-60 flex flex-col animate-scale-in" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)' }}>
                {/* Search Input */}
                <div className="p-2" style={{ borderBottom: '1px solid var(--gsi-border-light)' }}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5" style={{ color: 'var(--gsi-text-muted)' }} />
                    <input
                      type="text"
                      className="w-full pl-8 pr-2 py-2 text-sm rounded-md outline-none transition-colors"
                      placeholder="Type to search..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ border: '1px solid var(--gsi-border)', background: 'var(--gsi-surface)' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--gsi-primary)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--gsi-border)'}
                      autoFocus
                    />
                  </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {filteredDistricts.length === 0 ? (
                    <div className="p-3 text-sm text-center" style={{ color: 'var(--gsi-text-muted)' }}>No districts found</div>
                  ) : (
                    filteredDistricts.map((d) => (
                      <div
                        key={d.name}
                        onClick={() => handleDistrictSelect(d.name)}
                        className="px-3 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors"
                        style={
                          filters.district === d.name
                            ? { background: 'var(--gsi-primary-50)', color: 'var(--gsi-primary-dark)', fontWeight: 600 }
                            : {}
                        }
                        onMouseEnter={(e) => {
                          if (filters.district !== d.name) e.currentTarget.style.background = 'var(--gsi-bg-warm)';
                        }}
                        onMouseLeave={(e) => {
                          if (filters.district !== d.name) e.currentTarget.style.background = '';
                        }}
                      >
                        <span>{d.name}</span>
                        {!filters.state && <span className="text-[10px] ml-2" style={{ color: 'var(--gsi-text-muted)' }}>{d.state}</span>}
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
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--gsi-text-secondary)' }}>Blocks</label>

              <div className="max-h-40 overflow-y-auto space-y-1 p-2.5 rounded-lg custom-scrollbar" style={{ background: 'var(--gsi-bg-warm)', border: '1px solid var(--gsi-border-light)' }}>
                {/* Select All */}
                <label className="flex items-center gap-2.5 cursor-pointer pb-2 mb-1" style={{ borderBottom: '1px solid var(--gsi-border)' }}>
                  <input
                    type="checkbox"
                    checked={isAllBlocksSelected}
                    onChange={toggleAllBlocks}
                    className="w-3.5 h-3.5 rounded accent-teal-600"
                    style={{ borderColor: 'var(--gsi-border)' }}
                  />
                  <span className="text-xs font-bold" style={{ color: 'var(--gsi-text-secondary)' }}>Select All</span>
                </label>

                {blocks.map((block: string) => (
                  <label key={block} className="flex items-center gap-2.5 cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={filters.blocks?.includes(block) || false}
                      onChange={() => handleBlockToggle(block)}
                      className="w-3.5 h-3.5 rounded accent-teal-600"
                      style={{ borderColor: 'var(--gsi-border)' }}
                    />
                    <span className="text-xs" style={{ color: 'var(--gsi-text-secondary)' }}>{block}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: '1px solid var(--gsi-border-light)' }} />

        {/* ── Budget Section ── */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <IndianRupee className="w-3.5 h-3.5" style={{ color: 'var(--gsi-text-muted)' }} />
            <h3 className="text-[11px] uppercase tracking-wider font-bold" style={{ color: 'var(--gsi-text-muted)' }}>Budget</h3>
          </div>

          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold" style={{ color: 'var(--gsi-text-secondary)' }}>Max Annual Fee</label>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: 'var(--gsi-primary-50)', color: 'var(--gsi-primary-dark)' }}>
              {feeLabel}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="200000"
            step="5000"
            value={filters.maxFee}
            onChange={(e) => setFilters(prev => ({ ...prev, maxFee: Number(e.target.value) }))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-teal-600"
            style={{ background: 'var(--gsi-border)' }}
          />
          <div className="flex justify-between text-[10px] mt-1.5 font-medium" style={{ color: 'var(--gsi-text-muted)' }}>
            <span>Free</span>
            <span>₹2 Lakh+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
