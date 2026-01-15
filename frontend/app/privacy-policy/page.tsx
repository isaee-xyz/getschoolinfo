import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Privacy Policy | GetSchoolsInfo',
    description: 'How we collect, use, and shield your data.',
};

export default function PrivacyPolicyPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 border-b border-gray-200 pb-4">Privacy Policy</h1>

                <div className="space-y-8 text-slate-700 leading-relaxed">
                    <p>
                        At GetSchoolsInfo, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our school discovery platform.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Information We Collect</h2>

                        <h3 className="font-bold text-slate-800 mt-4 mb-2">Personal Information:</h3>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Name and email address when you subscribe to school alerts or newsletters.</li>
                            <li>Search preferences and location data when you search for schools.</li>
                            <li>Contact details if you reach out through our Contact Us form.</li>
                            <li>Feedback and comments you provide.</li>
                        </ul>

                        <h3 className="font-bold text-slate-800 mt-4 mb-2">Non-Personal Information:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>IP address, browser type, device information, and operating system.</li>
                            <li>Browsing behavior, pages visited, and time spent on the website.</li>
                            <li>Search queries and filters used (district, management type, quality scores).</li>
                            <li>Referral sources and click patterns.</li>
                            <li>Technical information collected through cookies and analytics tools.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">How We Use Your Information</h2>
                        <p className="mb-3">We use collected information to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Provide personalized school recommendations based on your location and preferences.</li>
                            <li>Send school alerts, educational updates, and platform feature announcements (with your consent).</li>
                            <li>Improve search algorithms and quality metric calculations.</li>
                            <li>Analyze user behavior to enhance the school discovery experience.</li>
                            <li>Respond to your inquiries, feedback, and support requests.</li>
                            <li>Monitor website performance and troubleshoot technical issues.</li>
                            <li>Generate aggregate statistics about school searches and trends (anonymized data only).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Data Sharing & Third Parties</h2>
                        <p className="mb-4">We do not sell, trade, or transfer your personal information to third parties without your explicit consent, except for:</p>

                        <h3 className="font-bold text-slate-800 mt-2 mb-2">Trusted Service Providers:</h3>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Email service providers for newsletter delivery.</li>
                            <li>Analytics tools (Google Analytics) for website usage analysis.</li>
                            <li>Hosting providers for website infrastructure.</li>
                            <li>All partners are bound by strict confidentiality agreements.</li>
                        </ul>

                        <h3 className="font-bold text-slate-800 mt-2 mb-2">Legal Requirements:</h3>
                        <p>We may disclose your information if required by law, regulation, legal process, or governmental request.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Cookies & Tracking Technologies</h2>
                        <p className="mb-3">We use cookies to:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Remember your search preferences and location.</li>
                            <li>Provide personalized school recommendations.</li>
                            <li>Analyze website traffic and user engagement.</li>
                            <li>Improve website functionality and user experience.</li>
                        </ul>
                        <p><strong>Cookie Management:</strong> You can disable cookies in your browser settings. However, this may affect website functionality, such as saved search filters and location-based recommendations.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Third-Party Links</h2>
                        <p className="mb-4">
                            GetSchoolsInfo may contain links to official school websites, the UDISE+ government portal, and educational resources.
                            We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Data Security</h2>
                        <p className="mb-4">We implement industry-standard security measures including SSL/HTTPS encryption, secure server infrastructure, and regular audits. However, no method of transmission over the internet is 100% secure.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Children's Privacy</h2>
                        <p>GetSchoolsInfo is intended for use by parents, guardians, and educators. We do not knowingly collect personal information from children under 13 without parental consent.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Your Rights</h2>
                        <p className="mb-3">You have the right to:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Access your personal information we hold.</li>
                            <li>Update or correct inaccurate information.</li>
                            <li>Delete your personal data (subject to legal obligations).</li>
                            <li>Opt-out of marketing communications by unsubscribing.</li>
                        </ul>
                    </section>

                    <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Contact Us</h2>
                        <p>For questions, concerns, or requests regarding this Privacy Policy or your personal data:</p>
                        <p className="font-bold text-blue-600 mt-2">Email: info@getschoolsinfo.com</p>
                        <p className="text-sm mt-2 text-gray-500">We will respond to your inquiry within 7-10 business days.</p>
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
