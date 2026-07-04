import type { APIRoute } from 'astro';
import { getStationBySlug, updateStation, deleteStation } from '../../../../server/db';
import type { Station } from '../../../../types/station';

export const GET: APIRoute = async ({ params }) => {
  const station = getStationBySlug(params.slug!);
  if (!station) {
    return new Response(
      JSON.stringify({ success: false, message: '中转站不存在' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return new Response(
    JSON.stringify({ success: true, data: station }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    const updates: Partial<Station> = {};

    if (body.name) updates.name = body.name;
    if (body.url) updates.url = body.url;
    if (body.description) updates.description = body.description;
    if (body.models) updates.models = Array.isArray(body.models) ? body.models : body.models.split(',').map((m: string) => m.trim());
    if (body.pricing) updates.pricing = typeof body.pricing === 'string' ? JSON.parse(body.pricing) : body.pricing;
    if (body.features) updates.features = Array.isArray(body.features) ? body.features : body.features.split(',').map((f: string) => f.trim());
    if (body.rating !== undefined) updates.rating = Number(body.rating);
    if (body.paymentMethods) updates.paymentMethods = Array.isArray(body.paymentMethods) ? body.paymentMethods : body.paymentMethods.split(',').map((p: string) => p.trim());
    if (body.docUrl !== undefined) updates.docUrl = body.docUrl || undefined;
    updates.updatedAt = new Date().toISOString().split('T')[0];

    const updated = updateStation(params.slug!, updates);
    if (!updated) {
      return new Response(
        JSON.stringify({ success: false, message: '中转站不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ success: true, data: updated, message: '更新成功' }),
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
  const success = deleteStation(params.slug!);
  if (!success) {
    return new Response(
      JSON.stringify({ success: false, message: '中转站不存在' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return new Response(
    JSON.stringify({ success: true, message: '已删除' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
