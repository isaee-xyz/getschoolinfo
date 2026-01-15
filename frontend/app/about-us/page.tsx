import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Search, Target, Lock, BarChart, Database } from 'lucide-react';

export const metadata = {
    title: 'About Us | GetSchoolsInfo',
    description: 'Learn about our mission to make school discovery transparent, objective, and parent-friendly.',
};

export default function AboutUsPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">About GetSchoolsInfo</h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Welcome to GetSchoolsInfo – India's independent school discovery platform helping parents make informed enrollment decisions based on objective, data-driven insights.
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Who We Are */}
                    <section className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Who We Are</h2>
                            <p className="text-slate-700 leading-relaxed">
                                GetSchoolsInfo is not affiliated with any government entity. We are an independent platform that makes government education data accessible and actionable for parents across India.
                            </p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <Target className="w-5 h-5" /> Mission
                            </h3>
                            <p className="text-blue-700 text-sm">To democratize access to school quality data so every child finds the right learning environment.</p>
                        </div>
                    </section>

                    {/* What We Do */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">What We Do</h2>
                        <p className="text-slate-700 mb-6">
                            We transform complex UDISE+ (Unified District Information System for Education Plus) government data into parent-friendly school quality metrics.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                "Student-Teacher Ratio – Individual attention your child will receive",
                                "Gender Parity Index – Inclusive learning environment",
                                "Teacher Qualification Index – Certified and trained educators",
                                "Infrastructure Score – Facilities like libraries, labs, and sports",
                                "Safety & Accessibility – CWSN facilities and security measures",
                                "Fee Transparency – Complete cost breakdown by grade level"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-slate-800 text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Methodology */}
                    <section id="methodology" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Methodology</h2>
                        <div className="bg-slate-900 text-slate-300 p-8 rounded-2xl">
                            <p className="mb-6 leading-relaxed">
                                All school quality scores are calculated using first-principles thinking based on official benchmarks:
                            </p>
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="bg-slate-800 p-4 rounded-lg">
                                    <span className="block text-white font-bold">NEP 2020</span>
                                    <span className="text-xs">National Education Policy</span>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-lg">
                                    <span className="block text-white font-bold">RTE Act 2009</span>
                                    <span className="text-xs">Right to Education</span>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-lg">
                                    <span className="block text-white font-bold">NCF</span>
                                    <span className="text-xs">National Curriculum Framework</span>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-lg">
                                    <span className="block text-white font-bold">UNESCO SDG 4</span>
                                    <span className="text-xs">Quality Education Standards</span>
                                </div>
                            </div>
                            <p className="text-sm italic border-l-4 border-blue-500 pl-4">
                                We use zero assumptions – every metric is derived from verifiable UDISE+ data fields and official policy benchmarks. No subjective opinions, no paid rankings, no school bias.
                            </p>
                        </div>
                    </section>

                    {/* Why We Built & Commitment */}
                    <section className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Why We Built This</h2>
                            <p className="text-slate-700 mb-4">Finding the right school shouldn't require decoding government databases or relying on word-of-mouth. We believe every parent deserves:</p>
                            <ul className="space-y-3">
                                <li className="flex gap-2 text-slate-700"><Search className="w-5 h-5 text-blue-500" /> Transparent information about school quality</li>
                                <li className="flex gap-2 text-slate-700"><BarChart className="w-5 h-5 text-blue-500" /> Objective comparisons based on national standards</li>
                                <li className="flex gap-2 text-slate-700"><Target className="w-5 h-5 text-blue-500" /> Location-based search to discover nearby schools</li>
                                <li className="flex gap-2 text-slate-700"><Lock className="w-5 h-5 text-blue-500" /> Free access to data that's already public but hard to navigate</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Commitment</h2>
                            <ul className="space-y-4">
                                <li className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <span className="font-bold text-slate-900 block">Data Accuracy</span>
                                    <span className="text-sm text-slate-600">We refresh school data periodically from UDISE+ sources</span>
                                </li>
                                <li className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <span className="font-bold text-slate-900 block">Objective Analysis</span>
                                    <span className="text-sm text-slate-600">No paid promotions or school partnerships</span>
                                </li>
                                <li className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <span className="font-bold text-slate-900 block">Privacy First</span>
                                    <span className="text-sm text-slate-600">Your search data stays private</span>
                                </li>
                                <li className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <span className="font-bold text-slate-900 block">Continuous Improvement</span>
                                    <span className="text-sm text-slate-600">We refine our algorithms based on parent feedback</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* What We Are NOT */}
                    <section className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
                        <h2 className="text-xl font-bold text-red-800 mb-4">What We're NOT</h2>
                        <div className="grid sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
                            <div className="flex gap-2 items-center text-red-700 text-sm font-medium"><span className="text-red-500 font-bold">✕</span> A government website or UDISE+ portal</div>
                            <div className="flex gap-2 items-center text-red-700 text-sm font-medium"><span className="text-red-500 font-bold">✕</span> An official school rating body</div>
                            <div className="flex gap-2 items-center text-red-700 text-sm font-medium"><span className="text-red-500 font-bold">✕</span> A school admission platform</div>
                            <div className="flex gap-2 items-center text-red-700 text-sm font-medium"><span className="text-red-500 font-bold">✕</span> A replacement for in-person visits</div>
                        </div>
                    </section>

                    {/* Sources */}
                    <section id="sources" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Database className="w-6 h-6 text-slate-400" /> Data Sources
                        </h2>
                        <p className="text-slate-700 mb-2">All school information is sourced from:</p>
                        <ul className="list-disc pl-5 space-y-1 text-slate-600">
                            <li>UDISE+ (Unified District Information System for Education Plus)</li>
                            <li>Public government databases</li>
                            <li>Official education department records</li>
                        </ul>
                    </section>

                    {/* Contact CTA */}
                    <section className="bg-blue-600 text-white p-8 rounded-2xl text-center">
                        <h2 className="text-2xl font-bold mb-4">Get Involved</h2>
                        <p className="max-w-xl mx-auto mb-6 opacity-90">Found incorrect information? Have suggestions? We welcome community feedback to improve accuracy.</p>
                        <a href="mailto:info@getschoolsinfo.com" className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors">
                            Contact: info@getschoolsinfo.com
                        </a>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
