import { defineConfig } from 'vitepress'
export default defineConfig({
  markdown: { // markdown 配置
    math: true,
    lineNumbers: true, // 行号显示
      container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    },
    image: {
      // 开启图片懒加载
      lazyLoading: true
    },
    // 组件插入h1标题下
    config: (md) => {
      // 创建 markdown-it 插件
      md.use((md) => {
        const defaultRender = md.render
        md.render = function (...args) {
          const [content, env] = args
          const isHomePage = env.path === '/' || env.relativePath === 'index.md'  // 判断是否是首页

          if (isHomePage) {
            return defaultRender.apply(md, args) // 如果是首页，直接渲染内容
          }
          // 在每个 md 文件内容的开头插入组件
          const defaultContent = defaultRender.apply(md, args)
          const component = '<ArticleMetadata />\n'
          return component + defaultContent
        }
      })
    }
  },
  title: "麦系WIKI",
  description: "WIKI",
  head: [["link", {rel:'icon',href:'/favico.png'}]],
  themeConfig: {
        search: { 
      provider: 'local'
    }, 
    logo: "/favico.png",
    nav: [
      { text: '主页', link: '/' },
      { text: '文档首页', link: '/docs/all/start' },
      { text: '直达文档', items:[
        {
          text: 'MCLUME',link: '/docs/mclume'
        },
        {
text: 'MCBUCKET',link: '/docs/mcbucket'
        }
      ] },
      { text: '外链', items:[
        {
          text: 'MCLUME官网',link: 'https://www.mcpool.net'
        },
        {
text: 'UNIMC官网',link: 'https://www.unimc.homes'
        },
        {
          text: 'UNIMC论坛',link: 'https://bbs.unimc.homes'
        }
      ] }
    ],

    sidebar: [
      {
        text: '开始',
        collapsed: false,
        items: [
          { text: '写在前面', link: '/docs/all/start' },
          { text: '最终协议', link: '/docs/all/rules' },
          { text: '语音', link: '/docs/all/语音' },
          { text: '常见问题', link: '/docs/all/ask' }
        ]
      },
      {
        text: 'MCLUME',
        collapsed: false,
        items: [
          { text: '关于', link: '/docs/mclume' },
          {
            text: '内容', collapsed: false, items:
              [
                {
                  text: '区服介绍', link: '/docs/mclume/play/区服'
                },
                {
                  text: '主服', collapsed: false, items: [

                    {
                      text: '菜单', link: '/docs/mclume/play/菜单'
                    },
                    {
                      text: '权限', link: '/docs/mclume/play/权限'
                    },
                    {
                      text: '签到', link: '/docs/mclume/play/签到'
                    },
                    {
                      text: '配方', link: '/docs/mclume/play/配方'
                    },
                    {
                      text: '命令', link: '/docs/mclume/play/命令'
                    }
                  ]
                }
              ]
          }
        ]
      },
      {
        text: 'MCBUCKET',
        collapsed: false,
        items: [
          { text: '关于', link: '/docs/mcbucket' },
          {
            text: '内容', collapsed: false, items:
              [
                {
                  text: '菜单', link: '/docs/mcbucket/plugins/菜单'
                },
                {
                  text: '经济', link: '/docs/mcbucket/plugins/经济'
                },
                {
                  text: '区服', link: '/docs/mcbucket/plugins/区服'
                }
              ]
          }
        ]
      },
      {
        text: '模组服', link: '/docs/mod'
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/UNIMC-DEV' }
    ]
  }
})

