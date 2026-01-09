# AGENT CONTEXT & MEMORY
**Last Updated: Jan 2026**

This file serves as a quick-reference memory for the AI Agent working on `getschoolinfo`.

## 🚨 Critical Configuration (DO NOT HALLUCINATE)
*   **Frontend Port**: `3002` (NOT 3000).
*   **Backend Port**: `4000`.
*   **Database Host**: `localhost` (Postgres).
*   **Database User**: `infinitylearn` (Homebrew default).
*   **Database Name**: `school_db_dev`.

## 🏗️ Architecture constraints
1.  **Dual-Table Strategy**:
    *   `schools` / `schools_staging`: Normalized, complete data (Source of Truth).
    *   `school_stats` / `school_stats_staging`: Flattened metadata AND **Pre-computed Metrics** (Source of Search/Speed).
    *   **Rule**: API `GET /api/schools` MUST query `school_stats`. `GET /api/school/:slug` MUST JOIN both.
    *   **Metrics**: Frontend should prioritize pre-computed metrics (e.g. `student_teacher_ratio`) from DB over finding raw numbers.
2.  **Middleware Security**:
    *   `frontend/middleware.ts` BLOCKS generic user agents (curl, python-requests).
    *   **Testing Rule**: Always use `curl -A "Mozilla/5.0" ...` to test routes.

## ✅ Recent Progress (Session Jan 8, 2026)
*   **Database**: Seeded 138 Schools for "Bathinda".
*   **Backend**: 
    *   Fixed connection logic to accept explicit env vars.
    *   Enriched `GET /api/schools` to return `badge_value_for_money` etc.
*   **Frontend**: 
    *   Fixed `NEXT_PUBLIC_API_URL` double slash bug.
    *   Fixed 500 Crash on School Detail (added checks for missing leadership data).
    *   Updated `SchoolCard` to display "Best Value" / "Academic Elite" badges.

## 📝 TODO / Next Steps
*   Deploy to Staging.
*   add more cities/districts beyond Bathinda.
