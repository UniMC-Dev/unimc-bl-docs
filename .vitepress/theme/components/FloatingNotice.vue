<template>
  <div 
    v-if="isVisible" 
    class="custom-toast"
    :class="{ 'show': visible, 'hide': !visible }"
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
  },
  // 新增属性：是否始终显示内容
  alwaysShowContent: {
    type: Boolean,
    default: false
  }
})

// 用于控制动画完成后再隐藏元素
const visible = ref(true)
const isVisible = ref(true)
const lightEffectStyle = reactive({
  opacity: 0,
  left: '0px',
  top: '0px',
  transform: 'translate(-50%, -50%)'
})

const handleClose = () => {
  visible.value = false
  // 等待关闭动画完成后再隐藏元素
  setTimeout(() => {
    isVisible.value = false
  }, 400)
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
  // 进入动画触发
  setTimeout(() => {
    visible.value = true
  }, 10)
  
  if (props.duration > 0) {
    setTimeout(() => {
      handleClose()
    }, props.duration)
  }
})

// 深色模式切换时强制重绘
watch(isDark, () => {
  if (isVisible.value) {
    visible.value = false
    setTimeout(() => {
      visible.value = true
    }, 50)
  }
})
</script>

<style scoped>
.custom-toast {
  min-height: 48px;
  width: auto;
  border-radius: 24px;
  
  /* 液态玻璃效果 */
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  display: flex;
  align-items: center;
  justify-content: center; /* 缩起时文字居中 */
  gap: 0.5rem;
  padding: 0 16px;
  
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  overflow: visible; /* 确保内容不会被裁剪 */
  
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  z-index: 99999;
  pointer-events: auto;
}

/* 进入动画 */
.custom-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* 关闭动画 */
.custom-toast.hide {
  opacity: 0;
  transform: translateX(-50%) translateY(100px) scale(0.95);
}

/* 鼠标悬停时展开 - 宽度适应内容 */
.custom-toast:hover {
  padding: 0 20px;
  gap: 0.75rem;
  justify-content: flex-start;
  box-shadow: 0 6px 35px rgba(0, 0, 0, 0.1),
              inset 0 0 0 1px rgba(255, 255, 255, 0.2);
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
  width: 0;
  transition: all 0.3s ease-out; /* 更平滑的过渡效果 */
}

/* 展开时显示文本并自动适应宽度 */
.custom-toast:hover .notice-text,
/* 始终显示内容的情况 */
.custom-toast.always-show .notice-text {
  opacity: 1;
  flex: 1;
  width: auto;
  margin: 0 8px;
  max-width: calc(90vw - 120px);
}

/* 关闭按钮样式 */
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
  padding: 0;
  pointer-events: auto;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease-out;
}

.custom-toast:hover .notice-close,
.custom-toast.always-show .notice-close {
  opacity: 1;
  transform: scale(1);
}

.notice-close:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  transform: rotate(90deg);
}

/* 鼠标跟随光效 */
.light-effect {
  position: absolute;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  pointer-events: none;
  transition: opacity 0.5s ease-out, 
              transform 0.15s ease-out;
  z-index: -1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .custom-toast {
    bottom: 1.5rem;
    min-height: 44px;
  }
  
  .custom-toast:hover .notice-text,
  .custom-toast.always-show .notice-text {
    max-width: calc(90vw - 100px);
  }
}
</style>

<!-- 深色模式样式 -->
<style>
html.dark .custom-toast {
  background: rgba(15, 15, 20, 0.65) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2),
              inset 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
}

html.dark .custom-toast:hover {
  box-shadow: 0 6px 35px rgba(0, 0, 0, 0.3),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
}

html.dark .light-effect {
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%) !important;
}
</style>
