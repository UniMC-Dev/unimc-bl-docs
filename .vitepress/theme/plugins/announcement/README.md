# 公告插件使用指南

这是一个为 VitePress 设计的高颜值公告插件，具有灵感自苹果系统的毛玻璃风格和流畅动画，支持响应式和多种高级功能，方便你在文档网站优雅地展示重要信息。

## ✨ 主要特性

- 🎨 **苹果风格设计**：毛玻璃卡片、圆角、层次阴影
- 🚀 **丝滑动效**：进入/退出/排序均有自然过渡动画
- 📱 **响应式布局**：自动适配移动端和不同屏幕尺寸
- 🌙 **深色模式支持**：自动适应主题切换
- ⚡ **高性能**：CSS 动画，优化重绘，无多余 JS 运算
- 🔧 **声明式配置**：通过 TypeScript 配置文件集中管理公告内容与显示规则
- 🎯 **精准页面定位**：支持按页面路径精确控制公告显示范围
- ⏰ **定时公告**：可指定开始/结束时间自动管理活动类公告
- ♿ **无障碍支持**：支持键盘操作（ESC关闭）、高对比度模式
- 🛠️ **动态 API**：支持运行时动态添加/移除/修改公告
- 🏷️ **优先级与最大显示数**：可配置同屏最多显示数量，按优先级自动排序

## 🚀 快速开始

### 1. 插件集成

已默认集成于主题，无需单独安装。

### 2. 配置公告

编辑 `.vitepress/theme/plugins/announcement/config.ts`，按如下示例添加或修改公告：

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
    target: ['/'] // 仅首页显示
  }
]
```

### 3. 使用组件

在你的布局或页面中添加：

```vue
<AnnouncementSystem />
```

## 📋 配置参考

### 公告配置 (AnnouncementConfig)

| 属性        | 类型                                                    | 说明                       |
|-------------|--------------------------------------------------------|----------------------------|
| `id`        | `string`                                               | 公告唯一标识符（必须唯一） |
| `title`     | `string`                                               | 公告标题                   |
| `content`   | `string`                                               | 公告正文内容               |
| `type`      | `'info' \| 'success' \| 'warning' \| 'error'`          | 公告类型                   |
| `priority`  | `number`                                               | 显示优先级，数值越大越优先 |
| `startTime` | `string`                                               | 开始显示时间（可选）       |
| `endTime`   | `string`                                               | 结束显示时间（可选）       |
| `showIcon`  | `boolean`                                              | 是否显示类型图标           |
| `closable`  | `boolean`                                              | 是否可手动关闭             |
| `duration`  | `number`                                               | 自动关闭时间（毫秒，0为常显） |
| `position`  | `'top' \| 'bottom'`                                    | 显示位置                   |
| `target`    | `string[]`                                             | 显示页面路径（空为全站）   |

### 全局配置 (globalConfig)

| 属性               | 类型     | 默认值  | 说明                    |
|--------------------|----------|---------|-------------------------|
| `maxVisible`       | `number` | `3`     | 同时最多显示的公告数    |
| `spacing`          | `number` | `12`    | 公告间距（像素）        |
| `animationDuration`| `number` | `400`   | 动画时长（毫秒）        |
| `enableSound`      | `boolean`| `false` | 是否启用声音提示        |
| `enableVibration`  | `boolean`| `false` | 是否启用震动反馈        |
| `zIndex`           | `number` | `99999` | 公告容器层级            |
| `enableKeyboard`   | `boolean`| `true`  | 是否启用 ESC 快捷关闭   |
| `showDelay`        | `number` | `500`   | 公告显示延迟（毫秒）    |

## 🎨 样式定制

插件采用 CSS 变量与响应式单位，可通过全局样式覆盖变量调整色彩：

```css
:root {
  --announcement-info-color: #007AFF;
  --announcement-success-color: #34C759;
  --announcement-warning-color: #FF9500;
  --announcement-error-color: #FF3B30;
}
```

## 🛠️ 高级用法

### 动态 API 示例

```typescript
import { addAnnouncement, removeAnnouncement, clearAnnouncements, templates } from './plugins/announcement'

// 使用预设模板快速添加
addAnnouncement(templates.welcome('欢迎新用户！'))

// 添加自定义公告
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

// 移除特定公告
removeAnnouncement('custom-announcement')

// 清空所有公告
clearAnnouncements()
```

## 🎯 最佳实践

1. **优先级合理分配**：重要通知用高优先级（90~100），普通信息用中低优先级，避免重要内容被覆盖。
2. **控制同屏数量**：建议 maxVisible ≤ 3，保持界面简洁不干扰主内容。
3. **精准页面定位**：使用 `target` 属性仅在相关页面显示对应公告。
4. **定时活动公告**：利用 `startTime` 和 `endTime` 管理节日或限时活动类公告，无需手动下线。
5. **无障碍支持**：允许用户通过 ESC 快捷关闭，适配高对比度及减少动画偏好。

## 🐛 故障排查

- 公告未显示：检查 `target` 配置、时间范围、优先级与页面路径是否匹配。
- 动画异常：确保无外部 CSS 冲突，浏览器未开启“减少动画”模式。
- 移动端问题：检查响应式样式，建议在多设备测试。

## 🔄 更新日志

### v1.0.0
- 初始版本发布，支持公告管理/优先级/动画/定时/动态API/苹果风设计/深色模式/响应式布局

---

本插件设计用于高频变更、高优雅展示场景，适合所有 VitePress 文档项目。如需更多用法或定制，请查阅 [QUICK_START.md](./QUICK_START.md) 或阅读源码。
