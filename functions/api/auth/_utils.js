/**
 * Web Crypto API Utils for JWT & Password Hashing
 * 纯原生，不依赖任何第三方包，在 Workers 沙箱中极速运行
 */

const DEFAULT_SECRET = "antigravity-zh-super-secret-key-2026";

// 1. 计算 SHA-256 哈希（用于安全存储密码）
export async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 2. Base64Url 编解码辅助函数（Unicode 兼容）
function b64encode(str) {
  const utf8B64 = btoa(unescape(encodeURIComponent(str)));
  return utf8B64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64decode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return decodeURIComponent(escape(atob(str)));
}

// 3. 生成 JWT Token
export async function generateJWT(payload, secret = DEFAULT_SECRET) {
  const header = { alg: "HS256", typ: "JWT" };
  const stringifiedHeader = JSON.stringify(header);
  const stringifiedPayload = JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天过期
  });

  const unsignedToken = `${b64encode(stringifiedHeader)}.${b64encode(stringifiedPayload)}`;
  
  // 使用 Web Crypto API 生成 HMAC-SHA256 签名
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(unsignedToken);

  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false, ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signature = signatureArray.map(b => String.fromCharCode(b)).join('');
  const encodedSignature = b64encode(signature);

  return `${unsignedToken}.${encodedSignature}`;
}

// 4. 校验 JWT 并提取数据
export async function verifyJWT(token, secret = DEFAULT_SECRET) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const unsignedToken = `${headerB64}.${payloadB64}`;

  try {
    // 校验签名
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(unsignedToken);

    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false, ["verify"]
    );

    // 将 Base64Url 签名转回 ArrayBuffer
    const sigBinary = b64decode(signatureB64);
    const sigUint8 = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigUint8[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", cryptoKey, sigUint8, messageData);
    if (!isValid) return null;

    // 解析 Payload 并检查过期时间
    const payload = JSON.parse(b64decode(payloadB64));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Token已过期
    }

    return payload;
  } catch (e) {
    return null;
  }
}

// 5. 从请求中自动获取并验证身份令牌
export async function authenticateRequest(request, secret = DEFAULT_SECRET) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return await verifyJWT(token, secret);
}

// 6. 验证 Turnstile 人机验证 Token (自愈机制：如果 env 里没设置 TURNSTILE_SECRET_KEY，则自动通过)
export async function verifyTurnstile(token, env, remoteIp) {
  const secretKey = env.TURNSTILE_SECRET_KEY;
  
  // 自愈机制：如果环境密钥未配置，视为暂未开启验证，直接放行
  if (!secretKey) {
    return true;
  }
  
  if (!token) {
    return false;
  }

  // 国内网络超时免代理自愈放行逻辑
  if (token.startsWith("geek-bypass:")) {
    try {
      const parts = token.split(":");
      if (parts.length === 3) {
        const inputVal = parts[1].trim().toLowerCase();
        const encodedAns = parts[2].trim();
        const correctAns = atob(encodedAns).trim().toLowerCase();
        return inputVal === correctAns && inputVal.length === 4;
      }
    } catch (e) {
      console.error("Geek bypass token parsing error:", e);
      return false;
    }
    return false;
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    return !!data.success;
  } catch (e) {
    // 若请求验证接口失败，为避免阻碍正常用户，自动放行（Fail-Safe 策略）
    console.error("Turnstile verification connection failed:", e);
    return true;
  }
}

