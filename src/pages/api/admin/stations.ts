import type { APIRoute } from 'astro';
import { getAllStations, addStation } from '../../../server/db';
import type { Station } from '../../../types/station';

export const GET: APIRoute = async () => {
  const stations = getAllStations();
  return new Response(
    JSON.stringify({ success: true, data: stations }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, slug, url, description, models, pricing, features, rating, paymentMethods, docUrl } = body;

    if (!name || !slug || !url || !description || !models || !pricing || !features || !rating || !paymentMethods) {
      return new Response(
        JSON.stringify({ success: false, message: '缺少必填字段' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const station: Station = {
      name,
      slug,
      url,
      description,
      models: Array.isArray(models) ? models : models.split(',').map((m: string) => m.trim()),
      pricing: typeof pricing === 'string' ? JSON.parse(pricing) : pricing,
      features: Array.isArray(features) ? features : features.split(',').map((f: string) => f.trim()),
      rating: Number(rating),
      paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : paymentMethods.split(',').map((p: string) => p.trim()),
      docUrl: docUrl || undefined,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const created = addStation(station);
    return new Response(
      JSON.stringify({ success: true, data: created, message: '中转站添加成功' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: '添加失败: ' + (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
