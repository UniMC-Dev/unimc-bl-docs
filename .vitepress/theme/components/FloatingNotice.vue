<template>
  <div 
    v-if="visible" 
    class="floating-notice"
  >
    <div class="notice-content">
      <div class="notice-decoration"></div>
      <h3 class="notice-title">📢 {{ title }}</h3>
      <p class="notice-text">{{ content }}</p>
      <button 
        class="notice-close" 
        @click="handleClose"
        aria-label="关闭公告"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 组件属性定义
const props = defineProps({
  title: {
    type: String,
    default: '最新公告'
  },
  content: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0 // 0表示不自动关闭
  }
})

// 状态管理 - 移除了storage功能，仅使用内存状态
const visible = ref(true)

// 关闭公告
const handleClose = () => {
  visible.value = false
}

// 自动关闭功能
onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      visible.value = false
    }, props.duration)
  }
})
</script>

<style scoped>
.floating-notice {
  position: fixed;
  top: 3rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 90%;
  max-width: 600px;
  animation: floatIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.notice-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(245, 247, 250, 0.95));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(220, 224, 230, 0.6);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.notice-content:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);
}

.notice-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-indigo-5));
}

.notice-title {
  margin: 0 2rem 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.02em;
}

.notice-text {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  font-size: 1rem;
  letter-spacing: 0.01em;
}

.notice-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
}

.notice-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--vp-c-text-1);
  transform: rotate(90deg);
}

/* 深色模式适配 */
:deep(.dark) .notice-content {
  background: linear-gradient(135deg, rgba(20, 22, 28, 0.92), rgba(28, 30, 38, 0.95));
  border-color: rgba(55, 59, 72, 0.6);
}

:deep(.dark) .notice-close:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 关闭动画 */
.floating-notice-leave-active {
  animation: floatOut 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes floatOut {
  from {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -20px) scale(0.95);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-notice {
    top: 2rem;
  }
  
  .notice-content {
    padding: 1.5rem;
  }
  
  .notice-title {
    font-size: 1.15rem;
    margin-right: 1.5rem;
  }
  
  .notice-text {
    font-size: 0.95rem;
  }
}
</style>
