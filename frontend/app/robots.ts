import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://getschoolsinfo.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/dashboard'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
