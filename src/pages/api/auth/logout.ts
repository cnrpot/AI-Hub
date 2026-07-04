import type { APIRoute } from 'astro';
import { clearSession } from '../../../server/auth';

export const POST: APIRoute = async ({ cookies }) => {
  clearSession(cookies);
  return new Response(
    JSON.stringify({ success: true, message: '已退出登录' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
