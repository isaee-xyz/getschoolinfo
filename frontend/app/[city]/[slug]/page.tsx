import React from 'react';
import { Metadata } from 'next';
import SchoolDetailClient from './SchoolDetailClient';
import SchoolDetailFetcher from './SchoolDetailFetcher';
import { School } from '@/types';

export const dynamic = 'force-dynamic';

// Server-side API URL (may differ from client-side in production)
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getSchool(slug: string): Promise<School | null> {
    try {
        const url = `${API_URL}/school/${slug}`;
        console.log('[SchoolDetail] Fetching:', url);
        const res = await fetch(url, {
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`[SchoolDetail] API returned ${res.status} for slug: ${slug}`);
            return null;
        }

        return res.json();
    } catch (error) {
        console.error("[SchoolDetail] Server-side fetch failed:", error);
        return null;
    }
}

type Props = {
    params: Promise<{ city: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { city, slug } = await params;
    const school = await getSchool(slug);

    if (!school) {
        return {
            title: 'School Details | GetSchoolsInfo',
            description: 'View detailed school information including fees, infrastructure, and academic metrics.'
        };
    }

    const title = `${school.name}, ${school.district} | Fees, Reviews & Admissions`;
    const description = `Admission details for ${school.name} in ${school.district}. Tuition fees, board affiliation, contact number, and facilities.`;
    const images = school.image ? [school.image] : [];

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
        alternates: {
            canonical: `https://getschoolsinfo.com/${city}/${slug}`,
        }
    };
}

export default async function SchoolDetailPage({ params }: Props) {
    const { city, slug } = await params;
    const school = await getSchool(slug);

    if (school) {
        // Server-side fetch succeeded -- render directly
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": school.name,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": school.village,
                "addressLocality": school.district,
                "addressRegion": school.state,
                "postalCode": school.pincode,
                "addressCountry": "IN"
            },
            "url": `https://getschoolsinfo.com/${city}/${slug}`,
            "image": school.image
        };

        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <SchoolDetailClient school={school} />
            </>
        );
    }

    // Server-side fetch failed -- fall back to client-side fetch
    // This handles cases where the server can't reach the API (e.g., different network)
    return <SchoolDetailFetcher slug={slug} city={city} />;
}
