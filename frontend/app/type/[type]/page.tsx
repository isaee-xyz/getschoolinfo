import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchoolList from '@/components/SchoolList';
import { MOCK_SCHOOLS } from '@/constants';

// --- Static Generation Configuration (ISR) ---

export async function generateStaticParams() {
    return [
        { type: 'co-ed' },
        { type: 'boys' },
        { type: 'girls' },
        { type: 'private' },
        { type: 'government' }
    ];
}

export const revalidate = 86400; // Daily

// --- Metadata ---

type Props = {
    params: Promise<{ type: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { type } = await params;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');

    return {
        title: `Best ${formattedType} Schools | Top ${formattedType} Schools List 2024`,
        description: `Looking for ${formattedType} schools? Browse our list of top-rated ${formattedType} schools with fees, reviews, and admission details.`,
        alternates: {
            canonical: `https://getschoolinfo.com/type/${type}`,
        }
    };
}

// --- Page Component ---

export default async function SchoolTypePage({ params }: Props) {
    const { type } = await params;
    const targetType = type.toLowerCase();

    // Filtering Logic (Mock for now, SQL in prod)
    const filteredSchools = MOCK_SCHOOLS.filter(s => {
        const schoolType = (s.schTypeDesc || "").toLowerCase();
        const management = (s.schMgmtDesc || "").toLowerCase();

        if (targetType === 'co-ed') return schoolType.includes('co-ed');
        if (targetType === 'boys') return schoolType.includes('boy');
        if (targetType === 'girls') return schoolType.includes('girl');
        if (targetType === 'private') return management.includes('private');
        if (targetType === 'government') return management.includes('government') || management.includes('dept. of education');

        return false;
    });

    const formattedType = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
    const count = filteredSchools.length;

    // JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "name": `Top ${formattedType} Schools`,
        "description": `List of ${count} ${formattedType} schools.`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": filteredSchools.slice(0, 10).map((school, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://getschoolinfo.com/${school.district.toLowerCase().replace(/\s+/g, '-')}/${school.slug || 'school-' + school.id}`,
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
                    schools={filteredSchools}
                    // Pass initial filter so UI emphasizes it (though sidebar might not have 'type' filter yet, it is good practice)
                    title={`Top ${formattedType} Schools`}
                    subtitle={`Explore the best ${formattedType} schools. Verified details for ${count} schools.`}
                />
            </main>
            <Footer />
        </>
    );
}
