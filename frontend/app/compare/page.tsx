"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MOCK_SCHOOLS } from '@/constants';
import { useStore } from '@/context/StoreContext';
import { CheckCircle, XCircle, Share2, ArrowLeft, Trash2 } from 'lucide-react';
import { School } from '@/types';

// Helper for SearchParams

// Define interface for row configuration
interface CompareRow {
    label: string;
    render: (s: School) => React.ReactNode;
    isBold?: boolean;
}

function CompareContent() {
    const { compareList, toggleCompare, clearCompare } = useStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'all' | 'fees' | 'infra' | 'safety'>('all');

    // Logic: Merge context list with URL params if any
    const urlIds = searchParams.get('ids')?.split(',') || [];

    // Create a combined unique set of IDs to display
    // Prioritize URL IDs if they exist (shared view), otherwise store
    const displayIds = urlIds.length > 0 ? urlIds : compareList;
    const [schools, setSchools] = useState<School[]>([]);

    useEffect(() => {
        const fetchSchools = async () => {
            if (displayIds.length === 0) {
                setSchools([]);
                return;
            }
            try {
                // Fetch each school individually to ensure we get the specific records
                // The /api/school/:slug endpoint supports lookup by UDISE/ID
                const promises = displayIds.map(id =>
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/school/${id}`)
                        .then(res => res.ok ? res.json() : null)
                        .catch(err => {
                            console.error(`Failed to fetch school ${id}`, err);
                            return null;
                        })
                );

                const results = await Promise.all(promises);
                // Filter out nulls (failed fetches)
                setSchools(results.filter(s => s !== null));
            } catch (err) {
                console.error("Error fetching compare schools:", err);
            }
        };
        fetchSchools();
    }, [displayIds.join(',')]); // Re-run if IDs change

    const handleShare = () => {
        // In Next.js, we construct the URL. 
        // Assuming the page is /compare
        const url = `${window.location.origin}/compare?ids=${displayIds.join(',')}`;
        navigator.clipboard.writeText(url);
        alert('Comparison link copied to clipboard!');
    };

    const removeItem = (id: string) => {
        toggleCompare(id);
        // If we are in "URL mode", we might want to update URL
        if (urlIds.length > 0) {
            // Remove from URL params logic would go here, 
            // but for simplicity, we just clear the params to fall back to local store or just refresh
            router.push('/compare');
        }
    };

    const sections: { id: string; title: string; show: boolean; rows: CompareRow[] }[] = [
        {
            id: 'basic',
            title: 'Basic Information',
            show: activeTab === 'all',
            rows: [
                { label: 'Board', render: (s: School) => s.boardSecName || 'N/A' },
                { label: 'Type', render: (s: School) => s.schTypeDesc || 'N/A' },
                { label: 'Grades', render: (s: School) => `${s.lowClass || '?'} - ${s.highClass || '?'}` },
                { label: 'Medium', render: (s: School) => s.mediumOfInstrName1 || 'N/A' },
                { label: 'Established', render: (s: School) => s.yearDesc || s.estdYear || 'N/A' },
            ]
        },
        {
            id: 'fees',
            title: 'Annual Fees',
            show: activeTab === 'all' || activeTab === 'fees',
            rows: [
                { label: 'Admission (One-time)', render: (s: School) => `₹${(s.admissionFeeInRupees || 0).toLocaleString()}` },
                { label: 'Tuition', render: (s: School) => `₹${(s.tuitionFeeInRupees || 0).toLocaleString()}` },
                { label: 'Dev. Charges', render: (s: School) => `₹${(s.yearlyDevelopmentChargesInRupees || 0).toLocaleString()}` },
                { label: 'Other Annual', render: (s: School) => `₹${((s.annualMonthlyOtherCharges || 0) * 12).toLocaleString()}` },
                {
                    label: 'Total Annual',
                    isBold: true,
                    render: (s: School) => `₹${((s.tuitionFeeInRupees || 0) + (s.yearlyDevelopmentChargesInRupees || 0) + ((s.annualMonthlyOtherCharges || 0) * 12)).toLocaleString()}`
                },
            ]
        },
        {
            id: 'infra',
            title: 'Infrastructure & Ratios',
            show: activeTab === 'all' || activeTab === 'infra',
            rows: [
                { label: 'Student:Teacher', render: (s: School) => s.totalTeacher ? `1 : ${Math.round((s.rowTotal || 0) / s.totalTeacher)}` : 'N/A' },
                { label: 'Smart Boards', render: (s: School) => s.digiBoardTot || 0 },
                { label: 'Computers', render: (s: School) => (s.desktopFun || 0) + (s.laptopTot || 0) },
                { label: 'Library', render: (s: School) => <BoolIcon val={s.libraryYnDesc === 'Yes'} /> },
                { label: 'Playground', render: (s: School) => <BoolIcon val={s.playgroundYnDesc === 'Yes'} /> },
                { label: 'Internet', render: (s: School) => <BoolIcon val={s.internetYnDesc === 'Yes'} /> },
            ]
        },
        {
            id: 'safety',
            title: 'Safety & Hygiene',
            show: activeTab === 'all' || activeTab === 'safety',
            rows: [
                { label: 'Perimeter Wall', render: (s: School) => s.bndrywallType || 'N/A' },
                { label: 'Fire Safety', render: (s: School) => <BoolIcon val={s.fireSafetyYn === 1} /> },
                { label: 'Medical Check', render: (s: School) => <BoolIcon val={s.medchkYnDesc === 'Yes'} /> },
                { label: 'Girls Toilets', render: (s: School) => s.toiletgFun || 0 },
                { label: 'CWSN Toilets', render: (s: School) => s.toiletbCwsnFun || 0 },
            ]
        }
    ];

    return (
        <div className="container mx-auto">

            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <Link href="/search" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Search
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">Compare Schools</h1>
                </div>

                {schools.length > 0 && (
                    <div className="flex gap-3">
                        <button onClick={clearCompare} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-bold border border-transparent hover:border-red-200">
                            <Trash2 className="w-4 h-4" /> Clear
                        </button>
                        <button onClick={handleShare} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-colors">
                            <Share2 className="w-4 h-4" /> Share Comparison
                        </button>
                    </div>
                )}
            </div>

            {schools.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <p className="text-slate-500 text-lg mb-4">No schools selected for comparison.</p>
                    <Link href="/search" className="text-blue-600 font-bold hover:underline">Browse schools to add</Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">

                    {/* Filter Tabs */}
                    <div className="flex overflow-x-auto border-b border-gray-100 p-2 gap-2 bg-slate-50">
                        <FilterTab label="All Overview" isActive={activeTab === 'all'} onClick={() => setActiveTab('all')} />
                        <FilterTab label="Fees & Costs" isActive={activeTab === 'fees'} onClick={() => setActiveTab('fees')} />
                        <FilterTab label="Infra & Ratios" isActive={activeTab === 'infra'} onClick={() => setActiveTab('infra')} />
                        <FilterTab label="Safety" isActive={activeTab === 'safety'} onClick={() => setActiveTab('safety')} />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr>
                                    <th className="p-4 bg-white min-w-[150px] sticky left-0 z-10 border-r border-gray-100">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Metric</span>
                                    </th>
                                    {schools.map(school => (
                                        <th key={school.id || Math.random()} className="p-4 min-w-[250px] align-top bg-white border-b border-gray-100">
                                            <div className="relative">
                                                <button
                                                    onClick={() => school.id && removeItem(school.id)}
                                                    className="absolute -top-2 -right-2 p-1 text-gray-300 hover:text-red-500"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                                <img src={school.image || '/default-school.jpg'} alt={school.name || 'School'} className="w-full h-32 object-cover rounded mb-2" onError={(e) => (e.target as HTMLImageElement).src = '/default-school.jpg'} />
                                                <Link href={`/${(school.district || 'district').toLowerCase().replace(/\s+/g, '-')}/${school.slug || 'school-' + school.id}`} className="block font-bold text-slate-900 hover:text-blue-600 mb-1">
                                                    {school.name || 'Unknown School'}
                                                </Link>
                                                <p className="text-xs text-slate-500">{school.district || 'Unknown District'}</p>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sections.filter(s => s.show).map(section => (
                                    <React.Fragment key={section.id}>
                                        <tr className="bg-gray-50">
                                            <td colSpan={schools.length + 1} className="p-2 px-4 font-bold text-slate-700 text-xs uppercase tracking-wider">
                                                {section.title}
                                            </td>
                                        </tr>
                                        {section.rows.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 py-3 font-medium text-slate-600 sticky left-0 bg-white border-r border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                                    {row.label}
                                                </td>
                                                {schools.map(school => (
                                                    <td key={school.id || Math.random()} className={`p-4 py-3 text-slate-800 ${row.isBold ? 'font-bold' : ''}`}>
                                                        {row.render(school)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

const FilterTab: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-slate-500 hover:bg-gray-200'}`}
    >
        {label}
    </button>
);

const BoolIcon: React.FC<{ val: boolean }> = ({ val }) => (
    val ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-300" />
);

export default function ComparePage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 py-8 px-4">
                <Suspense fallback={<div>Loading comparison...</div>}>
                    <CompareContent />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
