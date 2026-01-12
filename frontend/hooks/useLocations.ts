"use client";

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useLocations() {
    const [districts, setDistricts] = useState<{ name: string; state: string }[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [blocks, setBlocks] = useState<string[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${API_URL}/config/locations`);
                if (res.ok) {
                    const data = await res.json();
                    // Handle both legacy (string[]) and new ({name, state}[]) formats for safety
                    const rawDistricts = data.districts || [];
                    const formattedDistricts = rawDistricts.map((d: any) =>
                        typeof d === 'string' ? { name: d, state: '' } : d
                    );
                    setDistricts(formattedDistricts);
                    setStates(data.states || []);
                }
            } catch (error) {
                console.error("Failed to fetch locations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    const fetchBlocks = async (district: string) => {
        if (!district) {
            setBlocks([]);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/config/locations?district=${encodeURIComponent(district)}`);
            if (res.ok) {
                const data = await res.json();
                setBlocks(data.blocks || []);
            }
        } catch (error) {
            console.error("Failed to fetch blocks:", error);
        }
    };

    return { districts, states, blocks, fetchBlocks, loading };
}
