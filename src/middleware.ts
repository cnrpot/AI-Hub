import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './server/auth';

/**
 * Astro middleware — route protection for admin pages and API endpoints.
 *
 * Rules:
 *   1. /api/auth/*  — always allowed (login, logout endpoints)
 *   2. /admin/*     — redirect unauthenticated users to /admin/login
 *                     (except /admin/login itself)
 *   3. /api/admin/* — return 401 JSON for unauthenticated requests
 *   4. everything else passes through
 */
export const onRequest = defineMiddleware((context, next) => {
  const { url, cookies } = context;
  const pathname = url.pathname;

  // 1. Auth API endpoints (login / logout) — always public.
  if (pathname.startsWith('/api/auth/')) {
    return next();
  }

  // 2. Admin pages — redirect to login if not authenticated.
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isLoginPage = pathname === '/admin/login';
  if (isAdminPage && !isLoginPage) {
    if (!isAuthenticated(cookies)) {
      return context.redirect('/admin/login');
    }
  }

  // 3. Admin API endpoints — return 401 JSON if not authenticated.
  if (pathname.startsWith('/api/admin/')) {
    if (!isAuthenticated(cookies)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 4. Everything else — pass through.
  return next();
});
