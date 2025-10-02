<template>
  <Teleport to="body">
    <div 
      v-if="visibleAnnouncements.length > 0"
      class="announcement-system"
      :class="`position-${globalConfig.position || 'top'}`"
      :style="{ zIndex: globalConfig.zIndex }"
    >
      <TransitionGroup
        name="announcement"
        tag="div"
        class="announcement-container"
        :style="{ gap: `${globalConfig.spacing}px` }"
      >
        <div
          v-for="(announcement, index) in visibleAnnouncements"
          :key="announcement.id"
          class="announcement-wrapper"
          :style="{ '--delay': `${index * 100}ms` }"
        >
          <div
            class="announcement-toast"
            :class="[
              `type-${announcement.type}`,
              { 'with-icon': announcement.showIcon },
              { 'closable': announcement.closable },
              { 'closing': closingAnnouncements.has(announcement.id) }
            ]"
            @click="handleAnnouncementClick(announcement)"
          >
            <!-- 背景模糊效果 -->
            <div class="announcement-backdrop"></div>
            
            <!-- 内容区域 -->
            <div class="announcement-content">
              <!-- 图标 -->
              <div v-if="announcement.showIcon" class="announcement-icon">
                <component :is="getIconComponent(announcement.type)" />
              </div>
              
              <!-- 文本内容 -->
              <div class="announcement-text">
                <h4 v-if="announcement.title" class="announcement-title">
                  {{ announcement.title }}
                </h4>
                <p class="announcement-message">{{ announcement.content }}</p>
              </div>
              
              <!-- 关闭按钮 -->
              <button
                v-if="announcement.closable"
                class="announcement-close"
                @click.stop="closeAnnouncement(announcement.id)"
                :aria-label="'关闭公告'"
              >
                <CloseIcon />
              </button>
            </div>
            
            <!-- 进度条 -->
            <div
              v-if="announcement.duration > 0"
              class="announcement-progress"
              :style="{ animationDuration: `${announcement.duration}ms` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, h } from 'vue'
import { useRoute } from 'vitepress'
import { announcements, globalConfig, type AnnouncementConfig } from './config'

// 图标组件
const InfoIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  width: '20',
  height: '20',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'
  })
])

const SuccessIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  width: '20',
  height: '20',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
  })
])

const WarningIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  width: '20',
  height: '20',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
  })
])

const ErrorIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  width: '20',
  height: '20',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z'
  })
])

const CloseIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  width: '16',
  height: '16',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
  })
])

// 状态管理
const route = useRoute()
const closedAnnouncements = ref<Set<string>>(new Set())
const closingAnnouncements = ref<Set<string>>(new Set()) // 正在关闭的公告
const activeTimers = ref<Map<string, number>>(new Map())

// 获取图标组件
const getIconComponent = (type: string) => {
  const iconMap = {
    info: InfoIcon,
    success: SuccessIcon,
    warning: WarningIcon,
    error: ErrorIcon
  }
  return iconMap[type as keyof typeof iconMap] || InfoIcon
}

// 路径匹配辅助函数
const isPathMatched = (currentPath: string, targetPath: string): boolean => {
  // 规范化路径（移除尾部斜杠，除非是根路径）
  const normalizePath = (path: string) => {
    if (path === '/') return path
    return path.endsWith('/') ? path.slice(0, -1) : path
  }
  
  const normalizedCurrent = normalizePath(currentPath)
  const normalizedTarget = normalizePath(targetPath)
  
  // 精确匹配首页
  if (normalizedTarget === '/') {
    return normalizedCurrent === '/' || normalizedCurrent === '/index'
  }
  
  // 精确匹配
  if (normalizedCurrent === normalizedTarget) {
    return true
  }
  
  // 前缀匹配（确保是完整的路径段）
  if (normalizedCurrent.startsWith(normalizedTarget + '/')) {
    return true
  }
  
  return false
}

// 检查公告是否应该显示
const shouldShowAnnouncement = (announcement: AnnouncementConfig): boolean => {
  // 检查是否已关闭（但不包括正在关闭的，让它们有时间播放动画）
  if (closedAnnouncements.value.has(announcement.id)) {
    return false
  }
  
  // 检查时间范围
  const now = new Date()
  if (announcement.startTime && new Date(announcement.startTime) > now) {
    return false
  }
  if (announcement.endTime && new Date(announcement.endTime) < now) {
    return false
  }
  
  // 检查页面路径
  if (announcement.target && announcement.target.length > 0) {
    const currentPath = route.path
    const isMatched = announcement.target.some(targetPath => 
      isPathMatched(currentPath, targetPath)
    )
    
    // 调试信息（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 公告路径匹配调试 [${announcement.id}]:`, {
        currentPath: currentPath,
        targetPaths: announcement.target,
        isMatched: isMatched,
        matchDetails: announcement.target.map(target => ({
          target,
          matched: isPathMatched(currentPath, target)
        }))
      })
    }
    
    return isMatched
  }
  
  return true
}

