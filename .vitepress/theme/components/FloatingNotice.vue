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

// 状态管理 - 仅使用内存状态
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
.toast-notice {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 90%;
  max-width: 500px;
  animation: slideUp 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

.notice-content {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(220, 224, 230, 0.4);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.notice-content:hover {
  background-color: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.notice-title {
  margin: 0 2rem 0.5rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notice-text {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  font-size: 0.95rem;
}

.notice-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.notice-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--vp-c-text-1);
  transform: rotate(90deg);
}

/* 深色模式适配 */
:deep(.dark) .notice-content {
  background-color: rgba(15, 15, 20, 0.8);
  border-color: rgba(55, 59, 72, 0.4);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

:deep(.dark) .notice-content:hover {
  background-color: rgba(15, 15, 20, 0.9);
}

:deep(.dark) .notice-close:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

/* 动画效果 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 关闭动画 */
.toast-notice-leave-active {
  animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideDown {
  from {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toast-notice {
    bottom: 1.5rem;
  }
  
  .notice-content {
    padding: 1rem 1.25rem;
  }
  
  .notice-title {
    font-size: 1rem;
  }
  
  .notice-text {
    font-size: 0.9rem;
  }
}
</style>
