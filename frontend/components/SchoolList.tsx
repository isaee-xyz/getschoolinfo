"use client";

import React, { useState, useMemo } from 'react';
import FilterSidebar from '@/components/FilterSidebar';
import SchoolCard from '@/components/SchoolCard';
import { MOCK_SCHOOLS } from '@/constants';
import { FilterState } from '@/types';
import { SlidersHorizontal } from 'lucide-react';

interface SchoolListProps {
    initialFilters?: Partial<FilterState>;
    title?: string;
    subtitle?: string;
    schools?: typeof MOCK_SCHOOLS; // Allow passing pre-filtered schools (SSR) or default to MOCK
}

export default function SchoolList({ initialFilters, title, subtitle, schools = MOCK_SCHOOLS }: SchoolListProps) {
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [visibleCount, setVisibleCount] = useState(50);

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

    // Sync district from props if URL changes
    React.useEffect(() => {
        if (initialFilters?.district) {
            setFilters(prev => ({ ...prev, district: initialFilters.district! }));
        }
    }, [initialFilters?.district]);

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
            // If user selected a district in sidebar, match it exactly.
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
                // Mock data needs board normalization, assuming simple string match for now
                const schoolBoard = school.boardSecName;
                // check if schoolBoard is included in selected boards
                // (This needs robust data normalization in real app)
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

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-4">
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 p-3 rounded-lg font-semibold text-slate-700"
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className={`md:w-1/4 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
                    <FilterSidebar filters={filters} setFilters={setFilters} />
                </aside>

                {/* Results */}
                <main className="md:w-3/4">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {title ? title : `Found ${filteredSchools.length} Schools`}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {subtitle ? subtitle : "Showing schools verified by government data (2024-25) with Policy-Benchmarked Metrics."}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {filteredSchools.length > 0 ? (
                            <>
                                {filteredSchools.slice(0, visibleCount).map(school => (
                                    <SchoolCard key={school.id} school={school} />
                                ))}

                                {visibleCount < filteredSchools.length && (
                                    <div className="text-center mt-8">
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 12)}
                                            className="bg-white border border-gray-300 text-slate-700 font-bold py-3 px-8 rounded-full shadow-sm hover:bg-gray-50 hover:shadow-md transition-all"
                                        >
                                            Load More Schools ({filteredSchools.length - visibleCount} remaining)
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                                <p className="text-slate-500 text-lg">No schools match your specific criteria.</p>
                                <button
                                    onClick={() => setFilters({
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
                                    })}
                                    className="mt-4 text-blue-600 font-semibold hover:underline"
                                >
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
