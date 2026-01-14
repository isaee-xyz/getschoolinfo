import { School } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
    const baseUrl = 'https://getschoolsinfo.com';
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/pages-sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;

    try {
        // Fetch district list from config endpoint (lighter than fetching all schools)
        const res = await fetch(`${apiUrl}/config/locations`, {
            next: { revalidate: 3600 }
        });

        if (res.ok) {
            const data = await res.json();
            const districts = data.districts || [];

            // Handle both structure formats if it returns { districts: string[] } or { districts: {name, state}[] }
            // API returns: { districts: { name: string, state: string }[], states: string[] }

            const districtNames = districts.map((d: any) => typeof d === 'string' ? d : d.name).sort();

            districtNames.forEach((district: string) => {
                const districtSlug = district.toLowerCase().replace(/\s+/g, '-');
                xml += `
  <sitemap>
    <loc>${baseUrl}/${districtSlug}-sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
            });
        }
    } catch (error) {
        console.error('Master sitemap index generation error:', error);
    }

    xml += `
</sitemapindex>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
