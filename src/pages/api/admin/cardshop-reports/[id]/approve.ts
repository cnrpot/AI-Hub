import type { APIRoute } from 'astro';
import { approveCardShopReport } from '../../../../server/db';

export const POST: APIRoute = async ({ params }) => {
  const id = params.id!;
  const report = approveCardShopReport(id);
  if (!report) {
    return new Response(JSON.stringify({ error: 'Report not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ success: true, report }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
