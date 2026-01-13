"use client";

import React, { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { clarity } from 'react-microsoft-clarity';

import { OnboardingModal } from './OnboardingModal';

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        clarity.init('v0o6qard58');
    }, []);

    return (
        <AuthProvider>
            <StoreProvider>
                {children}
                <OnboardingModal />
            </StoreProvider>
        </AuthProvider>
    );
}
