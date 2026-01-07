import React from 'react';
import { Metadata } from 'next';
import { MOCK_SCHOOLS } from '@/constants';
import SchoolDetailClient from './SchoolDetailClient';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const school = MOCK_SCHOOLS.find((s) => s.id === id);

    if (!school) {
        return {
            title: 'School Not Found',
        };
    }

    const title = `${school.name}, ${school.district} - Fees, Reviews, and Admissions`;
    const description = `${school.name} is a ${school.schTypeDesc} school in ${school.district}. Check fees, academic results, infrastructure, and get contact details.`;
    const images = [{
        url: school.image || 'https://getschoolinfo.com/og-default.jpg', // Ideally dynamic OG generation would be here
        width: 1200,
        height: 630,
        alt: school.name
    }];

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
        }
    };
}

export default async function SchoolPage({ params }: Props) {
    const { id } = await params;
    const school = MOCK_SCHOOLS.find((s) => s.id === id);

    if (!school) {
        return <div>School Not Found</div>;
    }

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: school.name,
        address: {
            '@type': 'PostalAddress',
            streetAddress: school.address,
            addressLocality: school.block,
            addressRegion: school.district,
            addressCountry: 'IN'
        },
        foundingDate: school.estdYear,
        numberOfStudents: school.rowTotal,
        hasMap: `https://www.google.com/maps/dir/?api=1&destination=${school.lat},${school.lng}`,
        image: school.image,
        description: `${school.name} is a ${school.schTypeDesc} school associated with ${school.boardSecName}.`,
        telephone: school.leadership.principal.contactNumber
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <SchoolDetailClient id={id} />
        </>
    );
}
