import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchoolList from '@/components/SchoolList';

// --- Configuration ---

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// --- Helper: Fetch schools by district from the API ---

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchSchoolsByDistrict(district: string) {
    try {
        const res = await fetch(`${API_BASE}/schools?district=${encodeURIComponent(district)}&limit=500`, {
            next: { revalidate: 3600 }, // Cache for 1 hour on server
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data)
            ? data.map((s: any) => ({
                ...s,
                id: String(s.udise_code || s.id || ''),
            }))
            : [];
    } catch (err) {
        console.error('Failed to fetch schools for district:', district, err);
        return [];
    }
}

// --- Metadata ---

type Props = {
    params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { city } = await params;
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ');

    return {
        title: `Top Schools in ${formattedCity} | Fees, Reviews & Admissions 2025`,
        description: `Find the best schools in ${formattedCity}. Compare fees, board affiliation (CBSE/ICSE), infrastructure, and academic results for top-rated schools in ${formattedCity}.`,
        alternates: {
            canonical: `https://getschoolinfo.com/city/${city}`,
        }
    };
}

// --- Page Component ---

export default async function CityPage({ params }: Props) {
    const { city } = await params;
    const districtSearch = city.replace(/-/g, ' ');

    const citySchools = await fetchSchoolsByDistrict(districtSearch);

    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ');
    const count = citySchools.length;

    // JSON-LD for "SearchResultsPage"
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": citySchools.slice(0, 10).map((school: any, index: number) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://getschoolinfo.com/${(school.district || city).toLowerCase().replace(/\s+/g, '-')}/${school.slug || school.udise_code || school.id}`,
                "name": school.name
            }))
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Header />
            <main className="min-h-screen" style={{ background: 'var(--gsi-bg)' }}>
                <SchoolList
                    schools={citySchools}
                    initialFilters={{ location: formattedCity }}
                    title={`Best Schools in ${formattedCity}`}
                    subtitle={count > 0
                        ? `Explore ${count} schools in ${formattedCity}. Powered by official UDISE+ data (2024-25).`
                        : `No schools found in ${formattedCity}. Try searching with a different spelling.`}
                />
            </main>
            <Footer />
        </>
    );
}
