import type { APIRoute } from 'astro';
import { getAllCardShops, addCardShop } from '../../../server/db';

export const GET: APIRoute = async () => {
  const shops = getAllCardShops();
  return new Response(
    JSON.stringify({ success: true, data: shops }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, url, description, shopType, platforms, products, healthStatus } = body;

    if (!name || !url) {
      return new Response(
        JSON.stringify({ success: false, message: '缺少必填字段（名称、URL）' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const created = addCardShop({
      name,
      url,
      description: description || '',
      shopType: shopType || 'other',
      platforms: Array.isArray(platforms) ? platforms : [],
      products: Array.isArray(products) ? products : [],
      healthStatus: healthStatus || 'unknown',
    });

    return new Response(
      JSON.stringify({ success: true, data: created, message: '卡网添加成功' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: '添加失败: ' + (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
