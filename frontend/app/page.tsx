"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLocations } from '@/hooks/useLocations';
import { ShieldCheck, Database, GraduationCap, IndianRupee, Trophy, Building2, MapPin, RefreshCw } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const { districts, states, loading } = useLocations();

  // Dynamic Counter Logic
  const [schoolCount, setSchoolCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    // 1. Fetch Count
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/total-schools`)
      .then(res => res.json())
      .then(data => {
        if (data.count) setSchoolCount(data.count);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    // 2. Animate Count
    if (schoolCount === 0) return;

    let start = 0;
    const end = schoolCount;
    const duration = 2000;
    const incrementTime = 20;
    const totalSteps = duration / incrementTime;
    const stepValue = end / totalSteps;

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setDisplayCount(end);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [schoolCount]);

  const handleSearch = () => {
    router.push(`/search?district=${selectedDistrict}`);
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-linear-to-b from-blue-50 to-white py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Make Informed School Choices <span className="text-blue-600 block mt-2">for Your Child</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Don't guess. Check Teacher Quality, Hygiene Stats, and Hidden Fees before you apply.
            </p>

            {/* Existing Search Box ... */}
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 max-w-3xl mx-auto flex flex-col md:flex-row gap-4 mb-12">
              <div className="flex-1">
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="" disabled>Select State</option>
                  {states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={loading}
                >
                  <option value="">{loading ? "Loading..." : "Select District"}</option>
                  {Array.from(new Set(districts.map(d => d.name))).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
              >
                Find Schools
              </button>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-12 mt-10 text-sm text-slate-500 font-medium">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                <span>Updated: January 2026</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span>Covering 28 States & 8 UTs</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Database className="w-4 h-4 text-purple-500" />
                <span>
                  <strong className="text-slate-900 text-lg mr-1 font-mono">
                    {displayCount.toLocaleString()}+
                  </strong>
                  Schools Listed
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Collections */}
        <section className="py-20 container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-10">Smart Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/search?filter=infra')}>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Top Infrastructure</h3>
              <p className="text-sm text-gray-500">Schools with verified labs, smart boards & playgrounds.</p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/search?filter=value')}>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Best Value</h3>
              <p className="text-sm text-gray-500">High quality education with low fees. Hidden gems.</p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/search?filter=academic')}>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Academic Elite</h3>
              <p className="text-sm text-gray-500">Schools with highly qualified staff and great ratios.</p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/search?filter=safety')}>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Safety First</h3>
              <p className="text-sm text-gray-500">Secure perimeter, fire safety and verified transport.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
