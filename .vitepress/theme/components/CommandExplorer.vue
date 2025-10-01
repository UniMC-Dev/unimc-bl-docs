<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vitepress' // 引入vitepress的toast组件
const commands = ref([
{
    name: '/tpa',
    categories: ['传送'],
    description: '请求传送到另一个玩家的位置',
    usage: '/tpa <玩家名>'
  },
  {
    name: '/tpahere',
    categories: ['传送'],
    description: '请求将另一个玩家传送到你的位置',
    usage: '/tpahere <玩家名>'
  },
  {
    name: '/tpaccept',
    categories: ['传送'],
    description: '接受传送请求',
    usage: '/tpaccept'
  },
  {
    name: '/tpdecline',
    categories: ['传送'],
    description: '拒绝传送请求',
    usage: '/tpdecline'
  },
  {
    name: '/tpignore',
    categories: ['传送'],
    description: '切换 是否 忽视以后所有传送请求',
    usage: '/tpignore'
  },
  {
    name: '/home',
    categories: ['传送'],
    description: '传送到你设置的家',
    usage: '/home [家的名称]'
  },
  {
    name: '/sethome',
    categories: ['传送'],
    description: '设置一个家的位置',
    usage: '/sethome [家的名称]'
  },
  {
    name: '/delhome',
    categories: ['传送'],
    description: '删除一个家的位置',
    usage: '/delhome <家的名称>'
  },
  {
    name: '/phomes',
    categories: ['传送'],
    description: '查看公共家',
    usage: '/phomes'
  },
  {
    name: '/homes',
    categories: ['编辑家'],
    description: '查看家列表，并对其操作',
    usage: '/homes'
  },
  {
    name: '/edithome',
    categories: ['编辑家'],
    description: '重命名',
    usage: '/edithome <name> rename <name>'
  },
  {
    name: '/edithome',
    categories: ['编辑家'],
    description: '重定位至当前坐标',
    usage: '/edithome <name> relocate'
  },
  {
    name: '/edithome',
    categories: ['编辑家'],
    description: '设置为公共',
    usage: '/edithome <name> public'
  },
  {
    name: '/edithome',
    categories: ['编辑家'],
    description: '设置为私人',
    usage: '/edithome <name> private'
  },
  {
    name: '/msg',
    categories: ['聊天'],
    description: '向指定玩家发送私信',
    usage: '/msg <玩家名> <消息>'
  },
  {
    name: '/r',
    categories: ['聊天'],
    description: '回复最后一个私信你的玩家',
    usage: '/r <消息>'
  },
  {
    name: '/pay',
    categories: ['经济'],
    description: '向其他玩家转账',
    usage: '/pay <玩家名> <金额>'
  },
  {
    name: '/shop',
    categories: ['经济'],
    description: '打开服务器商店界面',
    usage: '/shop'
  },
  {
    name: '/fp',
    categories: ['其他'],
    description: '查询bot用法(人间&乐土)',
    usage: '/fp help'
  },
  {
    name: '/bot',
    categories: ['其他'],
    description: '查询bot用法(乐土)',
    usage: '/bot'
  },
  {
    name: '/menu',
    categories: ['其他'],
    description: '打开菜单界面',
    usage: '/menu'
  },
  {
    name: '/s',
    categories: ['其他'],
    description: '切换计分板开关状态，报错需再尝试',
    usage: '/s'
  },
  {
    name: '/co i',
    categories: ['其他'],
    description: '切换为查询模式，可右/左键方块查询记录',
    usage: '/co i'
  },
  {
    name: '/co lookup',
    categories: ['其他'],
    description: '进行全服查询',
    usage: '/co lookup u:<user> t:<time> r:<radius> a:<action> i:<include> e:<exclude>'
  },
  {
    name: '/list',
    categories: ['其他'],
    description: '查看在线玩家列表',
    usage: '/list'
  }
])

// 分类列表
const categories = computed(() => {
  const categorySet = new Set()
  commands.value.forEach(cmd => {
    cmd.categories.forEach(category => categorySet.add(category))
  })
  return Array.from(categorySet)
})

// 搜索和筛选状态
const searchQuery = ref('')
const selectedCategory = ref('全部')
const toast = useToast()

// 复制功能优化 - 添加视觉反馈
const copyToClipboard = (text, event) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      // 显示复制成功提示
      toast.success('指令已复制到剪贴板', { duration: 2000 })
      // 按钮动画效果
      const btn = event.currentTarget
      btn.classList.add('copied')
      setTimeout(() => btn.classList.remove('copied'), 1000)
    })
    .catch(err => {
      toast.error('复制失败，请手动复制', { duration: 2000 })
      console.error('复制失败:', err)
    })
}

// 筛选后的指令列表
const filteredCommands = computed(() => {
  return commands.value.filter(cmd => {
    if (selectedCategory.value !== '全部' && !cmd.categories.includes(selectedCategory.value)) {
      return false
    }
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      return cmd.name.toLowerCase().includes(query) || 
             cmd.description.toLowerCase().includes(query) ||
             cmd.categories.some(cat => cat.toLowerCase().includes(query))
    }
    
    return true
  })
})

