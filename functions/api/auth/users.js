import { authenticateRequest } from "./_utils.js";

// ==========================================
// GET /api/auth/users (管理员用户管理及反馈追踪，限管理员)
// ==========================================
export async function onRequestGet(context) {
  const { request, env } = context;
  const db = env.DB || env.db;

  if (!db) {
    return new Response(JSON.stringify({ error: "未绑定 D1 数据库" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 1. 鉴权，仅管理员 niu1029 可执行用户检索
  const user = await authenticateRequest(request);
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "操作被拒绝：仅限系统管理员访问用户中心。" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const url = new URL(request.url);
    const targetUser = url.searchParams.get("username");

    // 场景 A：如果指定了用户名，则返回该用户发表的所有具体反馈列表
    if (targetUser) {
      const { results: userFeedbacks } = await db.prepare(
        "SELECT id, content, image_url, created_at FROM feedbacks WHERE username = ? ORDER BY id DESC"
      ).bind(targetUser).all();

      return new Response(JSON.stringify(userFeedbacks || []), {
        headers: { "Content-Type": "application/json;charset=utf-8" }
      });
    }

    // 场景 B：获取所有用户统计列表，联表查出反馈数量
    const { results: usersList } = await db.prepare(`
      SELECT 
        u.username, 
        u.role, 
        u.created_at,
        (SELECT COUNT(*) FROM feedbacks f WHERE f.username = u.username) as feedback_count
      FROM users u
      ORDER BY u.created_at DESC
    `).all();

    return new Response(JSON.stringify(usersList || []), {
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
