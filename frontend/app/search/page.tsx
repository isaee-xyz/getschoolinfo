"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchoolList from '@/components/SchoolList';

function SearchContent() {
    const searchParams = useSearchParams();
    const districtParam = searchParams.get('district') || '';
    const [schools, setSchools] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchSchools = async () => {
            try {
                // Construct query string from search params
                const params = new URLSearchParams();
                if (districtParam) params.append('district', districtParam);

                // Add support for state and search if they exist in URL
                const stateParam = searchParams.get('state');
                const queryParam = searchParams.get('search');
                if (stateParam) params.append('state', stateParam);
                if (queryParam) params.append('search', queryParam);

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setSchools(data);
                setSchools(data);
            } catch (err) {
                console.error("Error fetching schools:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchools();
    }, []);

    if (loading) {
        return <div className="container mx-auto p-8 text-center text-slate-500">Loading schools data...</div>;
    }

    return (
        <SchoolList
            initialFilters={{ district: districtParam, location: '' }}
            title={districtParam ? `Schools in ${districtParam}` : undefined}
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
