import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(targetUrl, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'AI-Hub-HealthCheck/1.0',
      },
    });
    clearTimeout(timeout);

    const responseTime = Date.now() - start;
    const ok = res.ok || res.status === 301 || res.status === 302 || res.status === 405;

    return new Response(
      JSON.stringify({
        ok,
        status: res.status,
        responseTime,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    const responseTime = Date.now() - start;
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : 'Request failed',
        responseTime,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
