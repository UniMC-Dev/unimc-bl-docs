<template>
  <Teleport to="body">
    <Transition name="fade">
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
              <div class="announcement-backdrop"></div>
              
              <div class="announcement-content">
                <div v-if="announcement.showIcon" class="announcement-icon">
                  <component :is="getIconComponent(announcement.type)" />
                </div>
                
                <div class="announcement-text">
                  <h4 v-if="announcement.title" class="announcement-title">
                    {{ announcement.title }}
                  </h4>
                  <p class="announcement-message">{{ announcement.content }}</p>
                </div>
                
                <button
                  v-if="announcement.closable"
                  class="announcement-close"
                  @click.stop="closeAnnouncement(announcement.id)"
                  :aria-label="'关闭公告'"
                >
                  <CloseIcon />
                </button>
              </div>
              
              <div
                v-if="announcement.duration > 0 && announcement.showProgress"
                class="announcement-progress"
                :style="{ animationDuration: `${announcement.remainingTime}ms` }"
              ></div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, h, watch } from 'vue'
import { useRoute } from 'vitepress'
import { announcements, globalConfig, type AnnouncementConfig } from './config'

// --- 图标组件定义 (保持不变) ---
const InfoIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  width: '20',
  height: '20',
  fill: 'currentColor'}, [
  h('path', {
    d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'
  })])
const SuccessIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  width: '20',
  height: '20',
  fill: 'currentColor'}, [
  h('path', {
    d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
  })])
const WarningIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  width: '20',
  height: '20',
  fill: 'currentColor'}, [
  h('path', {
    d: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
  })])
const ErrorIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  width: '20',
  height: '20',
  fill: 'currentColor'}, [
  h('path', {
    d: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z'
  })])
const CloseIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  width: '16',
  height: '16',
  fill: 'currentColor'}, [
  h('path', {
    d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
  })])
// --- 状态管理 ---
const route = useRoute()
const showAnnouncementSystem = ref(false) 
const closedAnnouncements = ref<Set<string>>(new Set()) // 永久关闭/已结束的公告
const closingAnnouncements = ref<Set<string>>(new Set()) // 正在执行关闭动画的公告
const activeAnnouncements = ref<Map<string, {
  startTime: number
  remainingTime: number
  showProgress: boolean
  timer: number | null
  isActive: boolean // 关键：表示公告当前是否处于生命周期中
}>>(new Map()) 

// --- 工具函数 (保持不变) ---
const getIconComponent = (type: string) => {
  const iconMap = { info: InfoIcon, success: SuccessIcon, warning: WarningIcon, error: ErrorIcon }
  return iconMap[type as keyof typeof iconMap] || InfoIcon
}

const isPathMatched = (currentPath: string, targetPath: string): boolean => {
  const normalizePath = (path: string) => {
    if (path === '/') return path
    return path.endsWith('/') ? path.slice(0, -1) : path
  }
  const normalizedCurrent = normalizePath(currentPath)
  const normalizedTarget = normalizePath(targetPath)
  
  if (normalizedTarget === '/') {
    return normalizedCurrent === '/' || normalizedCurrent === '/index' || normalizedCurrent === ''
  }
  if (normalizedCurrent === normalizedTarget) {
    return true
  }
  if (normalizedCurrent.startsWith(normalizedTarget + '/')) {
    return true
  }
  return false
}

// 检查公告是否“有资格”在当前路由下“首次”显示
const canBeActivated = (announcement: AnnouncementConfig): boolean => {
  // 1. 检查是否已关闭/已结束
  if (closedAnnouncements.value.has(announcement.id)) {
    return false
  }
  
  // 2. 检查是否已经处于活跃状态（如果已活跃，则返回 false，防止重复激活）
  if (activeAnnouncements.value.get(announcement.id)?.isActive) {
      return false
  }

  // 3. 检查时间范围
  const now = new Date()
  if (announcement.startTime && new Date(announcement.startTime) > now) {
    return false
  }
  if (announcement.endTime && new Date(announcement.endTime) < now) {
    return false
  }
  
  // 4. 检查页面路径
  if (announcement.target && announcement.target.length > 0) {
    const currentPath = route.path
    return announcement.target.some(targetPath => isPathMatched(currentPath, targetPath))
  }
  
  return true
}

// 初始化/激活公告状态
const initAnnouncementState = (announcement: AnnouncementConfig) => {
  // 仅在未激活状态下才初始化
  if (!activeAnnouncements.value.get(announcement.id)?.isActive) {
    activeAnnouncements.value.set(announcement.id, {
      startTime: Date.now(),
      remainingTime: announcement.duration,
      showProgress: announcement.duration > 0,
      timer: null,
      isActive: true // 标记为已激活
    })
  }
}

