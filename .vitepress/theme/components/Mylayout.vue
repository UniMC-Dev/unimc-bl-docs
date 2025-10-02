<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { nextTick, provide } from 'vue'

const { isDark } = useData()

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  // 计算从点击位置到屏幕角落的最大距离（动画终点）
  const maxRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  )

  // 动画路径：始终从0扩展到最大（新状态元素的显示逻辑）
  const clipPath = [
    `circle(0px at ${x}px ${y}px)`, // 起点：点击位置的0半径圆
    `circle(${maxRadius}px at ${x}px ${y}px)` // 终点：覆盖全屏的圆
  ]

  // 启动视图过渡
  const transition = document.startViewTransition(async () => {
    // 切换主题状态
    isDark.value = !isDark.value
    await nextTick() // 确保DOM更新完成
  })

  // 等待过渡准备就绪后执行动画（关键：绑定到过渡的update阶段）
  transition.updateCallbackDone.then(() => {
    document.documentElement.animate(
      { clipPath }, // 移除反转逻辑，始终用扩展路径
      {
        duration: 300,
        easing: 'ease-in-out',
        pseudoElement: `::view-transition-new(root)` // 始终动画新状态元素
      }
    )
  })
})
</script>

<template>
  <DefaultTheme.Layout v-bind="$attrs">
    <!-- doc-footer-before插槽 -->
  </DefaultTheme.Layout>
  
  <!-- 公告系统 -->
  <AnnouncementSystem />
</template>

<style scoped>
</style>

<style>
/* 视图过渡基础样式：禁用默认动画，确保层级正确 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* 核心：新状态始终在顶层覆盖旧状态 */
::view-transition-old(root) {
  z-index: 1;
}
::view-transition-new(root) {
  z-index: 9999;
}

/* 修复开关按钮样式偏移 */
.VPSwitchAppearance .check {
  transform: none !important;
}
.VPSwitchAppearance .check .icon {
  top: -2px;
}
</style>
