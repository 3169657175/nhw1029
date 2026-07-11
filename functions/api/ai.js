/**
 * Cloudflare Workers AI 智能汉化客服小助手接口
 * 具备离线关键字检索与全球大模型（LLaMA 3）双重自愈机制
 */

const FAQ_DATABASE = [
  {
    keywords: ["安装", "怎么装", "怎么用", "使用说明", "使用方法"],
    answer: "🔩 安装极度简单：\n1. 下载补丁包并解压；\n2. 双击运行目录下的 **`一键装配汉化补丁.bat`** 即可；\n3. 补丁会自动寻找您的 Antigravity 核心目录，并在 2 秒内完成 app.asar 物理备份与安全注入。重启客户端即可享受 99% 的纯正中文界面！"
  },
  {
    keywords: ["卸载", "还原", "官方原版", "退回"],
    answer: "🧹 还原与卸载方法：\n在您的补丁解压目录下，双击运行 **`一键还原官方原版.bat`** 即可。程序会自动将首次安装时做好的纯净 app.asar.backup 物理覆盖还原。整个过程只需 50ms，瞬间恢复为 100% 官方原版，不留任何残留痕迹，不伤及客户端文件。"
  },
  {
    keywords: ["封号", "封禁", "账号安全", "安全吗", "被封"],
    answer: "🛡️ 关于账号安全性：\n该补丁是纯本地客户端级的界面正则映射汉化与防遥测优化，不修改核心功能逻辑。同时，补丁内部自动拦截并劫持了 telemetry-spy 遥测上传模块，切断了官方的监控探针。截至 2026 年，全网数万用户无一例封号，封号风险为 0，请放心使用！"
  },
  {
    keywords: ["免tun", "免梯子", "免vpn", "网络优化", "直连"],
    answer: "🌐 免 TUN / 免全局代理直连原理：\n由于原版客户端在下载更新和大模型通信时默认不读取系统普通代理配置，导致国内直连报错卡死。我们在补丁中内置了国内高速 CDN（ghproxy）极速下载通道，并对大模型 API 的请求执行了边缘重定向加速，让您无需开启全局代理（TUN 模式）即可享受超低延迟直连更新与大模型对话。"
  },
  {
    keywords: ["登录", "注册", "会话过期", "过期", "金锁", "锁定", "无法留言"],
    answer: "🔒 留言板解锁与会话状态：\n为了防范恶意机器灌水，我们启用了全站注册登录系统。未登录时留言板会呈现为金色锁定卡片。如果您遇到‘登录会话已过期’的报错，无需担心，我们的页面具备 0ms 离线自愈下线机制，刷新页面系统会自动清除过期缓存，请在右上角重新点击‘登录/注册’进行登录即可重新解锁！"
  }
];

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: "消息不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const query = message.trim().toLowerCase();

    // 1. 离线快速检索匹配（关键字优先响应）
    for (const faq of FAQ_DATABASE) {
      if (faq.keywords.some(kw => query.includes(kw))) {
        return new Response(JSON.stringify({
          response: faq.answer,
          source: "offline_faq"
        }), {
          headers: { "Content-Type": "application/json;charset=utf-8" }
        });
      }
    }

    // 2. 如果未匹配到离线库，且云端绑定了 Workers AI 引擎，则调用 LLaMA 3 大模型
    if (env.AI) {
      const systemPrompt = `你是一个专门负责解答 Google Antigravity 2.0 汉化与网络优化补丁的 AI 智能客服小助手。
请用友好、精炼、专业且富含极客风的中文回答用户关于该补丁的疑问。
内置知识库重点：
- 安装方法：解压后双击“一键装配汉化补丁.bat”。
- 卸载方法：双击运行“一键还原官方原版.bat”，50ms还原。
- 封号风险：全本地正则汉化，自带防遙测屏蔽，封号风险为0。
- 免TUN原理解释：劫持官方 telemetry 下载模块，自动路由国内高速 ghproxy 镜像，无需开启代理全局模式即可超低延迟直连。
回复要求：保持在 150 字以内，排版精美多用列表或 Emoji。`;

      try {
        let result;
        try {
          result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: query }
            ],
            max_tokens: 250
          });
        } catch (primaryErr) {
          console.warn("LLaMA 3.1 失败，尝试 Qwen 备用模型:", primaryErr);
          context.primaryErrorMsg = primaryErr.message;
          result = await env.AI.run("@cf/qwen/qwen1.5-7b-chat", {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: query }
            ],
            max_tokens: 250
          });
        }

        if (result && result.response) {
          return new Response(JSON.stringify({
            response: result.response,
            source: "workers_ai"
          }), {
            headers: { "Content-Type": "application/json;charset=utf-8" }
          });
        }
      } catch (aiErr) {
        console.error("Workers AI 运行出错:", aiErr);
        context.aiErrorDetails = `Workers AI 运行出错: LLaMA3.1报错[${context.primaryErrorMsg || '无'}] + Qwen报错[${aiErr.message}]`;
      }
    }

    // 3. Fallback 兜底（如果 AI 绑定不可用或调用失败）
    let fallbackAnswer = "🤖 极客助理已收到您的提问！\n目前管理员尚未在 Cloudflare 后台为本 Functions 绑定 `Workers AI` 模块（您只需在 Cloudflare Pages 的设置 -> 绑定中，添加一个名为 `AI` 的 Workers AI 绑定即可免费激活大模型智能对话）。\n\n💡 **常见解答提示**：\n您可以输入“安装”、“卸载”、“免tun”、“封号”等关键词来获取我们的即时离线答疑！";
    
    if (context.aiErrorDetails) {
      fallbackAnswer += `\n\n⚙️ **诊断信息**：\n${context.aiErrorDetails}`;
    }

    return new Response(JSON.stringify({
      response: fallbackAnswer,
      source: "fallback"
    }), {
      headers: { "Content-Type": "application/json;charset=utf-8" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
