"use client";

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useLocations() {
    const [districts, setDistricts] = useState<string[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${API_URL}/api/config/locations`);
                if (res.ok) {
                    const data = await res.json();
                    setDistricts(data.districts || []);
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

    return { districts, states, loading };
}
