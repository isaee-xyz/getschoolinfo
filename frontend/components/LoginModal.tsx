"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Lock } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subTitle?: string;
}

export default function LoginModal({ isOpen, onClose, title = "Unlock School Details", subTitle = "Sign in to view contact details, fees, and more." }: LoginModalProps) {
    const { loginWithGoogle } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [privacyChecked, setPrivacyChecked] = useState(true);
    const [marketingChecked, setMarketingChecked] = useState(true);

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle();
            onClose(); // Close modal on success
        } catch (error) {
            console.error("Login failed", error);
            alert(error instanceof Error ? error.message : "Login failed. Please check your connection or try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                            <Lock className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                        <p className="text-sm text-slate-500">{subTitle}</p>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4 mb-6 text-left">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={privacyChecked}
                                onChange={(e) => setPrivacyChecked(e.target.checked)}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs text-slate-600 leading-tight">
                                I agree to the <a href="/terms-and-condition" className="text-blue-600 hover:underline" target="_blank">Terms</a> and <a href="/privacy-policy" className="text-blue-600 hover:underline" target="_blank">Privacy Policy</a>. <span className="text-red-500">*</span>
                            </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={marketingChecked}
                                onChange={(e) => setMarketingChecked(e.target.checked)}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-[10px] text-slate-500 leading-tight group-hover:text-slate-700 transition-colors">
                                Receive admission updates via WhatsApp/SMS/Call. (Optional)
                            </span>
                        </label>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading || !privacyChecked}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/10"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
