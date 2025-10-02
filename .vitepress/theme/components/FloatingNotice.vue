<template>
  <div 
    v-if="visible" 
    class="custom-toast"
    :class="{ 'toast-visible': visible }"
  >
    <h3 class="notice-title">📢 {{ title }}</h3>
    <p class="notice-text">{{ content }}</p>
    <button 
      class="notice-close" 
      @click="handleClose"
      aria-label="关闭公告"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
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
.custom-toast {
  /* 细长胶囊造型 */
  height: 48px;
  min-width: 280px;
  max-width: 90vw;
  border-radius: 24px; /* 高度的一半实现完全圆角 */
  
  /* 半透明背景 + 毛玻璃效果 - 降低不透明度至70% */
  background: rgba(50, 50, 50, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  /* 居中布局 */
  position: fixed;
  bottom: 2rem;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0 20px;
  
  /* 文字样式 */
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* 初始状态 - 隐藏 */
  opacity: 0;
  transform: translateX(-50%) translateY(100px);
  pointer-events: none;
  z-index: 9999;
  
  /* 动画过渡 */
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 显示状态 - 触发动画 */
.custom-toast.toast-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.notice-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.notice-text {
  margin: 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
  pointer-events: auto;
}

.notice-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: rotate(90deg);
}

/* 深色模式适配 - 半透明调整 */
:deep(.dark) .custom-toast {
  background: rgba(30, 30, 30, 0.7);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-toast {
    bottom: 1.5rem;
    height: 44px;
    padding: 0 16px;
  }
}
</style>
