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
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Use mock name if signing in with just email (simulate existing user)
            const userName = name || email.split('@')[0];
            login(email, userName);
            setIsLoading(false);
            router.push('/dashboard');
        }, 1000);
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isSignUp && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            required={isSignUp}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="parent@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {!isSignUp && (
                                    <div className="flex justify-end mt-1">
                                        <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        {isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

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
