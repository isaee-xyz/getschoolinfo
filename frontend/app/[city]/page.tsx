import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchoolList from '@/components/SchoolList';
import { MOCK_SCHOOLS } from '@/constants';

// --- Static Generation Configuration ---

// This ensures these paths are built at build time (or on demand if fallback is true)
// reducing server load to ZERO for subsequent requests.
/*
export async function generateStaticParams() {
    // In production, fetch this list from DB: SELECT distinct district FROM schools
    const districts = Array.from(new Set(MOCK_SCHOOLS.map(s => s.district))).filter(Boolean);

    // Normalize to URL-friendly slugs (e.g., "bathinda", "mumbai")
    return districts.map((city) => ({
        city: city.toLowerCase().replace(/\s+/g, '-')
    }));
}
*/
export const dynamic = 'force-dynamic';

// ISR Revalidation: Update these pages at most once per day
export const revalidate = 0;

// --- Metadata ---

type Props = {
    params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { city } = await params;
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ');

    return {
        title: `Top Schools in ${formattedCity} | Fees, Reviews & Admissions 2024`,
        description: `Find the best schools in ${formattedCity}. Compare fees, board affiliation (CBSE/ICSE), infrastructure, and academic results for top-rated schools in ${formattedCity}.`,
        alternates: {
            canonical: `https://getschoolinfo.com/city/${city}`,
        }
    };
}

// --- Page Component ---

export default async function CityPage({ params }: Props) {
    const { city } = await params;
    const normalizedCitySearch = city.replace(/-/g, ' ').toLowerCase();

    // In a real app with DB, we'd fetch specific schools here 
    // const schools = await db.query('SELECT * FROM schools WHERE lower(district) = $1', [normalizedCitySearch]);

    // For now, filtering mock data:
    const citySchools = MOCK_SCHOOLS.filter(s =>
        s.district.toLowerCase().includes(normalizedCitySearch)
    );

    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ');
    const count = citySchools.length;

    // JSON-LD for "SearchResultsPage"
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": citySchools.slice(0, 10).map((school, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://getschoolinfo.com/school/${school.id}`,
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
            <main className="min-h-screen bg-gray-50">
                <SchoolList
                    schools={citySchools}
                    initialFilters={{ location: formattedCity }}
                    title={`Best Schools in ${formattedCity}`}
                    subtitle={`Explore ${count} top-rated schools in ${formattedCity}. Filter by fees, board, and facilities.`}
                />
            </main>
            <Footer />
        </>
    );
}