// 设置自动关闭定时器
const setupAutoClose = (announcement: AnnouncementConfig) => {
  const activeInfo = activeAnnouncements.value.get(announcement.id)
  // 如果没有活跃信息，或者没有设置时长，或者定时器已存在，则退出
  if (!activeInfo || announcement.duration <= 0 || activeInfo.timer) return

  // 设置新定时器
  activeInfo.timer = setTimeout(() => {
    // 自动关闭时调用 closeAnnouncement
    closeAnnouncement(announcement.id)
  }, activeInfo.remainingTime) as unknown as number

  activeAnnouncements.value.set(announcement.id, activeInfo)
}

// **【核心 computed 属性】** 计算可见的公告
const visibleAnnouncements = computed(() => {
    // 仅显示所有当前处于“isActive: true”的公告，**忽略当前路由的路径匹配**。
    const activeAnnouncementsList = announcements
        .filter(announcement => activeAnnouncements.value.get(announcement.id)?.isActive)
        .map(announcement => {
            const activeInfo = activeAnnouncements.value.get(announcement.id)!
            return {
                ...announcement,
                showProgress: activeInfo.showProgress,
                remainingTime: activeInfo.remainingTime
            }
        })
        .sort((a, b) => b.priority - a.priority)
        .slice(0, globalConfig.maxVisible)

    return activeAnnouncementsList
})

// 关闭公告 (用于手动关闭或计时结束)
const closeAnnouncement = (id: string) => {
  const activeInfo = activeAnnouncements.value.get(id)
  
  // 1. 清除定时器
  if (activeInfo?.timer) {
    clearTimeout(activeInfo.timer)
  }
  
  // 2. 标记为正在关闭 (用于 CSS 过渡)
  closingAnnouncements.value.add(id)

  // 3. 将其 ID 添加到 closedAnnouncements，防止 canBeActivated 再次通过
  closedAnnouncements.value.add(id) 
  
  // 4. 等待动画结束（300ms 对应 CSS 中的 leave 动画时长）
  setTimeout(() => {
    // 5. 从 activeAnnouncements 中移除（这将导致 visibleAnnouncements 列表更新，触发 leave 动画）
    activeAnnouncements.value.delete(id) 
    
    // 6. 移除 closing 状态
    closingAnnouncements.value.delete(id)
    
  }, 300) 
}

const handleAnnouncementClick = (announcement: AnnouncementConfig) => {
  console.log('Announcement clicked:', announcement.id)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (globalConfig.enableKeyboard && event.key === 'Escape') {
    const latestAnnouncement = visibleAnnouncements.value[0]
    if (latestAnnouncement && latestAnnouncement.closable) {
      closeAnnouncement(latestAnnouncement.id)
    }
  }
}

const isPageLoaded = () => document.readyState === 'complete'

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

// --- 监听路由变化以激活新的公告 ---
watch(() => route.path, (newPath) => {
    // 路由切换时，检查是否有新的公告应该被激活
    announcements.forEach(announcement => {
        if (canBeActivated(announcement)) {
            initAnnouncementState(announcement);
            setupAutoClose(announcement);
        }
    });
}, { immediate: false }) 

// 生命周期
onMounted(async () => {
  await waitForPageLoad()
  await new Promise(resolve => setTimeout(resolve, globalConfig.showDelay || 500))
  
  // 1. 显示公告系统
  showAnnouncementSystem.value = true
  
  // 2. 首次激活可见的公告
  announcements.forEach(announcement => {
      if (canBeActivated(announcement)) {
          initAnnouncementState(announcement);
          setupAutoClose(announcement);
      }
  });

  // 3. 添加键盘事件监听
  if (globalConfig.enableKeyboard) {
    document.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  // 清理所有定时器和状态
  activeAnnouncements.value.forEach(activeInfo => {
    if (activeInfo.timer) {
      clearTimeout(activeInfo.timer)
    }
  })
  activeAnnouncements.value.clear()
  closingAnnouncements.value.clear()
  
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
  position: relative;
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

/* 公告系统淡入动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 公告项动画 */
.announcement-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--delay, 0ms);
}

.announcement-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.6, 1);
    position: absolute; 
  /* 确保元素在脱离文档流后仍能占据全部宽度 */
  width: 100%; 
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
  .announcement-move,
  .fade-enter-active,
  .fade-leave-active {
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
