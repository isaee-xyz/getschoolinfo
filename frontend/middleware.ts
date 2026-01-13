import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

    // --- Check 1: Bot Blocking ---
    // Allow legitimate bots (Google, GPT, etc.) implicitly by not listing them
    // Block known script libraries
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
