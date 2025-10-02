<template>
  <div 
    v-if="visible" 
    class="toast-notice"
  >
    <div class="notice-content">
      <h3 class="notice-title">📢 {{ title }}</h3>
      <p class="notice-text">{{ content }}</p>
      <button 
        class="notice-close" 
        @click="handleClose"
        aria-label="关闭公告"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
<!-- 细长型Toast组件 -->
<div class="custom-toast" id="customToast">
  <span class="toast-text">操作成功</span>
</div>

<style>
.custom-toast {
  /* 细长胶囊造型 */
  height: 36px;
  min-width: 280px;
  max-width: 90vw;
  border-radius: 18px; /* 高度的一半实现完全圆角 */
  
  /* 半透明背景 + 毛玻璃效果 */
  background: rgba(50, 50, 50, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  /* 居中布局 */
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  
  /* 文字样式 */
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* 动画效果 */
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9999;
  pointer-events: none;
}

/* 显示状态 */
.custom-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* 深色模式适配 */
.dark .custom-toast {
  background: rgba(30, 30, 30, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
</style>

<script>
// 显示Toast的函数
function showToast(message, duration = 2000) {
  const toast = document.getElementById('customToast');
  toast.querySelector('.toast-text').textContent = message;
  toast.classList.add('show');
  
  // 自动隐藏
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}
</script>
