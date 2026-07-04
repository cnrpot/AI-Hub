import type { APIRoute } from 'astro';
import { addReport } from '../../server/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, url, description, models, contact } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return json(
        { success: false, message: '站名不能为空' },
        400,
      );
    }

    if (!url || typeof url !== 'string' || !url.trim()) {
      return json(
        { success: false, message: '官网 URL 不能为空' },
        400,
      );
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return json(
        { success: false, message: '简介不能为空' },
        400,
      );
    }

    // Validate and normalize models (accept string or array)
    let modelsArray: string[];
    if (Array.isArray(models)) {
      modelsArray = models.filter((m: unknown) => typeof m === 'string' && m.trim());
      if (modelsArray.length === 0) {
        return json({ success: false, message: '支持的模型不能为空' }, 400);
      }
      modelsArray = modelsArray.map((m: string) => m.trim());
    } else if (typeof models === 'string' && models.trim()) {
      modelsArray = models.split(',').map((m: string) => m.trim()).filter(Boolean);
      if (modelsArray.length === 0) {
        return json({ success: false, message: '支持的模型不能为空' }, 400);
      }
    } else {
      return json({ success: false, message: '支持的模型不能为空' }, 400);
    }

    // Validate URL format
    try {
      new URL(url.trim());
    } catch {
      return json(
        { success: false, message: '官网 URL 格式不正确' },
        400,
      );
    }

    await addReport({
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
      models: modelsArray,
      contact: typeof contact === 'string' && contact.trim() ? contact.trim() : undefined,
    });

    return json(
      { success: true, message: '上报成功，等待管理员审核' },
      200,
    );
  } catch {
    return json(
      { success: false, message: '服务器内部错误，请稍后重试' },
      500,
    );
  }
};

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
