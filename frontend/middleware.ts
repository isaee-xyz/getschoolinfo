import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security Update: Force Deploy v2

// 1. Scraper User-Agent Blocklist
// We block strictly known automated tools that don't respect UX or potential DOS vectors
const BAD_BOT_AGENTS = [
    'python-requests',
    'wget',
    'scrapy',
    'aiohttp',
    'httpx',
    'libwww-perl',
    'axios',
    'puppeteer-extra',
];

// 2. Simple In-Memory Rate Limiter Map (For demonstration/simple usage)
// Note: In production middleware (Edge), Map is not shared across all instances universally,
// but it works well enough for single-instance or basic protection.
// ideally, use Redis (e.g., Upstash) for proper distributed rate limiting.
const ipRequestCounts = new Map<string, { count: number; windowStart: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute per IP

export function middleware(request: NextRequest) {
    const ua = request.headers.get('user-agent')?.toLowerCase() || '';
    const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

    // --- Phase 0: Super Admin / Authorized Scraper Bypass ---
    // If the request has the secret key, we bypass ALL bot checks and rate limits.
    const SCRAPER_KEY = 'infinity-learn-scraper-secret-2026'; // Simple hardcoded key for now
    const authHeader = request.headers.get('x-scraper-auth');

    if (authHeader === SCRAPER_KEY) {
        return NextResponse.next(); // 🟢 ACCESS GRANTED IMMEDIATELY
    }

    // --- Phase 1: Global Bot & Scraper Management ---

    // 1. Explicit Whitelist (Search Engines, AI, Social, Monitoring)
    // These bypass strict browser integrity checks but are still rate-limited reasonably.
    const ALLOWED_BOTS = [
        'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot', 'sogou', 'gptbot', // Search
        'applebot', 'facebot', 'facebookexternalhit', 'twitterbot', 'linkedinbot', 'slackbot', 'discordbot', // Social
        'whatsapp', 'telegrambot', 'pinterest', 'redditbot',
        'ccbot', 'claude-web', 'anthropic-ai', 'cohere-ai', 'omgilibot', 'perplexitybot', 'diffbot', // AI
        'uptime', 'monitor' // Monitoring
    ];

    const isWhitelisted = ALLOWED_BOTS.some(bot => ua.includes(bot));

    // 2. Explicit Blocklist (Known Scrapers / Abuse Tools)
    if (BAD_BOT_AGENTS.some(bot => ua.includes(bot))) {
        return new NextResponse('Access Denied: Automated access restricted.', { status: 403 });
    }

    // 3. Automated Browser / Headless Detection (For Non-Whitelisted Clients)
    if (!isWhitelisted) {
        // A. Headless Signals
        const hasAcceptLanguage = request.headers.has('accept-language');
        const isHeadless =
            ua.includes('headlesschrome') ||
            ua.includes('phantomjs') ||
            ua.includes('selenium') ||
            !hasAcceptLanguage; // Real browsers ALMOST always send this

        if (isHeadless) {
            return new NextResponse('Access Denied: Browser integrity check failed.', { status: 403 });
        }

        // B. API Direct Access Prevention (Referer Check)
        // If hitting /api/ endpoints, must come from our own frontend (or match allowed origins)
        if (request.nextUrl.pathname.startsWith('/api/')) {
            const referer = request.headers.get('referer') || '';
            const origin = request.headers.get('origin') || '';
            const host = request.headers.get('host') || '';

            const hasRefererOrOrigin = referer || origin;
            const isSameOrigin = (referer && referer.includes(host)) || (origin && origin.includes(host));

            if (!hasRefererOrOrigin || !isSameOrigin) {
                return new NextResponse('Access Denied: Direct API access restricted.', { status: 403 });
            }
        }
    }

    if (BAD_BOT_AGENTS.some(bot => ua.includes(bot))) {
        return new NextResponse('Access Denied: Automated access restricted.', { status: 403 });
    }

    // --- Check 2: Rate Limiting ---
    const now = Date.now();
    const currentLimit = ipRequestCounts.get(ip) || { count: 0, windowStart: now };

    if (now - currentLimit.windowStart > RATE_LIMIT_WINDOW_MS) {
        // Reset window
        currentLimit.count = 1;
        currentLimit.windowStart = now;
    } else {
        currentLimit.count++;
    }

    ipRequestCounts.set(ip, currentLimit);

    if (currentLimit.count > MAX_REQUESTS_PER_WINDOW) {
        // UX-Friendly Rate Limit:
        // Instead of hard 429, maybe just return 429 but with a Retry-After header
        // We avoid captchas as per user request.
        return new NextResponse('Too Many Requests. Please try again later.', {
            status: 429,
            headers: { 'Retry-After': '60' }
        });
    }

    // --- Check 3: Header Security ---
    const response = NextResponse.next();
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
    response.headers.set('X-Content-Type-Options', 'nosniff');

    return response;
}

export const config = {
    matcher: [
        // Apply key security to all routes except static assets
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
