import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://getschoolinfo.com';

    return {
        rules: [
            {
                userAgent: ['Googlebot', 'Bingbot', 'GPTBot', 'ChatGPT-User'],
                allow: '/',
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/dashboard'],
            },
            // Explicitly disallow common scrapers if possible by UA, 
            // though middleware is better for aggressive blocking.
            {
                userAgent: ['CCBot', 'ChatGPT-User', 'GPTBot'],
                allow: '/' // Re-iterating allow for AI bots just to be safe/explicit
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
