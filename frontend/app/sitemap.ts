import { MetadataRoute } from 'next';
import { MOCK_SCHOOLS } from '@/constants';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://getschoolinfo.com';

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

    // Dynamic School routes
    const schoolRoutes = MOCK_SCHOOLS.map((school) => ({
        url: `${baseUrl}/school/${school.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...routes, ...schoolRoutes];
}
