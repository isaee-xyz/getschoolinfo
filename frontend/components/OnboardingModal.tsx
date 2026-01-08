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

    // Check if profile is complete (you might want to verify specific fields)
    if (userProfile?.phoneNumber && userProfile?.studentName && userProfile?.studentClass) {
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
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">

                <div className="p-8">
                    {/* Header Section (Matching Login Page) */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-lg shadow-blue-200">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Complete Profile</h2>
                        <p className="text-sm text-slate-500 mt-2">
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
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium border-r border-gray-200 pr-2 mr-2">
                                    +91
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-20 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                                    placeholder="9876543210"
                                    required
                                />
                            </div>
                        </div>

                        {/* Student Name */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Student Name <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                                    placeholder="Enter child's name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Class Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admission For Class <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={studentClass}
                                    onChange={(e) => setStudentClass(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-gray-50 focus:bg-white text-gray-900"
                                    required
                                >
                                    <option value="" disabled>Select Class</option>
                                    {CLASSES.map(cls => (
                                        <option key={cls} value={cls}>{cls}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={pageLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
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
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-slate-400">
                        Your information is safe with us.
                    </p>
                </div>
            </div>
        </div>
    );
}
