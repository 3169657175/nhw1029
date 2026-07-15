import { authenticateRequest } from "./auth/_utils.js";

// ==========================================
// 1. GET /api/announcement (获取最新发布的公告)
// ==========================================
export async function onRequestGet(context) {
  const { env } = context;
  const db = env.DB || env.db;

  if (!db) {
    return new Response(JSON.stringify({ error: "未绑定 D1 数据库" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 数据库表自愈
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at INTEGER NOT NULL
      )
    `).run();

    // 查出最新的一条公告
    const announcement = await db.prepare(
      "SELECT id, content, image_url, created_at FROM announcements ORDER BY id DESC LIMIT 1"
    ).first();

    return new Response(JSON.stringify(announcement || null), {
      headers: { 
        "Content-Type": "application/json;charset=utf-8",
        "Cache-Control": "no-cache"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// ==========================================
// 2. POST /api/announcement (发布新公告，限管理员)
// ==========================================
export async function onRequestPost(context) {
  const { request, env } = context;
  const db = env.DB || env.db;

  if (!db) {
    return new Response(JSON.stringify({ error: "未绑定 D1 数据库" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 1. 登录会话与管理员身份鉴权
  const user = await authenticateRequest(request);
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "操作被拒绝：您无权发布系统公告。" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { content, image_url } = await request.json();

    if (!content || !content.trim()) {
      return new Response(JSON.stringify({ error: "公告内容不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. 插入公告
    await db.prepare("INSERT INTO announcements (content, image_url, created_at) VALUES (?, ?, ?)")
      .bind(content.trim(), image_url ? image_url.trim() : null, Date.now())
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
