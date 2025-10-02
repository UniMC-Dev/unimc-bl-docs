<template>
  <div 
    v-if="visible" 
    class="announcement-toast"
    :class="{ 'with-icon': showIcon }"
  >
    <div class="toast-content">
      <svg v-if="showIcon" class="toast-icon" viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
      <p class="toast-message">{{ message }}</p>
      <button class="toast-close" @click="close">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5000
  },
  showIcon: {
    type: Boolean,
    default: true
  }
})

const visible = ref(false)
const emit = defineEmits(['close'])

const show = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
  emit('close')
}

onMounted(() => {
  show()
})

watch(visible, (newVal) => {
  if (newVal && props.duration > 0) {
    setTimeout(close, props.duration)
  }
})

// 暴露显示方法供外部调用
defineExpose({ show })
</script>

<style scoped>
.announcement-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  width: clamp(300px, 80vw, 600px);
  animation: slideIn 0.3s ease-out forwards;
}

.toast-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: var(--vp-c-text-1);
}

.with-icon .toast-content {
  padding-left: 12px;
}

.toast-icon {
  margin-right: 10px;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.toast-message {
  flex-grow: 1;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.toast-close {
  background: none;
  border: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  background-color: var(--vp-c-bg-mute);
}

@keyframes slideIn {
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
.announcement-toast:not(:first-child) {
  animation: slideOut 0.3s ease-in forwards;
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
}

/* 深色模式适配 */
.dark .toast-content {
  background-color: var(--vp-c-bg-mute);
  border-color: var(--vp-c-divider-dark);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
