"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User as FirebaseUser,
    GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, increment } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface UserProfile {
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    phoneNumber?: string;
    studentName?: string;
    studentClass?: string;
    onboardingStatus?: 'pending' | 'completed';
    environment?: string;
    lastLoginAt?: any;
    loginCount?: number;
    metadata?: {
        userAgent: string;
        platform: string;
        language: string;
        ip?: string;
        city?: string;
        region?: string;
        country?: string;
        networkType?: string;
        timezone?: string;
    };
    [key: string]: any;
}

interface AuthContextType {
    user: FirebaseUser | null;
    userProfile: UserProfile | null;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    saveProfile: (data: Partial<UserProfile>) => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    let profileData = userDoc.exists() ? (userDoc.data() as UserProfile) : {};
                    let locationData = {};
                    let networkType = 'unknown';

                    // 1. Fetch Location Data (Best Effort)
                    try {
                        const res = await fetch('https://ipapi.co/json/');
                        if (res.ok) {
                            const data = await res.json();
                            locationData = {
                                ip: data.ip,
                                city: data.city,
                                region: data.region,
                                country: data.country_name,
                                timezone: data.timezone,
                            };
                        }
                    } catch (e) {
                        console.warn('Failed to fetch location data', e);
                    }

                    // 2. Capture Network Info
                    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
                        networkType = (navigator as any).connection.effectiveType || 'unknown';
                    }

                    // 3. Prepare Metadata
                    const metadata = {
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                        language: typeof navigator !== 'undefined' ? navigator.language : '',
                        platform: typeof navigator !== 'undefined' ? navigator.platform : '',
                        networkType,
                        ...locationData
                    };

                    const updateData: Partial<UserProfile> = {
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                        lastLoginAt: serverTimestamp(),
                        environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
                        metadata: metadata,
                        loginCount: increment(1) as any,
                    };

                    // If new user (doc doesn't exist) or no status, set as pending
                    if (!userDoc.exists() || !profileData.onboardingStatus) {
                        updateData.onboardingStatus = 'pending';
                    }

                    // 4. Update User Profile
                    await setDoc(userDocRef, updateData, { merge: true });

                    // 5. Log Event to 'login_events' collection
                    try {
                        await addDoc(collection(db, 'login_events'), {
                            uid: currentUser.uid,
                            timestamp: serverTimestamp(),
                            type: 'login',
                            environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
                            ...metadata
                        });
                        console.log("Login event logged successfully");
                    } catch (evtErr) {
                        console.error("Failed to log login event (check Firestore rules):", evtErr);
                    }

                    // Update local state 
                    // Note: We avoid merging Firestore sentinel objects (increment) into local state
                    setUserProfile({ ...profileData, ...updateData, loginCount: (profileData.loginCount || 0) + 1 });

                    localStorage.setItem('getschool_user_uid', currentUser.uid);
                } catch (error) {
                    console.error("Error fetching/saving user profile:", error);
                }
            } else {
                setUserProfile(null);
                localStorage.removeItem('getschool_user_uid');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const saveProfile = async (data: Partial<UserProfile>) => {
        if (!user) throw new Error("No user logged in");
        console.log("Saving user profile for:", user.uid, data);

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, data, { merge: true });
            console.log("Profile saved to Firestore.");

            setUserProfile(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error("Error saving profile:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loginWithGoogle, logout, saveProfile, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
