<!-- 引入组件 -->
<script setup>
import Timeline from '../.vitepress/theme/components/Timeline.vue'

// 时间线数据
const timelineData = [
  {
    date: '2025/10/01',
    title: '文档大修改',
    details: [
      '添加日志',
      '删改mb内容',
      '删改链接，重新调整布局'
    ]
  }
]
</script>

<!-- 使用组件 -->
<Timeline :items="timelineData" />
