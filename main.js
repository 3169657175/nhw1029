// ==========================================================================
// INTERACTIVE ENGINE: PREMIUM MINIMALIST AURORA 2.0 (殿堂级极光微光极简主义)
// 1. Canvas 3D 鼠标互动网格算法
// 2. 模拟物理装配终端交互
// 3. IDE Diff 选项卡切换引擎
// 4. FAQ 手风琴流畅折叠组件
// 5. 3D 视差透视轮播图与鼠标三维偏转追踪引擎 (Perspective Parallax Carousel)
// 6. 移动端导航栏折叠菜单逻辑 (Mobile Toggle)
// 7. 全站模态弹窗鉴权 (Global Auth System) 与 D1/R2 反馈/回复/管理员删除逻辑
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  safeInit(initGridBackground);
  safeInit(initTerminalSimulator);
  safeInit(initIDETabs);
  safeInit(initFAQAccordion);
  safeInit(initScreenshotSwitcher);
  safeInit(initMobileNavbar);
  safeInit(initGlobalAuth); // 启用全站身份验证引擎
  safeInit(initAIAssistant); // 启用 AI 客服助手系统
});

function safeInit(initFn) {
  try {
    initFn();
  } catch (e) {
    console.warn(`[Init] Skip component load: ${initFn.name}`, e);
  }
}

/**
 * 1. 深度 3D 鼠标扭曲网格背景
 */
function initGridBackground() {
  const canvas = document.getElementById('grid-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const gridSpacing = 45; 
  let mouse = { x: -1000, y: -1000, active: false };

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;

    const cols = Math.floor(width / gridSpacing) + 2;
    const rows = Math.floor(height / gridSpacing) + 2;

    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        let x = c * gridSpacing;
        let y = r * gridSpacing;

        if (mouse.active) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 200;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            x -= (dx / dist) * force * 16;
            y -= (dy / dist) * force * 16;
          }
        }

        if (r === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    for (let r = 0; r < rows; r++) {
      ctx.beginPath();
      for (let c = 0; c < cols; c++) {
        let x = c * gridSpacing;
        let y = r * gridSpacing;

        if (mouse.active) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 200;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            x -= (dx / dist) * force * 16;
            y -= (dy / dist) * force * 16;
          }
        }

        if (c === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    if (mouse.active) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 180);
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.03)');
      grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/**
 * 2. 模拟物理装配终端交互
 */
function initTerminalSimulator() {
  const runBtn = document.getElementById('run-injector-btn');
  const termLog = document.getElementById('terminal-log');
  
  if (!runBtn || !termLog) return;

  const logs = [
    { text: '$ node patch-injector.js --target="C:\\AppData\\antigravity"', delay: 300 },
    { text: '[*] 准备执行物理装配流程...', delay: 500 },
    { text: '[1/4] 正在检测本地 Antigravity 客户端核心... 成功', delay: 400 },
    { text: '      - 路径: AppData/Local/Programs/antigravity/resources/app.asar', delay: 200 },
    { text: '[2/4] 物理备份 app.asar ➡️ app.asar.backup... 完成 (100% 备份保障)', delay: 600 },
    { text: '[3/4] 物理解包 app.asar 存档并注入补丁代码...', delay: 700 },
    { text: '      - 注入 [汉化核心] ➡️ 99.2% 界面与正则映射覆盖成功', delay: 300 },
    { text: '      - 注入 [免 TUN 拦截器] ➡️ 自动劫持 telemetry-spy 模块', delay: 200 },
    { text: '      - 注入 [智能过滤器] ➡️ 100% 精确防侧边栏和下拉框干扰', delay: 300 },
    { text: '[4/4] 正在重新压缩并封包 app.asar 存档...', delay: 800 },
    { text: '[SUCCESS] 物理补丁已完美装配！重启软件生效。', delay: 400, color: '#10b981' }
  ];

  let isRunning = false;

  runBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;

    runBtn.disabled = true;
    runBtn.textContent = '装配中...';
    runBtn.style.opacity = '0.5';

    termLog.innerHTML = '';

    let currentIndex = 0;

    function printNextLog() {
      if (currentIndex >= logs.length) {
        isRunning = false;
        runBtn.disabled = false;
        runBtn.textContent = '重新注入补丁';
        runBtn.style.opacity = '1';
        return;
      }

      const log = logs[currentIndex];
      const p = document.createElement('p');
      p.className = 'term-text';
      p.textContent = log.text;
      if (log.color) {
        p.style.color = log.color;
        p.style.textShadow = `0 0 10px ${log.color}`;
      }

      termLog.appendChild(p);
      termLog.scrollTop = termLog.scrollHeight;

      currentIndex++;
      setTimeout(printNextLog, log.delay);
    }

    printNextLog();
  });
}

