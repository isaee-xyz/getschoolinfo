"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Phone, User, GraduationCap, ArrowRight } from 'lucide-react';

export function OnboardingModal() {
    const { user, userProfile, saveProfile, loading } = useAuth();
    const [pageLoading, setPageLoading] = useState(false);

    // Form State
    const [phone, setPhone] = useState('');
    const [studentName, setStudentName] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [error, setError] = useState('');

    // If no user or loading auth, or profile already exists (and has required fields), don't show
    if (loading || !user) return null;

    // Check if profile is complete based on status or legacy field check
    if (userProfile?.onboardingStatus === 'completed' || (userProfile?.phoneNumber && userProfile?.studentName && userProfile?.studentClass)) {
        return null;
    }

    const validatePhone = (p: string) => {
        const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
        return phoneRegex.test(p);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setPageLoading(true);

        // Validation
        if (!validatePhone(phone)) {
            setError('Please enter a valid Indian phone number (10 digits).');
            setPageLoading(false);
            return;
        }
        if (!studentName.trim()) {
            setError('Please enter the Student Name.');
            setPageLoading(false);
            return;
        }
        if (!studentClass) {
            setError('Please select a Class.');
            setPageLoading(false);
            return;
        }

        try {
            await saveProfile({
                phoneNumber: phone,
                studentName,
                studentClass,
                onboardingStatus: 'completed',
                updatedAt: new Date().toISOString()
            });
            // Modal will auto-close due to `userProfile` check above
        } catch (err: any) {
            console.error("Error saving profile:", err);
            setError(err.message || "Failed to save profile. Please try again.");
        } finally {
            setPageLoading(false);
        }
    };

    const CLASSES = [
        "Play Group", "Nursery", "LKG", "UKG",
        "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
        "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
        "Class 11", "Class 12"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border-light)' }}>

                <div className="p-8">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-lg"
                            style={{ background: 'var(--gsi-primary)', boxShadow: '0 4px 14px -3px rgba(13, 148, 136, 0.3)' }}
                        >
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-extrabold font-display" style={{ color: 'var(--gsi-text)' }}>Complete Profile</h2>
                        <p className="text-sm mt-2" style={{ color: 'var(--gsi-text-muted)' }}>
                            Just a few more details to personalize your experience.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center justify-center">
                                {error}
                            </div>
                        )}

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gsi-text-secondary)' }}>Phone Number <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-teal-500 transition-colors" style={{ color: 'var(--gsi-text-muted)' }}>
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-sm font-medium pr-2 mr-2" style={{ color: 'var(--gsi-text-muted)', borderRight: '1px solid var(--gsi-border)' }}>
                                    +91
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-20 pr-4 py-3 rounded-xl outline-none transition-all"
                                    style={{ border: '1px solid var(--gsi-border)', background: 'var(--gsi-bg-warm)', color: 'var(--gsi-text)' }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gsi-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; e.currentTarget.style.background = 'var(--gsi-surface)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--gsi-border)'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.background = 'var(--gsi-bg-warm)'; }}
                                    placeholder="9876543210"
                                    required
                                />
                            </div>
                        </div>

                        {/* Student Name */}
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gsi-text-secondary)' }}>Student Name <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-teal-500 transition-colors" style={{ color: 'var(--gsi-text-muted)' }}>
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                                    style={{ border: '1px solid var(--gsi-border)', background: 'var(--gsi-bg-warm)', color: 'var(--gsi-text)' }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gsi-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; e.currentTarget.style.background = 'var(--gsi-surface)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--gsi-border)'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.background = 'var(--gsi-bg-warm)'; }}
                                    placeholder="Enter child's name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Class Selection */}
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gsi-text-secondary)' }}>Admission For Class <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={studentClass}
                                    onChange={(e) => setStudentClass(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 rounded-xl outline-none transition-all appearance-none"
                                    style={{ border: '1px solid var(--gsi-border)', background: 'var(--gsi-bg-warm)', color: 'var(--gsi-text)' }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gsi-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; e.currentTarget.style.background = 'var(--gsi-surface)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--gsi-border)'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.background = 'var(--gsi-bg-warm)'; }}
                                    required
                                >
                                    <option value="" disabled>Select Class</option>
                                    {CLASSES.map(cls => (
                                        <option key={cls} value={cls}>{cls}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4" style={{ color: 'var(--gsi-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={pageLoading}
                            className="w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            style={{ background: 'var(--gsi-primary)', boxShadow: '0 4px 14px -3px rgba(13, 148, 136, 0.3)' }}
                            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--gsi-primary-dark)'; }}
                            onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--gsi-primary)'; }}
                        >
                            {pageLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Complete Setup <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Strip */}
                <div className="px-8 py-4 text-center" style={{ borderTop: '1px solid var(--gsi-border-light)', background: 'var(--gsi-primary-50)' }}>
                    <p className="text-xs" style={{ color: 'var(--gsi-text-muted)' }}>
                        Your information is safe with us.
                    </p>
                </div>
            </div>
        </div>
    );
}
