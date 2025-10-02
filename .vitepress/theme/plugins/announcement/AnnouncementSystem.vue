<template>
  <Teleport to="body">
    <div 
      v-if="showAnnouncementSystem && visibleAnnouncements.length > 0"
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
              v-if="announcement.duration > 0 && announcement.showProgress"
              class="announcement-progress"
              :style="{ animationDuration: `${announcement.remainingTime}ms` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, h, watch } from 'vue'
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
const showAnnouncementSystem = ref(false) // 控制整个公告系统的显示
const closedAnnouncements = ref<Set<string>>(new Set())
const closingAnnouncements = ref<Set<string>>(new Set())
const activeAnnouncements = ref<Map<string, {
  startTime: number
  remainingTime: number
  showProgress: boolean
  timer: number | null
}>>(new Map())

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
  const normalizePath = (path: string) => {
    if (path === '/') return path
    return path.endsWith('/') ? path.slice(0, -1) : path
  }
  
  const normalizedCurrent = normalizePath(currentPath)
  const normalizedTarget = normalizePath(targetPath)
  
  // 首页特殊处理
  if (normalizedTarget === '/') {
    return normalizedCurrent === '/' || normalizedCurrent === '/index' || normalizedCurrent === ''
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
  // 检查是否已关闭
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
    
    // 只要当前路径匹配任意一个目标路径，就应该显示
    const isMatched = announcement.target.some(targetPath => 
      isPathMatched(currentPath, targetPath)
    )
    
    // 调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 公告路径匹配调试 [${announcement.id}]:`, {
        currentPath,
        targetPaths: announcement.target,
        isMatched,
        matchDetails: announcement.target.map(target => ({
          target,
          matched: isPathMatched(currentPath, target)
        }))
      })
    }
    
    return isMatched
  }
  
  // 如果没有指定目标路径，默认在所有页面显示
  return true
}

// 计算可见的公告（包含状态信息）
const visibleAnnouncements = computed(() => {
  const nowVisible = announcements
    .filter(shouldShowAnnouncement)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, globalConfig.maxVisible)
    .map(announcement => {
      const activeInfo = activeAnnouncements.value.get(announcement.id)
      return {
        ...announcement,
        showProgress: activeInfo?.showProgress ?? (announcement.duration > 0),
        remainingTime: activeInfo?.remainingTime ?? announcement.duration
      }
    })

  return nowVisible
})

// 初始化公告状态
const initAnnouncementState = (announcement: AnnouncementConfig) => {
  if (!activeAnnouncements.value.has(announcement.id)) {
    activeAnnouncements.value.set(announcement.id, {
      startTime: Date.now(),
      remainingTime: announcement.duration,
      showProgress: announcement.duration > 0,
      timer: null
    })
  }
}

// 设置自动关闭定时器
const setupAutoClose = (announcement: AnnouncementConfig) => {
  const activeInfo = activeAnnouncements.value.get(announcement.id)
  if (!activeInfo || announcement.duration <= 0) return

  // 清除现有定时器
  if (activeInfo.timer) {
    clearTimeout(activeInfo.timer)
  }

  // 设置新定时器
  activeInfo.timer = setTimeout(() => {
    closeAnnouncement(announcement.id)
  }, activeInfo.remainingTime) as unknown as number

  activeAnnouncements.value.set(announcement.id, activeInfo)
}

// 关闭公告
const closeAnnouncement = (id: string) => {
  // 标记为正在关闭
  closingAnnouncements.value.add(id)
  
  // 清除定时器
  const activeInfo = activeAnnouncements.value.get(id)
  if (activeInfo?.timer) {
    clearTimeout(activeInfo.timer)
  }
  activeAnnouncements.value.delete(id)
  
  // 延迟添加到已关闭列表
  setTimeout(() => {
    closedAnnouncements.value.add(id)
    closingAnnouncements.value.delete(id)
  }, 300)
}

// 处理公告点击
const handleAnnouncementClick = (announcement: AnnouncementConfig) => {
  console.log('Announcement clicked:', announcement.id)
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (globalConfig.enableKeyboard && event.key === 'Escape') {
    const latestAnnouncement = visibleAnnouncements.value[0]
    if (latestAnnouncement && latestAnnouncement.closable) {
      closeAnnouncement(latestAnnouncement.id)
    }
  }
}

// 检查页面是否已加载完成
const isPageLoaded = () => {
  return document.readyState === 'complete'
}

// 等待页面加载完成
const waitForPageLoad = () => {
  return new Promise<void>((resolve) => {
    if (isPageLoaded()) {
      resolve()
    } else {
      const onLoad = () => {
        window.removeEventListener('load', onLoad)
        resolve()
      }
      window.addEventListener('load', onLoad)
    }
  })
}

// 监听可见公告的变化，确保新出现的公告正确初始化
watch(visibleAnnouncements, (newVisible, oldVisible) => {
  // 找出新出现的公告
  const newAnnouncements = newVisible.filter(
    ann => !oldVisible.some(oldAnn => oldAnn.id === ann.id)
  )
  
  // 为新公告初始化状态和计时器
  newAnnouncements.forEach(announcement => {
    initAnnouncementState(announcement)
    setupAutoClose(announcement)
  })
})

// 生命周期
onMounted(async () => {
  // 等待页面加载完成
  await waitForPageLoad()
  
  // 延迟显示公告系统（0.5秒）
  await new Promise(resolve => setTimeout(resolve, globalConfig.showDelay || 500))
  
  // 显示公告系统
  showAnnouncementSystem.value = true
  
  // 初始化可见公告的状态
  visibleAnnouncements.value.forEach(announcement => {
    initAnnouncementState(announcement)
    setupAutoClose(announcement)
  })
  
  // 添加键盘事件监听
  if (globalConfig.enableKeyboard) {
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  // 清除所有定时器
  activeAnnouncements.value.forEach(activeInfo => {
    if (activeInfo.timer) {
      clearTimeout(activeInfo.timer)
    }
  })
  activeAnnouncements.value.clear()
  
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
