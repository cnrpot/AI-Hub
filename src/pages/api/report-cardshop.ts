import type { APIRoute } from 'astro';
import { addCardShopReport } from '../../server/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, url, description, shopType, platforms, contact } = body;

    if (!name || !url) {
      return new Response(
        JSON.stringify({ success: false, message: '店名和网址不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try { new URL(url.trim()); } catch {
      return new Response(
        JSON.stringify({ success: false, message: '网址格式不正确' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const platformsArray = typeof platforms === 'string'
      ? platforms.split(',').map((p: string) => p.trim()).filter(Boolean)
      : Array.isArray(platforms) ? platforms : [];

    await addCardShopReport({
      name: name.trim(),
      url: url.trim(),
      description: description?.trim() || '',
      shopType: shopType || 'other',
      platforms: platformsArray,
      contact: contact?.trim() || undefined,
    });

    return new Response(
      JSON.stringify({ success: true, message: '上报成功，等待管理员审核' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: '服务器内部错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
