import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './server/auth';

export const onRequest = defineMiddleware((context, next) => {
  const { url, cookies } = context;
  const pathname = url.pathname;

  if (pathname.startsWith('/api/auth/')) {
    return next();
  }

  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isLoginPage = pathname === '/admin/login';
  if (isAdminPage && !isLoginPage) {
    if (!isAuthenticated(cookies)) {
      return context.redirect('/admin/login');
    }
  }

  if (pathname.startsWith('/api/admin/')) {
    if (!isAuthenticated(cookies)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return next();
});
