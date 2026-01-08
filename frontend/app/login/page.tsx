"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { loginWithGoogle } = useAuth();
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle();
            router.push('/dashboard');
        } catch (error) {
            console.error("Login failed", error);
            alert("Login failed. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                    <div className="px-8 py-10">
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                                G
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900">
                                {isSignUp ? 'Create an Account' : 'Welcome Back'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-2">
                                {isSignUp ? 'Start your school search journey today.' : 'Sign in to access your shortlist and comparisons.'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 font-bold py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                                <span>Continue with Google</span>
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Email Login Coming Soon</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"} {' '}
                                <button
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="text-blue-600 font-bold hover:underline"
                                >
                                    {isSignUp ? 'Log in' : 'Sign up'}
                                </button>
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-slate-400">
                            By continuing, you agree to GetSchoolInfo's Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
