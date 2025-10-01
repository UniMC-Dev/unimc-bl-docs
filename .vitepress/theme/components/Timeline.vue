<template>
  <div class="timeline-container">
    <!-- 时间线主轴 -->
    <div class="timeline-axis"></div>
    
    <!-- 时间线节点列表 -->
    <div class="timeline-items">
      <div 
        v-for="(item, index) in items" 
        :key="index" 
        class="timeline-item"
        ref="timelineItems"
      >
        <!-- 节点圆点（带动画） -->
        <div class="timeline-dot">
          <div class="dot-pulse"></div>
        </div>
        
        <!-- 节点内容（带进入动画） -->
        <div class="timeline-content">
          <div class="timeline-date">
            <span class="date-marker"></span>
            {{ item.date }}
          </div>
          <h3 class="timeline-title">{{ item.title }}</h3>
          <ul class="timeline-details">
            <li v-for="(detail, i) in item.details" :key="i">{{ detail }}</li>
          </ul>
          <div class="timeline-content-decoration"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

// 接收外部传入的时间线数据
const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  }
})

const timelineItems = ref([])

onMounted(() => {
  // 监听元素进入视图，触发动画
  timelineItems.value.forEach((el, index) => {
    const { stop } = useIntersectionObserver(
      el,
      ([{ isIntersecting }]) => {
        if (isIntersecting) {
          // 延迟动画，创建序列效果
          setTimeout(() => {
            el.classList.add('visible')
          }, index * 150)
          stop()
        }
      },
      { threshold: 0.1 }
    )
  })
})
</script>

<style scoped>
.timeline-container {
  position: relative;
  max-width: 1000px;
  margin: 3rem auto;
  padding: 0 1.5rem;
}

/* 主轴样式 - 更精致的渐变效果 */
.timeline-axis {
  position: absolute;
  left: 1.5rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom,
    var(--vp-c-brand-1) 0%,
    var(--vp-c-brand-2) 30%,
    var(--vp-c-brand-3) 70%,
    var(--vp-c-brand-soft) 100%);
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(58, 122, 58, 0.2);
}

/* 节点容器 */
.timeline-items {
  position: relative;
  padding-left: 3rem;
}

.timeline-item {
  position: relative;
  margin-bottom: 3.5rem;
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 元素进入视图时的动画 - 更流畅的过渡 */
.timeline-item.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 节点圆点 - 增强深度感 */
.timeline-dot {
  position: absolute;
  left: -3rem;
  top: 0.5rem;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: var(--vp-c-bg);
  border: 2px solid var(--vp-c-brand-1);
  z-index: 2;
  box-shadow: 0 0 0 4px rgba(58, 122, 58, 0.1);
  transition: all 0.3s ease;
}

.timeline-item.visible .timeline-dot {
  animation: dotPop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dotPop {
  0% { transform: scale(0.8); }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 呼吸动画效果 - 更自然的节奏 */
.dot-pulse {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  height: 100%;
  background-color: var(--vp-c-brand-1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2.5s infinite cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.8;
  }
  70% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* 内容样式 - 增强卡片质感 */
.timeline-content {
  padding: 1.75rem;
  border-radius: 10px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05), 0 3px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

/* 内容卡片装饰元素 */
.timeline-content-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom,
    var(--vp-c-brand-1) 0%,
    var(--vp-c-brand-2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.timeline-content:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08), 0 6px 12px rgba(0, 0, 0, 0.05);
}

.timeline-content:hover .timeline-content-decoration {
  opacity: 1;
}

/* 日期样式优化 */
.timeline-date {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: 0.3px;
  font-weight: 500;
}

.date-marker {
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' fill='%233a7a3a'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.timeline-content:hover .date-marker {
  opacity: 1;
}

/* 标题样式优化 */
.timeline-title {
  margin: 0 0 1.25rem 0;
  color: var(--vp-c-brand-1);
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.3px;
  transition: color 0.3s ease;
}

.timeline-content:hover .timeline-title {
  color: var(--vp-c-brand-2);
}

/* 详情列表样式优化 */
.timeline-details {
  margin: 0;
  padding-left: 1.75rem;
  list-style: none;
}

.timeline-details li {
  margin: 0.75rem 0;
  line-height: 1.7;
  position: relative;
  color: var(--vp-c-text-1);
  transition: color 0.2s ease;
}

.timeline-details li::before {
  content: '';
  position: absolute;
  left: -1.75rem;
  top: 0.7rem;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--vp-c-brand-1);
  transition: transform 0.2s ease;
}

.timeline-content:hover .timeline-details li::before {
  transform: scale(1.3);
}

.timeline-content:hover .timeline-details li {
  color: var(--vp-c-text-2);
}

/* 响应式调整 - 更细致的断点处理 */
@media (max-width: 768px) {
  .timeline-container {
    margin: 2rem auto;
  }
  
  .timeline-axis {
    left: 1rem;
  }
  
  .timeline-items {
    padding-left: 2rem;
  }
  
  .timeline-item {
    margin-bottom: 2.5rem;
  }
  
  .timeline-dot {
    left: -2rem;
    width: 20px;
    height: 20px;
  }
  
  .timeline-content {
    padding: 1.25rem;
  }
  
  .timeline-title {
    font-size: 1.2rem;
  }
}

/* 深色模式适配增强 */
.dark .timeline-content {
  background-color: var(--vp-c-bg-mute);
  border-color: var(--vp-c-divider-dark);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
}

.dark .timeline-content:hover {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15);
}

.dark .timeline-axis {
  box-shadow: 0 0 10px rgba(95, 182, 95, 0.2);
}

.dark .timeline-dot {
  box-shadow: 0 0 0 4px rgba(95, 182, 95, 0.1);
}

.dark .timeline-details li::before {
  background-color: var(--vp-c-brand-light);
}
</style>
