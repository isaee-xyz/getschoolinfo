"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import FilterSidebar from '@/components/FilterSidebar';
import SchoolCard from '@/components/SchoolCard';
import { MOCK_SCHOOLS } from '@/constants';
import { FilterState } from '@/types';
import { SlidersHorizontal, SearchX, RotateCcw, Loader2 } from 'lucide-react';

interface SchoolListProps {
    initialFilters?: Partial<FilterState>;
    title?: string;
    subtitle?: string;
    schools?: typeof MOCK_SCHOOLS; // Allow passing pre-filtered schools (SSR) or default to MOCK
}

export default function SchoolList({ initialFilters, title, subtitle, schools = MOCK_SCHOOLS }: SchoolListProps) {
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const [filters, setFilters] = useState<FilterState>({
        location: initialFilters?.location || '',
        district: initialFilters?.district || '',
        state: initialFilters?.state || '',
        blocks: initialFilters?.blocks || [],
        maxFee: initialFilters?.maxFee || 200000,
        board: initialFilters?.board || [],
        grade: initialFilters?.grade || '',
        smartClass: initialFilters?.smartClass || false,
        qualifiedStaff: initialFilters?.qualifiedStaff || false,
        securePerimeter: initialFilters?.securePerimeter || false,
        disabilityFriendly: initialFilters?.disabilityFriendly || false,
        rteCompliant: initialFilters?.rteCompliant || false,
        genderBalanced: initialFilters?.genderBalanced || false
    });

    // Sync district and state from props if URL changes
    React.useEffect(() => {
        const updates: Partial<FilterState> = {};
        if (initialFilters?.district && initialFilters.district !== filters.district) {
            updates.district = initialFilters.district;
        }
        if (initialFilters?.state && initialFilters.state !== filters.state) {
            updates.state = initialFilters.state;
        }
        if (Object.keys(updates).length > 0) {
            setFilters(prev => ({ ...prev, ...updates }));
        }
    }, [initialFilters?.district, initialFilters?.state]);

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(10);
    }, [filters]);

    const filteredSchools = useMemo(() => {
        return schools.filter(school => {
            // Location Filter (Legacy & Search Text)
            if (filters.location) {
                const search = filters.location.toLowerCase();
                const matchesLoc =
                    school.district.toLowerCase().includes(search) ||
                    school.name.toLowerCase().includes(search) ||
                    school.pincode.includes(search);
                if (!matchesLoc) return false;
            }

            // Explicit District Filter (Dropdown)
            if (filters.district) {
                if (school.district.toLowerCase() !== filters.district.toLowerCase()) return false;
            }

            // Block Filter (Multi-select)
            if (filters.blocks && filters.blocks.length > 0) {
                if (!filters.blocks.includes(school.block)) return false;
            }

            // Budget
            if (school.tuitionFeeInRupees > filters.maxFee) return false;

            // Board (if array is not empty)
            if (filters.board.length > 0) {
                const schoolBoard = school.boardSecName;
            }

            // Quality: Smart Classrooms
            if (filters.smartClass) {
                if ((school.digiBoardTot + school.projectorTot) === 0) return false;
            }

            // Quality: Qualified Staff
            if (filters.qualifiedStaff) {
                if (school.totTchPgraduateAbove < 10) return false;
            }

            // Safety: Perimeter
            if (filters.securePerimeter) {
                if (school.bndrywallType !== 'Pucca') return false;
            }

            // Inclusion
            if (filters.disabilityFriendly) {
                if (school.rampsYn !== 1 || school.toiletbCwsnFun === 0) return false;
            }

            // RTE Compliant
            if (filters.rteCompliant) {
                const str = school.totalTeacher > 0 ? school.rowTotal / school.totalTeacher : 99;
                if (str > 30) return false;
                if ((school.toiletbFun + school.toiletgFun) === 0) return false;
            }

            // Gender Balanced
            if (filters.genderBalanced) {
                if (!school.rowBoyTotal || school.rowBoyTotal === 0) return false;
                const gpi = school.rowGirlTotal / school.rowBoyTotal;
                if (gpi < 0.9 || gpi > 1.1) return false;
            }

            return true;
        });
    }, [filters, schools]);

    // Infinite scroll with IntersectionObserver
    const loadMore = useCallback(() => {
        setIsLoadingMore(true);
        // Small delay to show loading indicator and avoid jarring jumps
        setTimeout(() => {
            setVisibleCount(prev => prev + 10);
            setIsLoadingMore(false);
        }, 300);
    }, []);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && visibleCount < filteredSchools.length && !isLoadingMore) {
                    loadMore();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [visibleCount, filteredSchools.length, isLoadingMore, loadMore]);

    const clearAllFilters = () => {
        setFilters({
            location: '',
            district: '',
            state: '',
            blocks: [],
            maxFee: 200000,
            board: [],
            grade: '',
            smartClass: false,
            qualifiedStaff: false,
            securePerimeter: false,
            disabilityFriendly: false,
            rteCompliant: false,
            genderBalanced: false
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl font-semibold text-sm transition-colors"
                    style={{
                        background: 'var(--gsi-surface)',
                        border: '1px solid var(--gsi-border)',
                        color: 'var(--gsi-text-secondary)',
                    }}
                >
                    <SlidersHorizontal className="w-4 h-4" style={{ color: showMobileFilters ? 'var(--gsi-primary)' : undefined }} />
                    {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
                {/* Sidebar */}
                <aside className={`md:w-72 lg:w-80 shrink-0 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
                    <FilterSidebar filters={filters} setFilters={setFilters} />
                </aside>

                {/* Results */}
                <main className="flex-1 min-w-0">
                    {/* Results Header */}
                    <div className="mb-5">
                        <div className="flex items-end justify-between gap-4 flex-wrap">
                            <div>
                                <h1 className="text-xl lg:text-2xl font-bold tracking-tight font-display" style={{ color: 'var(--gsi-text)' }}>
                                    {title ? title : (
                                        <>
                                            <span style={{ color: 'var(--gsi-primary)' }}>{filteredSchools.length.toLocaleString()}</span>
                                            {' '}Schools Found
                                        </>
                                    )}
                                </h1>
                                <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--gsi-text-muted)' }}>
                                    {subtitle ? subtitle : "Government-reported data from UDISE+ (2024-25)"}
                                </p>
                            </div>
                        </div>

                        {/* Active filter chips */}
                        {(filters.district || filters.state) && (
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {filters.state && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)', color: 'var(--gsi-text-secondary)' }}>
                                        {filters.state}
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, state: '', district: '', blocks: [] }))}
                                            className="ml-0.5 transition-colors"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.district && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full text-white"
                                        style={{ background: 'var(--gsi-primary)', borderColor: 'var(--gsi-primary)' }}>
                                        {filters.district}
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, district: '', blocks: [] }))}
                                            className="ml-0.5 opacity-80 hover:opacity-100 transition-opacity"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* School Cards */}
                    <div className="space-y-4">
                        {filteredSchools.length > 0 ? (
                            <>
                                {filteredSchools.slice(0, visibleCount).map((school, index) => (
                                    <SchoolCard key={school.id} school={school} />
                                ))}

                                {/* Infinite scroll sentinel */}
                                {visibleCount < filteredSchools.length && (
                                    <div ref={sentinelRef} className="flex flex-col items-center justify-center py-8 gap-2">
                                        {isLoadingMore ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gsi-primary)' }} />
                                                <span className="text-xs font-medium" style={{ color: 'var(--gsi-text-muted)' }}>
                                                    Loading more schools...
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-xs" style={{ color: 'var(--gsi-text-muted)' }}>
                                                {filteredSchools.length - visibleCount} more schools below
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* All loaded indicator */}
                                {visibleCount >= filteredSchools.length && filteredSchools.length > 10 && (
                                    <div className="text-center py-6">
                                        <span className="text-xs font-medium" style={{ color: 'var(--gsi-text-muted)' }}>
                                            Showing all {filteredSchools.length} schools
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Empty State */
                            <div className="text-center py-16 rounded-xl" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)' }}>
                                <SearchX className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--gsi-border)' }} />
                                <h3 className="text-lg font-semibold mb-1 font-display" style={{ color: 'var(--gsi-text-secondary)' }}>No schools match your criteria</h3>
                                <p className="text-sm mb-5 max-w-sm mx-auto" style={{ color: 'var(--gsi-text-muted)' }}>
                                    Try broadening your filters or selecting a different location.
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                                    style={{ color: 'var(--gsi-primary)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-primary-50)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = ''}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
