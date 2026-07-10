/**
 * Cloudflare Workers R2 Image Upload API
 * 支持大写 IMAGES 与小写 images 双向自适应兼容
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  // 双向兼容大小写绑定名称，提升容错性
  const images = env.IMAGES || env.images;

  if (!images) {
    return new Response(JSON.stringify({ error: "未找到绑定的 R2 存储桶，请检查 Pages 绑定设置并确认已成功“重新部署”项目。" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "没有选择上传任何文件" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "只允许上传图片文件" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "图片文件大小不能超过 5MB" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const fileExt = file.name.split(".").pop() || "png";
    const randomFileName = `${crypto.randomUUID()}.${fileExt}`;

    const fileBuffer = await file.arrayBuffer();
    await images.put(randomFileName, fileBuffer, {
      httpMetadata: { contentType: file.type }
    });

    const publicUrlPrefix = "https://pub-8a91b6e9bc6246279bd3d001f8f137b8.r2.dev";
    const imageUrl = `${publicUrlPrefix}/${randomFileName}`;

    return new Response(JSON.stringify({ url: imageUrl }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
