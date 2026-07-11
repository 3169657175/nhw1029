import { hashPassword, generateJWT } from "./_utils.js";

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
    const { username, password } = await request.json();

    if (!username || !password || !username.trim() || !password.trim()) {
      return new Response(JSON.stringify({ error: "账号和密码不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // ==========================================
    // 数据库自愈建用户表
    // ==========================================
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at INTEGER NOT NULL
      )
    `).run();

    // ==========================================
    // 特殊自愈：如果管理员 niu1029 登录且密码正确，但表中没有该用户，自动帮其注册
    // ==========================================
    if (cleanUsername === "niu1029" && cleanPassword === "123456") {
      const adminExists = await db.prepare("SELECT username FROM users WHERE username = 'niu1029'").first();
      if (!adminExists) {
        const passHash = await hashPassword("123456");
        await db.prepare("INSERT INTO users (username, password_hash, role, created_at) VALUES ('niu1029', ?, 'admin', ?)")
          .bind(passHash, Date.now())
          .run();
        console.log("D1 Auto-heal: administrator niu1029 auto-registered successfully.");
      }
    }

    // 查询用户
    const user = await db.prepare("SELECT username, password_hash, role FROM users WHERE username = ?")
      .bind(cleanUsername)
      .first();

    if (!user) {
      return new Response(JSON.stringify({ error: "账号或密码错误" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 验证密码哈希
    const inputHash = await hashPassword(cleanPassword);
    if (inputHash !== user.password_hash) {
      return new Response(JSON.stringify({ error: "账号或密码错误" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 登录成功，生成下发 JWT 令牌
    const token = await generateJWT({
      username: user.username,
      role: user.role
    });

    return new Response(JSON.stringify({
      success: true,
      token,
      username: user.username,
      role: user.role
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
