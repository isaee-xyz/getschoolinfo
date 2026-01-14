import { MetadataRoute } from 'next';
import { School } from '@/types';

// Revalidate sitemap every hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://getschoolsinfo.com';
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    // Static routes
    const routes = [
        '',
        '/search',
        '/compare',
        '/login',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    try {
        // Fetch all schools for sitemap
        // Assuming /api/schools returns a list. If paginated, we might need a specific sitemap endpoint or fetch large limit
        const res = await fetch(`${apiUrl}/schools?limit=10000`, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            console.error('Failed to fetch schools for sitemap');
            return routes;
        }

        const schools: School[] = await res.json();

        // 1. Dynamic District (City) Pages
        const distinctDistricts = Array.from(new Set(schools.map(s => s.district)));
        const districtRoutes = distinctDistricts.map(district => ({
            url: `${baseUrl}/${district.toLowerCase().replace(/\s+/g, '-')}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }));

        // 2. Dynamic School routes
        const schoolRoutes = schools.map((school) => {
            const citySlug = school.district.toLowerCase().replace(/\s+/g, '-');
            const schoolSlug = school.slug || `school-${school.id}`;

            return {
                url: `${baseUrl}/${citySlug}/${schoolSlug}`,
                lastModified: new Date(), // Ideally school.updated_at if available
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            };
        });

        return [...routes, ...districtRoutes, ...schoolRoutes];
    } catch (error) {
        console.error('Sitemap generation error:', error);
        return routes;
    }
}
