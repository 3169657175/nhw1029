export async function onRequestGet(context) {
  const { env } = context;
  
  // 提取所有的环境变量 Key，并过滤掉敏感的密钥前缀以保安全
  const keys = Object.keys(env).map(k => {
    if (k.toLowerCase().includes('secret') || k.toLowerCase().includes('key')) {
      return `${k} (masked)`;
    }
    return k;
  });

  const aiType = typeof env.AI;
  const aiKeys = env.AI ? Object.getOwnPropertyNames(Object.getPrototypeOf(env.AI)) : [];

  return new Response(JSON.stringify({
    allKeys: keys,
    aiType: aiType,
    aiPrototypeKeys: aiKeys,
    hasAI: !!env.AI
  }), {
    headers: { 
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store" 
    }
  });
}
