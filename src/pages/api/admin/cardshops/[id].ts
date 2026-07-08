import type { APIRoute } from 'astro';
import { updateCardShop, deleteCardShop } from '../../../../server/db';

export const PUT: APIRoute = async ({ request, params }) => {
  const id = params.id!;
  try {
    const body = await request.json();
    const { name, url, description, shopType, platforms, products, healthStatus } = body;

    const updated = updateCardShop(id, {
      name,
      url,
      description,
      shopType,
      platforms: Array.isArray(platforms) ? platforms : undefined,
      products: Array.isArray(products) ? products : undefined,
      healthStatus,
    });

    if (!updated) {
      return new Response(
        JSON.stringify({ success: false, message: '未找到该卡网' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: updated, message: '卡网更新成功' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: '更新失败: ' + (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = params.id!;
  const deleted = deleteCardShop(id);
  if (!deleted) {
    return new Response(
      JSON.stringify({ success: false, message: '未找到该卡网' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return new Response(
    JSON.stringify({ success: true, message: '卡网已删除' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
