# 📘 Working Guide & Best Practices

This document records the specific technical decisions, "gotchas", and standard patterns established for **GetSchoolInfo**. Consult this before adding new features.

---

## 1. URL & Routing Logic

### Comparison URLs (`/compare`)
*   **Format**: Use indexed query parameters: `?id_1=A&id_2=B&id_3=C`.
*   **Sorting Rule (Canonicalization)**:
    *   **Always sort IDs** before generating the URL.
    *   Example: Comparing ID `99` and `10` must generate `?id_1=10&id_2=99`.
    *   **Why**: This ensures consistent URLs for caching and SEO, regardless of the order the user clicked.
*   **UI Logic**: The "Compare School" page columns must match the sorted order. Always `sort()` the displayed schools by ID before rendering.

### Links
*   Always use `id` (which maps to UDISE Code) as the primary key.
*   Slug format: `/[district]/[school-slug]`.

---

## 2. Data Cleaning & formatting

The backend data contains legacy formatting that **must be cleaned on the Frontend**:

*   **HTML Entities**: School names and addresses often contain `&amp;`, `&quot;`, etc.
    *   *Solution*: Always run strings through a decoder functionality before display.
*   **Prefixes "N-"**: Many fields like Board or School Type come with numeric prefixes (e.g., `2-State Board`, `3-Co-educational`).
    *   *Solution*: Regex strip `^[0-9]+-` before displaying.
    *   *Example*: `school.schTypeDesc.replace(/^[0-9]+-/, '')`.
*   **Null/Zero Handling**:
    *   **Stats**: Hide "Students", "Teachers", "Rooms" blocks if the value is `0`. Do not show "0 Students".
    *   **Years**: "Est. 0" or "Since 0" should be hidden.
    *   **Badges**: Conditionals should check ` > 0` or `!== 'NA'`.

---

## 3. Performance & Caching

### API & List Rendering
*   **Pagination**: Use "Limit + Load More" (Client-Side) rather than massive initial payloads.
    *   Current Pattern: Load 10 items, "Load More" appends 10.
*   **Comparison Fetching**: fetch individual schools via `Promise.all` rather than bulk logic if APIs are limited.

### CDN & Caching (Cloudflare)
*   **Mechanism**: The application controls caching via `Cache-Control` headers in `next.config.ts`.
*   **Policy**:
    *   `/` (Home): 1 Hour (`stale-while-revalidate`).
    *   `/school/*`: 1 Hour.
    *   `/how-it-works`, Static Pages: 24 Hours.
    *   Images/Fonts: 1 Year (`immutable`).
*   **Cloudflare Config**: Set Browser Cache TTL to **"Respect Existing Headers"**.

---

## 4. UI/UX Standards

*   **Comparisons**: Max 3 schools.
*   **Empty States**: Always provide a "Clear" button for comparisons that resets URL *and* State.
*   **Loading**: Use Skeleton loaders or simple spinners; avoid layout shift.

---

## 5. Agent Optimization (AEO)

*   **Page**: `/for-ai-assistants` describes the schema for AI bots.
*   **Robots.txt**: Explicitly allows `GPTBot` and `CCBot` (common AI crawlers).
*   **Schema**: Maintain valid `JSON-LD` (EducationalOrganization) on all detail pages.

---

*Last Updated: Jan 2026*
