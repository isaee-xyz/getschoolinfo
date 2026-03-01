"use client";

import React, { useEffect, useState } from 'react';
import SchoolDetailClient from './SchoolDetailClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { School } from '@/types';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface Props {
    slug: string;
    city: string;
}

export default function SchoolDetailFetcher({ slug, city }: Props) {
    const [school, setSchool] = useState<School | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchool = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                console.log('[SchoolDetailFetcher] Client-side fetching:', `${apiUrl}/school/${slug}`);

                const res = await fetch(`${apiUrl}/school/${slug}`);

                if (!res.ok) {
                    if (res.status === 404) {
                        setError('School not found. It may have been removed or the link may be incorrect.');
                    } else {
                        setError(`Failed to load school data (status: ${res.status})`);
                    }
                    return;
                }

                const data = await res.json();
                setSchool(data);
            } catch (err) {
                console.error('[SchoolDetailFetcher] Error:', err);
                setError('Could not connect to the server. Please check if the backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchSchool();
    }, [slug]);

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gsi-bg)' }}>
                    <div className="text-center">
                        <div className="w-10 h-10 rounded-full animate-spin mx-auto mb-4"
                            style={{ border: '3px solid var(--gsi-border)', borderTopColor: 'var(--gsi-primary)' }} />
                        <p className="text-sm" style={{ color: 'var(--gsi-text-muted)' }}>Loading school details...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error || !school) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--gsi-bg)' }}>
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'var(--gsi-danger-light)' }}>
                            <AlertCircle className="w-8 h-8" style={{ color: 'var(--gsi-danger)' }} />
                        </div>
                        <h1 className="text-xl font-bold mb-2 font-display" style={{ color: 'var(--gsi-text)' }}>
                            School Not Found
                        </h1>
                        <p className="text-sm mb-6" style={{ color: 'var(--gsi-text-muted)' }}>
                            {error || 'The requested school could not be found.'}
                        </p>
                        <Link
                            href="/search"
                            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 text-white rounded-lg transition-colors"
                            style={{ background: 'var(--gsi-primary)' }}
                        >
                            <ArrowLeft className="w-4 h-4" /> Browse Schools
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return <SchoolDetailClient school={school} />;
}
