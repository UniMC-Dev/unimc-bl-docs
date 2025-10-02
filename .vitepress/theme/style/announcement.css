<template>
  <div 
    v-if="visible" 
    class="announcement"
    :class="{ 'announcement-hidden': !visible }"
  >
    <div class="announcement-content">
      <h3 class="announcement-title">📢 {{ title }}</h3>
      <p class="announcement-text">{{ content }}</p>
      <button 
        class="announcement-close" 
        @click="handleClose"
        aria-label="关闭公告"
      >
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'

interface Props {
  title: string
  content: string
  storageKey: string
  duration: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '最新公告',
  content: '',
  storageKey: 'announcement_closed',
  duration: 0 // 0表示不自动关闭
})

// 状态管理 - 使用本地存储记录关闭状态
const visible = useStorage(
  props.storageKey,
  true,
  localStorage,
  { writeDefaults: false }
)

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

<style>
.announcement {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 90%;
  max-width: 600px;
  transition: all 0.3s ease-out;
  animation: floatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.announcement-content {
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.announcement-content:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.announcement-title {
  margin: 0 0 0.75rem 0;
  color: var(--vp-c-brand-1);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.announcement-text {
  margin: 0;
  color: var(--vp-c-text-1);
  line-height: 1.6;
  font-size: 14px;
}

.announcement-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: var(--vp-c-text-2);
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.announcement-close:hover {
  background-color: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.announcement-hidden {
  opacity: 0;
  transform: translate(-50%, -20px);
  pointer-events: none;
}

/* 深色模式适配 */
:deep(.dark) .announcement-content {
  background-color: var(--vp-c-bg-soft-dark);
  border-color: var(--vp-c-divider-dark);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .announcement-content {
    padding: 1.25rem;
  }
  
  .announcement-title {
    font-size: 1.1rem;
  }
}
</style>
