import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import { CheckCircle, Users, Building, BookOpen, Shield, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'How It Works | School Quality Metrics Explained | GetSchoolsInfo',
    description: 'Understand the 10 key quality metrics we use to rate schools, including Student-Teacher Ratio, Infrastructure scores, and safety standards.',
};

export default function HowItWorks() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50">
                <section className="bg-slate-900 text-white py-20 px-4">
                    <div className="container mx-auto max-w-4xl text-center">
                        <h1 className="text-4xl font-bold mb-6">Understanding Our Quality Metrics</h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            We don't just list schools; we analyze them using 10 objective government data points to help you find the best fit.
                        </p>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-16 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                        {/* Metric 1 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">1. Student-Teacher Ratio (STR)</h2>
                            </div>
                            <p className="text-slate-600 mb-4">
                                The number of students per teacher. Lower is better.
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> <strong>Good:</strong> 30 students or fewer</li>
                                    <li className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-orange-500" /> <strong>Average:</strong> 31-40 students</li>
                                    <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-red-500" /> <strong>Poor:</strong> More than 40 students</li>
                                </ul>
                            </div>
                        </div>

                        {/* Metric 2 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-green-100 p-3 rounded-lg text-green-600">
                                    <Building className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">2. Classroom Density</h2>
                            </div>
                            <p className="text-slate-600 mb-4">
                                Students per "Good Condition" classroom. Ensures no overcrowding.
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> <strong>Ideal:</strong> 25-35 students</li>
                                    <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-red-500" /> <strong>Crowded:</strong> 50+ students</li>
                                </ul>
                            </div>
                        </div>

                        {/* Metric 3 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">3. Teacher Qualifications</h2>
                            </div>
                            <p className="text-slate-600 mb-4">
                                Percentage of teachers with professional degrees (B.Ed, M.Ed).
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                <p>We look for schools where <strong>80%+</strong> of the staff is professionally qualified, ensuring substantial pedagogical training.</p>
                            </div>
                        </div>

                        {/* Metric 4 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">4. Safety & Hygiene</h2>
                            </div>
                            <p className="text-slate-600 mb-4">
                                A composite score checking for Boundary Walls, Fire Safety, and Functional Toilets.
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                <p>Schools must have a <strong>Pucca Boundary Wall</strong> and separate, functional toilets for girls to pass our safety check.</p>
                            </div>
                        </div>

                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
