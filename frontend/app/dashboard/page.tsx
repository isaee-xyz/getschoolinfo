"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SchoolCard from '@/components/SchoolCard';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { MOCK_SCHOOLS } from '@/constants';
import { Heart, BookOpen, Settings, LogOut, TrendingUp, Search } from 'lucide-react';

import { School } from '@/types';

export default function DashboardPage() {
    const { shortlist, compareList, recentSearches } = useStore();
    const { user, userProfile, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const [savedSchools, setSavedSchools] = React.useState<School[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch Real School Data for Shortlist
    useEffect(() => {
        const fetchShortlistedSchools = async () => {
            if (shortlist.length === 0) {
                setSavedSchools([]);
                setLoading(false);
                return;
            }
            try {
                // Fetch each school individually to ensure we get specific records regardless of pagination
                const promises = shortlist.map(id =>
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/school/${id}`)
                        .then(res => res.ok ? res.json() : null)
                        .catch(err => {
                            console.error(`Failed to fetch shortlisted school ${id}`, err);
                            return null;
                        })
                );

                const results = await Promise.all(promises);
                setSavedSchools(results.filter(s => s !== null));
            } catch (err) {
                console.error("Error fetching shortlisted schools:", err);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchShortlistedSchools();
        }
    }, [shortlist, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    const displayName = userProfile?.studentName || user?.displayName || (user?.email?.split('@')[0]) || 'Student';

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pb-12">

                {/* User Welcome Header */}
                <div className="bg-slate-900 text-white py-12 px-4">
                    <div className="container mx-auto max-w-5xl">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <img
                                src={user?.photoURL || "https://ui-avatars.com/api/?name=" + (displayName) + "&background=random"}
                                alt={displayName}
                                className="w-20 h-20 rounded-full border-4 border-white/20"
                            />
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold">Hello, {displayName}!</h1>
                                <p className="text-slate-300 mt-1">{user?.email}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={logout}
                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 px-4 py-2 rounded-lg font-medium backdrop-blur-sm transition-colors flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            {/* Shortlist Stat */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center text-white">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-300 text-sm font-medium">Shortlisted Schools</p>
                                    <p className="text-2xl font-bold">{savedSchools.length}</p>
                                </div>
                            </div>

                            {/* Compare Stat (Clickable) */}
                            <Link href={compareList.length > 0 ? `/compare?${compareList.map(id => `id=${id}`).join('&')}` : '/compare'} className="block group">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4 transition-transform group-hover:scale-105 group-hover:bg-white/20">
                                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-slate-300 text-sm font-medium">Comparison List</p>
                                        <p className="text-2xl font-bold">{compareList.length}</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Recent Searches Stat */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                    <Search className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-300 text-sm font-medium">Recent Searches</p>
                                    <p className="text-2xl font-bold">{recentSearches.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto max-w-5xl px-4 -mt-6 space-y-8">

                    {/* Recent Searches Section */}
                    {recentSearches.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5 text-emerald-500" /> Continue Searching
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {recentSearches.map((term, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/search?search=${encodeURIComponent(term)}`}
                                        className="bg-gray-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-4 py-2 rounded-lg border border-gray-200 hover:border-emerald-200 transition-colors text-sm font-medium"
                                    >
                                        {term}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Shortlist Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-pink-500" /> My Shortlist
                            </h2>
                            <Link href="/search" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                                Find More Schools
                            </Link>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-slate-500">Loading your saved schools...</div>
                        ) : savedSchools.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Your shortlist is empty</h3>
                                <p className="text-slate-500 mb-6">Save schools you're interested in to track them here.</p>
                                <Link
                                    href="/search"
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Start Exploring
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {savedSchools.map(school => (
                                    <SchoolCard key={school.id} school={school} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
