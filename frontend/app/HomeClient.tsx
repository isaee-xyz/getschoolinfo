"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLocations } from '@/hooks/useLocations';
import {
  ShieldCheck, Database, GraduationCap, IndianRupee,
  Building2, MapPin, RefreshCw, Search, ChevronRight, CheckCircle2,
  Scale, ArrowRight, TrendingUp, FileText, BarChart3,
  Users
} from 'lucide-react';

const topStates = [
  { name: 'Telangana', state: 'TELANGANA', count: 5278 },
  { name: 'Karnataka', state: 'KARNATAKA', count: 5169 },
  { name: 'Maharashtra', state: 'MAHARASHTRA', count: 4821 },
  { name: 'Tamil Nadu', state: 'TAMILNADU', count: 3211 },
  { name: 'Andhra Pradesh', state: 'ANDHRA PRADESH', count: 3116 },
  { name: 'Madhya Pradesh', state: 'MADHYA PRADESH', count: 2909 },
  { name: 'Rajasthan', state: 'RAJASTHAN', count: 2195 },
  { name: 'Uttar Pradesh', state: 'UTTAR PRADESH', count: 1582 },
];

// Auto-sliding state pills for mobile
function MobileStateMarquee({ states }: { states: typeof topStates }) {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const isPaused = useRef(false);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        let scrollPos = 0;
        const speed = 0.5; // pixels per frame

        const animate = () => {
            if (!isPaused.current && container) {
                scrollPos += speed;
                // When we've scrolled past half (the duplicated set), reset to start
                const halfScroll = container.scrollWidth / 2;
                if (scrollPos >= halfScroll) {
                    scrollPos = 0;
                }
                container.scrollLeft = scrollPos;
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    const handleTouch = useCallback((paused: boolean) => {
        isPaused.current = paused;
    }, []);

    // Duplicate the states array to create seamless looping
    const doubledStates = [...states, ...states];

    return (
        <div className="lg:hidden mt-6 -mx-4 px-4 overflow-hidden">
            <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-hidden"
                onTouchStart={() => handleTouch(true)}
                onTouchEnd={() => handleTouch(false)}
                onMouseEnter={() => handleTouch(true)}
                onMouseLeave={() => handleTouch(false)}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {doubledStates.map((st, i) => (
                    <button
                        key={`${st.name}-${i}`}
                        onClick={() => router.push(`/search?state=${encodeURIComponent(st.state)}`)}
                        className="flex items-center gap-2 px-3 py-2 shrink-0 text-sm font-medium transition-colors active:scale-95"
                        style={{
                            background: 'var(--gsi-surface)',
                            border: '1px solid var(--gsi-border)',
                            borderRadius: 'var(--gsi-radius)',
                            color: 'var(--gsi-text)',
                        }}
                    >
                        <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--gsi-primary)' }} />
                        {st.name}
                        <span className="text-[11px] tabular-nums" style={{ color: 'var(--gsi-text-muted)' }}>
                            {st.count.toLocaleString()}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function HomeClient() {
    const router = useRouter();
    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const { districts, states, loading } = useLocations();

    // Dynamic Counter Logic
    const [schoolCount, setSchoolCount] = useState(0);
    const [displayCount, setDisplayCount] = useState(0);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/total-schools`)
            .then(res => res.json())
            .then(data => {
                if (data.count) setSchoolCount(data.count);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (schoolCount === 0) return;

        let start = 0;
        const end = schoolCount;
        const duration = 2000;
        const incrementTime = 20;
        const totalSteps = duration / incrementTime;
        const stepValue = end / totalSteps;

        const timer = setInterval(() => {
            start += stepValue;
            if (start >= end) {
                setDisplayCount(end);
                clearInterval(timer);
            } else {
                setDisplayCount(Math.floor(start));
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [schoolCount]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (selectedDistrict) params.set('district', selectedDistrict);
        if (selectedState) params.set('state', selectedState);
        router.push(`/search?${params.toString()}`);
    };

    // Filter districts based on selected state
    const filteredDistricts = selectedState
        ? districts.filter(d => d.state === selectedState)
        : districts;

    const smartCollections = [
        {
            icon: Building2,
            title: 'Top Infrastructure',
            desc: 'Smart boards, computer labs, playgrounds. Filter by the infrastructure that matters to you.',
            color: 'var(--gsi-primary)',
            bgColor: 'var(--gsi-primary-50)',
            borderColor: '#CCFBF1',
            filter: 'infra',
        },
        {
            icon: IndianRupee,
            title: 'Best Value',
            desc: 'Schools where metrics outperform their fee bracket. Quality doesn\'t always cost more.',
            color: 'var(--gsi-accent)',
            bgColor: 'var(--gsi-accent-light)',
            borderColor: '#FEF3C7',
            filter: 'value',
        },
        {
            icon: GraduationCap,
            title: 'Academic Elite',
            desc: 'High teacher qualifications, low student-teacher ratios, strong training records.',
            color: '#7C3AED',
            bgColor: '#F5F3FF',
            borderColor: '#EDE9FE',
            filter: 'academic',
        },
        {
            icon: ShieldCheck,
            title: 'Safety First',
            desc: 'Pucca boundary walls, fire safety, functional toilets, drinking water. The basics, done right.',
            color: 'var(--gsi-success)',
            bgColor: 'var(--gsi-success-light)',
            borderColor: '#D1FAE5',
            filter: 'safety',
        },
    ];

    return (
        <>
            <Header />
            <main>
                {/* ═══════════ Hero Section — Split Layout ═══════════ */}
                <section className="relative overflow-hidden grain-overlay" style={{ background: 'var(--gsi-bg)' }}>
                    <div className="absolute inset-0 bg-dot-grid" />

                    <div className="container mx-auto px-4 pt-8 pb-10 md:pt-12 md:pb-16 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            {/* Left: Headline + Search */}
                            <div className="max-w-xl relative z-10 overflow-visible">
                                {/* Trust badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 animate-fade-in"
                                    style={{ background: 'var(--gsi-primary-50)', color: 'var(--gsi-primary-dark)', border: '1px solid #99F6E4' }}>
                                    <Database className="w-3.5 h-3.5" />
                                    Powered by UDISE+ · India's Official School Census
                                </div>

                                <h1 className="text-display text-3xl md:text-5xl mb-4 animate-fade-in-up" style={{ color: 'var(--gsi-text)' }}>
                                    38,312 schools.
                                    <br />
                                    <span style={{ color: 'var(--gsi-primary)' }}>Real data. No opinions.</span>
                                </h1>

                                <p className="text-base mb-8 leading-relaxed animate-fade-in-up" style={{ color: 'var(--gsi-text-secondary)', animationDelay: '100ms' }}>
                                    Search, compare and understand schools using official UDISE+ data. No paid rankings. No hidden agendas.
                                </p>

                                {/* Search Box */}
                                <div className="p-3 animate-fade-in-up overflow-hidden" style={{
                                    background: 'var(--gsi-surface)',
                                    borderRadius: 'var(--gsi-radius-lg)',
                                    boxShadow: 'var(--gsi-shadow-md)',
                                    border: '1px solid var(--gsi-border)',
                                    animationDelay: '200ms'
                                }}>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <select
                                            className="flex-1 min-w-0 p-2.5 text-sm outline-none appearance-none transition-colors"
                                            style={{
                                                background: 'var(--gsi-bg)',
                                                border: '1px solid var(--gsi-border)',
                                                borderRadius: 'var(--gsi-radius)',
                                                color: 'var(--gsi-text)',
                                            }}
                                            value={selectedState}
                                            onChange={(e) => {
                                                setSelectedState(e.target.value);
                                                setSelectedDistrict("");
                                            }}
                                        >
                                            <option value="">Select State</option>
                                            {states.sort().map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="flex-1 min-w-0 p-2.5 text-sm outline-none appearance-none transition-colors"
                                            style={{
                                                background: 'var(--gsi-bg)',
                                                border: '1px solid var(--gsi-border)',
                                                borderRadius: 'var(--gsi-radius)',
                                                color: 'var(--gsi-text)',
                                            }}
                                            value={selectedDistrict}
                                            onChange={(e) => setSelectedDistrict(e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="">{loading ? "Loading..." : "Select District"}</option>
                                            {Array.from(new Set(filteredDistricts.map(d => d.name))).sort().map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleSearch}
                                            className="flex items-center justify-center gap-2 text-white px-4 py-3 sm:py-2.5 font-semibold text-sm transition-all min-h-[44px] whitespace-nowrap"
                                            style={{ background: 'var(--gsi-primary)', borderRadius: 'var(--gsi-radius)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-primary-dark)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gsi-primary)'}
                                        >
                                            <Search className="w-4 h-4" />
                                            <span className="hidden sm:inline">Find Schools</span>
                                            <span className="sm:hidden">Search</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Stats Strip */}
                                <div className="flex flex-wrap items-center gap-4 mt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                                    <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--gsi-text-secondary)' }}>
                                        <TrendingUp className="w-4 h-4" style={{ color: 'var(--gsi-primary)' }} />
                                        <span className="font-bold tabular-nums" style={{ color: 'var(--gsi-text)' }}>
                                            {displayCount > 0 ? displayCount.toLocaleString() : '38,312'}
                                        </span> Schools
                                    </div>
                                    <span style={{ color: 'var(--gsi-border)' }}>•</span>
                                    <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--gsi-text-secondary)' }}>
                                        <MapPin className="w-4 h-4" style={{ color: 'var(--gsi-accent)' }} />
                                        709 Districts
                                    </div>
                                    <span style={{ color: 'var(--gsi-border)' }}>•</span>
                                    <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--gsi-text-secondary)' }}>
                                        <MapPin className="w-4 h-4" style={{ color: 'var(--gsi-success)' }} />
                                        35 States & UTs
                                    </div>
                                    <span style={{ color: 'var(--gsi-border)' }}>•</span>
                                    <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--gsi-text-secondary)' }}>
                                        <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--gsi-text-muted)' }} />
                                        2024-25 Data
                                    </div>
                                </div>
                            </div>

                            {/* Mobile: Auto-sliding state chips — visible below lg */}
                            <MobileStateMarquee states={topStates} />

                            {/* Desktop: Top States Grid — hidden below lg */}
                            <div className="hidden lg:block">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 font-display" style={{ color: 'var(--gsi-text-muted)' }}>
                                    Browse by State
                                </h3>
                                <div className="grid grid-cols-2 gap-3 stagger-children">
                                    {topStates.map((st, i) => (
                                        <button
                                            key={st.name}
                                            onClick={() => router.push(`/search?state=${encodeURIComponent(st.state)}`)}
                                            className="flex items-center gap-3 p-3 text-left transition-all duration-200 cursor-pointer group animate-fade-in-up"
                                            style={{
                                                background: 'var(--gsi-surface)',
                                                border: '1px solid var(--gsi-border)',
                                                borderRadius: 'var(--gsi-radius)',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--gsi-primary-light)';
                                                e.currentTarget.style.boxShadow = 'var(--gsi-shadow-md)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--gsi-border)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ background: 'var(--gsi-primary-50)', color: 'var(--gsi-primary)' }}>
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold group-hover:text-teal-700 transition-colors truncate" style={{ color: 'var(--gsi-text)' }}>
                                                    {st.name}
                                                </div>
                                                <div className="text-[11px] tabular-nums" style={{ color: 'var(--gsi-text-muted)' }}>
                                                    {st.count.toLocaleString()} schools
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════ Compare Bar — CTA ═══════════ */}
                <section className="py-6" style={{ background: 'var(--gsi-primary-50)', borderTop: '1px solid #CCFBF1', borderBottom: '1px solid #CCFBF1' }}>
                    <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--gsi-primary)', color: 'white' }}>
                                <Scale className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold font-display" style={{ color: 'var(--gsi-text)' }}>
                                    Compare Schools Side-by-Side
                                </h3>
                                <p className="text-xs" style={{ color: 'var(--gsi-text-secondary)' }}>
                                    Put up to 3 schools next to each other. Compare every metric at a glance.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/compare')}
                            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 text-white transition-all"
                            style={{ background: 'var(--gsi-primary)', borderRadius: 'var(--gsi-radius)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-primary-dark)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gsi-primary)'}
                        >
                            Start Comparing <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* ═══════════ How It Works — Illustrated Journey ═══════════ */}
                <section className="py-16 overflow-hidden" style={{ background: 'var(--gsi-surface)', borderBottom: '1px solid var(--gsi-border-light)' }}>
                    <div className="container mx-auto px-4 max-w-5xl">
                        <h2 className="text-center text-2xl md:text-3xl font-bold mb-3 tracking-tight font-display" style={{ color: 'var(--gsi-text)' }}>
                            How It Works
                        </h2>
                        <p className="text-center text-sm mb-12 max-w-md mx-auto" style={{ color: 'var(--gsi-text-secondary)' }}>
                            From search to school visit in three simple steps
                        </p>

                        <div className="relative">
                            {/* Connecting line — desktop only */}
                            <div className="hidden md:block absolute top-[72px] left-[16%] right-[16%] h-[2px] z-0" style={{ background: 'linear-gradient(to right, var(--gsi-primary), var(--gsi-accent), var(--gsi-success))' }}>
                                <div className="absolute top-1/2 -translate-y-1/2 left-[30%] w-2 h-2 rounded-full" style={{ background: 'var(--gsi-accent)' }} />
                                <div className="absolute top-1/2 -translate-y-1/2 left-[70%] w-2 h-2 rounded-full" style={{ background: 'var(--gsi-success)' }} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 relative z-10">
                                {/* Step 1: Search — parent on phone with search bar */}
                                <div className="flex flex-col items-center text-center group">
                                    <div className="w-36 h-36 mb-5 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                                        style={{ background: 'var(--gsi-primary-50)', border: '2px solid #CCFBF1' }}>
                                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Phone body */}
                                            <rect x="22" y="10" width="36" height="60" rx="6" fill="white" stroke="#0D9488" strokeWidth="2"/>
                                            <rect x="26" y="16" width="28" height="44" rx="2" fill="#F0FDFA"/>
                                            {/* Search bar on phone screen */}
                                            <rect x="29" y="22" width="22" height="6" rx="3" fill="#CCFBF1" stroke="#0D9488" strokeWidth="1"/>
                                            <circle cx="33" cy="25" r="1.5" fill="#0D9488"/>
                                            {/* Search results lines */}
                                            <rect x="29" y="33" width="22" height="3" rx="1.5" fill="#E0F2FE" opacity="0.8"/>
                                            <rect x="29" y="39" width="18" height="3" rx="1.5" fill="#E0F2FE" opacity="0.6"/>
                                            <rect x="29" y="45" width="20" height="3" rx="1.5" fill="#E0F2FE" opacity="0.4"/>
                                            {/* Home button */}
                                            <circle cx="40" cy="64" r="2.5" stroke="#CBD5E1" strokeWidth="1.5" fill="none"/>
                                            {/* Magnifying glass floating */}
                                            <circle cx="60" cy="20" r="8" fill="#0D9488" opacity="0.15"/>
                                            <circle cx="58" cy="18" r="4" stroke="#0D9488" strokeWidth="1.5" fill="none"/>
                                            <line x1="61" y1="21" x2="64" y2="24" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-base mb-1.5 font-display" style={{ color: 'var(--gsi-text)' }}>Search your area</h3>
                                    <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: 'var(--gsi-text-secondary)' }}>
                                        Pick your state and district. Filter by fees, board, infrastructure or safety.
                                    </p>
                                </div>

                                {/* Mobile vertical connector */}
                                <div className="flex md:hidden justify-center -my-2">
                                    <div className="w-[2px] h-6" style={{ background: 'linear-gradient(to bottom, var(--gsi-primary), var(--gsi-accent))' }} />
                                </div>

                                {/* Step 2: Compare — two cards side by side */}
                                <div className="flex flex-col items-center text-center group">
                                    <div className="w-36 h-36 mb-5 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                                        style={{ background: 'var(--gsi-accent-light)', border: '2px solid #FDE68A' }}>
                                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Left card */}
                                            <rect x="6" y="16" width="30" height="42" rx="4" fill="white" stroke="#D97706" strokeWidth="1.5"/>
                                            <rect x="10" y="21" width="12" height="3" rx="1.5" fill="#0D9488" opacity="0.7"/>
                                            <rect x="10" y="27" width="22" height="2" rx="1" fill="#E5E7EB"/>
                                            <rect x="10" y="32" width="18" height="2" rx="1" fill="#E5E7EB"/>
                                            {/* Score circle on left */}
                                            <circle cx="21" cy="45" r="7" fill="#F0FDFA" stroke="#0D9488" strokeWidth="1.5"/>
                                            <text x="21" y="48" textAnchor="middle" fill="#0D9488" fontSize="8" fontWeight="bold">7.2</text>
                                            {/* Right card */}
                                            <rect x="44" y="16" width="30" height="42" rx="4" fill="white" stroke="#D97706" strokeWidth="1.5"/>
                                            <rect x="48" y="21" width="12" height="3" rx="1.5" fill="#0D9488" opacity="0.7"/>
                                            <rect x="48" y="27" width="22" height="2" rx="1" fill="#E5E7EB"/>
                                            <rect x="48" y="32" width="18" height="2" rx="1" fill="#E5E7EB"/>
                                            {/* Score circle on right */}
                                            <circle cx="59" cy="45" r="7" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5"/>
                                            <text x="59" y="48" textAnchor="middle" fill="#D97706" fontSize="8" fontWeight="bold">8.5</text>
                                            {/* VS badge */}
                                            <circle cx="40" cy="37" r="8" fill="#D97706"/>
                                            <text x="40" y="40" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">VS</text>
                                            {/* Arrows */}
                                            <path d="M34 37 L32 37" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
                                            <path d="M46 37 L48 37" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-base mb-1.5 font-display" style={{ color: 'var(--gsi-text)' }}>Compare side-by-side</h3>
                                    <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: 'var(--gsi-text-secondary)' }}>
                                        See teacher quality, class size, hygiene and 10+ metrics for up to 3 schools at once.
                                    </p>
                                </div>

                                {/* Mobile vertical connector */}
                                <div className="flex md:hidden justify-center -my-2">
                                    <div className="w-[2px] h-6" style={{ background: 'linear-gradient(to bottom, var(--gsi-accent), var(--gsi-success))' }} />
                                </div>

                                {/* Step 3: Decide — parent with child walking to school */}
                                <div className="flex flex-col items-center text-center group">
                                    <div className="w-36 h-36 mb-5 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                                        style={{ background: 'var(--gsi-success-light)', border: '2px solid #BBF7D0' }}>
                                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* School building */}
                                            <rect x="42" y="24" width="28" height="32" rx="2" fill="white" stroke="#16A34A" strokeWidth="1.5"/>
                                            {/* Roof/triangle */}
                                            <path d="M40 24 L56 12 L72 24" stroke="#16A34A" strokeWidth="1.5" fill="#F0FDF4" strokeLinejoin="round"/>
                                            {/* Door */}
                                            <rect x="52" y="40" width="8" height="16" rx="1" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1"/>
                                            {/* Windows */}
                                            <rect x="46" y="30" width="6" height="6" rx="1" fill="#DCFCE7" stroke="#16A34A" strokeWidth="0.8"/>
                                            <rect x="60" y="30" width="6" height="6" rx="1" fill="#DCFCE7" stroke="#16A34A" strokeWidth="0.8"/>
                                            {/* Flag */}
                                            <line x1="56" y1="12" x2="56" y2="6" stroke="#16A34A" strokeWidth="1.5"/>
                                            <rect x="56" y="6" width="6" height="4" rx="0.5" fill="#16A34A" opacity="0.6"/>
                                            {/* Parent figure */}
                                            <circle cx="22" cy="34" r="4" fill="#0D9488" opacity="0.8"/>
                                            <path d="M22 38 L22 52 M18 44 L26 44 M22 52 L18 60 M22 52 L26 60" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            {/* Child figure */}
                                            <circle cx="32" cy="40" r="3" fill="#D97706" opacity="0.8"/>
                                            <path d="M32 43 L32 52 M29 47 L35 47 M32 52 L29 58 M32 52 L35 58" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            {/* Checkmark badge */}
                                            <circle cx="14" cy="26" r="6" fill="#16A34A" opacity="0.15"/>
                                            <path d="M11 26 L13 28 L17 24" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-base mb-1.5 font-display" style={{ color: 'var(--gsi-text)' }}>Choose with confidence</h3>
                                    <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: 'var(--gsi-text-secondary)' }}>
                                        Every data point is from UDISE+. No paid rankings. Just facts for your family.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-10">
                            <a href="/how-it-works" className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:underline" style={{ color: 'var(--gsi-primary)' }}>
                                See how we calculate each metric <ChevronRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* ═══════════ Data Source — Single Trust Line + Pipeline ═══════════ */}
                <section className="py-14 section-warm">
                    <div className="container mx-auto px-4 max-w-4xl">
                        {/* Single authoritative trust statement */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-3"
                                style={{ background: 'var(--gsi-primary-50)', color: 'var(--gsi-primary-dark)', border: '1px solid #99F6E4' }}>
                                <Database className="w-4 h-4" />
                                Official Government Data
                            </div>
                            <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--gsi-text-secondary)' }}>
                                All data comes from <strong style={{ color: 'var(--gsi-text)' }}>UDISE+</strong>, India's official school census conducted annually by the Ministry of Education, covering 1.5 million+ schools across 35 states and union territories.
                            </p>
                        </div>

                        {/* Simplified pipeline — what we do with the data */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { icon: FileText, title: 'We organize it', desc: 'Structure raw census data into searchable, comparable school profiles.', accent: 'var(--gsi-primary)' },
                                { icon: BarChart3, title: 'We make it comparable', desc: 'Transparent formulas turn data points into scores you can understand.', accent: 'var(--gsi-accent)' },
                                { icon: Users, title: 'You decide', desc: 'See the data, compare schools, and make an informed choice for your child.', accent: 'var(--gsi-success)' },
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} className="relative p-5 text-center" style={{
                                        background: 'var(--gsi-surface)',
                                        border: '1px solid var(--gsi-border)',
                                        borderRadius: 'var(--gsi-radius-md)',
                                    }}>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${item.accent}15`, color: item.accent }}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-sm mb-1 font-display" style={{ color: 'var(--gsi-text)' }}>{item.title}</h3>
                                        <p className="text-xs leading-relaxed" style={{ color: 'var(--gsi-text-secondary)' }}>{item.desc}</p>
                                        {i < 2 && (
                                            <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                                                <ChevronRight className="w-5 h-5" style={{ color: 'var(--gsi-border)' }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══════════ Smart Collections ═══════════ */}
                <section className="py-16 container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight font-display" style={{ color: 'var(--gsi-text)' }}>Smart Collections</h2>
                            <p className="text-sm mt-1" style={{ color: 'var(--gsi-text-secondary)' }}>Curated lists based on UDISE+ metrics</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {smartCollections.map((c, i) => {
                            const Icon = c.icon;
                            return (
                                <div
                                    key={i}
                                    onClick={() => router.push(`/search?filter=${c.filter}`)}
                                    className="p-5 cursor-pointer group transition-all duration-200"
                                    style={{
                                        background: 'var(--gsi-surface)',
                                        border: `1px solid ${c.borderColor}`,
                                        borderRadius: 'var(--gsi-radius-md)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = c.color;
                                        e.currentTarget.style.boxShadow = 'var(--gsi-shadow-md)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = c.borderColor;
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                                        style={{ background: c.bgColor, color: c.color }}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold mb-1.5 text-sm font-display" style={{ color: 'var(--gsi-text)' }}>{c.title}</h3>
                                    <p className="text-xs leading-relaxed" style={{ color: 'var(--gsi-text-secondary)' }}>{c.desc}</p>
                                    <div className="flex items-center gap-1 mt-3 text-xs font-semibold md:opacity-0 md:group-hover:opacity-100 transition-opacity" style={{ color: c.color }}>
                                        Explore <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ═══════════ Trust Section ═══════════ */}
                <section className="py-16" style={{ background: 'var(--gsi-primary-50)', borderTop: '1px solid #CCFBF1' }}>
                    <div className="container mx-auto px-4 max-w-3xl text-center">
                        <h2 className="text-xl md:text-2xl font-bold mb-3 tracking-tight font-display" style={{ color: 'var(--gsi-text)' }}>Why parents trust this data</h2>
                        <p className="text-sm mb-10 max-w-lg mx-auto" style={{ color: 'var(--gsi-text-secondary)' }}>
                            School decisions should be based on facts, not marketing.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { title: 'Government-reported data', desc: 'Every data point comes from UDISE+, India\'s official school census covering 1.5M+ schools.' },
                                { title: 'No paid rankings', desc: 'Schools can\'t pay to rank higher. Every metric is calculated from the same data, the same way.' },
                                { title: 'Explainable scores', desc: 'See exactly how each score is calculated. Click any metric to understand the formula.' },
                                { title: 'Free to use', desc: 'All school data and comparisons are free. No paywalls, no sign-up walls.' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 text-left" style={{
                                    background: 'var(--gsi-surface)',
                                    border: '1px solid #CCFBF1',
                                    borderRadius: 'var(--gsi-radius-md)',
                                }}>
                                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--gsi-primary)' }} />
                                    <div>
                                        <h3 className="font-semibold text-sm mb-0.5 font-display" style={{ color: 'var(--gsi-text)' }}>{item.title}</h3>
                                        <p className="text-xs leading-relaxed" style={{ color: 'var(--gsi-text-secondary)' }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <a href="/about-us#methodology" className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:underline" style={{ color: 'var(--gsi-primary)' }}>
                                Learn more about our methodology <ChevronRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