// 计算可见的公告
const visibleAnnouncements = computed(() => {
  return announcements
    .filter(shouldShowAnnouncement)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, globalConfig.maxVisible)
})

// 关闭公告
const closeAnnouncement = (id: string) => {
  // 标记为正在关闭，开始播放离开动画
  closingAnnouncements.value.add(id)
  
  // 清除定时器
  const timer = activeTimers.value.get(id)
  if (timer) {
    clearTimeout(timer)
    activeTimers.value.delete(id)
  }
  
  // 延迟添加到已关闭列表，给动画时间播放
  setTimeout(() => {
    closedAnnouncements.value.add(id)
    closingAnnouncements.value.delete(id)
  }, 300) // 与 CSS 动画时长保持一致
}

// 处理公告点击
const handleAnnouncementClick = (announcement: AnnouncementConfig) => {
  // 可以在这里添加点击事件处理逻辑
  console.log('Announcement clicked:', announcement.id)
}

// 设置自动关闭定时器
const setupAutoClose = (announcement: AnnouncementConfig) => {
  if (announcement.duration > 0) {
    const timer = setTimeout(() => {
      closeAnnouncement(announcement.id)
    }, announcement.duration)
    
    activeTimers.value.set(announcement.id, timer)
  }
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (globalConfig.enableKeyboard && event.key === 'Escape') {
    // ESC 键关闭最新的公告
    const latestAnnouncement = visibleAnnouncements.value[0]
    if (latestAnnouncement && latestAnnouncement.closable) {
      closeAnnouncement(latestAnnouncement.id)
    }
  }
}

// 生命周期
onMounted(async () => {
  // 延迟显示公告
  await new Promise(resolve => setTimeout(resolve, globalConfig.showDelay))
  
  // 为每个可见公告设置自动关闭
  visibleAnnouncements.value.forEach(setupAutoClose)
  
  // 添加键盘事件监听
  if (globalConfig.enableKeyboard) {
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  // 清除所有定时器
  activeTimers.value.forEach(timer => clearTimeout(timer))
  activeTimers.value.clear()
  
  // 清理状态
  closingAnnouncements.value.clear()
  
  // 移除键盘事件监听
  if (globalConfig.enableKeyboard) {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.announcement-system {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  padding: 0 20px;
  pointer-events: none;
}

.announcement-system.position-top {
  top: 20px;
}

.announcement-system.position-bottom {
  bottom: 20px;
}

.announcement-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.announcement-wrapper {
  width: 100%;
  pointer-events: auto;
}

.announcement-toast {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.announcement-toast:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.announcement-toast.closing {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

.announcement-backdrop {
  position: absolute;
  inset: 0;
  background: var(--vp-c-bg-soft);
  opacity: 0.9;
}

.dark .announcement-backdrop {
  background: rgba(30, 30, 30, 0.9);
}

.announcement-content {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  gap: 12px;
}

.announcement-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  color: var(--announcement-color);
}

.announcement-text {
  flex: 1;
  min-width: 0;
}

.announcement-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.announcement-message {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  word-break: break-word;
}

.announcement-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-top: -2px;
}

.announcement-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--vp-c-text-1);
  transform: scale(1.1);
}

.dark .announcement-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.announcement-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--announcement-color);
  width: 100%;
  transform-origin: left;
  animation: progress linear forwards;
  opacity: 0.6;
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* 类型样式 */
.type-info {
  --announcement-color: #007AFF;
}

.type-success {
  --announcement-color: #34C759;
}

.type-warning {
  --announcement-color: #FF9500;
}

.type-error {
  --announcement-color: #FF3B30;
}

/* 动画 */
.announcement-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--delay, 0ms);
}

.announcement-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
}

.announcement-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.announcement-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.announcement-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .announcement-system {
    padding: 0 16px;
  }
  
  .announcement-content {
    padding: 14px 16px;
    gap: 10px;
  }
  
  .announcement-title {
    font-size: 13px;
  }
  
  .announcement-message {
    font-size: 12px;
  }
}

/* 减少动画偏好设置 */
@media (prefers-reduced-motion: reduce) {
  .announcement-toast,
  .announcement-toast.closing,
  .announcement-close,
  .announcement-enter-active,
  .announcement-leave-active,
  .announcement-move {
    transition: none !important;
    animation: none !important;
  }
  
  .announcement-toast:hover {
    transform: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .announcement-toast {
    border: 2px solid var(--announcement-color);
  }
  
  .announcement-backdrop {
    opacity: 1;
  }
}
</style>
