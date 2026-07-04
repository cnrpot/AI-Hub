import type { APIRoute } from 'astro';
import { rejectReport } from '../../../../../server/db';

export const POST: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing report ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const report = rejectReport(id);
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
};
