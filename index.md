---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "MCLUME X MCBUCKET"
  text: "WIKI"
  tagline: 玩家为本 体验至上
  image: 
    src: /favico.png
    alt: logo
  actions:
    - theme: brand
      text: 查看文档
      link: /docs/all/start
    - theme: alt
      text: 了解UNIMC
      link: https://mc.clami.fun

features:
  - icon: <?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8C8.92487 8 4 12.9249 4 19C4 30 17 40 24 42.3262C31 40 44 30 44 19C44 12.9249 39.0751 8 33 8C29.2797 8 25.9907 9.8469 24 12.6738C22.0093 9.8469 18.7203 8 15 8Z" fill="none" stroke="#ff0000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    title: 始终如一
    details: 纯公益运行至今已有五年历史，
  - icon: <?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M33 38H22V30H36V22H44V38H39L36 41L33 38Z" stroke="#0044ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 6H36V30H17L13 34L9 30H4V6Z" fill="none" stroke="#0044ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 18H20" stroke="#0044ff" stroke-width="4" stroke-linecap="round"/><path d="M26 18H27" stroke="#0044ff" stroke-width="4" stroke-linecap="round"/><path d="M12 18H13" stroke="#0044ff" stroke-width="4" stroke-linecap="round"/></svg>
    title: 倾听
    details: 坚守玩家为本，体验至上
  - icon: <?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31 4H16L10 27H18L14 44L40 16H28L31 4Z" fill="none" stroke="#00ff0f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 11L19 19" stroke="#00ff0f" stroke-width="4" stroke-linecap="round"/></svg>
    title: 性能
    details: 5800X | 128GB 更流畅！
---
<!-- 美观低多边形动态背景 -->
<div class="geo-background">
  <canvas id="geo-canvas"></canvas>
</div>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

onMounted(() => {
  // 多边形动画初始化
  const canvas = document.getElementById('geo-canvas')
  if (!canvas) return; // 如果canvas不存在，则不执行后续操作
  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let points = [];
  let POINTS_X, POINTS_Y;
  const MOVE_RANGE = 32;
  const SPEED_MIN = 0.6; // 速度加快一倍
  const SPEED_MAX = 1.4;
  let resizeTimeout;

  function randomSpeed() {
    return (Math.random() - 0.5) * (SPEED_MAX - SPEED_MIN) + (SPEED_MIN * (Math.random() > 0.5 ? 1 : -1));
  }

  function randomColor(base, alpha) {
    return `rgba(${base[0]},${base[1]},${base[2]},${alpha})`;
  }

  function resizeCanvas() {
    // 画布像素为1.05倍
    canvas.width = window.innerWidth * 0.5;
    canvas.height = window.innerHeight * 0.5;
    canvas.style.width = '105vw';
    canvas.style.height = '105vh';
    calcPoints();
    initPoints();
  }

  function calcPoints() {
    // 只按可视区算点数，密度进一步缩小（每320px一个点）
    POINTS_X = Math.max(2, Math.floor(window.innerWidth / 320));
    POINTS_Y = Math.max(1, Math.floor(window.innerHeight / 320));
  }

  function initPoints() {
    points = [];
    // 在可视区基础上每边多100px
    const extra = 100;
    const w = window.innerWidth + extra * 2;
    const h = window.innerHeight + extra * 2;
    // 偏移量，让点居中在大画布
    const offsetX = (canvas.width - w) / 2;
    const offsetY = (canvas.height - h) / 2;
    for (let y = 0; y <= POINTS_Y; y++) {
      for (let x = 0; x <= POINTS_X; x++) {
        const baseX = (w / POINTS_X) * x + offsetX;
        const baseY = (h / POINTS_Y) * y + offsetY;
        points.push({
          baseX,
          baseY,
          x: baseX + (Math.random() - 0.5) * MOVE_RANGE,
          y: baseY + (Math.random() - 0.5) * MOVE_RANGE,
          angle: Math.random() * Math.PI * 2,
          speed: randomSpeed(),
          colorSeed: Math.random()
        });
      }
    }
  }

  function drawTriangles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.documentElement.classList.contains('dark');
    const baseColors = isDark
      ? [[0, 122, 204], [0, 80, 150], [22, 217, 199]]
      : [[22, 217, 199], [0, 122, 204], [255, 199, 0]];
    for (let y = 0; y < POINTS_Y; y++) {
      for (let x = 0; x < POINTS_X; x++) {
        const idx = y * (POINTS_X + 1) + x;
        const p1 = points[idx];
        const p2 = points[idx + 1];
        const p3 = points[idx + POINTS_X + 1];
        const p4 = points[idx + POINTS_X + 2];

        const colorIdx = Math.floor(p1.colorSeed * baseColors.length);
        const color = randomColor(baseColors[colorIdx], isDark ? 0.18 : 0.15);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = isDark ? 'rgba(0,200,255,0.18)' : 'rgba(0,122,204,0.18)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = isDark ? 'rgba(0,200,255,0.18)' : 'rgba(0,122,204,0.18)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
  }
  // 降低动画帧率
  let lastFrame = 0;
  let running = true;
  
  function handleVisibilityChange() {
    running = document.visibilityState === 'visible';
    if (running) animate(performance.now());
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  function animate(now) {
    if (!running) return;
    if (!lastFrame || now - lastFrame > 70) { // 约14fps
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.angle += p.speed * 0.008;
        p.x = p.baseX + Math.cos(p.angle) * MOVE_RANGE;
        p.y = p.baseY + Math.sin(p.angle) * MOVE_RANGE;
      }
      drawTriangles();
      lastFrame = now;
    }
    animationFrameId = requestAnimationFrame(animate);
  }

  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 200);
  };
  
  window.addEventListener('resize', handleResize);

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === 'class') drawTriangles();
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  resizeCanvas();
  animate();

  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (resizeTimeout) clearTimeout(resizeTimeout);
    observer.disconnect();
  })
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  overflow: visible !important;
  position: relative;
}
.geo-background {
  position: fixed;
  inset: 0;
  left: 0; top: 0; right: 0; bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: -9999;
  overflow: hidden;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
#geo-canvas {
  width: 105vw;
  height: 105vh;
  max-width: none;
  max-height: none;
  min-width: 100vw;
  min-height: 100vh;
  opacity: 0.85;
  display: block;
  filter: blur(0.5px);
  transition: background 0.3s;
  pointer-events: none;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>