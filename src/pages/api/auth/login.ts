import type { APIRoute } from 'astro';
import { createSession } from '../../../server/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const password = body?.password;

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: '请输入密码' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const success = createSession(cookies, password);
    if (success) {
      return new Response(
        JSON.stringify({ success: true, message: '登录成功' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ success: false, message: '密码错误' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: '服务器配置错误，请检查环境变量' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
