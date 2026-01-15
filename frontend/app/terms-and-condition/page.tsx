import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Terms & Conditions | GetSchoolsInfo',
    description: 'Legal terms and conditions for using GetSchoolsInfo.',
};

export default function TermsAndConditionsPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Terms and Conditions</h1>
                <p className="text-gray-500 mb-8 border-b border-gray-200 pb-4">Effective Date: January 2026</p>

                <div className="space-y-8 text-slate-700 leading-relaxed font-sans">
                    <p>
                        Welcome to GetSchoolsInfo. By accessing or using our website at getschoolsinfo.com ("Platform"), you agree to be bound by these Terms and Conditions ("Terms"). Please read them carefully before using our services.
                        These Terms should be read together with our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a> and <a href="/disclaimer" className="text-blue-600 hover:underline">Disclaimer</a>, which form part of this agreement.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing, browsing, or using GetSchoolsInfo, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and our Disclaimer. If you do not agree with any part of these Terms, you must not use our Platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
                        <p className="mb-2">GetSchoolsInfo is an independent school discovery platform that:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Aggregates publicly available school data from UDISE+.</li>
                            <li>Calculates quality metrics based on official educational benchmarks (NEP 2020, RTE Act).</li>
                            <li>Provides search and comparison tools.</li>
                        </ul>
                        <p><strong>We are NOT:</strong> A government website, accreditation authority, or admission platform.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. User Eligibility</h2>
                        <p>You must be at least 18 years of age and capable of entering into a legally binding agreement to use this Platform.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. User Responsibilities</h2>
                        <p className="mb-2">You agree to use the Platform only for lawful purposes. You agree <strong>NOT</strong> to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Use automated systems (bots, scrapers) to extract data.</li>
                            <li>Submit false or malicious information.</li>
                            <li>Resell or commercially exploit Platform data.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Accuracy and Limitations</h2>
                        <p>
                            School data is sourced from UDISE+ and may contain errors. We expressly disclaim liability for any inaccuracies. You must independently verify all information before making enrollment decisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Privacy and Data Protection</h2>
                        <p>
                            Your privacy is important to us. By using this Platform, you agree to our collection and use of personal information as described in our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">11. Disclaimer of Warranties</h2>
                        <p className="uppercase text-sm font-semibold tracking-wide text-gray-500 mb-2">THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE".</p>
                        <p>We do not warrant accuracy, availability, or fitness for purpose. You use the Platform entirely at your own risk.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">12. Limitation of Liability</h2>
                        <p>
                            In no event shall GetSchoolsInfo's total liability exceed ₹1,000. We are not liable for any indirect, incidental, or consequential damages.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">16. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of India. Any disputes are subject to the exclusive jurisdiction of courts in Bangalore, Karnataka.
                        </p>
                    </section>

                    <section className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Contact Us</h2>
                        <p>For questions regarding these Terms:</p>
                        <p className="font-bold text-blue-600">Email: info@getschoolsinfo.com</p>
                    </section>

                    <p className="text-sm text-gray-400 mt-8 pt-8 border-t border-gray-100">
                        Last Updated: January 2026
                    </p>
                </div>
            </main>
            <Footer />
        </>
    );
}
