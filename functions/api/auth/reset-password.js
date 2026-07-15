import { authenticateRequest, hashPassword } from "./_utils.js";

// ==========================================
// POST /api/auth/reset-password (管理员强制重置用户密码)
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

  // 1. 登录与角色鉴权 (仅限 admin 管理员)
  const user = await authenticateRequest(request);
  if (!user || user.role !== "admin") {
    return new Response(JSON.stringify({ error: "操作被拒绝：仅管理员有权修改其他用户密码。" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { username, new_password } = await request.json();

    if (!username || !new_password || !username.trim() || !new_password.trim()) {
      return new Response(JSON.stringify({ error: "用户名与新密码不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const cleanUsername = username.trim();
    const cleanNewPassword = new_password.trim();

    if (cleanNewPassword.length < 6) {
      return new Response(JSON.stringify({ error: "新密码长度不能少于 6 位" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. 检查用户是否存在
    const targetUser = await db.prepare("SELECT username FROM users WHERE username = ?")
      .bind(cleanUsername)
      .first();

    if (!targetUser) {
      return new Response(JSON.stringify({ error: `用户 @${cleanUsername} 不存在` }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. 对新密码进行 SHA-256 哈希计算
    const newHash = await hashPassword(cleanNewPassword);

    // 4. 更新数据库
    await db.prepare("UPDATE users SET password_hash = ? WHERE username = ?")
      .bind(newHash, cleanUsername)
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
