"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { FeeStructure, FeeDetails, School } from '@/types';
import InfoTooltip from '@/components/InfoTooltip';
import LoginModal from '@/components/LoginModal';
import {
    MapPin, Phone, User, CheckCircle, ChevronDown, ChevronUp, ShieldCheck, Heart, Share2, Scale, Navigation,
    GraduationCap, BookOpen, Building, Laptop, Trophy, Mail, FileCheck, Zap, Wifi, Lock,
    Droplets, BatteryCharging, Mic2, Accessibility, Users, BarChart2, ChevronRight, Projector
} from 'lucide-react';

/* ── Helper: Quality Metric Card with ring indicator ── */
const MetricCard = ({ status, label, value, sub, tooltip }: { status: 'good' | 'avg' | 'poor', label: string, value: string | number, sub: string, tooltip: string }) => {
    const styles = {
        good: { bg: 'var(--gsi-success-light)', border: '#BBF7D0', color: '#065F46', ring: 'var(--gsi-success)', pct: 100 },
        avg: { bg: 'var(--gsi-warning-light)', border: '#FDE68A', color: '#92400E', ring: 'var(--gsi-warning)', pct: 60 },
        poor: { bg: 'var(--gsi-danger-light)', border: '#FECACA', color: '#991B1B', ring: 'var(--gsi-danger)', pct: 30 },
    };
    const s = styles[status];
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (s.pct / 100) * circumference;
    return (
        <div className="p-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-0.5" style={{ background: s.bg, borderColor: s.border, border: `1px solid ${s.border}`, borderRadius: 'var(--gsi-radius-md)' }}>
            {/* Ring */}
            <div className="relative w-12 h-12 mb-2">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="none" stroke={s.border} strokeWidth="3" />
                    <circle cx="20" cy="20" r="18" fill="none" stroke={s.ring} strokeWidth="3"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeLinecap="round" className="transition-all duration-700" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] uppercase font-bold" style={{ color: s.color }}>
                    {status === 'good' ? '✓' : status === 'avg' ? '~' : '!'}
                </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: s.color, opacity: 0.7 }}>{label}</span>
            <span className="text-xl font-extrabold mb-0.5" style={{ color: s.color }}>{value}</span>
            <span className="text-[10px] mb-2" style={{ color: s.color, opacity: 0.6 }}>{sub}</span>
            <InfoTooltip text={tooltip} />
        </div>
    );
};

/* ── Helper: Accordion Section ── */
const AccordionSection = ({ title, icon, defaultOpen, children }: { title: string, icon: React.ReactNode, defaultOpen: boolean, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="overflow-hidden transition-shadow hover:shadow-sm" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)', borderRadius: 'var(--gsi-radius-md)' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 transition-colors"
                style={{}}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
                <div className="flex items-center gap-3 font-bold text-sm font-display" style={{ color: 'var(--gsi-text)' }}>
                    {icon}
                    {title}
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--gsi-text-muted)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--gsi-text-muted)' }} />}
            </button>
            {isOpen && <div className="px-5 pb-5 pt-4" style={{ borderTop: '1px solid var(--gsi-border-light)' }}>{children}</div>}
        </div>
    );
};

/* ── Helper: Infrastructure Item ── */
const InfraItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--gsi-bg)', border: '1px solid var(--gsi-border-light)' }}>
        <div style={{ color: 'var(--gsi-primary)' }}>{icon}</div>
        <div>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--gsi-text-muted)' }}>{label}</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--gsi-text)' }}>{value}</p>
        </div>
    </div>
);

/* ── Helper: Progress Bar ── */
const ProgressBar = ({ pct, color = 'var(--gsi-primary)' }: { pct: number; color?: string }) => (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--gsi-border-light)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
);

/* ── Helper: Yes/No Badge ── */
const YesNoBadge = ({ val }: { val: boolean }) => (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
        style={val
            ? { background: 'var(--gsi-success-light)', color: '#065F46' }
            : { background: 'var(--gsi-danger-light)', color: '#991B1B' }
        }>
        {val ? '✓ Yes' : '✗ No'}
    </span>
);