/**
 * 3. IDE Diff 选项卡切换引擎
 */
function initIDETabs() {
  const fileItems = document.querySelectorAll('.file-item');
  const editorPanes = document.querySelectorAll('.editor-pane');

  if (fileItems.length === 0 || editorPanes.length === 0) return;

  fileItems.forEach(item => {
    item.addEventListener('click', () => {
      fileItems.forEach(f => f.classList.remove('active'));
      editorPanes.forEach(pane => pane.classList.remove('active'));

      item.classList.add('active');
      const targetId = item.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/**
 * 4. FAQ 手风琴折叠组件
 */
function initFAQAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');
  if (triggers.length === 0) return;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.parentElement;
      const content = item.querySelector('.faq-content');
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.faq-content').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
}

/**
 * 5. 3D 视差透视轮播图与鼠标三维偏转追踪引擎 (Perspective Parallax Carousel)
 */
function initScreenshotSwitcher() {
  const wrapper = document.querySelector('.real-screenshot-wrapper');
  const dots = document.querySelectorAll('.sc-dot');
  const img = document.getElementById('real-screenshot-img');
  const label = document.getElementById('screenshot-label');
  const title = document.getElementById('screenshot-title-text');

  if (!wrapper || dots.length === 0 || !img) return;

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      if (dot.classList.contains('active')) return;

      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      const src = dot.getAttribute('data-src');
      const lbl = dot.getAttribute('data-label');
      const ttl = dot.getAttribute('data-title');

      img.style.opacity = '0.3';
      img.style.transform = 'scale(0.97) rotateY(-8deg)';
      
      setTimeout(() => {
        img.src = src;
        const restoreStyles = () => {
          img.style.opacity = '1';
          img.style.transform = 'scale(1) rotateY(0deg)';
        };
        img.onload = restoreStyles;
        img.onerror = restoreStyles;
      }, 250);

      if (label) label.textContent = lbl;
      if (title) title.textContent = ttl;
    });
  });

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;  
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 6; 
    const rotateY = ((x - centerX) / centerX) * 6;

    wrapper.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.015)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    wrapper.style.transform = `perspective(1200px) rotateX(3deg) rotateY(-0.5deg) scale(1)`;
  });
}

/**
 * 6. 移动端导航栏折叠菜单逻辑 (Mobile Toggle)
 */
function initMobileNavbar() {
  const toggleBtn = document.getElementById('nav-toggle-btn');
  const navbar = document.querySelector('.navbar');

  if (!toggleBtn || !navbar) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navbar.classList.toggle('mobile-active');
  });

  document.addEventListener('click', (e) => {
    if (navbar.classList.contains('mobile-active')) {
      const menu = document.querySelector('.nav-menu');
      if (menu && !menu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navbar.classList.remove('mobile-active');
      }
    }
  });
}

/**
 * 7. 全站模态弹窗鉴权 (Global Auth System) 与 D1/R2 反馈/回复/删除流程
 */
