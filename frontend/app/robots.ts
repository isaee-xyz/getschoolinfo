import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://getschoolsinfo.com';

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
                userAgent: ['CCBot'],
                allow: '/' // Re-iterating allow for AI bots just to be safe/explicit
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
