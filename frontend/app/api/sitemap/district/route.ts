import { NextRequest } from 'next/server';
import { School } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const districtSlug = searchParams.get('district'); // e.g., 'buldana' from rewrite

    // SECURITY: Only allow access with a secret token for now
    const token = searchParams.get('token');
    if (token !== 'preview') {
        return new Response('Not Found', { status: 404 });
    }

    const baseUrl = 'https://getschoolsinfo.com';
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    if (districtSlug) {
        try {
            // Need a way to match slug back to district Name for query if API requires precise Name
            // For now, let's fetch all and filter, or assume API supports case-insensitive search or match
            // Optimization: Fetch only schools for this district to reduce payload
            // Using a safe upper limit (e.g. 2000) for schools per district
            const res = await fetch(`${apiUrl}/schools?district=${districtSlug}&limit=5000`, {
                next: { revalidate: 3600 }
            });

            if (res.ok) {
                const schools: School[] = await res.json();

                // The API might return schools even if slug mismatch if fuzzy match, 
                // but usually it's fine. We filter just in case or trust the API.
                // Since we passed 'district' which maps to name, and we have slug, 
                // we rely on backend handling 'district' query effectively. 
                // If backend requires proper name (not slug), we might get empty results 
                // if we pass slug 'buldana-city' but db has 'Buldana City'.
                // However, the Master Index generated slugs from DB names, so we just need to match back.
                // Backend 'schools' endpoint checks (district = $1 OR district ILIKE $1) so it might work if slug is close.
                // Ideally, we'd pass the exact Name. But URL only has slug.
                // Workaround: We fetch all for that district if we can transform slug->name, 
                // BUT we don't know the name.
                // IF backend supports slug filtering, great. 
                // IF NOT, we might need to rely on the fact that existing logic used slug-ified names.
                // Let's check backend behavior: 
                // Backend: district = $1 OR district ILIKE $1. 'buldana' ~ 'Buldana'. 
                // 'south-delhi' ~ 'South Delhi'? No, 'south-delhi' ILIKE 'South Delhi' is false.
                // PROBLEM: We cannot easily query by slug if we only have slug and DB has "South Delhi".
                // FIX: We must fetch all generic locations first to find the Name matching the slug? No that's slow per request.
                // BETTER FIX: Fetch ALL schools for sitemap generation? No, that's what we are avoiding.
                // ALTERNATIVE: Backend supports ILIKE %search%.
                // TRADEOFF: For now, I will keep the fetch-all-for-district strategy if feasible, 
                // OR revert to fetching a larger set if we believe efficiency is key.
                // BUT wait, we just agreed to fetch filtered.
                // Let's try to map slug -> spaces. 'south-delhi' -> 'south delhi'.

                const searchParam = districtSlug.replace(/-/g, ' ');
                console.log(`DEBUG Sitemap: generate for slug=${districtSlug}, search=${searchParam}`);

                // Re-fetch with approximated name
                const schoolsUrl = `${apiUrl}/schools?district=${searchParam}&limit=5000`;
                console.log(`DEBUG Sitemap: fetching ${schoolsUrl}`);

                const schoolsRes = await fetch(schoolsUrl, { next: { revalidate: 3600 } });
                console.log(`DEBUG Sitemap: status=${schoolsRes.status}`);

                const districtSchools: School[] = schoolsRes.ok ? await schoolsRes.json() : [];
                console.log(`DEBUG Sitemap: found ${districtSchools.length} schools`);

                districtSchools.forEach(school => {
                    const citySlug = school.district.toLowerCase().replace(/\s+/g, '-');
                    const schoolSlug = school.slug || `school-${school.id}`;
                    xml += `
  <url>
    <loc>${baseUrl}/${citySlug}/${schoolSlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
                });
            }
        } catch (error) {
            console.error(`Error generating sitemap for district ${districtSlug}:`, error);
        }
    }

    xml += `
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