function initGlobalAuth() {
  // 全局 DOM 元素
  const authModal = document.getElementById('global-auth-modal');
  const authModalClose = document.getElementById('auth-modal-close-btn');
  const navLoginTrigger = document.getElementById('nav-login-trigger');
  const navUserMenu = document.getElementById('nav-user-menu');
  const navUserNameText = document.getElementById('nav-user-name-text');
  const navLogoutAction = document.getElementById('nav-logout-action');
  
  // FAQ 局部 DOM 元素（仅在 faq.html 存在时有用）
  const feedbackForm = document.getElementById('feedback-form');
  const feedbackLockCard = document.getElementById('feedback-lock-card');
  const feedbackWall = document.getElementById('feedback-wall');

  // Modal 切换 Tab 按钮
  const modalTabLogin = document.getElementById('modal-tab-login');
  const modalTabRegister = document.getElementById('modal-tab-register');
  const modalLoginForm = document.getElementById('modal-login-form');
  const modalRegisterForm = document.getElementById('modal-register-form');

  // ========================================================
  // 7.0 退出登录底层逻辑（抽离封装）
  // ========================================================
  function handleForceLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
    updateAuthUI();
  }

  // 检测接口错误是否为会话失效，若是则自动执行登出
  function checkSessionExpiry(errorMessage) {
    if (
      errorMessage && (
        errorMessage.includes("会话已过期") || 
        errorMessage.includes("重新登录") || 
        errorMessage.includes("未授权") || 
        errorMessage.includes("401") ||
        errorMessage.includes("403")
      )
    ) {
      handleForceLogout();
      return true;
    }
    return false;
  }
  
  // 7.0.1 联合拉取反馈墙
  async function loadFeedbacks() {
    if (!feedbackWall) return;

    const currentRole = localStorage.getItem('auth_role');
    const currentToken = localStorage.getItem('auth_token');
    const currentUser = localStorage.getItem('auth_user');

    try {
      const res = await fetch('/api/feedback?t=' + Date.now());
      if (res.status === 401) {
        handleForceLogout();
        throw new Error('登录会话已过期');
      }
      if (!res.ok) throw new Error('拉取失败');
      const list = await res.json();
      
      if (list.length === 0) {
        feedbackWall.innerHTML = `<p style="color: var(--text-muted); font-size: 12px; text-align: center; margin-top: 50px;">🎉 暂无反馈，欢迎提交第一个 Bug！</p>`;
        return;
      }

      feedbackWall.innerHTML = list.map(item => {
        const dateStr = new Date(item.created_at).toLocaleString('zh-CN', {
          month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        const imgTag = item.image_url 
          ? `<img src="${item.image_url}" class="wall-post-img" onclick="viewLargeImage(this.src, '${escapeHtml(item.username)} 的反馈')" title="点击查看大图" alt="截图">`
          : '';
        
        // 管理员 或 作者本人 均可展示删除按钮
        const deleteBtn = (currentRole === 'admin' || (currentUser && currentUser === item.username))
          ? `<button type="button" class="action-text-btn delete-btn" onclick="deleteFeedback(${item.id})">✕ 删除</button>`
          : '';

        const replyTriggerBtn = currentToken
          ? `<button type="button" class="action-text-btn reply-btn" onclick="toggleReplyBox(${item.id})">💬 回复</button>`
          : '';

        // 嵌套子回复渲染
        let repliesHtml = '';
        if (item.replies && item.replies.length > 0) {
          repliesHtml = `
            <div class="replies-container">
              ${item.replies.map(reply => {
                const replyDate = new Date(reply.created_at).toLocaleString('zh-CN', {
                  month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                });
                
                // 子回复的自助删除展示判断
                const deleteReplyBtn = (currentRole === 'admin' || (currentUser && currentUser === reply.username))
                  ? `<button type="button" class="action-text-btn delete-btn" onclick="deleteReply(${reply.id})" style="font-size:9px; margin-left:6px;">✕</button>`
                  : '';

                const isAdminReply = (reply.username === 'niu1029') ? 'admin' : '';

                return `
                  <div class="reply-item">
                    <div class="reply-meta">
                      <span class="reply-user ${isAdminReply}">${escapeHtml(reply.username)} ${isAdminReply ? '(管理员)' : ''}</span>
                      <span class="reply-time">${replyDate} ${deleteReplyBtn}</span>
                    </div>
                    <p class="reply-text">${escapeHtml(reply.content)}</p>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }

        return `
          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; transition: var(--transition-smooth); position: relative;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px;">
              <strong style="color: var(--neon-blue);">${escapeHtml(item.username)}</strong>
              <span style="color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                ${dateStr}
                ${deleteBtn}
              </span>
            </div>
            <p style="color: var(--text-secondary); font-size: 12px; word-break: break-all; line-height: 1.5;">${escapeHtml(item.content)}</p>
            ${imgTag}
            
            <div class="post-action-bar">
              ${replyTriggerBtn}
            </div>

            <!-- 二级回复框 -->
            <div id="reply-box-${item.id}" class="reply-input-box">
              <textarea id="reply-text-${item.id}" placeholder="写下您的回复... (最长 300 字)" class="reply-textarea"></textarea>
              <button type="button" class="run-btn reply-send-btn" onclick="submitReply(${item.id})">发送</button>
            </div>

            ${repliesHtml}
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
      if (checkSessionExpiry(err.message)) {
        feedbackWall.innerHTML = `<p style="color: var(--text-muted); font-size: 12px; text-align: center; margin-top: 50px;">🔒 登录已失效，已为您自动退出登录状态。</p>`;
      } else {
        feedbackWall.innerHTML = `<p style="color: #f87171; font-size: 12px; text-align: center; margin-top: 50px;">❌ 无法连接到云数据库</p>`;
      }
    }
  }

  // 7.0.2 提交二级回复
  async function submitReply(feedbackId) {
    const token = localStorage.getItem('auth_token');
    const textarea = document.getElementById(`reply-text-${feedbackId}`);
    if (!textarea) return;

    const content = textarea.value.trim();

    if (!token) {
      openAuthModal();
      return;
    }

    if (!content) {
      alert('回复内容不能为空！');
      return;
    }

    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feedback_id: feedbackId,
          content: content
        })
      });

      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        handleForceLogout();
        throw new Error(data.error || '登录已过期');
      }
      if (!res.ok) throw new Error(data.error || '提交回复失败');

      textarea.value = '';
      const replyBox = document.getElementById(`reply-box-${feedbackId}`);
      if (replyBox) replyBox.style.display = 'none';

      await loadFeedbacks();
    } catch (err) {
      alert(`回复失败: ${err.message}`);
      checkSessionExpiry(err.message);
    }
  }

  // 7.0.3 管理员删除主留言
  async function deleteFeedback(id) {
    if (!confirm('⚠️ 警告：确定要彻底删除这条留言以及其下的所有子回复吗？此操作不可逆。')) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch(`/api/feedback?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        handleForceLogout();
        throw new Error(data.error || '登录已过期');
      }
      if (!res.ok) throw new Error(data.error || '删除失败');

      await loadFeedbacks();
    } catch (err) {
      alert(`删除失败: ${err.message}`);
      checkSessionExpiry(err.message);
    }
  }

  // 7.0.4 管理员删除子回复
  async function deleteReply(id) {
    if (!confirm('确定要删除这条回复吗？')) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch(`/api/reply?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        handleForceLogout();
        throw new Error(data.error || '登录已过期');
      }
      if (!res.ok) throw new Error(data.error || '删除失败');

      await loadFeedbacks();
    } catch (err) {
      alert(`删除失败: ${err.message}`);
      checkSessionExpiry(err.message);
    }
  }

  // 7.0.5 展开回复框
  function toggleReplyBox(id) {
    const box = document.getElementById(`reply-box-${id}`);
    if (!box) return;
    const isVisible = box.style.display === 'flex';
    box.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
      const input = document.getElementById(`reply-text-${id}`);
      if (input) input.focus();
    }
  }

  // 7.1 全局弹窗控制方法
  const openAuthModal = () => {
    if (!authModal) return;
    authModal.style.display = 'flex';
    setTimeout(() => {
      authModal.classList.add('active');
    }, 10);
  };

  const closeAuthModal = () => {
    if (!authModal) return;
    authModal.classList.remove('active');
    setTimeout(() => {
      authModal.style.display = 'none';
    }, 300);
  };

  // 7.2 注册全局弹窗事件
  if (navLoginTrigger) {
    navLoginTrigger.addEventListener('click', openAuthModal);
  }

  if (feedbackLockCard) {
    feedbackLockCard.addEventListener('click', openAuthModal);
  }

  if (authModalClose) {
    authModalClose.addEventListener('click', closeAuthModal);
  }

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // 7.3 Modal 内部选项卡切换
  if (modalTabLogin && modalTabRegister) {
    modalTabLogin.addEventListener('click', () => {
      modalTabLogin.classList.add('active');
      modalTabRegister.classList.remove('active');
      modalLoginForm.classList.add('active');
      modalRegisterForm.classList.remove('active');
    });

    modalTabRegister.addEventListener('click', () => {
      modalTabRegister.classList.add('active');
      modalTabLogin.classList.remove('active');
      modalRegisterForm.classList.add('active');
      modalLoginForm.classList.remove('active');
    });
  }

  // 7.4 模态弹窗注册流程
  if (modalRegisterForm) {
    modalRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('modal-reg-user').value.trim();
      const password = document.getElementById('modal-reg-pass').value.trim();

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '注册失败');

        alert('🎉 注册成功！请直接在登录选项卡进行登录。');
        document.getElementById('modal-reg-user').value = '';
        document.getElementById('modal-reg-pass').value = '';
        modalTabLogin.click(); // 切回登录
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // 7.5 模态弹窗登录流程
  if (modalLoginForm) {
    modalLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('modal-login-user').value.trim();
      const password = document.getElementById('modal-login-pass').value.trim();

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '登录失败');

        // 保存全局登录会话
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', data.username);
        localStorage.setItem('auth_role', data.role);

        document.getElementById('modal-login-user').value = '';
        document.getElementById('modal-login-pass').value = '';

        closeAuthModal();
        updateAuthUI();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // 7.6 退出登录逻辑
  if (navLogoutAction) {
    navLogoutAction.addEventListener('click', (e) => {
      e.preventDefault();
      handleForceLogout();
    });
  }

  // 7.7 全局更新登录状态 UI
  function updateAuthUI() {
    let token = localStorage.getItem('auth_token');
    
    // 【前端离线自愈】如果存在 token，直接在前端解密 exp 判定是否过期，防范过期卡死
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payloadDecoded = decodeURIComponent(escape(atob(payloadB64)));
          const payload = JSON.parse(payloadDecoded);
          
          if (payload.exp && Date.now() / 1000 > payload.exp) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_role');
            token = null;
          }
        } else {
          throw new Error();
        }
      } catch (e) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_role');
        token = null;
      }
    }

    const user = localStorage.getItem('auth_user');
    const role = localStorage.getItem('auth_role');

    // 1. 更新 Navbar 显示
    if (token && user) {
      if (navLoginTrigger) navLoginTrigger.style.display = 'none';
      if (navUserMenu) navUserMenu.style.display = 'inline-block';
      if (navUserNameText) {
        navUserNameText.textContent = (role === 'admin') ? `${user} (管理员)` : user;
      }
    } else {
      if (navLoginTrigger) navLoginTrigger.style.display = 'inline-block';
      if (navUserMenu) navUserMenu.style.display = 'none';
    }

    // 2. 更新 FAQ 反馈墙表单
    if (feedbackForm && feedbackLockCard) {
      if (token && user) {
        feedbackLockCard.style.display = 'none';
        feedbackForm.style.display = 'block';
      } else {
        feedbackLockCard.style.display = 'block';
        feedbackForm.style.display = 'none';
      }
      loadFeedbacks(); // 留言列表联合刷新
    }
  }

  // 7.8 留言板表单交互（如果存在）
  if (feedbackForm && feedbackWall) {
    const fileInput = document.getElementById('fb-image');
    const filenameSpan = document.getElementById('fb-image-name');
    const previewBox = document.getElementById('fb-preview-box');
    const previewImg = document.getElementById('fb-preview-img');
    const removeBtn = document.getElementById('fb-remove-img');
    const submitBtn = document.getElementById('fb-submit-btn');
    const contentInput = document.getElementById('fb-content');

    // 文件选择预览
    if (fileInput && filenameSpan) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) {
          clearImageSelection();
          return;
        }
        filenameSpan.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
          if (previewImg && previewBox) {
            previewImg.src = e.target.result;
            previewBox.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', clearImageSelection);
    }

    function clearImageSelection() {
      if (fileInput) fileInput.value = '';
      if (filenameSpan) filenameSpan.textContent = '未选择任何图片';
      if (previewBox) previewBox.style.display = 'none';
      if (previewImg) previewImg.src = '';
    }

    // 提交主留言
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const token = localStorage.getItem('auth_token');
      const content = contentInput.value.trim();

      if (!token) {
        openAuthModal();
        return;
      }

      if (!content) return;

      submitBtn.disabled = true;
      submitBtn.textContent = '正在提交...';
      submitBtn.style.opacity = '0.5';

      try {
        let uploadedImageUrl = null;

        // 阶段一：上传截图 (携带 JWT Bearer 头)
        if (fileInput && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);

          submitBtn.textContent = '正在上传截图...';
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: uploadFormData
          });

          if (uploadRes.status === 401) {
            handleForceLogout();
            throw new Error('登录会话已过期，已自动下线');
          }
          if (!uploadRes.ok) {
            const uploadErr = await uploadRes.json();
            throw new Error(uploadErr.error || '图片上传到存储桶失败');
          }

          const uploadData = await uploadRes.json();
          uploadedImageUrl = uploadData.url;
        }

        // 阶段二：保存留言
        submitBtn.textContent = '正在写入反馈...';
        
        const feedbackRes = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            content,
            image_url: uploadedImageUrl 
          })
        });

        const feedbackData = await feedbackRes.json();
        if (feedbackRes.status === 401) {
          handleForceLogout();
          throw new Error(feedbackData.error || '登录会话已过期，已自动下线');
        }
        if (!feedbackRes.ok) {
          throw new Error(feedbackData.error || '留言提交失败');
        }

        contentInput.value = '';
        clearImageSelection();
        await loadFeedbacks();

      } catch (err) {
        alert(`反馈提交失败: ${err.message}`);
        checkSessionExpiry(err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '提交反馈';
        submitBtn.style.opacity = '1';
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 挂载全局方法以支持外部 HTML 中的 onclick
  window.submitReply = submitReply;
  window.deleteFeedback = deleteFeedback;
  window.deleteReply = deleteReply;
  window.toggleReplyBox = toggleReplyBox;
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;

  // 执行全局初始化登录态判定
  updateAuthUI();
}

/**
 * 8. 全屏大图灯箱预览控制逻辑
 */
function viewLargeImage(src, caption) {
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  if (!lightbox || !lightboxImg) return;

  lightboxImg.src = src;
  if (lightboxCaption) {
    lightboxCaption.textContent = caption || '反馈截图';
  }

  lightbox.style.display = 'flex';
  setTimeout(() => {
    lightbox.classList.add('active');
  }, 10);
}

document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('image-lightbox');
  const closeBtn = document.getElementById('lightbox-close-btn');

  if (!lightbox) return;

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    setTimeout(() => {
      lightbox.style.display = 'none';
    }, 300);
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target !== closeBtn) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
});

window.viewLargeImage = viewLargeImage;

// ==========================================================================
   // 极客汉化 AI 客服悬浮对话交互系统 (Typewriter & History Persistence)
// ==========================================================================
function initAIAssistant() {
  const triggerBtn = document.getElementById('ai-assistant-trigger-btn');
  const chatPanel = document.getElementById('ai-chat-panel');
  const closeBtn = document.getElementById('ai-chat-close-btn');
  const chatBody = document.getElementById('ai-chat-body');
  const chatInput = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send-btn');

  if (!triggerBtn || !chatPanel || !chatBody) return;

  let isResponding = false; // 防抖锁

  // 1. 从 sessionStorage 中恢复聊天记录（确保穿梭于不同 html 时历史不丢）
  const savedHistory = sessionStorage.getItem('ai_chat_history');
  if (savedHistory) {
    try {
      const history = JSON.parse(savedHistory);
      chatBody.innerHTML = '';
      history.forEach(item => {
        appendBubbleDirectly(item.role, item.content);
      });
    } catch (e) {
      console.error("恢复历史聊天出错:", e);
    }
  }

  // 2. 交互控制：点击气泡按钮打开/收回面板
  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = chatPanel.classList.toggle('active');
    if (isActive) {
      setTimeout(() => chatInput.focus(), 150);
      scrollToBottom();
    }
  });

  // 3. 点击关闭按钮收起面板
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    chatPanel.classList.remove('active');
  });

  // 4. 点击面板外部自动收起面板
  document.addEventListener('click', (e) => {
    if (!chatPanel.contains(e.target) && e.target !== triggerBtn) {
      chatPanel.classList.remove('active');
    }
  });

  // 5. 消息发送事件
  sendBtn.addEventListener('click', handleUserSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUserSend();
    }
  });

  async function handleUserSend() {
    if (isResponding) return;
    const text = chatInput.value.trim();
    if (!text) return;

    // 清空输入框并加锁
    chatInput.value = '';
    isResponding = true;
    toggleInputState(true);

    // 渲染用户气泡
    appendBubbleDirectly('user', text);
    saveToHistory('user', text);
    scrollToBottom();

    // 渲染 AI 正在打字/载入中占位气泡
    const loadingBubble = appendBubbleDirectly('ai', '🤖 正在匹配云端大模型...');
    scrollToBottom();

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      
      // 移除正在载入文字
      loadingBubble.textContent = '';
      
      if (res.ok && data.response) {
        // 使用打字机特效优雅输出 AI 的回答
        typeWriterEffect(loadingBubble, data.response, () => {
          saveToHistory('ai', data.response);
          isResponding = false;
          toggleInputState(false);
          chatInput.focus();
        });
      } else {
        throw new Error(data.error || '获取 AI 回复失败');
      }

    } catch (err) {
      loadingBubble.textContent = `⚠️ 连接失败，请稍后重试（${err.message}）`;
      isResponding = false;
      toggleInputState(false);
    }
  }

  // 辅助函数：逐字打字机特效
  function typeWriterEffect(element, text, callback) {
    let index = 0;
    function nextChar() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        scrollToBottom();
        setTimeout(nextChar, 12); // 12ms 的流畅节奏
      } else {
        if (callback) callback();
      }
    }
    nextChar();
  }

  // 辅助函数：快速渲染气泡
  function appendBubbleDirectly(role, text) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.textContent = text;
    chatBody.appendChild(bubble);
    return bubble;
  }

  // 辅助函数：保存聊天记录到 sessionStorage
  function saveToHistory(role, content) {
    const history = JSON.parse(sessionStorage.getItem('ai_chat_history') || '[]');
    history.push({ role, content });
    sessionStorage.setItem('ai_chat_history', JSON.stringify(history));
  }

  // 辅助函数：滚动到底部
  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // 辅助函数：切换输入禁用状态
  function toggleInputState(disabled) {
    chatInput.disabled = disabled;
    sendBtn.disabled = disabled;
    if (!disabled) {
      chatInput.style.opacity = '1';
      sendBtn.style.opacity = '1';
    } else {
      chatInput.style.opacity = '0.7';
      sendBtn.style.opacity = '0.7';
    }
  }
}
