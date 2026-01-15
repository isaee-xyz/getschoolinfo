import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Disclaimer | GetSchoolsInfo',
    description: 'Legal disclaimer regarding data accuracy and liability for GetSchoolsInfo.',
};

export default function DisclaimerPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 border-b border-gray-200 pb-4">Disclaimer</h1>

                <div className="space-y-8 text-slate-700 leading-relaxed">
                    <p className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 font-medium">
                        GetSchoolsInfo is an independent school discovery platform and is not affiliated with, endorsed by, or operated by any government entity, including the Ministry of Education, UDISE+, or any state education department.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">About Our Data</h2>
                        <p>
                            All school information on this website is derived from publicly available government sources, primarily the Unified District Information System for Education Plus (UDISE+). We process this data to calculate quality metrics and present it in a parent-friendly format.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Data Accuracy & Liability</h2>
                        <p className="mb-4">While we strive to ensure the accuracy and reliability of information presented on GetSchoolsInfo:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>We make no representations or warranties of any kind, either express or implied, regarding the completeness, accuracy, reliability, or availability of the content.</li>
                            <li>School data is sourced from UDISE+ and may contain errors or be outdated at the time of your visit.</li>
                            <li>Our quality scores and metrics are derived calculations based on official benchmarks (NEP 2020, RTE Act, UNESCO standards) but should not be the sole basis for school selection.</li>
                            <li>Any reliance you place on such information is strictly at your own risk.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Independent Analysis</h2>
                        <p className="mb-4">Our school quality metrics (Student-Teacher Ratio, Gender Parity Index, Teacher Qualification Index, etc.) are calculated using first-principles thinking based on:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>National Education Policy (NEP) 2020</li>
                            <li>Right to Education (RTE) Act 2009</li>
                            <li>National Curriculum Framework (NCF)</li>
                            <li>UNESCO global standards</li>
                        </ul>
                        <p className="mt-4">These metrics represent our independent analysis and do not reflect official government ratings or endorsements.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Verification Required</h2>
                        <p className="mb-4">Before making any enrollment decisions, we strongly recommend that you:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Visit the school premises in person.</li>
                            <li>Verify all information directly with the school administration.</li>
                            <li>Check the official UDISE+ portal at <a href="https://udiseplus.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://udiseplus.gov.in</a> for source data.</li>
                            <li>Review official school documents and records.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">No Liability</h2>
                        <p className="mb-4">We are not responsible for any loss or damage, including without limitation, indirect or consequential loss or damage, or any loss or damage arising from:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Loss of data or profits arising out of or in connection with the use of this website.</li>
                            <li>Decisions made based on information provided on this platform.</li>
                            <li>Any errors, omissions, or discrepancies in school data.</li>
                            <li>Changes in school information not yet reflected in UDISE+ data.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">External Links</h2>
                        <p>
                            This website may contain links to external websites (official school websites, UDISE+ portal, etc.) that are not provided or maintained by GetSchoolsInfo. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Updates & Changes</h2>
                        <p>
                            School data is updated periodically based on UDISE+ data release cycles. Quality metrics may change as new data becomes available. We reserve the right to modify our methodology and scoring algorithms to improve accuracy and relevance.
                        </p>
                    </section>

                    <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Contact Us</h2>
                        <p>For questions, corrections, or concerns regarding the information on this website, please contact us at: <a href="mailto:info@getschoolsinfo.com" className="text-blue-600 font-bold hover:underline">info@getschoolsinfo.com</a></p>
                    </section>

                    <p className="text-sm text-gray-400 mt-8 pt-8 border-t border-gray-100">
                        By using this website, you acknowledge and agree to these terms and conditions.<br />
                        Last Updated: January 2026
                    </p>
                </div>
            </main>
            <Footer />
        </>
    );
}
