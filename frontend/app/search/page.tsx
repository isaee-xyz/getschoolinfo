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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
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
            initialFilters={{ location: districtParam }}
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