// 增加初始化动画
onMounted(() => {
  const cards = document.querySelectorAll('.command-card')
  cards.forEach((card, index) => {
    card.style.setProperty('--index', index)
  })
})
</script>

<template>
  <div class="command-explorer">
    <!-- 搜索和筛选区域 -->
    <div class="command-filters">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索指令或描述..." 
          class="search-input"
          :class="{ focused: isSearchFocused }"
          @focus="isSearchFocused = true"
          @blur="isSearchFocused = false"
        />
        <div class="search-icon">🔍</div>
        <!-- 搜索结果计数 -->
        <div v-if="searchQuery" class="search-results-count">
          找到 {{ filteredCommands.length }} 个结果
        </div>
      </div>
      
      <div class="category-filter">
        <span class="filter-label">分类:</span>
        <div class="category-buttons">
          <button 
            class="category-btn" 
            :class="{ active: selectedCategory === '全部' }" 
            @click="selectedCategory = '全部'"
          >
            全部
          </button>
          <button 
            v-for="category in categories" 
            :key="category" 
            class="category-btn" 
            :class="{ active: selectedCategory === category }" 
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 指令卡片区域 -->
    <div class="command-results">
      <p v-if="filteredCommands.length === 0" class="no-results">
        没有找到匹配的指令，请尝试其他搜索条件。
      </p>
      <div v-else class="command-grid">
        <div 
          v-for="(cmd, index) in filteredCommands" 
          :key="cmd.name + cmd.usage + index" 
          class="command-card"
          :style="{'--index': index}"
        >
          <div class="command-header">
            <h3 class="command-name">{{ cmd.name }}</h3>
            <button 
              class="copy-btn" 
              @click="copyToClipboard(cmd.name, $event)"
              title="复制指令"
            >
              <span class="copy-icon">📋</span>
              <span class="copy-success">✓</span>
            </button>
          </div>
          
          <div class="command-categories">
            <span 
              v-for="(category, catIndex) in cmd.categories" 
              :key="catIndex" 
              class="command-category"
            >
              {{ category }}
            </span>
          </div>
          
          <div class="command-body">
            <p class="command-description">{{ cmd.description }}</p>
            <div class="command-details">
              <div class="detail-item">
                <span class="detail-label">用法:</span>
                <code class="detail-value">{{ cmd.usage }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.command-explorer {
  margin: 2rem 0;
  font-family: var(--vp-font-family-base);
}

/* 搜索和筛选样式优化 */
.command-filters {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.command-filters:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  font-size: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.search-input.focused + .search-icon {
  color: var(--vp-c-brand-1);
  transform: translateY(-50%) scale(1.1);
}

.search-icon {
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--vp-c-text-2);
  pointer-events: none;
  transition: all 0.2s ease;
}

.search-results-count {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
}

.filter-label {
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-right: 0.5rem;
}

.category-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-btn {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.category-btn:hover::after {
  opacity: 1;
}

.category-btn:hover {
  background-color: var(--vp-c-bg-mute);
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-btn.active {
  background-color: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

/* 指令卡片样式优化 */
.command-results {
  margin-top: 1rem;
}

.no-results {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--vp-c-text-2);
  font-style: italic;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px dashed var(--vp-c-divider);
}

.command-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.command-card {
  background-color: var(--vp-c-bg-soft);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid var(--vp-c-divider);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.command-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand-1);
}

.command-header {
  padding: 1rem 1.5rem;
  background-color: var(--vp-c-brand-1);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.command-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.command-card:hover .command-header::after {
  transform: translateX(100%);
}

.command-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.command-name::before {
  content: '/';
  opacity: 0.8;
}

.copy-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.copy-btn .copy-success {
  position: absolute;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.copy-btn.copied .copy-icon {
  opacity: 0;
  transform: scale(0.8);
}

.copy-btn.copied .copy-success {
  opacity: 1;
  transform: scale(1);
}

.copy-icon {
  font-size: 16px;
  transition: all 0.3s ease;
}

.command-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.command-category {
  font-size: 0.8rem;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.command-card:hover .command-category {
  background-color: var(--vp-c-brand-1);
  color: white;
}

.command-body {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.command-description {
  margin-top: 0;
  margin-bottom: 1.2rem;
  color: var(--vp-c-text-1);
  line-height: 1.6;
  font-size: 0.95rem;
}

.command-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: auto;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.detail-label {
  font-weight: 500;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.detail-value {
  color: var(--vp-c-text-1);
}

code {
  background-color: var(--vp-c-bg-mute);
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  color: var(--vp-c-brand-1);
  transition: all 0.2s ease;
}

.command-card:hover code {
  background-color: var(--vp-c-brand-soft);
}

/* 响应式调整优化 */
@media (max-width: 768px) {
  .command-grid {
    grid-template-columns: 1fr;
  }
  
  .category-filter {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .category-buttons {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    flex-wrap: nowrap;
    scrollbar-width: thin;
  }
  
  .category-buttons::-webkit-scrollbar {
    height: 4px;
  }
  
  .category-buttons::-webkit-scrollbar-thumb {
    background-color: var(--vp-c-divider);
    border-radius: 2px;
  }
}

/* 动画效果增强 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.command-card {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: calc(var(--index, 0) * 0.05s);
  opacity: 0;
}

/* 空状态优化 */
.no-results {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
