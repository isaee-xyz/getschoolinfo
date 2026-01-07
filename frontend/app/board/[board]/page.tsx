import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchoolList from '@/components/SchoolList';
import { MOCK_SCHOOLS } from '@/constants';

// --- Static Generation Configuration (ISR) ---

export async function generateStaticParams() {
    // Top Boards to pre-render
    const boards = ['cbse', 'icse', 'state-board', 'ib', 'cambridge'];
    return boards.map((board) => ({ board }));
}

export const revalidate = 86400; // Daily updates

// --- Metadata ---

type Props = {
    params: Promise<{ board: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { board } = await params;
    const formattedBoard = board.toUpperCase().replace('-', ' ');

    return {
        title: `Best ${formattedBoard} Schools | Top Rated ${formattedBoard} Schools List 2024`,
        description: `Find the best ${formattedBoard} schools near you. Compare fees, facilities, and academic results for top ${formattedBoard} affiliated schools.`,
        alternates: {
            canonical: `https://getschoolinfo.com/board/${board}`,
        }
    };
}

// --- Page Component ---

export default async function BoardPage({ params }: Props) {
    const { board } = await params;

    // Board logic: normalize mock data for this example
    // In Production: WHERE lower(board_name) = $1
    const targetBoard = board.toLowerCase();

    const boardSchools = MOCK_SCHOOLS.filter(s => {
        const schoolBoard = (s.boardSecName || s.boardHighSecName || "").toLowerCase();

        if (targetBoard === 'cbse') return schoolBoard.includes('cbse');
        if (targetBoard === 'icse') return schoolBoard.includes('icse') || schoolBoard.includes('cisce');
        if (targetBoard === 'state-board') return schoolBoard.includes('state') || schoolBoard.includes('pseb'); // example
        if (targetBoard === 'ib') return schoolBoard.includes('ib') || schoolBoard.includes('international baccalaureate');
        if (targetBoard === 'cambridge') return schoolBoard.includes('cambridge') || schoolBoard.includes('igcse');

        return false;
    });

    const formattedBoard = board.toUpperCase().replace('-', ' ');
    const count = boardSchools.length;

    // JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "name": `Top ${formattedBoard} Schools`,
        "description": `List of ${count} ${formattedBoard} schools.`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": boardSchools.slice(0, 10).map((school, index) => ({
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
                    schools={boardSchools}
                    // We pass 'board' to filter state so checkbox is checked logic works if mapped correctly
                    initialFilters={{ board: [formattedBoard] }}
                    title={`Top ${formattedBoard} Schools`}
                    subtitle={`Browse ${count} trusted ${formattedBoard} schools. Filter by location, fees, and more.`}
                />
            </main>
            <Footer />
        </>
    );
}
