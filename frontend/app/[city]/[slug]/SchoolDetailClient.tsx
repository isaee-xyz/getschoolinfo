"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MOCK_SCHOOLS } from '@/constants';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { FeeStructure, FeeDetails, School } from '@/types';
import InfoTooltip from '@/components/InfoTooltip';
import {
    MapPin, Phone, User, CheckCircle, ChevronDown, ChevronUp, ShieldCheck, Heart, Share2, Scale, Navigation,
    GraduationCap, BookOpen, Building, Laptop, Trophy, ImageIcon, Mail, FileCheck, Zap, Wifi, Lock
} from 'lucide-react';

// --- Helper Components ---

const StatusBadge: React.FC<{ status: 'green' | 'yellow' | 'red', label: string, value: string | number, sub?: string, tooltip?: string }> = ({ status, label, value, sub, tooltip }) => {
    const colors = {
        green: "bg-green-50 text-green-700 border-green-200",
        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
        red: "bg-red-50 text-red-700 border-red-200"
    };

    return (
        <div className={`p-4 rounded-xl border ${colors[status]} flex flex-col items-center text-center h-full justify-center relative group`}>
            <div className="flex items-center gap-1 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</span>
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            <span className="text-2xl font-extrabold">{value}</span>
            {sub && <span className="text-xs mt-1 font-medium opacity-80">{sub}</span>}
        </div>
    );
};

const AccordionSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: React.ReactNode }> = ({ title, children, defaultOpen = false, icon }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 bg-white shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
                <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
                    {icon}
                    {title}
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {isOpen && (
                <div className="p-5">
                    {children}
                </div>
            )}
        </div>
    );
};

