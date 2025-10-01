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
          <div class="timeline-date">{{ item.date }}</div>
          <h3 class="timeline-title">{{ item.title }}</h3>
          <ul class="timeline-details">
            <li v-for="(detail, i) in item.details" :key="i">{{ detail }}</li>
          </ul>
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
  margin: 2rem auto;
  padding: 0 1.5rem;
}

/* 主轴样式 */
.timeline-axis {
  position: absolute;
  left: 1.5rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom,
    var(--vp-c-brand-1) 0%,
    var(--vp-c-brand-soft) 100%);
  transform: translateX(-50%);
}

/* 节点容器 */
.timeline-items {
  position: relative;
  padding-left: 3rem;
}

.timeline-item {
  position: relative;
  margin-bottom: 3rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 元素进入视图时的动画 */
.timeline-item.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 节点圆点 */
.timeline-dot {
  position: absolute;
  left: -3rem;
  top: 0.5rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--vp-c-bg);
  border: 2px solid var(--vp-c-brand-1);
  z-index: 2;
}

/* 呼吸动画效果 */
.dot-pulse {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  height: 100%;
  background-color: var(--vp-c-brand-1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* 内容样式 */
.timeline-content {
  padding: 1.5rem;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.timeline-content:hover {
  transform: translateY(-5px);
}

.timeline-date {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 日期前的SVG图标（与首页风格统一） */
.timeline-date::before {
  content: '';
  background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' fill='%233a7a3a'/%3E%3C/svg%3E");
  width: 16px;
  height: 16px;
  display: inline-block;
}

.timeline-title {
  margin: 0 0 1rem 0;
  color: var(--vp-c-brand-1);
  font-size: 1.2rem;
  font-weight: 600;
}

.timeline-details {
  margin: 0;
  padding-left: 1.5rem;
  list-style: none; /* 新增：隐藏默认列表符号 */
}

.timeline-details li {
  margin: 0.5rem 0;
  line-height: 1.6;
  position: relative;
}

.timeline-details li::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 0.7rem;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--vp-c-brand-1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .timeline-axis {
    left: 1rem;
  }
  .timeline-items {
    padding-left: 2rem;
  }
  .timeline-item {
    margin-bottom: 2rem;
  }
  .timeline-dot {
    left: -2rem;
  }
  .timeline-content {
    padding: 1rem;
  }
}

/* 深色模式适配 */
.dark .timeline-content {
  background-color: var(--vp-c-bg-mute);
  border-color: var(--vp-c-divider-dark);
}

.dark .timeline-details li::before {
  background-color: var(--vp-c-brand-light);
}
</style>