/* ── Helper: Fee Table ── */
const FeeTable = ({ details }: { details: FeeDetails }) => (
    <div className="overflow-hidden" style={{ border: '1px solid var(--gsi-border)', borderRadius: 'var(--gsi-radius)' }}>
        <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase tracking-wider font-bold" style={{ background: 'var(--gsi-primary-50)', color: 'var(--gsi-text-secondary)' }}>
                <tr>
                    <th className="px-4 py-3">Fee Component</th>
                    <th className="px-4 py-3 text-right">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                <tr style={{ borderBottom: '1px solid var(--gsi-border-light)' }}><td className="px-4 py-3" style={{ color: 'var(--gsi-text-secondary)' }}>Tuition Fee</td><td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--gsi-text)' }}>{details.tuitionFeeInRupees?.toLocaleString() || 0}</td></tr>
                <tr style={{ borderBottom: '1px solid var(--gsi-border-light)' }}><td className="px-4 py-3" style={{ color: 'var(--gsi-text-secondary)' }}>Admission Fee</td><td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--gsi-text)' }}>{details.admissionFeeInRupees?.toLocaleString() || 0}</td></tr>
                <tr style={{ borderBottom: '1px solid var(--gsi-border-light)' }}><td className="px-4 py-3" style={{ color: 'var(--gsi-text-secondary)' }}>Development Charges</td><td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--gsi-text)' }}>{details.yearlyDevelopmentChargesInRupees?.toLocaleString() || 0}</td></tr>
                <tr style={{ borderBottom: '1px solid var(--gsi-border-light)' }}><td className="px-4 py-3" style={{ color: 'var(--gsi-text-secondary)' }}>Other Charges</td><td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--gsi-text)' }}>{details.otherChargesInRupees?.toLocaleString() || 0}</td></tr>
                <tr className="font-bold" style={{ background: 'var(--gsi-primary-50)' }}>
                    <td className="px-4 py-3" style={{ color: 'var(--gsi-text)' }}>Total (Annual)</td>
                    <td className="px-4 py-3 text-right" style={{ color: 'var(--gsi-text)' }}>{(details.tuitionFeeInRupees + details.admissionFeeInRupees + details.yearlyDevelopmentChargesInRupees + (details.otherChargesInRupees || 0)).toLocaleString()}</td>
                </tr>
            </tbody>
        </table>
    </div>
);

interface SchoolDetailClientProps {
    school: any;
}

