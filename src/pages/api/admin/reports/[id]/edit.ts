import type { APIRoute } from 'astro';
import { updateReport } from '../../../../../server/db';

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing report ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const updates: { name?: string; url?: string; description?: string; models?: string[] } = {};

    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.url === 'string' && body.url.trim()) updates.url = body.url.trim();
    if (typeof body.description === 'string' && body.description.trim()) updates.description = body.description.trim();
    if (Array.isArray(body.models)) {
      updates.models = body.models.filter((m: unknown) => typeof m === 'string' && m.trim()).map((m: string) => m.trim());
    } else if (typeof body.models === 'string' && body.models.trim()) {
      updates.models = body.models.split(',').map((m: string) => m.trim()).filter(Boolean);
    }

    const report = updateReport(id, updates);
    if (!report) {
      return new Response(JSON.stringify({ error: 'Report not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
