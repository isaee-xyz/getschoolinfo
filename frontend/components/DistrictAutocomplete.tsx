"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DistrictAutocomplete() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/search?query=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data);
                        setIsOpen(true);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (district: string) => {
        setQuery(district);
        setIsOpen(false);
        // Explicitly clear 'search' (text) param to resolve conflict
        router.push(`/search?district=${encodeURIComponent(district)}&search=`);
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-xl">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search District (e.g. Bengaluru)..."
                    className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/50 text-slate-700 placeholder-slate-400"
                />
                <Search className="w-5 h-5 text-blue-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                {loading && (
                    <Loader2 className="w-4 h-4 text-blue-500 absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin" />
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-gray-50 border-b border-gray-100">
                        Districts
                    </div>
                    <ul>
                        {results.map((item, idx) => (
                            <li
                                key={idx}
                                onClick={() => handleSelect(item.name)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-800">{item.name}</div>
                                    <div className="text-xs text-slate-500">{item.state}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