const SchoolDetailClient: React.FC<SchoolDetailClientProps> = ({ school }) => {
    const router = useRouter();
    const { toggleShortlist, isInShortlist, toggleCompare, isInCompare } = useStore();
    const { isAuthenticated, loginWithGoogle } = useAuth();
    const [animating, setAnimating] = useState(false);
    const [activeFeeTab, setActiveFeeTab] = useState<keyof FeeStructure>('primary');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    if (!school) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gsi-bg)' }}>
                <p style={{ color: 'var(--gsi-text-secondary)' }}>School not found.</p>
            </div>
        );
    }

    const isSaved = isInShortlist(String(school.id));
    const isComparing = isInCompare(String(school.id));

    const handleShortlist = () => {
        setAnimating(true);
        toggleShortlist(String(school.id));
        setTimeout(() => setAnimating(false), 300);
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: school.name, url });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    // WhatsApp share
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out ${school.name} on GetSchoolsInfo\n${typeof window !== 'undefined' ? window.location.href : ''}`)}`;

    // ── Derived Metrics ──
    const studentsPerClass = school.students_per_classroom
        ? Math.round(school.students_per_classroom)
        : Math.round(school.rowTotal / (school.clsrmsGd || 1));

    let crowdingStatus: 'good' | 'avg' | 'poor' = 'good';
    if (studentsPerClass > 45) crowdingStatus = 'poor';
    else if (studentsPerClass > 35) crowdingStatus = 'avg';

    const ptr = school.student_teacher_ratio
        ? Math.round(school.student_teacher_ratio)
        : Math.round(school.rowTotal / (school.totalTeacher || 1));

    let ptrStatus: 'good' | 'avg' | 'poor' = 'good';
    if (ptr > 40) ptrStatus = 'poor';
    else if (ptr > 30) ptrStatus = 'avg';

    const gpt = (school.girls_toilets_per_1000 && school.girls_toilets_per_1000 > 0)
        ? Math.round(1000 / school.girls_toilets_per_1000)
        : Math.round(school.rowGirlTotal / (school.toiletgFun || 1));

    const bpt = (school.boys_toilets_per_1000 && school.boys_toilets_per_1000 > 0)
        ? Math.round(1000 / school.boys_toilets_per_1000)
        : Math.round((school.rowBoyTotal || 1) / (school.toiletbFun || 1));

    const trainingRate = school.teacher_training_pct
        ? Math.round(school.teacher_training_pct)
        : (school.totalTeacher > 0 ? Math.round(((school.tchRecvdServiceTrng || 0) / school.totalTeacher) * 100) : 0);

    const daysPct = school.instructional_days_pct
        ? Math.round(school.instructional_days_pct)
        : (school.instructionalDays ? Math.round((school.instructionalDays / 220) * 100) : 0);

    const bbox = `${school.lng - 0.01},${school.lat - 0.01},${school.lng + 0.01},${school.lat + 0.01}`;

    const decodeHtml = (str: string) => {
        if (!str) return "";
        return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    };

    const cleanName = decodeHtml(school.name);
    const cleanAddress = decodeHtml(school.address);
    const cleanType = school.schTypeDesc ? school.schTypeDesc.replace(/^[0-9]+-/, '') : '';
    const cleanBoard = school.boardSecName ? school.boardSecName.replace(/^[0-9]+-/, '') : '';

    return (
        <>
            <Header />
            <main className="pb-24 md:pb-12 min-h-screen" style={{ background: 'var(--gsi-bg)' }}>
                {/* ── Hero Header ── */}
                <section className="pt-6 pb-6 px-4" style={{ background: 'var(--gsi-surface)', borderBottom: '1px solid var(--gsi-border)' }}>
                    <div className="container mx-auto max-w-6xl">
                        {/* Breadcrumbs */}
                        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--gsi-text-muted)' }}>
                            <span onClick={() => router.push('/')} className="cursor-pointer hover:underline transition-colors">Home</span>
                            <span>/</span>
                            <span onClick={() => router.push(`/search?district=${school.district}`)} className="cursor-pointer hover:underline transition-colors">{school.district}</span>
                            <span>/</span>
                            <span className="font-medium truncate max-w-[200px]" style={{ color: 'var(--gsi-text-secondary)' }}>{cleanName}</span>
                        </nav>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div className="flex-1 min-w-0">
                                <div className="mb-4">
                                    <h1 className="text-xl md:text-2xl font-extrabold leading-tight mb-2 break-words tracking-tight font-display" style={{ color: 'var(--gsi-text)' }}>{cleanName}</h1>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {/* UDISE+ Data Badge */}
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md"
                                            style={{ background: 'var(--gsi-primary-50)', color: 'var(--gsi-primary-dark)', border: '1px solid #99F6E4' }}>
                                            <ShieldCheck className="w-3 h-3" />
                                            UDISE+ Data
                                        </span>
                                        {cleanBoard && cleanBoard !== 'NA' && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide"
                                                style={{ background: 'var(--gsi-bg-warm)', color: 'var(--gsi-text-secondary)', border: '1px solid var(--gsi-border)' }}>
                                                {cleanBoard}
                                            </span>
                                        )}
                                        {cleanType && cleanType !== 'NA' && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md" style={{ background: 'var(--gsi-bg)', color: 'var(--gsi-text-secondary)', border: '1px solid var(--gsi-border)' }}>{cleanType}</span>
                                        )}
                                        {school.estdYear > 0 && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md" style={{ background: 'var(--gsi-bg)', color: 'var(--gsi-text-secondary)', border: '1px solid var(--gsi-border)' }}>Est. {school.estdYear}</span>
                                        )}
                                        {school.schoolStatusName && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md" style={{ background: 'var(--gsi-success-light)', color: '#15803D', border: '1px solid #BBF7D0' }}>{school.schoolStatusName}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--gsi-text-secondary)' }}>
                                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--gsi-text-muted)' }} />
                                    <span className="break-all">{cleanAddress}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2.5 min-w-[180px] w-full md:w-auto shrink-0">
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={handleShortlist}
                                        className={`flex-1 flex items-center justify-center gap-2 font-semibold text-sm py-2.5 px-4 rounded-lg border transition-all ${animating ? 'scale-95' : 'scale-100'}`}
                                        style={{
                                            background: isSaved ? '#FFF1F2' : 'var(--gsi-surface)',
                                            color: isSaved ? '#BE123C' : 'var(--gsi-text-secondary)',
                                            borderColor: isSaved ? '#FECDD3' : 'var(--gsi-border)',
                                        }}
                                    >
                                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                        {isSaved ? 'Saved' : 'Shortlist'}
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-2.5 rounded-lg transition-colors"
                                        style={{ background: 'var(--gsi-surface)', color: 'var(--gsi-text-muted)', border: '1px solid var(--gsi-border)' }}
                                        title="Share link"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 rounded-lg transition-colors"
                                        style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#25D366' }}
                                        title="Share on WhatsApp"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </a>
                                </div>
                                <button
                                    onClick={() => toggleCompare(String(school.id))}
                                    className="flex items-center justify-center gap-2 font-semibold text-sm py-2.5 px-6 rounded-lg border transition-colors"
                                    style={isComparing ? { background: 'var(--gsi-primary)', borderColor: 'var(--gsi-primary)', color: 'white' } : { background: 'var(--gsi-surface)', color: 'var(--gsi-text-secondary)', borderColor: 'var(--gsi-border)' }}
                                >
                                    <Scale className="w-4 h-4" />
                                    {isComparing ? 'Comparing' : 'Compare'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ── Left Column: Main Content ── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* About Section */}
                            <div className="p-6" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)', borderRadius: 'var(--gsi-radius-md)' }}>
                                <h2 className="text-base font-bold mb-3 font-display" style={{ color: 'var(--gsi-text)' }}>About This School</h2>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--gsi-text-secondary)' }}>
                                    {cleanName} is a {cleanType || 'school'}
                                    {cleanBoard && cleanBoard !== 'NA' ? ` affiliated with ${cleanBoard}` : ''}.
                                    {school.estdYear > 0 ? ` Established in ${school.estdYear}, it` : ' It'} is managed by {school.schMgmtDesc || "Private Management"}.
                                    The school is located in {school.block}, {school.district}
                                    {school.lowClass && school.highClass ? ` and provides education from Class ${school.lowClass} to Class ${school.highClass}` : ''}
                                    {school.mediumOfInstrName1 ? ` with ${school.mediumOfInstrName1} as the primary medium of instruction` : ''}.
                                </p>

                                {(school.rowTotal > 0 || school.totalTeacher > 0 || school.clsrmsGd > 0 || school.estdYear > 0) && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5" style={{ borderTop: '1px solid var(--gsi-border-light)' }}>
                                        {school.rowTotal > 0 && (
                                            <div className="text-center">
                                                <span className="block text-xl font-extrabold tabular-nums" style={{ color: 'var(--gsi-text)' }}>{school.rowTotal.toLocaleString()}</span>
                                                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--gsi-text-muted)' }}>Students</span>
                                            </div>
                                        )}
                                        {school.totalTeacher > 0 && (
                                            <div className="text-center">
                                                <span className="block text-xl font-extrabold tabular-nums" style={{ color: 'var(--gsi-text)' }}>{school.totalTeacher}</span>
                                                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--gsi-text-muted)' }}>Teachers</span>
                                            </div>
                                        )}
                                        {school.clsrmsGd > 0 && (
                                            <div className="text-center">
                                                <span className="block text-xl font-extrabold tabular-nums" style={{ color: 'var(--gsi-text)' }}>{school.clsrmsGd}</span>
                                                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--gsi-text-muted)' }}>Classrooms</span>
                                            </div>
                                        )}
                                        {school.estdYear > 0 && (
                                            <div className="text-center">
                                                <span className="block text-xl font-extrabold tabular-nums" style={{ color: 'var(--gsi-text)' }}>{school.estdYear}</span>
                                                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--gsi-text-muted)' }}>Since</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Quality Scorecard */}
                            <div>
                                <h2 className="text-base font-bold mb-4 flex items-center gap-2 font-display" style={{ color: 'var(--gsi-text)' }}>
                                    <FileCheck className="w-5 h-5" style={{ color: 'var(--gsi-primary)' }} />
                                    Quality Scorecard
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {studentsPerClass > 0 && <MetricCard status={crowdingStatus} label="Class Size" value={studentsPerClass} sub="Students per classroom" tooltip="NCF Benchmark: max 35 students per classroom." />}
                                    {ptr > 0 && ptr !== Infinity && <MetricCard status={ptrStatus} label="Teacher Ratio" value={`1 : ${ptr}`} sub="Teacher per students" tooltip="RTE Benchmark: 1 teacher for every 30 students." />}
                                    {school.totalTeacher > 0 && <MetricCard status={trainingRate > 30 ? 'good' : 'poor'} label="Teacher Training" value={`${trainingRate}%`} sub="Trained annually" tooltip="Target: 30%+ teachers trained annually (NCERT)." />}
                                    {gpt > 0 && gpt !== Infinity && <MetricCard status={gpt > 40 ? 'avg' : 'good'} label="Girls Hygiene" value={`1 : ${gpt}`} sub="Toilet per girls" tooltip="RTE Benchmark: 1 toilet per 25-40 girls." />}
                                    {bpt > 0 && bpt !== Infinity && <MetricCard status={bpt > 40 ? 'avg' : 'good'} label="Boys Hygiene" value={`1 : ${bpt}`} sub="Toilet per boys" tooltip="RTE Benchmark: 1 toilet per 25-40 boys." />}
                                    {(school.instructionalDays || 0) > 0 && <MetricCard status={daysPct >= 100 ? 'good' : 'avg'} label="School Days" value={school.instructionalDays || "N/A"} sub="Days per year" tooltip="RTE Benchmark: 220 instructional days per year." />}
                                    {(school.furniture_availability_pct || school.stusHvFurnt > 0) && (() => {
                                        const furniturePct = school.furniture_availability_pct
                                            ? Math.round(school.furniture_availability_pct)
                                            : Math.round(((school.stusHvFurnt || 0) / (school.rowTotal || 1)) * 100);
                                        return <MetricCard status={furniturePct > 80 ? 'good' : furniturePct > 50 ? 'avg' : 'poor'} label="Furniture" value={`${furniturePct}%`} sub="Students with furniture" tooltip="Measures learning environment quality. Target: 80%+ students with proper seating." />;
                                    })()}
                                    {(school.gender_parity_index || (school.rowGirlTotal > 0 && school.rowTotal > 0)) && (() => {
                                        const gpi = school.gender_parity_index
                                            ? Number(school.gender_parity_index).toFixed(2)
                                            : ((school.rowGirlTotal / school.rowTotal) * 2).toFixed(2);
                                        const gpiNum = parseFloat(String(gpi));
                                        return <MetricCard status={gpiNum >= 0.9 && gpiNum <= 1.1 ? 'good' : gpiNum >= 0.75 ? 'avg' : 'poor'} label="Gender Parity" value={gpi} sub="GPI (1.0 = equal)" tooltip="Gender Parity Index: 1.0 means equal boys and girls. UNESCO target: 0.97–1.03." />;
                                    })()}
                                </div>
                            </div>

                            {/* Infrastructure */}
                            <AccordionSection title="Infrastructure & Facilities" icon={<Building className="w-4 h-4" style={{ color: 'var(--gsi-primary)' }} />} defaultOpen={true}>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <InfraItem icon={<Laptop className="w-4 h-4" />} label="Computers" value={(school.desktopFun || 0) + (school.laptopTot || 0)} />
                                    <InfraItem icon={<Zap className="w-4 h-4" />} label="Smart Boards" value={school.digiBoardTot || 0} />
                                    {school.projectorTot > 0 && <InfraItem icon={<Projector className="w-4 h-4" />} label="Projectors" value={school.projectorTot} />}
                                    <InfraItem icon={<BookOpen className="w-4 h-4" />} label="Library" value={school.libraryYnDesc || 'No'} />
                                    <InfraItem icon={<Trophy className="w-4 h-4" />} label="Playground" value={school.playgroundYnDesc || 'No'} />
                                    <InfraItem icon={<Wifi className="w-4 h-4" />} label="Internet" value={school.internetYnDesc || 'No'} />
                                    <InfraItem icon={<BatteryCharging className="w-4 h-4" />} label="Electricity" value={school.electricityYnDesc || 'No'} />
                                    <InfraItem icon={<Droplets className="w-4 h-4" />} label="Drinking Water" value={school.drinkWaterYnDesc || 'No'} />
                                    {school.auditoriumYn && <InfraItem icon={<Mic2 className="w-4 h-4" />} label="Auditorium" value={school.auditoriumYn ? 'Yes' : 'No'} />}
                                    <InfraItem icon={<Building className="w-4 h-4" />} label="Building Status" value={school.bldStatus || 'N/A'} />
                                    <InfraItem icon={<ShieldCheck className="w-4 h-4" />} label="Boundary Wall" value={school.bndrywallType || 'N/A'} />
                                    <InfraItem icon={<CheckCircle className="w-4 h-4" />} label="Fire Safety" value={school.fireSafetyYn === 1 ? 'Yes' : 'No'} />
                                    {school.medchkYnDesc && <InfraItem icon={<Users className="w-4 h-4" />} label="Medical Check" value={school.medchkYnDesc} />}
                                </div>
                            </AccordionSection>

                            {/* Teacher Breakdown */}
                            {school.totalTeacher > 0 && (
                                <AccordionSection title="Teacher Breakdown" icon={<Users className="w-4 h-4" style={{ color: 'var(--gsi-primary)' }} />} defaultOpen={false}>
                                    <div className="space-y-4">
                                        {/* Regular vs Contract */}
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: 'var(--gsi-text-secondary)' }}>
                                                <span>Regular Teachers</span>
                                                <span>{school.tchReg || 0} of {school.totalTeacher}</span>
                                            </div>
                                            <ProgressBar pct={((school.tchReg || 0) / school.totalTeacher) * 100} color="var(--gsi-success)" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: 'var(--gsi-text-secondary)' }}>
                                                <span>Contract Teachers</span>
                                                <span>{school.tchCont || 0} of {school.totalTeacher}</span>
                                            </div>
                                            <ProgressBar pct={((school.tchCont || 0) / school.totalTeacher) * 100} color="var(--gsi-warning)" />
                                        </div>
                                        {(school.profQual3 || school.totTchGraduateAbove || school.totTchPgraduateAbove) && (
                                            <div>
                                                <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: 'var(--gsi-text-secondary)' }}>
                                                    <span>B.Ed / Graduate+ Qualified</span>
                                                    <span>{school.profQual3 || school.totTchGraduateAbove || 0} of {school.totalTeacher}</span>
                                                </div>
                                                <ProgressBar pct={((school.profQual3 || school.totTchGraduateAbove || 0) / school.totalTeacher) * 100} color="var(--gsi-primary)" />
                                            </div>
                                        )}
                                        {school.tchRecvdServiceTrng > 0 && (
                                            <div>
                                                <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: 'var(--gsi-text-secondary)' }}>
                                                    <span>Received In-Service Training</span>
                                                    <span>{school.tchRecvdServiceTrng} of {school.totalTeacher}</span>
                                                </div>
                                                <ProgressBar pct={(school.tchRecvdServiceTrng / school.totalTeacher) * 100} color="#6366F1" />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-3 gap-3 pt-2" style={{ borderTop: '1px solid var(--gsi-border-light)' }}>
                                            <div className="text-center p-2 rounded-lg" style={{ background: 'var(--gsi-bg)' }}>
                                                <span className="block text-lg font-extrabold" style={{ color: 'var(--gsi-text)' }}>{school.totalTeacher}</span>
                                                <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--gsi-text-muted)' }}>Total</span>
                                            </div>
                                            <div className="text-center p-2 rounded-lg" style={{ background: 'var(--gsi-success-light)' }}>
                                                <span className="block text-lg font-extrabold" style={{ color: '#065F46' }}>{school.tchReg || 0}</span>
                                                <span className="text-[10px] uppercase font-bold" style={{ color: '#065F46', opacity: 0.7 }}>Regular</span>
                                            </div>
                                            <div className="text-center p-2 rounded-lg" style={{ background: 'var(--gsi-warning-light)' }}>
                                                <span className="block text-lg font-extrabold" style={{ color: '#92400E' }}>{school.tchCont || 0}</span>
                                                <span className="text-[10px] uppercase font-bold" style={{ color: '#92400E', opacity: 0.7 }}>Contract</span>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionSection>
                            )}

                            {/* Student Enrollment & Gender */}
                            {school.rowTotal > 0 && (
                                <AccordionSection title="Student Enrollment" icon={<BarChart2 className="w-4 h-4" style={{ color: 'var(--gsi-primary)' }} />} defaultOpen={false}>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="text-center p-3 rounded-lg" style={{ background: 'var(--gsi-bg)' }}>
                                                <span className="block text-xl font-extrabold" style={{ color: 'var(--gsi-text)' }}>{school.rowTotal.toLocaleString()}</span>
                                                <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--gsi-text-muted)' }}>Total</span>
                                            </div>
                                            {school.rowBoyTotal > 0 && (
                                                <div className="text-center p-3 rounded-lg" style={{ background: '#EFF6FF' }}>
                                                    <span className="block text-xl font-extrabold" style={{ color: '#1D4ED8' }}>{school.rowBoyTotal.toLocaleString()}</span>
                                                    <span className="text-[10px] uppercase font-bold" style={{ color: '#1D4ED8', opacity: 0.7 }}>Boys</span>
                                                </div>
                                            )}
                                            {school.rowGirlTotal > 0 && (
                                                <div className="text-center p-3 rounded-lg" style={{ background: '#FDF2F8' }}>
                                                    <span className="block text-xl font-extrabold" style={{ color: '#9D174D' }}>{school.rowGirlTotal.toLocaleString()}</span>
                                                    <span className="text-[10px] uppercase font-bold" style={{ color: '#9D174D', opacity: 0.7 }}>Girls</span>
                                                </div>
                                            )}
                                        </div>
                                        {school.rowGirlTotal > 0 && (
                                            <div>
                                                <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: 'var(--gsi-text-secondary)' }}>
                                                    <span>Girls Enrollment</span>
                                                    <span>{Math.round((school.rowGirlTotal / school.rowTotal) * 100)}%</span>
                                                </div>
                                                <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ background: '#EFF6FF' }}>
                                                    <div className="h-full transition-all duration-700" style={{ width: `${Math.round((school.rowGirlTotal / school.rowTotal) * 100)}%`, background: '#DB2777' }} />
                                                </div>
                                                <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--gsi-text-muted)' }}>
                                                    <span>Girls {school.rowGirlTotal.toLocaleString()}</span>
                                                    <span>Boys {(school.rowBoyTotal || school.rowTotal - school.rowGirlTotal).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                        {school.stusHvFurnt > 0 && (
                                            <div>
                                                <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: 'var(--gsi-text-secondary)' }}>
                                                    <span>Students with Furniture</span>
                                                    <span>{school.stusHvFurnt.toLocaleString()} ({Math.round((school.stusHvFurnt / school.rowTotal) * 100)}%)</span>
                                                </div>
                                                <ProgressBar pct={(school.stusHvFurnt / school.rowTotal) * 100} color="var(--gsi-primary)" />
                                            </div>
                                        )}
                                    </div>
                                </AccordionSection>
                            )}

                            {/* Disability Inclusion */}
                            <AccordionSection title="Disability & Inclusion" icon={<Accessibility className="w-4 h-4" style={{ color: 'var(--gsi-primary)' }} />} defaultOpen={false}>
                                <div className="space-y-3">
                                    <p className="text-xs mb-3" style={{ color: 'var(--gsi-text-muted)' }}>RTE Act requires all schools to be accessible to children with special needs (CWSN).</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg flex items-center gap-3" style={{ background: 'var(--gsi-bg)', border: '1px solid var(--gsi-border-light)' }}>
                                            <Accessibility className="w-5 h-5 shrink-0" style={{ color: 'var(--gsi-primary)' }} />
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--gsi-text-muted)' }}>Ramps</p>
                                                <YesNoBadge val={school.rampsYn === 1} />
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg flex items-center gap-3" style={{ background: 'var(--gsi-bg)', border: '1px solid var(--gsi-border-light)' }}>
                                            <ChevronRight className="w-5 h-5 shrink-0" style={{ color: 'var(--gsi-primary)' }} />
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--gsi-text-muted)' }}>Handrails</p>
                                                <YesNoBadge val={school.handrailsYn === 1} />
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg flex items-center gap-3" style={{ background: 'var(--gsi-bg)', border: '1px solid var(--gsi-border-light)' }}>
                                            <Users className="w-5 h-5 shrink-0" style={{ color: 'var(--gsi-primary)' }} />
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--gsi-text-muted)' }}>CWSN Toilets</p>
                                                <p className="text-sm font-bold" style={{ color: 'var(--gsi-text)' }}>{school.toiletbCwsnFun || 0} functional</p>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg flex items-center gap-3" style={{ background: 'var(--gsi-bg)', border: '1px solid var(--gsi-border-light)' }}>
                                            <ShieldCheck className="w-5 h-5 shrink-0" style={{ color: 'var(--gsi-primary)' }} />
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--gsi-text-muted)' }}>Medical Check</p>
                                                <YesNoBadge val={school.medchkYnDesc === 'Yes'} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AccordionSection>

                            {/* Fee Structure */}
                            {school.feeStructure && Object.values(school.feeStructure).some((f: any) =>
                                (f.tuitionFeeInRupees + f.admissionFeeInRupees + f.yearlyDevelopmentChargesInRupees) > 0
                            ) ? (
                                <AccordionSection title="Fee Structure" icon={<GraduationCap className="w-4 h-4" style={{ color: 'var(--gsi-accent)' }} />} defaultOpen={true}>
                                    <div>
                                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                            {(['primary', 'middle', 'secondary', 'seniorSecondary'] as const).map((key) => {
                                                const f = school.feeStructure?.[key];
                                                const total = f ? (f.tuitionFeeInRupees + f.admissionFeeInRupees) : 0;
                                                if (!f || total === 0) return null;
                                                return (
                                                    <button
                                                        key={key}
                                                        onClick={() => setActiveFeeTab(key)}
                                                        className="px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors"
                                                        style={{
                                                            borderRadius: 'var(--gsi-radius)',
                                                            ...(activeFeeTab === key
                                                                ? { background: 'var(--gsi-primary)', color: 'white' }
                                                                : { background: 'var(--gsi-bg)', color: 'var(--gsi-text-secondary)', border: '1px solid var(--gsi-border)' }
                                                            ),
                                                        }}
                                                    >
                                                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {school.feeStructure[activeFeeTab] ? (
                                            <FeeTable details={school.feeStructure[activeFeeTab]!} />
                                        ) : (
                                            <div className="text-center py-4 text-sm" style={{ color: 'var(--gsi-text-muted)' }}>Select a category to view fees.</div>
                                        )}
                                        <p className="text-[10px] mt-3" style={{ color: 'var(--gsi-text-muted)' }}>* Fees are indicative based on available data. Please verify with the school directly.</p>
                                    </div>
                                </AccordionSection>
                            ) : null}

                            {/* Academic Performance */}
                            {school.board && (
                                <AccordionSection title="Academic Performance" icon={<Trophy className="w-4 h-4" style={{ color: 'var(--gsi-accent)' }} />} defaultOpen={false}>
                                    <div className="p-4 rounded-lg text-sm" style={{ background: 'var(--gsi-accent-light)', color: 'var(--gsi-accent-dark)', border: '1px solid #FDE68A' }}>
                                        Performance data for {school.board} board exams will be available soon.
                                    </div>
                                </AccordionSection>
                            )}
                        </div>

                        {/* ── Right Column: Contact & Location ── */}
                        <div className="space-y-6">

                            {/* Leadership Card */}
                            <div className="overflow-hidden" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)', borderRadius: 'var(--gsi-radius-md)' }}>
                                <div className="p-4" style={{ background: 'var(--gsi-primary-50)', borderBottom: '1px solid var(--gsi-border-light)' }}>
                                    <h3 className="font-bold text-sm flex items-center gap-2 font-display" style={{ color: 'var(--gsi-text)' }}>
                                        <User className="w-4 h-4" style={{ color: 'var(--gsi-primary)' }} />
                                        School Leadership
                                    </h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                                            style={{ background: 'var(--gsi-primary)' }}>
                                            {school.leadership?.principal?.name?.charAt(0) || "P"}
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-wide" style={{ color: 'var(--gsi-text-muted)' }}>Principal</p>
                                            <p className="text-sm font-bold" style={{ color: 'var(--gsi-text)' }}>{school.leadership?.principal?.name || "Not Available"}</p>
                                            {school.leadership?.principal?.email && (
                                                isAuthenticated ? (
                                                    <p className="text-xs truncate" style={{ color: 'var(--gsi-primary)' }}>{school.leadership.principal.email.toLowerCase()}</p>
                                                ) : (
                                                    <p className="text-xs blur-[2px] select-none" style={{ color: 'var(--gsi-border)' }}>******@*******.**</p>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-3" style={{ borderTop: '1px solid var(--gsi-border-light)' }}>
                                        <p className="text-[10px] uppercase font-bold tracking-wide mb-2" style={{ color: 'var(--gsi-text-muted)' }}>Committees</p>
                                        <div className="p-2.5 rounded-lg text-xs" style={{ background: 'var(--gsi-bg)', color: 'var(--gsi-text-secondary)' }}>
                                            <span className="font-semibold block mb-0.5">Sexual Harassment Committee:</span>
                                            {school.leadership?.sexualHarassmentCommitteeHead?.name || "N/A"}
                                            {" "}
                                            {isAuthenticated ? (
                                                `(${school.leadership?.sexualHarassmentCommitteeHead?.contactNumber || "N/A"})`
                                            ) : (
                                                <span className="blur-[2px] select-none" style={{ color: 'var(--gsi-border)' }}>(**********)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Map */}
                            <div className="overflow-hidden" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)', borderRadius: 'var(--gsi-radius-md)' }}>
                                <div className="p-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--gsi-border-light)' }}>
                                    <MapPin className="w-4 h-4" style={{ color: 'var(--gsi-primary)' }} />
                                    <h3 className="font-bold text-sm font-display" style={{ color: 'var(--gsi-text)' }}>Location</h3>
                                </div>
                                <div className="h-48 relative" style={{ background: 'var(--gsi-bg)' }}>
                                    <iframe
                                        title="School Location"
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight={0}
                                        marginWidth={0}
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${school.lat},${school.lng}`}
                                        style={{ border: 0 }}
                                    />
                                </div>
                                <div className="p-4">
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${school.lat},${school.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 text-white font-semibold py-3 px-4 transition-all w-full text-sm"
                                        style={{ background: 'var(--gsi-primary)', borderRadius: 'var(--gsi-radius)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-primary-dark)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gsi-primary)'}
                                    >
                                        <Navigation className="w-4 h-4" />
                                        Get Directions
                                    </a>
                                </div>
                            </div>

                            {/* Contact Info — Gated */}
                            <div className="p-5 relative overflow-hidden" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border)', borderRadius: 'var(--gsi-radius-md)' }}>
                                <h3 className="font-bold text-sm mb-4 font-display" style={{ color: 'var(--gsi-text)' }}>Contact Details</h3>

                                {isAuthenticated ? (
                                    <ul className="space-y-3 text-sm">
                                        {school.leadership?.principal?.contactNumber && (
                                            <li className="flex items-center gap-3">
                                                <Phone className="w-4 h-4" style={{ color: 'var(--gsi-text-muted)' }} />
                                                <span style={{ color: 'var(--gsi-text)' }}>{school.leadership.principal.contactNumber}</span>
                                            </li>
                                        )}
                                        {school.leadership?.principal?.email && (
                                            <li className="flex items-center gap-3">
                                                <Mail className="w-4 h-4" style={{ color: 'var(--gsi-text-muted)' }} />
                                                <span className="truncate" style={{ color: 'var(--gsi-text)' }}>{school.leadership.principal.email.toLowerCase()}</span>
                                            </li>
                                        )}
                                        <li className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 mt-0.5" style={{ color: 'var(--gsi-text-muted)' }} />
                                            <span className="text-xs" style={{ color: 'var(--gsi-text-secondary)' }}>{school.address}</span>
                                        </li>
                                    </ul>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-3 opacity-40 blur-[3px] select-none">
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-4 h-4" />
                                                <span>+91 99999 99999</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-4 h-4" />
                                                <span>contact@school.edu.in</span>
                                            </div>
                                        </div>

                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center p-4 text-center backdrop-blur-[1px]">
                                            <div className="p-5 max-w-[260px]" style={{ background: 'var(--gsi-surface)', borderRadius: 'var(--gsi-radius-md)', boxShadow: 'var(--gsi-shadow-lg)', border: '1px solid var(--gsi-border)' }}>
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                                                    style={{ background: 'var(--gsi-primary-50)', color: 'var(--gsi-primary)' }}>
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-bold text-sm mb-1 font-display" style={{ color: 'var(--gsi-text)' }}>Unlock Contact Info</h4>
                                                <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--gsi-text-secondary)' }}>Login to view official email and phone numbers for this school.</p>
                                                <button
                                                    onClick={() => setIsLoginModalOpen(true)}
                                                    className="w-full text-white text-xs font-bold py-2.5 transition-colors flex items-center justify-center gap-2"
                                                    style={{ background: 'var(--gsi-primary)', borderRadius: 'var(--gsi-radius)' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-primary-dark)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gsi-primary)'}
                                                >
                                                    <User className="w-3 h-3" />
                                                    Login to View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Action Bar */}
            <div className="md:hidden fixed bottom-0 left-0 w-full p-4 flex gap-3 z-50" style={{ background: 'var(--gsi-surface)', borderTop: '1px solid var(--gsi-border)', boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.06)' }}>
                <button
                    onClick={() => isAuthenticated ? void 0 : setIsLoginModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-lg border"
                    style={{ borderColor: 'var(--gsi-primary)', color: 'var(--gsi-primary)', background: 'var(--gsi-surface)' }}
                >
                    {isAuthenticated ? (
                        <a href={`tel:${school.leadership?.principal?.contactNumber}`} className="flex items-center gap-2 w-full justify-center">
                            <Phone className="w-4 h-4" /> Call
                        </a>
                    ) : (
                        <span className="flex items-center gap-2"> <Lock className="w-4 h-4" /> Login to Call </span>
                    )}
                </button>
                <button
                    className="flex-1 text-white font-semibold text-sm py-3 rounded-lg"
                    style={{ background: 'var(--gsi-primary)' }}
                >
                    Visit School
                </button>
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
            <Footer />
        </>
    );
};

export default SchoolDetailClient;
