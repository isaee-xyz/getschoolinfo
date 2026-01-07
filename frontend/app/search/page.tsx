"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchoolList from '@/components/SchoolList';

function SearchContent() {
    const searchParams = useSearchParams();
    const districtParam = searchParams.get('district') || '';

    return (
        <SchoolList
            initialFilters={{ location: districtParam }}
            title={districtParam ? `Schools in ${districtParam}` : undefined}
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
