import { hashPassword, verifyTurnstile } from "./_utils.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const db = env.DB || env.db;

  if (!db) {
    return new Response(JSON.stringify({ error: "未绑定 D1 数据库" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { username, password, turnstileToken } = await request.json();

    // Turnstile 人机安全校验
    const isHuman = await verifyTurnstile(turnstileToken, env, request.headers.get("CF-Connecting-IP"));
    if (!isHuman) {
      return new Response(JSON.stringify({ error: "安全验证失败，请刷新页面重试" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 格式校验
    if (!username || !password || !username.trim() || !password.trim()) {
      return new Response(JSON.stringify({ error: "账号和密码不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return new Response(JSON.stringify({ error: "账号长度必须在 3 ~ 20 字之间" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (cleanPassword.length < 6) {
      return new Response(JSON.stringify({ error: "密码长度不能少于 6 位" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 防冒充与抢注管理员校验
    if (cleanUsername === "niu1029" && cleanPassword !== "123456") {
      return new Response(JSON.stringify({ error: "管理员账号 niu1029 的密码不匹配，无法注册。" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // ==========================================
    // D1 数据库自愈机制：自动建立 users 用户表
    // ==========================================
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at INTEGER NOT NULL
      )
    `).run();

    // 检查是否重名
    const existingUser = await db.prepare("SELECT username FROM users WHERE username = ?").bind(cleanUsername).first();
    if (existingUser) {
      return new Response(JSON.stringify({ error: "该账号已被注册，请尝试直接登录" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 计算哈希密码
    const passHash = await hashPassword(cleanPassword);
    const role = (cleanUsername === "niu1029") ? "admin" : "user";

    // 写入数据库
    await db.prepare("INSERT INTO users (username, password_hash, role, created_at) VALUES (?, ?, ?, ?)")
      .bind(cleanUsername, passHash, role, Date.now())
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
