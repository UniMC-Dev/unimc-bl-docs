<template>
  <div 
    v-if="visible" 
    class="custom-toast"
    :class="{ 'show': visible }"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- 鼠标跟随光效元素 -->
    <div class="light-effect" :style="lightEffectStyle"></div>
    
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
import { ref, onMounted, watch, reactive } from 'vue'
import { useData } from 'vitepress'

// 引入VitePress的深色模式状态
const { isDark } = useData()
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

const visible = ref(true)
const lightEffectStyle = reactive({
  opacity: 0,
  left: '0px',
  top: '0px',
  transform: 'translate(-50%, -50%)'
})

const handleClose = () => {
  visible.value = false
}

// 处理鼠标移动，实现光效跟随
const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  lightEffectStyle.left = `${x}px`
  lightEffectStyle.top = `${y}px`
  lightEffectStyle.opacity = 1
  
  // 清除之前的延迟
  clearTimeout(window.lightEffectTimeout)
}

// 鼠标离开时淡出光效
const handleMouseLeave = () => {
  window.lightEffectTimeout = setTimeout(() => {
    lightEffectStyle.opacity = 0
  }, 300)
}

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      visible.value = false
    }, props.duration)
  }
})

// 深色模式切换时强制重绘
watch(isDark, () => {
  if (visible.value) {
    visible.value = false
    setTimeout(() => visible.value = true, 50)
  }
})
</script>

<style scoped>
.custom-toast {
  min-height: 48px;
  width: auto;
  border-radius: 24px;
  
  /* 毛玻璃效果 - 浅色模式 */
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 16px;
  
  color: #333;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 99999;
  pointer-events: auto;
  
  /* 默认状态 - 只显示标题 */
  max-width: fit-content;
}

/* 显示状态动画 */
.custom-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* 鼠标悬停时展开 */
.custom-toast:hover {
  padding: 0 20px;
  max-width: 90vw;
  gap: 0.75rem;
}

.notice-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.notice-text {
  margin: 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 鼠标悬停时显示文本 */
.custom-toast:hover .notice-text {
  opacity: 1;
  flex: 1;
  margin: 0 8px;
}

.notice-close {
  background: transparent;
  border: none;
  color: rgba(50, 50, 50, 0.7);
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  pointer-events: auto;
  opacity: 0;
  transform: scale(0.8) rotate(0deg);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 鼠标悬停时显示关闭按钮 */
.custom-toast:hover .notice-close {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.notice-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: #333;
  transform: rotate(90deg);
}

/* 鼠标跟随光效 */
.light-effect {
  position: absolute;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  pointer-events: none;
  transition: opacity 0.5s ease, transform 0.1s ease-out;
  z-index: -1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .custom-toast {
    bottom: 1.5rem;
    min-height: 44px;
  }
}
</style>

<!-- 深色模式样式 -->
<style>
/* 深色模式适配 - 毛玻璃效果 */
html.dark .custom-toast {
  background: rgba(30, 30, 30, 0.7) !important;
  color: #fff !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

html.dark .notice-close {
  color: rgba(255, 255, 255, 0.7) !important;
}

html.dark .notice-close:hover {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

html.dark .light-effect {
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%) !important;
}
</style>
