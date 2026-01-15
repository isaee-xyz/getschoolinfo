"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchoolList from '@/components/SchoolList';

function SearchContent() {
    const searchParams = useSearchParams();
    // Default to Bathinda if no location/search is provided (per user requirement)
    // But if 'search' (text) is present, we might search globally? 
    // For now, consistent default:
    const districtParam = searchParams.get('district');
    const filterParam = searchParams.get('filter'); // 'academic' etc.
    // If district is NULL (not in URL), default to Bathinda.
    // If district is empty string (explicitly cleared), keep it empty (All).
    const effectiveDistrict = districtParam === null ? 'Bathinda' : districtParam;

    const [schools, setSchools] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchSchools = async () => {
            try {
                // Construct query string
                const params = new URLSearchParams();

                // Always pass district unless user is searching text globally
                // Here we stick to "SchoolList" behavior: default to Bathinda
                if (effectiveDistrict) params.append('district', effectiveDistrict);

                // Add support for state and search
                const stateParam = searchParams.get('state');
                const queryParam = searchParams.get('search');
                if (stateParam) params.append('state', stateParam);
                if (queryParam) params.append('search', queryParam);

                // Handle 'filter' -> 'sort'
                if (filterParam === 'academic') {
                    params.append('sort', 'academic');
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const rawData = await res.json();

                // Map raw data to ensure 'id' property exists for SchoolCard
                const data = Array.isArray(rawData) ? rawData.map((s: any) => ({
                    ...s,
                    id: String(s.id || s._id || s.udise_code || Math.random()) // Fallback to unique ID
                })) : [];

                setSchools(data);
            } catch (err) {
                console.error("Error fetching schools:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchools();
    }, [effectiveDistrict, searchParams, filterParam]);

    if (loading) {
        return <div className="container mx-auto p-8 text-center text-slate-500">Loading schools data...</div>;
    }

    return (
        <SchoolList
            initialFilters={{ district: effectiveDistrict, location: '' }}
            title={effectiveDistrict ? `Schools in ${effectiveDistrict} ${filterParam ? `(${filterParam})` : ''}` : undefined}
            schools={schools}
        />
    );
}

export default function SearchPage() {
    return (
        <>
            <Header />
            <Suspense fallback={<div className="container mx-auto p-8 text-center text-slate-500">Loading schools...</div>}>
                <SearchContent />
            </Suspense>
            <Footer />
        </>
    );
}
