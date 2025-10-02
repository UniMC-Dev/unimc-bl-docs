# UNIMC 服务器文档站 🚀

嘿，方块人！这是 MCLUME 服务器的官方说明书，用 VitePress 捣鼓的

## 这玩意儿是啥？

简单说，就是给 UNIMC 旗下服务器（MCLUME）玩家搭的「生存指南」。用了 VitePress 这工具，页面滑得比鞘翅还顺，还能自动切换亮色/暗色模式（再也不怕晚上肝文档瞎眼了）。

## 这货能干嘛？

- **文档展示**：服务器玩法、规则、FAQ 全在这儿，比村民的交易列表还清晰
- **公告系统**：自带苹果风 Buff（毛玻璃、圆角、阴影，懂的都懂），滑入滑出比末影珍珠还丝滑
  - 手机电脑通吃，躺床上看也不翻车
  - 会自己适配亮色/暗色模式，比幻翼还懂昼夜
  - 能设优先级，重要消息插队不挨打
  - 还能指定页面显示，精准推送不骚扰
  - 支持键盘操作（按ESC就能关，比拆红石电路简单）
  - 可自动关闭也能手动关，想留想走随你意
- **自定义皮肤**：能换背景图，想把服务器风景挂上去？安排！
- **搜搜更健康**：内置搜索功能，找命令比找要塞还快

## 快速上手（比搭地狱门简单）

### 准备工作

- Node.js 18+（版本太低会像没附魔的镐子一样慢）
- npm 或 yarn（选一个当你的工作台）

### 步骤拆解

1. 克隆仓库（就像挖方块，一挖一个准）
   ```bash
   git clone https://github.com/你的用户名/unimc-bl-docs.git
   cd unimc-bl-docs
   ```

2. 安装依赖（收集材料环节，缺啥补啥）
   ```bash
   npm install
   ```

3. 启动开发服（开个测试世界看看效果）
   ```bash
   npm run docs:dev
   ```

4. 访问地址：`http://localhost:5173`（传送门已激活）

### 打包发布（准备上架服务器）
npm run docs:build  # 打包成静态文件（就像把物品放进箱子）
npm run docs:preview  # 预览打包结果（开箱检查）
## 文件夹长啥样？
unimc-bl-docs/
├── docs/                 # 文档本体（全是知识点）
│   ├── all/              # 通用内容（公告、FAQ 啥的）
│   ├── mcbucket/         # MCBUCKET 服务器专属攻略
│   └── mclume/           # MCLUME 服务器秘籍
├── public/               # 静态资源（图片、图标，比战利品还香）
├── .vitepress/           # VitePress 配置（相当于服务器配置文件）
│   ├── config.mts        # 站点设置（改个名、换个图标都在这）
│   ├── theme/            # 主题定制（换皮肤就找它）
│   │   ├── style/        # 样式文件（改颜色、调布局）
│   │   │   ├── blockquote.css  # 引用块样式
│   │   │   ├── custom-block.css # 自定义块样式
│   │   │   └── var.css    # 变量定义（颜色、尺寸啥的）
│   │   └── plugins/
│   │       └── announcement/  # 公告插件（消息推送全靠它）
├── package.json          # 依赖清单（需要啥工具都在这写着）
└── LICENSE               # 许可证（规矩还是要讲的）
## 公告插件咋玩？

这插件比红石电路简单，看一眼就会：

### 基本配置

1. 配置文件在这：`.vitepress/theme/plugins/announcement/config.ts`
2. 举个栗子（复制粘贴改改就行）：
   ```typescript
   export const announcements = [
     {
       id: 'welcome',
       title: '欢迎光临～',
       content: '🎉 新服开张，来玩送钻石（bushi）',
       type: 'info',       // 类型：info/success/warning/error
       priority: 100,      // 优先级拉满，第一个跳出来（0-100）
       duration: 8000,     // 8秒后自动消失，0表示不自动关
       showIcon: true,     // 显示图标，花里胡哨才好看
       closable: true,     // 允许手动关闭，别太霸道
       position: 'top',    // 显示位置：top/bottom
       target: ['/']       // 只在首页显示，不骚扰老玩家
     }
   ]
   ```

### 样式定制（换皮肤环节）

想改颜色？简单！在CSS里覆盖变量就行：:root {
  --announcement-info-color: #007AFF;    /* 信息类公告颜色 */
  --announcement-success-color: #34C759; /* 成功类公告颜色 */
  --announcement-warning-color: #FF9500; /* 警告类公告颜色 */
  --announcement-error-color: #FF3B30;   /* 错误类公告颜色 */
}
### 高级操作（红石大师专属）

- **定时公告**：用`startTime`和`endTime`设置显示时间段，比闹钟还准时
- **条件显示**：结合代码动态添加公告，比如凌晨推送休息提醒：
  ```typescript
  // 深夜提醒示例
  if (new Date().getHours() >= 0 && new Date().getHours() < 6) {
    addAnnouncement({
      id: 'late-night',
      title: '夜深了',
      content: '🌙 该睡了，别肝了兄弟',
      type: 'info',
      priority: 50,
      duration: 10000
    })
  }
  ```

### 故障排除（修bug时间）

- 公告不显示？检查`target`路径对不对，是不是被其他样式盖住了
- 手机上乱掉？看看响应式样式，测测不同屏幕尺寸
- 动画卡成PPT？检查有没有开硬件加速，是不是和其他CSS冲突了

### 最佳实践（老玩家经验）

1. 重要通知优先级设90-100，一般消息50-80就行
2. 别一次弹太多，最多3个，不然像被僵尸围攻
3. 重要的设`duration: 0`（不自动关），一般的5-8秒够看了
4. 定期清理过期公告，配置文件别堆成垃圾场

## 许可证

本项目用 [Apache License 2.0](LICENSE) 开源，随便改，但别拿去卖钱哦～ 不然腐竹会顺着网线来打你（开玩笑的，但要讲武德）
