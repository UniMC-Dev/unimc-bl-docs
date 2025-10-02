# LOG-日志
*详情见Github*
<!-- 引入组件 -->
<script setup>
import Timeline from '/vercel/path0/.vitepress/theme/components/Timeline.vue'

// 时间线数据
const timelineData = [
    {
    date: '2025/10/02',
    title: '美化文档',
    details: [
      '修改背景图',
      '修改首页图',
      '修改icon',
      '添加公告系统'
    ]
  },
  {
    date: '2025/10/01',
    title: '文档大修改',
    details: [
      '添加日志',
      '删改mb内容',
      '删改链接，重新调整布局',
      '添加命令复制提示',
      '尝试美化主页'
    ]
  }
]
</script>

<!-- 使用组件 -->
<Timeline :items="timelineData" />
