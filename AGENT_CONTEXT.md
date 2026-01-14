# AGENT CONTEXT & MEMORY
**Last Updated: Jan 14, 2026**

This file serves as a quick-reference memory for the AI Agent working on `getschoolinfo`.

## 🚨 Critical Configuration (DO NOT HALLUCINATE)
*   **Production Domain**: `https://getschoolsinfo.com`
*   **Deployment**: DigitalOcean Droplet (`64.227.169.147`) via Docker Compose.
*   **SSL**: Handled by **Caddy** (Reverse Proxy) with Let's Encrypt.
*   **Frontend Port**: Internal `3002` (Exposed via Caddy on 443).
*   **Backend Port**: Internal `4000` (Exposed via Caddy for `/api/*` on 443).
*   **SEO**: `sitemap.xml` and `robots.txt` are **auto-generated**.

## 🏗️ Architecture constraints
1.  **Dual-Table Strategy**:
    *   `schools`: Normalized, complete data (Source of Truth).
    *   `school_stats`: Flattened metadata AND **Pre-computed Metrics** (Source of Search/Speed).
    *   **Rule**: API `GET /api/schools` MUST query `school_stats`. `GET /api/school/:slug` MUST JOIN both.
    *   **Staging**: **REMOVED**. We currently operate single-environment Production logic.
2.  **Middleware Security**:
    *   `frontend/middleware.ts` BLOCKS generic user agents (curl, python-requests).
    *   **Sitemap Protection**: `/sitemap.xml` is RESTRICTED to known Search Engines (Google, Bing) to prevent scraping.
    *   **Testing Rule**: Always use `curl -A "Mozilla/5.0" ...` to test routes.

## ✅ Recent Progress (Jan 2026)
*   **Deployment**:
    *   Fully dockerized (Frontend, Backend, Postgres, Caddy).
    *   Implemented "Local Build" strategy to bypass low-RAM server constraints.
    *   Configured Caddy for auto-HTTPS.
*   **Database**: 
    *   Seeded 2300+ Schools.
    *   Removed legacy "staging" table switches.
*   **Frontend**: 
    *   Fixed `NEXT_PUBLIC_API_URL` injection during Docker build.
    *   Implemented Dynamic Sitemap with **District Categories** and **School Pages**.
    *   Added Microsoft Clarity Analytics.

## 📝 TODO / Next Steps
*   Monitor SEO indexing.
*   Add more cities/districts.

