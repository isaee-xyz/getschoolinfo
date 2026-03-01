"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStore } from '@/context/StoreContext';
import { Share2, ArrowLeft, Trash2, Scale, CheckCircle2, Circle } from 'lucide-react';
import { School } from '@/types';

// Define interface for row configuration
interface CompareRow {
    label: string;
    render: (s: School) => React.ReactNode;
    isBold?: boolean;
    highlightBest?: 'lowest' | 'highest';
}

function CompareContent() {
    const { compareList, toggleCompare, clearCompare } = useStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'all' | 'fees' | 'infra' | 'safety'>('all');

    // Logic: Merge context list with URL params if any
    const indexedIds: string[] = [];
    if (searchParams.get('id_1')) indexedIds.push(searchParams.get('id_1')!);
    if (searchParams.get('id_2')) indexedIds.push(searchParams.get('id_2')!);
    if (searchParams.get('id_3')) indexedIds.push(searchParams.get('id_3')!);

    const urlIds = indexedIds.length > 0 ? indexedIds : (searchParams.get('ids')?.split(/[_]/) || []);

    // Prefer URL params (shared links), fall back to context store
    const rawIds = urlIds.length > 0 ? urlIds : compareList;
    // Stable sort key to prevent re-renders
    const idKey = [...rawIds].sort().join('_');
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true); // Start true so we show spinner initially

    useEffect(() => {
        const ids = idKey.split('_').filter(Boolean);
        if (ids.length === 0) {
            setSchools([]);
            setLoading(false);
            return;
        }

        const fetchSchools = async () => {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            try {
                const promises = ids.map(id => {
                    const url = `${apiUrl}/school/${id}`;
                    console.log('[Compare] Fetching:', url);
                    return fetch(url)
                        .then(res => {
                            if (!res.ok) {
                                console.error(`[Compare] API returned ${res.status} for school ${id}`);
                                return null;
                            }
                            return res.json();
                        })
                        .catch(err => {
                            console.error(`[Compare] Failed to fetch school ${id}:`, err);
                            return null;
                        });
                });

                const results = await Promise.all(promises);
                const validSchools = results.filter((s): s is School => s !== null);
                console.log('[Compare] Loaded', validSchools.length, 'of', ids.length, 'schools');
                setSchools(validSchools);
            } catch (err) {
                console.error("[Compare] Error fetching:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchools();
    }, [idKey]);

    const handleShare = () => {
        const params = new URLSearchParams();
        const sortedIds = idKey.split('_').filter(Boolean);
        sortedIds.forEach((id, index) => params.append(`id_${index + 1}`, id));
        const url = `${window.location.origin}/compare?${params.toString()}`;
        navigator.clipboard.writeText(url);
        alert('Comparison link copied to clipboard!');
    };

    const removeItem = (id: string) => {
        toggleCompare(id);
        if (urlIds.length > 0) {
            router.push('/compare');
        }
    };

    // Helper to find best value index for highlighting
    const findBestIndex = (schools: School[], getValue: (s: School) => number, mode: 'lowest' | 'highest'): number => {
        if (schools.length === 0) return -1;
        let bestIdx = 0;
        let bestVal = getValue(schools[0]);
        for (let i = 1; i < schools.length; i++) {
            const val = getValue(schools[i]);
            if (mode === 'lowest' ? val < bestVal : val > bestVal) {
                bestVal = val;
                bestIdx = i;
            }
        }
        return bestIdx;
    };

    const sections: { id: string; title: string; show: boolean; rows: CompareRow[] }[] = [
        {
            id: 'basic',
            title: 'Basic Information',
            show: activeTab === 'all',
            rows: [
                { label: 'Board', render: (s: School) => s.boardSecName ? s.boardSecName.replace(/^[0-9]+-/, '') : 'N/A' },
                { label: 'Type', render: (s: School) => s.schTypeDesc || 'N/A' },
                { label: 'Grades', render: (s: School) => `${s.lowClass || '?'} – ${s.highClass || '?'}` },
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
                    highlightBest: 'lowest',
                    render: (s: School) => `₹${((s.tuitionFeeInRupees || 0) + (s.yearlyDevelopmentChargesInRupees || 0) + ((s.annualMonthlyOtherCharges || 0) * 12)).toLocaleString()}`
                },
            ]
        },
        {
            id: 'infra',
            title: 'Infrastructure & Ratios',
            show: activeTab === 'all' || activeTab === 'infra',
            rows: [
                {
                    label: 'Student : Teacher',
                    highlightBest: 'lowest',
                    render: (s: School) => s.totalTeacher ? `1 : ${Math.round((s.rowTotal || 0) / s.totalTeacher)}` : 'N/A'
                },
                { label: 'Smart Boards', highlightBest: 'highest', render: (s: School) => s.digiBoardTot || 0 },
                { label: 'Computers', highlightBest: 'highest', render: (s: School) => (s.desktopFun || 0) + (s.laptopTot || 0) },
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
                { label: 'Girls Toilets', highlightBest: 'highest', render: (s: School) => s.toiletgFun || 0 },
                { label: 'CWSN Toilets', highlightBest: 'highest', render: (s: School) => s.toiletbCwsnFun || 0 },
            ]
        }
    ];

    return (
        <div className="container mx-auto">

            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <Link href="/search" className="flex items-center gap-2 mb-2 text-sm transition-colors" style={{ color: 'var(--gsi-text-muted)' }}>
                        <ArrowLeft className="w-4 h-4" /> Back to Search
                    </Link>
                    <h1 className="text-3xl font-bold font-display" style={{ color: 'var(--gsi-text)' }}>Compare Schools</h1>
                    {schools.length > 0 && (
                        <p className="text-sm mt-1" style={{ color: 'var(--gsi-text-muted)' }}>Side-by-side comparison of {schools.length} school{schools.length > 1 ? 's' : ''}</p>
                    )}
                </div>

                {schools.length > 0 && (
                    <div className="flex gap-3">
                        <button onClick={() => {
                            clearCompare();
                            router.push('/compare');
                        }} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold border border-transparent hover:border-red-200">
                            <Trash2 className="w-4 h-4" /> Clear
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm"
                            style={{ background: 'var(--gsi-primary)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-primary-dark)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gsi-primary)'}
                        >
                            <Share2 className="w-4 h-4" /> Share Comparison
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="text-center py-20 rounded-xl" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)' }}>
                    <div className="w-10 h-10 rounded-full animate-spin mx-auto mb-4" style={{ border: '3px solid var(--gsi-border)', borderTopColor: 'var(--gsi-primary)' }} />
                    <p className="text-sm" style={{ color: 'var(--gsi-text-muted)' }}>Loading school data...</p>
                </div>
            ) : schools.length === 0 ? (
                <div className="text-center py-20 rounded-xl" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gsi-primary-50)' }}>
                        <Scale className="w-8 h-8" style={{ color: 'var(--gsi-primary)' }} />
                    </div>
                    <p className="text-lg font-semibold mb-2" style={{ color: 'var(--gsi-text-secondary)' }}>No schools selected for comparison</p>
                    <p className="text-sm mb-6" style={{ color: 'var(--gsi-text-muted)' }}>Add schools from search results to compare them side by side.</p>
                    <Link
                        href="/search"
                        className="inline-flex items-center gap-2 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
                        style={{ background: 'var(--gsi-primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-primary-dark)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gsi-primary)'}
                    >
                        Browse Schools
                    </Link>
                </div>
            ) : (
                <div className="rounded-xl shadow-sm overflow-hidden" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)' }}>

                    {/* Filter Tabs */}
                    <div className="flex overflow-x-auto p-2 gap-2" style={{ borderBottom: '1px solid var(--gsi-border-light)', background: 'var(--gsi-bg-warm)' }}>
                        <FilterTab label="All Overview" isActive={activeTab === 'all'} onClick={() => setActiveTab('all')} />
                        <FilterTab label="Fees & Costs" isActive={activeTab === 'fees'} onClick={() => setActiveTab('fees')} />
                        <FilterTab label="Infra & Ratios" isActive={activeTab === 'infra'} onClick={() => setActiveTab('infra')} />
                        <FilterTab label="Safety" isActive={activeTab === 'safety'} onClick={() => setActiveTab('safety')} />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr>
                                    <th className="p-4 min-w-[150px] sticky left-0 z-10" style={{ background: 'var(--gsi-surface)', borderRight: '1px solid var(--gsi-border-light)' }}>
                                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--gsi-text-muted)' }}>Metric</span>
                                    </th>
                                    {schools.map(school => (
                                        <th key={school.id || Math.random()} className="p-4 min-w-[250px] align-top" style={{ background: 'var(--gsi-surface)', borderBottom: '1px solid var(--gsi-border-light)' }}>
                                            <div className="relative">
                                                <button
                                                    onClick={() => school.id && removeItem(school.id)}
                                                    className="absolute -top-1 -right-1 p-1 transition-colors hover:text-red-500"
                                                    style={{ color: 'var(--gsi-text-muted)' }}
                                                    title="Remove from comparison"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <circle cx="12" cy="12" r="10" />
                                                        <line x1="15" y1="9" x2="9" y2="15" />
                                                        <line x1="9" y1="9" x2="15" y2="15" />
                                                    </svg>
                                                </button>
                                                {/* Score badge instead of image */}
                                                <div className="w-full h-20 rounded-lg mb-2 flex items-center justify-center" style={{ background: 'var(--gsi-bg-warm)', border: '1px solid var(--gsi-border-light)' }}>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-extrabold font-display" style={{ color: 'var(--gsi-primary)' }}>
                                                            {school.totalTeacher > 0 ? Math.min(10, Math.max(0, Math.round(((30 / Math.max(1, school.rowTotal / school.totalTeacher)) * 5 + ((school.profQual3 || 0) / Math.max(1, school.totalTeacher)) * 5) * 10) / 10)) : '—'}
                                                        </div>
                                                        <div className="text-[10px] font-medium" style={{ color: 'var(--gsi-text-muted)' }}>out of 10</div>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/${(school.district || 'district').toLowerCase().replace(/\s+/g, '-')}/${school.slug || school.id}`}
                                                    className="block font-bold mb-1 transition-colors font-display"
                                                    style={{ color: 'var(--gsi-text)' }}
                                                >
                                                    {school.name || 'Unknown School'}
                                                </Link>
                                                <p className="text-xs" style={{ color: 'var(--gsi-text-muted)' }}>{school.district || 'Unknown District'}</p>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sections.filter(s => s.show).map(section => (
                                    <React.Fragment key={section.id}>
                                        <tr>
                                            <td
                                                colSpan={schools.length + 1}
                                                className="p-2 px-4 font-bold text-xs uppercase tracking-wider"
                                                style={{ background: 'var(--gsi-primary-50)', color: 'var(--gsi-primary-dark)' }}
                                            >
                                                {section.title}
                                            </td>
                                        </tr>
                                        {section.rows.map((row, idx) => (
                                            <tr key={idx} className="transition-colors" style={{ borderBottom: '1px solid var(--gsi-border-light)' }}>
                                                <td className="p-4 py-3 font-medium text-xs sticky left-0 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.04)]" style={{ color: 'var(--gsi-text-muted)', background: 'var(--gsi-surface)', borderRight: '1px solid var(--gsi-border-light)' }}>
                                                    {row.label}
                                                </td>
                                                {schools.map((school, schoolIdx) => (
                                                    <td key={school.id || Math.random()} className={`p-4 py-3 ${row.isBold ? 'font-bold' : ''}`} style={{ color: row.isBold ? 'var(--gsi-text)' : 'var(--gsi-text-secondary)' }}>
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
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap`}
        style={isActive
            ? { background: 'var(--gsi-surface)', color: 'var(--gsi-primary-dark)', border: '1px solid var(--gsi-border)', boxShadow: 'var(--gsi-shadow-sm)' }
            : { color: 'var(--gsi-text-muted)', border: '1px solid transparent' }
        }
    >
        {label}
    </button>
);

const BoolIcon: React.FC<{ val: boolean }> = ({ val }) => (
    val
        ? <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--gsi-success)' }} />
        : <Circle className="w-5 h-5" style={{ color: 'var(--gsi-border)' }} />
);

export default function ComparePage() {
    return (
        <>
            <Header />
            <main className="min-h-screen py-8 px-4" style={{ background: 'var(--gsi-bg)' }}>
                <Suspense fallback={
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid var(--gsi-border)', borderTopColor: 'var(--gsi-primary)' }} />
                    </div>
                }>
                    <CompareContent />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
