<template>
  <div 
    v-if="visible" 
    class="custom-toast"
    :class="{ 'show': visible }"
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
import { ref, onMounted, watch } from 'vue'
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

const handleClose = () => {
  visible.value = false
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
  /* 保持细长造型同时优化比例 */
  min-height: 48px;
  min-width: 280px;
  max-width: 90vw;
  border-radius: 24px;
  
  /* 修复透明度问题 - 使用更低的alpha值并确保无背景覆盖 */
  background: rgba(50, 50, 50, 0.7); /* 降低不透明度 */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1); /* 增加边框避免边缘融合 */
  
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 20px;
  
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 99999; /* 提高层级避免被覆盖 */
  pointer-events: none;
}

/* 显示状态动画 */
.custom-toast.show {
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
  flex: 1; /* 确保文本区域自适应 */
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

/* 响应式调整 */
@media (max-width: 768px) {
  .custom-toast {
    bottom: 1.5rem;
    min-height: 44px;
    padding: 0 16px;
  }
}
</style>

<!-- 单独的非scoped样式处理深色模式，提高选择器优先级 -->
<style>
/* 深色模式适配 - 使用直接选择器而非deep，提高优先级 */
html.dark .custom-toast {
  background: rgba(30, 30, 30, 0.9) !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
}
</style>
