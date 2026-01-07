import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SchoolDetailClient from './SchoolDetailClient';
import { School } from '@/types';

// Fallback for build time or if env not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getSchool(slug: string): Promise<School | null> {
    try {
        const res = await fetch(`${API_URL}/school/${slug}`, {
            next: { revalidate: 3600 } // ISR: Revalidate every hour
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch school: ${res.status}`);
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching school:", error);
        return null; // Handle gracefully
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
            title: 'School Not Found',
            description: 'The requested school could not be found.'
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
            canonical: `https://getschoolinfo.com/${city}/${slug}`,
        }
    };
}

export default async function SchoolDetailPage({ params }: Props) {
    const { city, slug } = await params;
    const school = await getSchool(slug);

    if (!school) {
        notFound();
    }

    // JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": school.name,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": school.village,
            "addressLocality": school.district,
            "addressRegion": school.state, // Assuming state field exists in DB/Type
            "postalCode": school.pincode,
            "addressCountry": "IN"
        },
        "url": `https://getschoolinfo.com/${city}/${slug}`,
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
