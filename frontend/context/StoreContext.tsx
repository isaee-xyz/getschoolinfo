"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';

interface StoreContextType {
    shortlist: string[];
    compareList: string[];
    toggleShortlist: (id: string) => Promise<void>;
    toggleCompare: (id: string | number) => void;
    isInShortlist: (id: string | number) => boolean;
    isInCompare: (id: string | number) => boolean;
    clearCompare: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [shortlist, setShortlist] = useState<string[]>([]);
    const [compareList, setCompareList] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial Load (Local Storage or Firestore)
    useEffect(() => {
        const loadInitialData = async () => {
            if (typeof window !== 'undefined') {
                // Always load compare list from local storage (it's session based usually)
                const savedCompare = localStorage.getItem('school_compare');
                if (savedCompare) setCompareList(JSON.parse(savedCompare));

                if (user) {
                    // Authenticated: Fetch from Firestore
                    try {
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            // Merge local storage if needed, or just trust DB. 
                            // For this iteration, DB is source of truth for logged in users.
                            if (data.shortlist && Array.isArray(data.shortlist)) {
                                setShortlist(data.shortlist);
                            }
                        }
                    } catch (error) {
                        console.error("Error loading shortlist from Firestore:", error);
                    }
                } else {
                    // Anonymous: Fetch from Local Storage
                    const savedShortlist = localStorage.getItem('school_shortlist');
                    if (savedShortlist) setShortlist(JSON.parse(savedShortlist));
                }
                setIsInitialized(true);
            }
        };

        loadInitialData();
    }, [user]);

    // Persist to Local Storage (only for anonymous or as backup)
    useEffect(() => {
        if (!user && isInitialized) {
            localStorage.setItem('school_shortlist', JSON.stringify(shortlist));
        }
    }, [shortlist, user, isInitialized]);

    useEffect(() => {
        localStorage.setItem('school_compare', JSON.stringify(compareList));
    }, [compareList]);

    const toggleShortlist = async (id: string) => {
        const isRemoving = shortlist.includes(id);

        // 1. Optimistic Update
        setShortlist(prev =>
            isRemoving ? prev.filter(item => item !== id) : [...prev, id]
        );

        // 2. Persist to Firestore if logged in
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    shortlist: isRemoving ? arrayRemove(id) : arrayUnion(id)
                }, { merge: true });
            } catch (error) {
                console.error("Failed to sync shortlist to cloud:", error);
                // Rollback if needed (omitted for simplicity in this iteration)
            }
        }
    };

    const toggleCompare = (rawId: string | number) => {
        console.log("toggleCompare CALLED with:", rawId, typeof rawId);
        if (!rawId && rawId !== 0) {
            console.warn("Attempted to toggle compare with invalid ID:", rawId);
            return;
        }
        const id = String(rawId);
        console.log("toggleCompare PROCESSED ID:", id);

        setCompareList(prev => {
            if (prev.includes(id)) {
                console.log("Removing from compare:", id);
                return prev.filter(item => item !== id);
            }
            if (prev.length >= 3) {
                alert("You can compare up to 3 schools at a time.");
                return prev;
            }
            console.log("Adding to compare:", id);
            return [...prev, id];
        });
    };

    const isInShortlist = (id: string | number) => shortlist.includes(String(id));
    const isInCompare = (id: string | number) => compareList.includes(String(id));
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
