"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface StoreContextType {
    shortlist: string[];
    compareList: string[];
    toggleShortlist: (id: string) => void;
    toggleCompare: (id: string) => void;
    isInShortlist: (id: string) => boolean;
    isInCompare: (id: string) => boolean;
    clearCompare: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [shortlist, setShortlist] = useState<string[]>([]);
    const [compareList, setCompareList] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedShortlist = localStorage.getItem('school_shortlist');
            const savedCompare = localStorage.getItem('school_compare');
            if (savedShortlist) setShortlist(JSON.parse(savedShortlist));
            if (savedCompare) setCompareList(JSON.parse(savedCompare));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('school_shortlist', JSON.stringify(shortlist));
    }, [shortlist]);

    useEffect(() => {
        localStorage.setItem('school_compare', JSON.stringify(compareList));
    }, [compareList]);

    const toggleShortlist = (id: string) => {
        setShortlist(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleCompare = (id: string) => {
        setCompareList(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            }
            if (prev.length >= 3) {
                alert("You can compare up to 3 schools at a time.");
                return prev;
            }
            return [...prev, id];
        });
    };

    const isInShortlist = (id: string) => shortlist.includes(id);
    const isInCompare = (id: string) => compareList.includes(id);
    const clearCompare = () => setCompareList([]);

    return (
        <StoreContext.Provider value={{
            shortlist,
            compareList,
            toggleShortlist,
            toggleCompare,
            isInShortlist,
            isInCompare,
            clearCompare
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};
