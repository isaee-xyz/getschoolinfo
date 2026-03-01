"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useStore } from '../context/StoreContext';

export default function DistrictAutocomplete() {
    const router = useRouter();
    const { addRecentSearch } = useStore();
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
        addRecentSearch(district);
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
                    className="w-full pl-10 pr-4 py-2 rounded-full outline-none transition-colors"
                    style={{ background: 'var(--gsi-primary-50)', border: '1px solid var(--gsi-border)', color: 'var(--gsi-text-secondary)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gsi-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--gsi-border)'; e.currentTarget.style.boxShadow = ''; }}
                />
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--gsi-primary)' }} />
                {loading && (
                    <Loader2 className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin" style={{ color: 'var(--gsi-primary)' }} />
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl overflow-hidden z-50" style={{ background: 'var(--gsi-surface)', border: '1px solid var(--gsi-border-light)' }}>
                    <div className="px-3 py-2 text-xs font-semibold" style={{ color: 'var(--gsi-text-muted)', background: 'var(--gsi-bg-warm)', borderBottom: '1px solid var(--gsi-border-light)' }}>
                        Districts
                    </div>
                    <ul>
                        {results.map((item, idx) => (
                            <li
                                key={idx}
                                onClick={() => handleSelect(item.name)}
                                className="px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors last:border-0"
                                style={{ borderBottom: '1px solid var(--gsi-bg-warm)' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-primary-50)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = ''}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                    style={{ background: 'var(--gsi-primary-50)' }}
                                >
                                    <MapPin className="w-4 h-4" style={{ color: 'var(--gsi-primary)' }} />
                                </div>
                                <div>
                                    <div className="font-medium" style={{ color: 'var(--gsi-text)' }}>{item.name}</div>
                                    <div className="text-xs" style={{ color: 'var(--gsi-text-muted)' }}>{item.state}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