const FeeTable: React.FC<{ details: FeeDetails }> = ({ details }) => {
    const total =
        details.admissionFeeInRupees +
        details.tuitionFeeInRupees +
        details.yearlyDevelopmentChargesInRupees +
        (details.annualMonthlyOtherChargesForOtherFacilitiesInRupees || 0);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                    <tr>
                        <th className="text-left p-3">Fee Component</th>
                        <th className="text-right p-3">Amount (Annual)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    <tr>
                        <td className="p-3 text-gray-700">Admission Fee (One Time)</td>
                        <td className="p-3 text-right font-medium">₹{details.admissionFeeInRupees.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td className="p-3 text-gray-700">Tuition Fee</td>
                        <td className="p-3 text-right font-medium">₹{details.tuitionFeeInRupees.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td className="p-3 text-gray-700">Development Charges</td>
                        <td className="p-3 text-right font-medium">₹{details.yearlyDevelopmentChargesInRupees.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td className="p-3 text-gray-700">Other Charges</td>
                        <td className="p-3 text-right font-medium">₹{details.annualMonthlyOtherChargesForOtherFacilitiesInRupees?.toLocaleString() || 0}</td>
                    </tr>
                    <tr className="bg-blue-50 font-bold text-slate-900 border-t-2 border-blue-100">
                        <td className="p-3">Total Annual Cost</td>
                        <td className="p-3 text-right">₹{total.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};



const InfraIconItem: React.FC<{ icon: React.ReactNode, label: string, value: string | number | undefined | null }> = ({ icon, label, value }) => {
    if (!value || value === 'NA' || value === '0' || value === 0) return null;
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="text-gray-500">
                {React.cloneElement(icon as any, { className: "w-5 h-5" })}
            </div>
            <div>
                <span className="block text-xs text-gray-500 uppercase font-semibold">{label}</span>
                <span className="block text-sm font-bold text-slate-800">{value}</span>
            </div>
        </div>
    );
};

// --- Main Client Component ---

interface SchoolDetailClientProps {
    school: School;
}

const SchoolDetailClient: React.FC<SchoolDetailClientProps> = ({ school }) => {
    const router = useRouter();
    const { toggleShortlist, isInShortlist, toggleCompare, isInCompare } = useStore();
    const { isAuthenticated, loginWithGoogle } = useAuth();
    const [animating, setAnimating] = useState(false);
    const [activeFeeTab, setActiveFeeTab] = useState<keyof FeeStructure>('primary');

    if (!school) {
        // Handle redirect or error UI in parent, or keeping this as fallback
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>School not found.</p>
            </div>
        );
    }

    const isSaved = isInShortlist(school.id);
    const isComparing = isInCompare(school.id);

    console.log("DEBUG SCHOOL DATA:", school);
    console.log("District:", school.district);
    console.log("Block:", school.block);

    const handleShortlist = () => {
        setAnimating(true);
        toggleShortlist(school.id);
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

    // --- Derivative Logic ---
    // --- Derivative Logic ---
    // Prioritize pre-computed DB metrics if available (and valid > 0 to avoid div/0 for ratios)

    // Students Per Classroom
    const studentsPerClass = school.students_per_classroom
        ? Math.round(school.students_per_classroom)
        : Math.round(school.rowTotal / (school.clsrmsGd || 1));

    let crowdingStatus: 'green' | 'yellow' | 'red' = 'green';
    if (studentsPerClass > 45) crowdingStatus = 'red';
    else if (studentsPerClass > 35) crowdingStatus = 'yellow';

    // Student Teacher Ratio (PTR)
    const ptr = school.student_teacher_ratio
        ? Math.round(school.student_teacher_ratio)
        : Math.round(school.rowTotal / (school.totalTeacher || 1));

    let ptrStatus: 'green' | 'yellow' | 'red' = 'green';
    if (ptr > 40) ptrStatus = 'red';
    else if (ptr > 30) ptrStatus = 'yellow';

    // Toilets: DB has "Toilets per 1000 Students". We show "1 Toilet : N Students".
    // N = 1000 / ToiletsPer1000
    const gpt = (school.girls_toilets_per_1000 && school.girls_toilets_per_1000 > 0)
        ? Math.round(1000 / school.girls_toilets_per_1000)
        : Math.round(school.rowGirlTotal / (school.toiletgFun || 1));

    const bpt = (school.boys_toilets_per_1000 && school.boys_toilets_per_1000 > 0)
        ? Math.round(1000 / school.boys_toilets_per_1000)
        : Math.round((school.rowBoyTotal || 1) / (school.toiletbFun || 1));

    // Training %
    const trainingRate = school.teacher_training_pct
        ? Math.round(school.teacher_training_pct)
        : (school.totalTeacher > 0 ? Math.round(((school.tchRecvdServiceTrng || 0) / school.totalTeacher) * 100) : 0);

    // Instructional Days % (DB stores %, we just strip decimals)
    const daysPct = school.instructional_days_pct
        ? Math.round(school.instructional_days_pct)
        : (school.instructionalDays ? Math.round((school.instructionalDays / 220) * 100) : 0);

    const bbox = `${school.lng - 0.01},${school.lat - 0.01},${school.lng + 0.01},${school.lat + 0.01}`;

    return (
        <>
            <Header />
            <main className="pb-24 md:pb-12 bg-gray-50 min-h-screen">
                {/* Hero Header */}
                <section className="bg-white border-b border-gray-200 pt-8 pb-6 px-4">
                    <div className="container mx-auto">
                        {/* Breadcrumbs */}
                        <div className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                            <span
                                onClick={() => router.push('/')}
                                className="cursor-pointer hover:underline"
                            >Home</span> /
                            <span
                                onClick={() => router.push(`/search?district=${school.district}`)}
                                className="cursor-pointer hover:underline"
                            >{school.district}</span> /
                            <span className="text-slate-600 font-semibold">{school.name}</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-start gap-4 mb-4">
                                    <img
                                        src={school.image || '/default-school.jpg'}
                                        alt="Logo"
                                        className="w-16 h-16 rounded-lg object-cover border border-gray-200 shadow-sm"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-school.jpg'; }}
                                    />
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-2">{school.name}</h1>
                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-bold">{school.boardSecName}</span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-bold">{school.schTypeDesc}</span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-bold">Est. {school.estdYear}</span>
                                            <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded text-xs font-bold">{school.schoolStatusName}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-4 text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        {school.address}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={handleShortlist}
                                        className={`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all border transform ${isSaved
                                            ? 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100'
                                            : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
                                            } ${animating ? 'scale-95' : 'scale-100'}`}
                                    >
                                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                        {isSaved ? 'Saved' : 'Shortlist'}
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="bg-white text-slate-700 border border-gray-300 hover:bg-gray-50 p-2.5 rounded-lg shadow-sm"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => toggleCompare(school.id)}
                                    className={`flex items-center justify-center gap-2 font-bold py-2.5 px-6 rounded-lg shadow-sm transition-colors border ${isComparing
                                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                                        : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <Scale className="w-4 h-4" />
                                    {isComparing ? 'Comparing' : 'Compare'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Main Content */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* About Section */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">About School</h2>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {school.name} is a {school.schTypeDesc} school affiliated with {school.boardSecName}.
                                    Established in {school.estdYear}, it is managed by {school.schMgmtDesc || "Private Management"}.
                                    The school is located in {school.block}, {school.district} and provides education from
                                    Class {school.lowClass} to Class {school.highClass} with {school.mediumOfInstrName1} as the primary medium of instruction.
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-slate-800">{school.rowTotal}</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Students</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-slate-800">{school.totalTeacher}</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Teachers</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-slate-800">{school.clsrmsGd}</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Rooms</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-slate-800">{school.estdYear}</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Since</span>
                                    </div>
                                </div>
                            </div>

                            {/* Health Audit Dashboard */}
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileCheck className="w-6 h-6 text-blue-600" />
                                    Compliance & Quality Audit
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {studentsPerClass > 0 && <StatusBadge
                                        status={crowdingStatus}
                                        label="Crowding Index"
                                        value={studentsPerClass}
                                        sub="Students/Class"
                                        tooltip="NCF Benchmark: 35 Students per classroom."
                                    />}
                                    {ptr > 0 && ptr !== Infinity && <StatusBadge
                                        status={ptrStatus}
                                        label="Attention Ratio"
                                        value={`1 : ${ptr}`}
                                        sub="Teacher : Student"
                                        tooltip="RTE Benchmark: 1 Teacher for every 30 Students."
                                    />}
                                    {school.totalTeacher > 0 && <StatusBadge
                                        status={trainingRate > 30 ? 'green' : 'red'}
                                        label="Teacher Training"
                                        value={`${trainingRate}%`}
                                        sub="Annually Trained"
                                        tooltip="Target: 30%+ teachers trained annually (NCERT)."
                                    />}
                                    {gpt > 0 && gpt !== Infinity && <StatusBadge
                                        status={gpt > 40 ? 'yellow' : 'green'}
                                        label="Girls Hygiene"
                                        value={`1 : ${gpt}`}
                                        sub="Toilet : Girls"
                                        tooltip="RTE Benchmark: 1 Toilet per 25-40 Girls."
                                    />}
                                    {bpt > 0 && bpt !== Infinity && <StatusBadge
                                        status={bpt > 40 ? 'yellow' : 'green'}
                                        label="Boys Hygiene"
                                        value={`1 : ${bpt}`}
                                        sub="Toilet : Boys"
                                        tooltip="RTE Benchmark: 1 Toilet per 25-40 Boys."
                                    />}
                                    {(school.instructionalDays || 0) > 0 && <StatusBadge
                                        status={daysPct >= 100 ? 'green' : 'yellow'}
                                        label="Instruction Days"
                                        value={school.instructionalDays || "NA"}
                                        sub="Days / Year"
                                        tooltip="RTE Benchmark: 220 Instructional Days/Year."
                                    />}
                                </div>
                            </div>

                            {/* Infrastructure Details */}
                            <AccordionSection title="Infrastructure & Facilities" icon={<Building className="w-5 h-5 text-blue-500" />} defaultOpen={true}>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                                    <InfraIconItem icon={<Laptop />} label="Computers" value={school.desktopFun + school.laptopTot} />
                                    <InfraIconItem icon={<Zap />} label="Smart Boards" value={school.digiBoardTot} />
                                    <InfraIconItem icon={<BookOpen />} label="Library" value={school.libraryYnDesc} />
                                    <InfraIconItem icon={<Trophy />} label="Playground" value={school.playgroundYnDesc} />
                                    <InfraIconItem icon={<Wifi />} label="Internet" value={school.internetYnDesc} />
                                    <InfraIconItem icon={<Building />} label="Building" value={school.bldStatus} />
                                    <InfraIconItem icon={<ShieldCheck />} label="Boundary" value={school.bndrywallType} />
                                    <InfraIconItem icon={<CheckCircle />} label="Ramps" value={school.rampsYn === 1 ? "Yes" : "No"} />
                                    <InfraIconItem icon={<CheckCircle />} label="Fire Safety" value={school.fireSafetyYn === 1 ? "Yes" : "No"} />
                                </div>
                            </AccordionSection>

                            {/* Fee Structure - STRICT HIDE IF 0 */}
                            {school.feeStructure && Object.values(school.feeStructure).some(f =>
                                (f.tuitionFeeInRupees + f.admissionFeeInRupees + f.yearlyDevelopmentChargesInRupees) > 0
                            ) ? (
                                <AccordionSection title="Fee Structure" icon={<GraduationCap className="w-5 h-5 text-purple-500" />} defaultOpen={true}>
                                    <div>
                                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                            {(['primary', 'middle', 'secondary', 'seniorSecondary'] as const).map((key) => {
                                                const f = school.feeStructure?.[key];
                                                const total = f ? (f.tuitionFeeInRupees + f.admissionFeeInRupees) : 0;
                                                if (!f || total === 0) return null; // Hide tab if 0 fee
                                                return (
                                                    <button
                                                        key={key}
                                                        onClick={() => setActiveFeeTab(key)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeFeeTab === key
                                                            ? 'bg-slate-800 text-white shadow-md'
                                                            : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {school.feeStructure[activeFeeTab] ? (
                                            <FeeTable details={school.feeStructure[activeFeeTab]!} />
                                        ) : (
                                            <div className="text-center text-gray-500 py-4">Select a category to view fees.</div>
                                        )}
                                        <p className="text-xs text-gray-400 mt-3 italic">* Fees are indicative based on available data. Verify with school.</p>
                                    </div>
                                </AccordionSection>
                            ) : null}

                            {/* Academic Performance - Optional */}
                            {school.board && (
                                <AccordionSection title="Academic Performance" icon={<Trophy className="w-5 h-5 text-yellow-500" />} defaultOpen={false}>
                                    <div className="p-4 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
                                        Performance data for {school.board} board exams will be available soon.
                                    </div>
                                </AccordionSection>
                            )}

                            {/* Gallery - Optional */}
                            {school.images?.gallery && school.images.gallery.length > 0 && (
                                <AccordionSection title="Campus Gallery" icon={<ImageIcon className="w-5 h-5 text-pink-500" />} defaultOpen={true}>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {school.images.gallery.map((img, idx) => (
                                            <img key={idx} src={img} alt={`Gallery ${idx + 1}`} className="rounded-lg object-cover h-32 w-full hover:scale-105 transition-transform cursor-pointer" />
                                        ))}
                                    </div>
                                </AccordionSection>
                            )}
                        </div>

                        {/* Right Column: Contact & Location */}
                        <div className="space-y-8">

                            {/* Leadership Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-900 text-white p-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        School Leadership
                                    </h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                            {school.leadership?.principal?.name?.charAt(0) || "P"}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Principal</p>
                                            <p className="text-sm font-bold text-slate-800">{school.leadership?.principal?.name || "Not Available"}</p>
                                            {school.leadership?.principal?.email && (
                                                isAuthenticated ? (
                                                    <p className="text-xs text-blue-600 truncate">{school.leadership.principal.email.toLowerCase()}</p>
                                                ) : (
                                                    <p className="text-xs text-gray-400 blur-[2px] select-none">******@*******.**</p>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-3">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Committees</p>
                                        <div className="bg-gray-50 p-2 rounded text-xs text-slate-700">
                                            <span className="font-semibold block">Sexual Harassment Committee:</span>
                                            {school.leadership?.sexualHarassmentCommitteeHead?.name || "N/A"}
                                            {" "}
                                            {isAuthenticated ? (
                                                `(${school.leadership?.sexualHarassmentCommitteeHead?.contactNumber || "N/A"})`
                                            ) : (
                                                <span className="blur-[2px] text-gray-400 select-none">(**********)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Map */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        Location
                                    </h3>
                                </div>
                                <div className="h-48 bg-gray-100 relative">
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
                                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors w-full text-sm"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        Get Directions
                                    </a>
                                </div>
                            </div>

                            {/* Contact Info */}
                            {/* Contact Info - Gated */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 relative overflow-hidden">
                                <h3 className="font-bold text-slate-900 mb-4">Contact Details</h3>

                                {isAuthenticated ? (
                                    <ul className="space-y-3 text-sm">
                                        {school.leadership?.principal?.contactNumber && (
                                            <li className="flex items-center gap-3">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span className="text-slate-700">{school.leadership.principal.contactNumber}</span>
                                            </li>
                                        )}
                                        {school.leadership?.principal?.email && (
                                            <li className="flex items-center gap-3">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-slate-700 truncate">{school.leadership.principal.email.toLowerCase()}</span>
                                            </li>
                                        )}
                                        <li className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                            <span className="text-slate-700">{school.address}</span>
                                        </li>
                                    </ul>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Blurred Placeholder */}
                                        <div className="space-y-3 opacity-50 blur-[3px] select-none">
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-4 h-4" />
                                                <span className="text-slate-700">+91 99999 99999</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-slate-700">contact@school.edu.in</span>
                                            </div>
                                        </div>

                                        {/* Gating CTA */}
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center p-4 text-center backdrop-blur-[1px]">
                                            <div className="bg-white p-4 rounded-xl shadow-lg border border-blue-100 max-w-[280px]">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-sm mb-1">Unlock Contact Info</h4>
                                                <p className="text-xs text-slate-500 mb-3">Login to view official email addresses and phone numbers for this school.</p>
                                                <button
                                                    onClick={() => loginWithGoogle()}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <User className="w-3 h-3" />
                                                    Login to View
                                                </button>
                                            </div>
                                        </div>

                                        {/* Visible Address (Always show address as per request 'except name' - usually address is key part of name/loc) 
                                            Wait, user said "hide/blur phone email except name". Address is usually fine? 
                                            Let's keep address visible below the blur if possible, or just hide it all for simplicity/impact.
                                            Actually, maps are visible above. Address is visible in Hero.
                                            So hiding this card's content is fine.
                                         */}
                                    </div>
                                )}
                            </div>

                        </div>

                    </div>
                </div>
            </main>

            {/* Mobile Sticky Action Bar */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex gap-4 z-50">
                <button
                    onClick={() => isAuthenticated ? void 0 : loginWithGoogle()}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-blue-600 text-blue-600 font-bold py-3 rounded-lg"
                >
                    {isAuthenticated ? (
                        <a href={`tel:${school.leadership?.principal?.contactNumber}`} className="flex items-center gap-2 w-full justify-center">
                            <Phone className="w-4 h-4" /> Call
                        </a>
                    ) : (
                        <span className="flex items-center gap-2"> <Lock className="w-4 h-4" /> Login to Call </span>
                    )}
                </button>
                <button className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md">
                    Visit School
                </button>
            </div>

            <Footer />
        </>
    );
};

export default SchoolDetailClient;
