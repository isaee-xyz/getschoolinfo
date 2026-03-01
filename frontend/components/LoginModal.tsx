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
            onClose();
        } catch (error: any) {
            console.error("Login failed", error);
            const msg = error?.message || "Login failed. Please check your connection or try again.";
            const code = error?.code ? `(Code: ${error.code})` : '';
            alert(`Authentication Error: ${msg} ${code}\n\nTip: If you are the developer, check Firebase Console Authorized Domains.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200" style={{ background: 'var(--gsi-surface)' }}>
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full transition-colors" style={{ color: 'var(--gsi-text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-bg-warm)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = ''}
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-inner" style={{ background: 'var(--gsi-primary-50)', color: 'var(--gsi-primary)' }}>
                            <Lock className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h3 className="text-xl font-bold mb-2 font-display" style={{ color: 'var(--gsi-text)' }}>{title}</h3>
                        <p className="text-sm" style={{ color: 'var(--gsi-text-muted)' }}>{subTitle}</p>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4 mb-6 text-left">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={privacyChecked}
                                onChange={(e) => setPrivacyChecked(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded accent-teal-600 focus:ring-teal-500"
                                style={{ borderColor: 'var(--gsi-border)' }}
                            />
                            <span className="text-xs leading-tight" style={{ color: 'var(--gsi-text-secondary)' }}>
                                I agree to the <a href="/terms-and-condition" className="font-medium hover:underline" style={{ color: 'var(--gsi-primary)' }} target="_blank">Terms</a> and <a href="/privacy-policy" className="font-medium hover:underline" style={{ color: 'var(--gsi-primary)' }} target="_blank">Privacy Policy</a>. <span className="text-red-500">*</span>
                            </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={marketingChecked}
                                onChange={(e) => setMarketingChecked(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded accent-teal-600 focus:ring-teal-500"
                                style={{ borderColor: 'var(--gsi-border)' }}
                            />
                            <span className="text-[10px] leading-tight transition-colors" style={{ color: 'var(--gsi-text-muted)' }}>
                                Receive admission updates via WhatsApp/SMS/Call. (Optional)
                            </span>
                        </label>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading || !privacyChecked}
                        className="w-full text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        style={{ background: 'var(--gsi-primary)' }}
                        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--gsi-primary-dark)'; }}
                        onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--gsi-primary)'; }}
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
