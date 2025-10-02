# 公告插件使用指南

这是一个为 VitePress 设计的优雅公告插件，具有苹果风格的设计和丝滑的动效。

## ✨ 特性

- 🎨 **苹果风格设计** - 毛玻璃效果、圆角、阴影
- 🚀 **丝滑动效** - 流畅的进入/退出动画
- 📱 **响应式设计** - 完美适配移动端
- 🌙 **深色模式支持** - 自动适配主题
- ⚡ **高性能** - 使用 CSS 动画，避免 JS 动画
- 🔧 **易于配置** - 通过修改配置文件管理公告
- 🎯 **精准定位** - 支持指定页面显示
- ♿ **无障碍支持** - 支持键盘操作和高对比度模式

## 🚀 快速开始

### 1. 安装插件

插件已经集成到主题中，无需额外安装。

### 2. 配置公告

编辑 `config.ts` 文件来管理公告：

```typescript
export const announcements: AnnouncementConfig[] = [
  {
    id: 'welcome-2024',
    title: '欢迎来到 MCLUME',
    content: '🎉 欢迎来到 MCLUME 服务器！',
    type: 'info',
    priority: 100,
    showIcon: true,
    closable: true,
    duration: 8000,
    position: 'top',
    target: ['/'] // 仅在首页显示
  }
]
```

### 3. 使用组件

在需要显示公告的页面或布局中添加：

```vue
<AnnouncementSystem />
```

## 📋 配置选项

### 公告配置 (AnnouncementConfig)

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | - | 公告唯一标识符 |
| `title` | `string` | - | 公告标题 |
| `content` | `string` | - | 公告内容 |
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 公告类型 |
| `priority` | `number` | - | 优先级（数值越大越优先） |
| `startTime` | `string` | - | 开始显示时间 |
| `endTime` | `string` | - | 结束显示时间 |
| `showIcon` | `boolean` | `true` | 是否显示图标 |
| `closable` | `boolean` | `true` | 是否可关闭 |
| `duration` | `number` | `5000` | 自动关闭时间（0表示不自动关闭） |
| `position` | `'top' \| 'bottom'` | `'top'` | 显示位置 |
| `target` | `string[]` | `[]` | 指定显示页面（空数组表示所有页面） |

### 全局配置 (globalConfig)

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxVisible` | `number` | `3` | 最大同时显示数量 |
| `spacing` | `number` | `12` | 公告间距（像素） |
| `animationDuration` | `number` | `400` | 动画持续时间（毫秒） |
| `enableSound` | `boolean` | `false` | 是否启用声音提示 |
| `enableVibration` | `boolean` | `false` | 是否启用震动反馈 |
| `zIndex` | `number` | `99999` | 层级 |
| `enableKeyboard` | `boolean` | `true` | 是否启用键盘快捷键 |
| `showDelay` | `number` | `500` | 显示延迟（毫秒） |

## 🎨 样式定制

插件使用 CSS 变量，可以通过覆盖变量来自定义样式：

```css
:root {
  --announcement-info-color: #007AFF;
  --announcement-success-color: #34C759;
  --announcement-warning-color: #FF9500;
  --announcement-error-color: #FF3B30;
}
```

## 🔧 高级用法

### 动态添加公告

```typescript
import { addAnnouncement, templates } from './plugins/announcement'

// 使用模板
addAnnouncement(templates.welcome('欢迎新用户！'))

// 自定义公告
addAnnouncement({
  id: 'custom-announcement',
  title: '自定义公告',
  content: '这是一个动态添加的公告',
  type: 'info',
  priority: 80,
  showIcon: true,
  closable: true,
  duration: 5000,
  position: 'top',
  target: []
})
```

### 移除公告

```typescript
import { removeAnnouncement, clearAnnouncements } from './plugins/announcement'

// 移除特定公告
removeAnnouncement('announcement-id')

// 清空所有公告
clearAnnouncements()
```

## 🎯 最佳实践

1. **合理设置优先级** - 重要通知使用高优先级（90-100），一般信息使用中等优先级（50-80）
2. **控制显示数量** - 避免同时显示过多公告，建议最多 3 个
3. **设置合适的持续时间** - 重要信息设置为 0（不自动关闭），一般信息 5-8 秒
4. **精准定位页面** - 使用 `target` 属性在特定页面显示相关公告
5. **定期清理** - 删除过期的公告配置，保持配置文件整洁

## 🐛 故障排除

### 公告不显示
- 检查 `target` 配置是否正确
- 确认时间范围设置
- 检查是否被其他样式覆盖

### 动画不流畅
- 检查是否启用了硬件加速
- 确认没有其他 CSS 冲突
- 考虑用户的动画偏好设置

### 移动端显示问题
- 检查响应式样式
- 确认触摸事件正常工作
- 测试不同屏幕尺寸

## 🔄 更新日志

### v1.0.0
- 初始版本发布
- 支持基本公告功能
- 苹果风格设计
- 响应式布局
- 深色模式支持
