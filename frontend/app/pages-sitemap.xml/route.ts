import { School } from '@/types';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(request: NextRequest) {
    // SECURITY: Handled by middleware (bots allowed, scrapers blocked)
    // const url = new URL(request.url);
    // const token = url.searchParams.get('token');
    // if (token !== 'preview') {
    //    return new Response('Not Found', { status: 404 });
    // }

    const baseUrl = 'https://getschoolsinfo.com';
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 1. Static Routes
    const staticRoutes = ['', '/search', '/compare', '/login'];
    staticRoutes.forEach(route => {
        xml += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
    });

    // 2. Board Pages
    const boards = ['cbse', 'icse', 'state-board', 'ib', 'cambridge'];
    boards.forEach(board => {
        xml += `
  <url>
    <loc>${baseUrl}/board/${board}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    // 3. District Landing Pages
    try {
        const res = await fetch(`${apiUrl}/config/locations`, {
            next: { revalidate: 3600 }
        });

        if (res.ok) {
            const data = await res.json();
            const districts = data.districts || [];
            const districtNames = districts.map((d: any) => typeof d === 'string' ? d : d.name).sort();

            districtNames.forEach((district: string) => {
                const districtSlug = district.toLowerCase().replace(/\s+/g, '-');
                xml += `
  <url>
    <loc>${baseUrl}/${districtSlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
            });
        }
    } catch (error) {
        console.error('Pages sitemap generation error:', error);
    }

    xml += `
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
