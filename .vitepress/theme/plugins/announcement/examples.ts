/**
 * 公告插件使用示例
 * 这个文件展示了如何配置和使用公告插件
 */

import { addAnnouncement, templates, type AnnouncementConfig } from './index'

// 示例1: 使用预设模板
export function addWelcomeAnnouncement() {
  addAnnouncement(templates.welcome(
    '🎉 欢迎来到 MCLUME 服务器！请仔细阅读游玩守则，享受愉快的游戏体验！'
  ))
}

export function addMaintenanceAnnouncement() {
  addAnnouncement(templates.maintenance(
    '⚠️ 服务器将于今晚 23:00 进行例行维护，预计持续 30 分钟，请提前下线保存进度。',
    '2024-10-02 22:30:00',
    '2024-10-03 00:30:00'
  ))
}

export function addFeatureAnnouncement() {
  addAnnouncement(templates.feature(
    '✨ 新增了互通绑定功能，Java版和基岩版玩家现在可以共享货币数据！',
    ['/docs/mclume', '/docs/mclume/play/互通绑定']
  ))
}

// 示例2: 自定义公告配置
export const customAnnouncements: AnnouncementConfig[] = [
  // 节日活动公告
  {
    id: 'halloween-2024',
    title: '万圣节活动',
    content: '🎃 万圣节特别活动现已开启！完成任务获得限定奖励，活动持续到11月5日！',
    type: 'success',
    priority: 85,
    startTime: '2024-10-25',
    endTime: '2024-11-05',
    showIcon: true,
    closable: true,
    duration: 10000,
    position: 'top',
    target: ['/docs/mclume', '/docs/mclume/play']
  },
  
  // 规则更新通知
  {
    id: 'rules-update-v2',
    title: '规则更新',
    content: '📋 服务器规则已更新，新增了关于建筑保护的条款，请及时查看。',
    type: 'info',
    priority: 75,
    showIcon: true,
    closable: true,
    duration: 0, // 不自动关闭
    position: 'top',
    target: ['/docs/mclume/rules']
  },
  
  // 技术问题通知
  {
    id: 'known-issue-lag',
    title: '已知问题',
    content: '🔧 我们已知晓部分玩家遇到的延迟问题，技术团队正在积极修复中。',
    type: 'warning',
    priority: 80,
    showIcon: true,
    closable: true,
    duration: 12000,
    position: 'top',
    target: []
  },
  
  // 社区活动公告
  {
    id: 'community-build',
    title: '社区建设活动',
    content: '🏗️ 本月社区建设主题：「未来城市」，优秀作品将获得特殊称号！',
    type: 'success',
    priority: 60,
    startTime: '2024-10-01',
    endTime: '2024-10-31',
    showIcon: true,
    closable: true,
    duration: 8000,
    position: 'top',
    target: ['/docs/mclume']
  }
]

// 示例3: 动态公告管理
export class AnnouncementManager {
  private static instance: AnnouncementManager
  
  static getInstance(): AnnouncementManager {
    if (!AnnouncementManager.instance) {
      AnnouncementManager.instance = new AnnouncementManager()
    }
    return AnnouncementManager.instance
  }
  
  // 添加临时公告（页面刷新后消失）
  addTemporaryAnnouncement(content: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const announcement: AnnouncementConfig = {
      id: `temp-${Date.now()}`,
      title: '临时通知',
      content,
      type,
      priority: 95,
      showIcon: true,
      closable: true,
      duration: 5000,
      position: 'top',
      target: []
    }
    
    addAnnouncement(announcement)
    return announcement.id
  }
  
  // 添加基于用户行为的公告
  addBehaviorBasedAnnouncement(userAction: string) {
    const behaviorAnnouncements: Record<string, AnnouncementConfig> = {
      'first-visit': {
        id: 'first-visit-guide',
        title: '新手指引',
        content: '👋 看起来你是第一次访问，建议先查看「开始指南」了解服务器基本信息！',
        type: 'info',
        priority: 90,
        showIcon: true,
        closable: true,
        duration: 0,
        position: 'top',
        target: []
      },
      
      'return-visit': {
        id: 'welcome-back',
        title: '欢迎回来',
        content: '🎮 欢迎回来！查看最新更新和活动信息，不要错过精彩内容！',
        type: 'success',
        priority: 70,
        showIcon: true,
        closable: true,
        duration: 6000,
        position: 'top',
        target: []
      }
    }
    
    const announcement = behaviorAnnouncements[userAction]
    if (announcement) {
      addAnnouncement(announcement)
      return announcement.id
    }
    
    return null
  }
  
  // 添加基于时间的公告
  addTimeBasedAnnouncement() {
    const now = new Date()
    const hour = now.getHours()
    
    let announcement: AnnouncementConfig | null = null
    
    if (hour >= 0 && hour < 6) {
      announcement = {
        id: 'late-night-tip',
        title: '深夜提醒',
        content: '🌙 夜深了，注意休息哦！适度游戏，健康生活。',
        type: 'info',
        priority: 50,
        showIcon: true,
        closable: true,
        duration: 8000,
        position: 'top',
        target: []
      }
    } else if (hour >= 6 && hour < 12) {
      announcement = {
        id: 'morning-greeting',
        title: '早安',
        content: '🌅 早上好！新的一天开始了，祝你游戏愉快！',
        type: 'success',
        priority: 50,
        showIcon: true,
        closable: true,
        duration: 6000,
        position: 'top',
        target: []
      }
    }
    
    if (announcement) {
      addAnnouncement(announcement)
      return announcement.id
    }
    
    return null
  }
}

// 使用示例
export function initializeExampleAnnouncements() {
  const manager = AnnouncementManager.getInstance()
  
  // 根据时间添加问候语
  manager.addTimeBasedAnnouncement()
  
  // 检查是否是首次访问（这里只是示例，实际需要结合本地存储或用户系统）
  const isFirstVisit = !localStorage.getItem('visited-before')
  if (isFirstVisit) {
    manager.addBehaviorBasedAnnouncement('first-visit')
    localStorage.setItem('visited-before', 'true')
  } else {
    manager.addBehaviorBasedAnnouncement('return-visit')
  }
}

