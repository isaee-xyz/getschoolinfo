"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchoolList from '@/components/SchoolList';

function SearchContent() {
    const searchParams = useSearchParams();
    const districtParam = searchParams.get('district');
    const filterParam = searchParams.get('filter');
    const stateSearchParam = searchParams.get('state');
    const searchQueryParam = searchParams.get('search');
    // Only default to Bathinda if no other search criteria provided
    const effectiveDistrict = (districtParam === null && !stateSearchParam && !searchQueryParam && !filterParam) ? 'Bathinda' : districtParam;

    const [schools, setSchools] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchSchools = async () => {
            try {
                const params = new URLSearchParams();

                if (effectiveDistrict) params.append('district', effectiveDistrict);

                const stateParam = searchParams.get('state');
                const queryParam = searchParams.get('search');
                if (stateParam) params.append('state', stateParam);
                if (queryParam) params.append('search', queryParam);

                if (filterParam === 'academic') {
                    params.append('sort', 'academic');
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const rawData = await res.json();

                const data = Array.isArray(rawData) ? rawData.map((s: any) => ({
                    ...s,
                    // Always use udise_code as the canonical ID (it's the PK in school_stats)
                    id: String(s.udise_code || s.id || s._id || Math.random())
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
        return (
            <div className="container mx-auto p-12 text-center">
                <div className="inline-flex items-center gap-3" style={{ color: 'var(--gsi-text-muted)' }}>
                    <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid var(--gsi-border)', borderTopColor: 'var(--gsi-primary)' }} />
                    <span className="text-sm font-medium">Loading schools...</span>
                </div>
            </div>
        );
    }

    // Build a descriptive title based on what filters are active
    const titleParts: string[] = [];
    if (effectiveDistrict) titleParts.push(effectiveDistrict);
    if (stateSearchParam) titleParts.push(stateSearchParam.charAt(0).toUpperCase() + stateSearchParam.slice(1).toLowerCase());
    const locationStr = titleParts.length > 0 ? titleParts.join(', ') : '';

    let title: string;
    if (searchQueryParam) {
        title = `Results for "${searchQueryParam}"${locationStr ? ` in ${locationStr}` : ''}`;
    } else if (locationStr) {
        title = `Schools in ${locationStr}${filterParam ? ` (${filterParam})` : ''}`;
    } else if (filterParam) {
        title = `Schools -- ${filterParam}`;
    } else {
        title = 'All Schools';
    }

    return (
        <SchoolList
            initialFilters={{ district: effectiveDistrict || '', state: stateSearchParam || '', location: '' }}
            title={title}
            schools={schools}
        />
    );
}

export default function SearchPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen" style={{ background: 'var(--gsi-bg)' }}>
                <Suspense fallback={
                    <div className="container mx-auto p-12 text-center">
                        <div className="inline-flex items-center gap-3" style={{ color: 'var(--gsi-text-muted)' }}>
                            <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid var(--gsi-border)', borderTopColor: 'var(--gsi-primary)' }} />
                            <span className="text-sm font-medium">Loading schools...</span>
                        </div>
                    </div>
                }>
                    <SearchContent />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
