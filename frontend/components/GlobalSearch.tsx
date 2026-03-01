"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, MapPin, GraduationCap, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
    name: string;
    district: string;
    state: string;
    slug: string;
    udise_code: string;
    board?: string;
}

interface GlobalSearchProps {
    compact?: boolean; // For mobile: smaller padding, shorter placeholder
}

export default function GlobalSearch({ compact = false }: GlobalSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/schools?search=${encodeURIComponent(query)}&limit=8`
                );
                if (res.ok) {
                    const data = await res.json();
                    const mapped = Array.isArray(data)
                        ? data.slice(0, 8).map((s: any) => ({
                            name: s.name,
                            district: s.district || '',
                            state: s.state || '',
                            slug: s.slug || '',
                            udise_code: s.udise_code || '',
                            board: s.board || '',
                        }))
                        : [];
                    setResults(mapped);
                    setIsOpen(mapped.length > 0);
                }
            } catch (e) {
                console.error('Global search error:', e);
            } finally {
                setLoading(false);
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
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = useCallback((result: SearchResult) => {
        setQuery('');
        setIsOpen(false);
        const city = (result.district || 'india').toLowerCase().replace(/\s+/g, '-');
        const slug = result.slug || result.udise_code;
        if (slug) {
            router.push(`/${city}/${slug}`);
        }
    }, [router]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim().length >= 2) {
            setIsOpen(false);
            router.push(`/search?search=${encodeURIComponent(query.trim())}`);
            setQuery('');
        }
    }, [query, router]);

    const clearQuery = useCallback(() => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        inputRef.current?.focus();
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={compact ? "Search schools, cities..." : "Search schools, cities, boards, pincode..."}
                    className={`w-full pl-9 pr-8 outline-none transition-colors ${compact ? 'py-2 text-sm rounded-lg' : 'py-2.5 text-sm rounded-full'}`}
                    style={{
                        background: 'var(--gsi-primary-50)',
                        border: '1px solid var(--gsi-border)',
                        color: 'var(--gsi-text)',
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--gsi-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                        if (results.length > 0) setIsOpen(true);
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--gsi-border)';
                        e.currentTarget.style.boxShadow = '';
                    }}
                />
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${compact ? 'w-4 h-4' : 'w-4 h-4'}`} style={{ color: 'var(--gsi-primary)' }} />

                {loading && (
                    <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: 'var(--gsi-primary)' }} />
                )}
                {!loading && query.length > 0 && (
                    <button
                        type="button"
                        onClick={clearQuery}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors"
                        style={{ color: 'var(--gsi-text-muted)' }}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </form>

            {/* Dropdown results */}
            {isOpen && results.length > 0 && (
                <div
                    className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-[60]"
                    style={{
                        background: 'var(--gsi-surface)',
                        border: '1px solid var(--gsi-border-light)',
                        boxShadow: 'var(--gsi-shadow-lg)',
                    }}
                >
                    <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--gsi-text-muted)', background: 'var(--gsi-bg-warm)', borderBottom: '1px solid var(--gsi-border-light)' }}>
                        Schools
                    </div>
                    <ul>
                        {results.map((item, idx) => (
                            <li
                                key={`${item.udise_code}-${idx}`}
                                onClick={() => handleSelect(item)}
                                className="px-3 py-2.5 cursor-pointer flex items-start gap-3 transition-colors"
                                style={{ borderBottom: idx < results.length - 1 ? '1px solid var(--gsi-bg-warm)' : 'none' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-primary-50)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = ''}
                            >
                                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                    style={{ background: 'var(--gsi-primary-50)' }}>
                                    <GraduationCap className="w-3.5 h-3.5" style={{ color: 'var(--gsi-primary)' }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium truncate" style={{ color: 'var(--gsi-text)' }}>
                                        {item.name}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] mt-0.5" style={{ color: 'var(--gsi-text-muted)' }}>
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{item.district}{item.state ? `, ${item.state}` : ''}</span>
                                        {item.board && (
                                            <>
                                                <span style={{ color: 'var(--gsi-border)' }}>|</span>
                                                <span>{item.board}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {/* "See all results" footer */}
                    <button
                        onClick={handleSubmit as any}
                        className="w-full px-3 py-2.5 text-xs font-semibold text-center transition-colors"
                        style={{
                            color: 'var(--gsi-primary)',
                            background: 'var(--gsi-bg-warm)',
                            borderTop: '1px solid var(--gsi-border-light)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gsi-primary-50)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gsi-bg-warm)'}
                    >
                        See all results for "{query}"
                    </button>
                </div>
            )}
        </div>
    );
}
