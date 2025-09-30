<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="rating-modal" @click.stop>
      <!-- Заголовок -->
      <div class="modal-header">
        <h2 class="modal-title">▲ Рейтинг игроков</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
        
      <!-- Навигация по рейтингам -->
      <div class="nav-section">
        <button 
          v-for="tab in ratingTabs" 
          :key="tab.id"
          class="nav-btn"
          :class="{ active: activeTab === tab.id }"
          @click="setActiveTab(tab.id)"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span class="nav-text">{{ tab.name }}</span>
        </button>
      </div>
        
      <!-- Контент рейтинга -->
      <div class="content-section">
        <!-- Общий рейтинг -->
        <div v-if="activeTab === 'overall'" class="rating-content">
          <div class="rating-header">
            <h3>◉ Общий рейтинг</h3>
              <div class="time-filter">
                <select v-model="timeFilter" @change="updateRankings">
                  <option value="all">За все время</option>
                  <option value="month">За месяц</option>
                  <option value="week">За неделю</option>
                  <option value="day">За день</option>
                </select>
              </div>
            </div>
            
            <div class="leaderboard">
              <!-- Индикатор загрузки -->
              <div v-if="isLoadingRankings" class="loading-indicator">
                <div class="loading-spinner">🔄</div>
                <p>Загрузка рейтинга...</p>
              </div>
              
              <!-- Список игроков -->
              <div 
                v-for="(player, index) in overallRankings" 
                :key="player.id"
                class="player-card"
                :class="{ 
                  'top-3': index < 3, 
                  'current-player': player.isCurrentPlayer 
                }"
              >
                <div class="rank">
                  <span v-if="index < 3" class="medal">{{ medals[index] }}</span>
                  <span v-else class="rank-number">{{ index + 1 }}</span>
                </div>
                
                <div class="player-avatar">
                  <span class="avatar-emoji">{{ player.avatar }}</span>
                  <div v-if="player.isOnline" class="online-indicator"></div>
                </div>
                
                <div class="player-info">
                  <div class="player-name">{{ player.name }}</div>
                  <div class="player-level">Уровень {{ player.level }}</div>
                </div>
                
                <div class="player-stats">
                  <div class="stat">
                    <span class="stat-label">Очки:</span>
                    <span class="stat-value">{{ player.points.toLocaleString() }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Достижения:</span>
                    <span class="stat-value">{{ player.achievements }}</span>
                  </div>
                </div>
                
                <div class="player-badge">
                  <span class="badge">{{ player.badge }}</span>
                </div>
              </div>
            </div>
          </div>
          
        <!-- Рейтинг по компании -->
        <div v-if="activeTab === 'company'" class="rating-content">
          <div class="rating-header">
            <h3>■ Рейтинг компаний</h3>
              <div class="sort-filter">
                <select v-model="companySort" @change="updateCompanyRankings">
                  <option value="revenue">По доходу</option>
                  <option value="reputation">По репутации</option>
                  <option value="employees">По сотрудникам</option>
                  <option value="products">По товарам</option>
                </select>
              </div>
            </div>
            
            <div class="company-leaderboard">
              <div 
                v-for="(company, index) in companyRankings" 
                :key="company.id"
                class="company-card"
                :class="{ 'top-3': index < 3 }"
              >
                <div class="rank">
                  <span v-if="index < 3" class="medal">{{ medals[index] }}</span>
                  <span v-else class="rank-number">{{ index + 1 }}</span>
                </div>
                
                <div class="company-logo">
                  <span class="logo-emoji">{{ company.logo }}</span>
                </div>
                
                <div class="company-info">
                  <div class="company-name">{{ company.name }}</div>
                  <div class="company-owner">Владелец: {{ company.owner }}</div>
                  <div class="company-level">Уровень {{ company.level }}</div>
                </div>
                
                <div class="company-stats">
                  <div class="stat">
                    <span class="stat-label">Доход:</span>
                    <span class="stat-value">💰 {{ company.revenue.toLocaleString() }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Репутация:</span>
                    <span class="stat-value">⭐ {{ company.reputation }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Сотрудники:</span>
                    <span class="stat-value">👥 {{ company.employees }}</span>
                  </div>
                </div>
                
                <div class="company-badge">
                  <span class="badge">{{ company.badge }}</span>
                </div>
              </div>
            </div>
          </div>
          
        <!-- Рейтинг по мини-играм -->
        <div v-if="activeTab === 'minigames'" class="rating-content">
          <div class="rating-header">
            <h3>● Рейтинг мини-игр</h3>
              <div class="game-filter">
                <select v-model="selectedGame" @change="updateMinigameRankings">
                  <option value="all">Все игры</option>
                  <option v-for="game in minigames" :key="game.id" :value="game.id">
                    {{ game.name }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="minigame-leaderboard">
              <!-- Индикатор загрузки -->
              <div v-if="isLoadingRankings" class="loading-indicator">
                <div class="loading-spinner">🔄</div>
                <p>Загрузка рейтинга мини-игр...</p>
              </div>
              
              <!-- Список игроков -->
              <div 
                v-for="(player, index) in minigameRankings" 
                :key="player.id"
                class="minigame-card"
                :class="{ 'top-3': index < 3 }"
              >
                <div class="rank">
                  <span v-if="index < 3" class="medal">{{ medals[index] }}</span>
                  <span v-else class="rank-number">{{ index + 1 }}</span>
                </div>
                
                <div class="player-avatar">
                  <span class="avatar-emoji">{{ player.avatar }}</span>
                </div>
                
                <div class="player-info">
                  <div class="player-name">{{ player.name }}</div>
                  <div class="game-name">{{ player.gameName }}</div>
                </div>
                
                <div class="game-stats">
                  <div class="stat">
                    <span class="stat-label">Счет:</span>
                    <span class="stat-value">{{ player.score.toLocaleString() }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Игр:</span>
                    <span class="stat-value">{{ player.gamesPlayed }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Побед:</span>
                    <span class="stat-value">{{ player.wins }}</span>
                  </div>
                </div>
                
                <div class="win-rate">
                  <span class="rate-label">Побед:</span>
                  <span class="rate-value">{{ player.winRate }}%</span>
                </div>
              </div>
            </div>
          </div>
          
        <!-- Моя статистика -->
        <div v-if="activeTab === 'my-stats'" class="rating-content">
          <div class="rating-header">
            <h3>◆ Моя статистика</h3>
            </div>
            
          <div class="my-stats-grid">
            <div class="stat-card">
              <div class="stat-icon">▲</div>
              <div class="stat-info">
                <div class="stat-title">Общий рейтинг</div>
                <div class="stat-value">{{ myStats.overallRank }}</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">■</div>
              <div class="stat-info">
                <div class="stat-title">Заработано</div>
                <div class="stat-value">{{ myStats.totalEarned.toLocaleString() }}</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">●</div>
              <div class="stat-info">
                <div class="stat-title">Игр сыграно</div>
                <div class="stat-value">{{ myStats.gamesPlayed }}</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">◉</div>
              <div class="stat-info">
                <div class="stat-title">Достижений</div>
                <div class="stat-value">{{ myStats.achievements }}</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">◆</div>
              <div class="stat-info">
                <div class="stat-title">Друзей</div>
                <div class="stat-value">{{ myStats.friends }}</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">▲</div>
              <div class="stat-info">
                <div class="stat-title">Уровень компании</div>
                <div class="stat-value">{{ myStats.companyLevel }}</div>
              </div>
            </div>
          </div>
            
          <div class="achievements-section">
            <h4>▲ Все достижения</h4>
            
            <!-- Индикатор загрузки -->
            <div v-if="isLoadingAchievements" class="loading-indicator">
              <div class="loading-spinner">🔄</div>
              <p>Загрузка достижений...</p>
            </div>
            
            <!-- Список достижений -->
            <div v-else class="achievements-list">
              <div 
                v-for="achievement in allAchievements" 
                :key="achievement.achievement_id"
                class="achievement-item"
                :class="{ 
                  'unlocked': achievement.is_unlocked,
                  'locked': !achievement.is_unlocked,
                  [`rarity-${achievement.rarity}`]: true
                }"
              >
                <div class="achievement-icon-wrapper">
                  <span class="achievement-icon">{{ achievement.achievement_icon }}</span>
                  <div v-if="achievement.is_unlocked" class="unlocked-badge">✓</div>
                </div>
                
                <div class="achievement-info">
                  <div class="achievement-name">{{ achievement.achievement_name }}</div>
                  <div class="achievement-description">{{ achievement.description }}</div>
                  
                  <!-- Прогресс-бар для неразблокированных достижений -->
                  <div v-if="!achievement.is_unlocked" class="achievement-progress">
                    <div class="progress-info">
                      <span class="progress-text">{{ formatProgress(achievement.current_progress, achievement.target_value) }}</span>
                      <span class="progress-percent">{{ achievement.progress_percent }}%</span>
                    </div>
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        :style="{ width: achievement.progress_percent + '%' }"
                        :class="`rarity-${achievement.rarity}`"
                      ></div>
                    </div>
                  </div>
                  
                  <!-- Дата получения для разблокированных -->
                  <div v-else class="achievement-date">
                    Дата получения: {{ formatAchievementDate(achievement.unlocked_at || '') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlayerPoints, type Achievement } from '@/composables/usePlayerPoints'

// Эмиты
const emit = defineEmits<{
  close: []
}>()

// Composable для работы с очками
const { 
  getLeaderboard, 
  getPlayerStats, 
  getMinigamesLeaderboard, 
  getPlayerAchievements,
  getAllAchievementsWithProgress
} = usePlayerPoints()

// Состояние
const activeTab = ref('overall')
const timeFilter = ref('all')
const companySort = ref('revenue')
const selectedGame = ref('all')
const currentTime = ref('')

// Медиали (однотонные)
const medals = ['●', '▲', '■']

// Вкладки рейтинга
const ratingTabs = ref([
  { id: 'overall', name: 'Общий', icon: '◉' },
  { id: 'company', name: 'Компании', icon: '■' },
  { id: 'minigames', name: 'Мини-игры', icon: '●' },
  { id: 'my-stats', name: 'Мои данные', icon: '◆' }
])

// Типы для рейтингов
interface PlayerRanking {
  id: string
  name: string
  avatar: string
  level: number
  points: number
  achievements: number
  badge: string
  isOnline: boolean
  isCurrentPlayer: boolean
}

interface CompanyRanking {
  id: string
  name: string
  logo: string
  owner: string
  level: number
  revenue: number
  reputation: number
  employees: number
  badge: string
}

interface MinigameRanking {
  id: string
  name: string
  avatar: string
  gameName: string
  score: number
  gamesPlayed: number
  wins: number
  winRate: number
}

// Общий рейтинг (будет загружен из базы данных)
const overallRankings = ref<PlayerRanking[]>([])
const isLoadingRankings = ref(false)

// Рейтинг компаний (пока пустой, будет заполнен позже)
const companyRankings = ref<CompanyRanking[]>([])

// Мини-игры
const minigames = ref([
  { id: 'material_auction', name: 'Аукцион материалов' },
  { id: 'fashion_battle', name: 'Fashion Battle' },
  { id: 'logistics_race', name: 'Логистическая гонка' }
])

// Рейтинг мини-игр (пока пустой, будет заполнен позже)
const minigameRankings = ref<MinigameRanking[]>([])

// Моя статистика (будет загружена из базы данных)
const myStats = ref({
  overallRank: 0,
  totalEarned: 0,
  gamesPlayed: 0,
  achievements: 0,
  friends: 0,
  companyLevel: 1,
  recentAchievements: [
    { id: 1, name: 'Первые деньги', icon: '■', date: 'Сегодня' },
    { id: 2, name: 'Новичок', icon: '●', date: 'Сегодня' },
    { id: 3, name: 'Регистрация', icon: '▲', date: 'Сегодня' }
  ]
})

// Все достижения с прогрессом
const allAchievements = ref<Achievement[]>([])
const isLoadingAchievements = ref(false)

// Таймер для времени
let timeInterval: NodeJS.Timeout

// Установка активной вкладки
const setActiveTab = async (tabId: string) => {
  activeTab.value = tabId
  
  // Загружаем данные при переключении вкладок
  if (tabId === 'overall') {
    await loadOverallRankings()
  } else if (tabId === 'minigames') {
    await loadMinigamesRankings()
  } else if (tabId === 'my-stats') {
    await loadMyStats()
  }
}

// Загрузка рейтинга игроков
const loadOverallRankings = async () => {
  try {
    isLoadingRankings.value = true
    const rankings = await getLeaderboard(50, 0) // Загружаем топ 50
    
    overallRankings.value = rankings.map((entry, index) => ({
      id: entry.user_id,
      name: entry.username,
      avatar: getRandomAvatar(),
      level: Math.floor(entry.total_points / 1000) + 1, // Уровень на основе очков
      points: entry.total_points,
      achievements: Math.floor(entry.games_played / 5), // Достижения на основе игр
      badge: getBadgeByRank(index + 1),
      isOnline: Math.random() > 0.3, // Случайный онлайн статус
      isCurrentPlayer: false // Будет установлено позже
    }))
    
    console.log('✅ Рейтинг игроков загружен:', overallRankings.value.length)
  } catch (error) {
    console.error('Ошибка при загрузке рейтинга:', error)
  } finally {
    isLoadingRankings.value = false
  }
}

// Загрузка рейтинга мини-игр
const loadMinigamesRankings = async () => {
  try {
    isLoadingRankings.value = true
    const gameType = selectedGame.value === 'all' ? undefined : selectedGame.value as any
    
    const rankings = await getMinigamesLeaderboard(gameType, 50, 0)
    
    minigameRankings.value = rankings.map((entry) => ({
      id: entry.user_id,
      name: entry.username,
      avatar: getRandomAvatar(),
      gameName: getGameDisplayName(entry.game_type),
      score: entry.total_points,
      gamesPlayed: entry.games_played,
      wins: Math.floor(entry.games_played * 0.7), // Примерный расчет побед
      winRate: Math.round((entry.games_played * 0.7 / entry.games_played) * 100) || 0
    }))
    
    console.log('✅ Рейтинг мини-игр загружен:', minigameRankings.value.length)
  } catch (error) {
    console.error('Ошибка при загрузке рейтинга мини-игр:', error)
  } finally {
    isLoadingRankings.value = false
  }
}

// Загрузка всех достижений с прогрессом
const loadAllAchievements = async () => {
  try {
    isLoadingAchievements.value = true
    const achievements = await getAllAchievementsWithProgress()
    allAchievements.value = achievements
    console.log('✅ Все достижения загружены:', achievements.length)
  } catch (error) {
    console.error('Ошибка при загрузке достижений:', error)
  } finally {
    isLoadingAchievements.value = false
  }
}

// Загрузка статистики игрока
const loadMyStats = async () => {
  try {
    const [stats, achievements] = await Promise.all([
      getPlayerStats(),
      getPlayerAchievements()
    ])
    
    if (stats) {
      myStats.value = {
        overallRank: stats.rank,
        totalEarned: stats.total_points,
        gamesPlayed: stats.games_played,
        achievements: achievements.length,
        friends: 0, // Пока не реализовано
        companyLevel: 1, // Пока не реализовано
        recentAchievements: achievements.slice(0, 5).map((achievement, index) => ({
          id: index + 1,
          name: achievement.achievement_name,
          icon: achievement.achievement_icon,
          date: formatAchievementDate(achievement.unlocked_at)
        }))
      }
      console.log('✅ Статистика игрока загружена:', myStats.value)
    }
    
    // Также загружаем все достижения для отображения прогресса
    await loadAllAchievements()
  } catch (error) {
    console.error('Ошибка при загрузке статистики:', error)
  }
}

// Обновление рейтингов
const updateRankings = () => {
  console.log('Обновление рейтинга с фильтром:', timeFilter.value)
  loadOverallRankings()
}

const updateCompanyRankings = () => {
  console.log('Обновление рейтинга компаний по:', companySort.value)
  // TODO: Реализовать загрузку рейтинга компаний
}

const updateMinigameRankings = () => {
  console.log('Обновление рейтинга мини-игр:', selectedGame.value)
  loadMinigamesRankings()
}

// Вспомогательные функции
const getRandomAvatar = () => {
  const avatars = ['●', '▲', '■', '◆', '◉', '◈', '◇', '◆']
  return avatars[Math.floor(Math.random() * avatars.length)]
}

const getBadgeByRank = (rank: number) => {
  if (rank === 1) return 'Лидер'
  if (rank <= 3) return 'Топ-3'
  if (rank <= 10) return 'Элита'
  if (rank <= 25) return 'Опытный'
  return 'Новичок'
}

const getGameDisplayName = (gameType: string) => {
  const gameNames = {
    'auction': 'Аукцион материалов',
    'logistics_race': 'Логистическая гонка',
    'fashion_battle': 'Fashion Battle',
    'team_production': 'Командное производство'
  }
  return gameNames[gameType as keyof typeof gameNames] || gameType
}

const formatAchievementDate = (dateString: string) => {
  if (!dateString) return 'Не получено'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Сегодня'
  if (diffDays === 2) return 'Вчера'
  if (diffDays <= 7) return `${diffDays} дней назад`
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatProgress = (current: number, target: number) => {
  if (current >= target) return `${target.toLocaleString()}`
  
  // Форматируем числа для лучшего отображения
  if (target >= 1000000) {
    return `${Math.round(current / 1000000 * 10) / 10}М / ${Math.round(target / 1000000 * 10) / 10}М`
  } else if (target >= 1000) {
    return `${Math.round(current / 1000 * 10) / 10}К / ${Math.round(target / 1000 * 10) / 10}К`
  } else {
    return `${current.toLocaleString()} / ${target.toLocaleString()}`
  }
}

// Обновление времени
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Загрузка при монтировании
onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // Загружаем данные в зависимости от активной вкладки
  if (activeTab.value === 'overall') {
    await loadOverallRankings()
  } else if (activeTab.value === 'minigames') {
    await loadMinigamesRankings()
  } else if (activeTab.value === 'my-stats') {
    await loadMyStats()
  }
})

// Очистка при размонтировании
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.rating-modal {
  background: var(--color-bg-menu-light);
  border-radius: 15px;
  width: 1000px;
  height: 700px;
  overflow: hidden;
  box-shadow: 0 8px 16px var(--shadow-medium);
  border: 2px solid var(--color-buttons);
  display: flex;
  flex-direction: column;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
  border-radius: 15px 15px 0 0;
}

.modal-title {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.4rem, 2.2vw, 1.8rem);
  font-weight: 700;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.close-btn {
  background: var(--color-buttons);
  border: 2px solid var(--color-accents);
  border-radius: 12px;
  color: var(--color-text);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  font-weight: 600;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.close-btn:hover {
  background: var(--color-accents);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.nav-section {
  display: flex;
  background: var(--color-bg-menu);
  padding: 15px 25px;
  gap: 10px;
  overflow-x: auto;
  border-bottom: 2px solid var(--color-buttons);
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text);
  min-width: 80px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.nav-btn:hover {
  background: var(--color-bg-menu-light);
  border-color: var(--color-buttons);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.nav-btn.active {
  background: var(--color-accents);
  border-color: var(--color-highlights);
  color: var(--color-text);
}

.nav-icon {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
}

.nav-text {
  font-size: clamp(0.7rem, 1.1vw, 0.85rem);
  font-weight: 600;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.content-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--color-bg-menu-light);
  height: calc(700px - 140px);
}

.rating-content h3 {
  margin: 0 0 20px 0;
  color: var(--color-text);
  font-size: clamp(1.2rem, 1.8vw, 1.5rem);
  text-align: center;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.time-filter, .sort-filter, .game-filter select {
  padding: 8px 12px;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.leaderboard, .company-leaderboard, .minigame-leaderboard {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--color-text);
}

.loading-spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-indicator p {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
}

.player-card, .company-card, .minigame-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  box-shadow: 0 2px 4px var(--shadow-light);
  transition: all 0.2s ease;
}

.player-card:hover, .company-card:hover, .minigame-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-medium);
  border-color: var(--color-accents);
}

.player-card.top-3, .company-card.top-3, .minigame-card.top-3 {
  background: var(--color-accents);
  border-color: var(--color-highlights);
  color: var(--color-text);
}

.player-card.current-player {
  border: 3px solid var(--color-highlights);
  background: var(--color-bg-menu);
  color: var(--color-text);
}

.rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 50%;
  font-weight: bold;
}

.top-3 .rank {
  background: var(--color-bg-menu);
  border-color: var(--color-accents);
}

.medal {
  font-size: clamp(1.2rem, 1.8vw, 1.5rem);
}

.rank-number {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.top-3 .rank-number {
  color: var(--color-text);
}

.player-avatar, .company-logo {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 50%;
}

.avatar-emoji, .logo-emoji {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  color: var(--color-accents);
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: var(--color-accents);
  border: 2px solid var(--color-bg-menu);
  border-radius: 50%;
}

.player-info, .company-info {
  flex: 1;
}

.player-name, .company-name {
  font-weight: bold;
  font-size: clamp(0.9rem, 1.4vw, 1.1rem);
  margin-bottom: 5px;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.player-level, .company-level, .company-owner {
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-text);
  opacity: 0.8;
}

.game-name {
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-text);
  opacity: 0.8;
}

.player-stats, .company-stats, .game-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 120px;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.stat-value {
  font-weight: bold;
  font-size: 0.9rem;
}

.player-badge, .company-badge {
  display: flex;
  align-items: center;
}

.badge {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.top-3 .badge {
  background: rgba(255, 255, 255, 0.2);
}

.win-rate {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.rate-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.rate-value {
  font-weight: bold;
  font-size: 1.1rem;
  color: #27ae60;
}

.my-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
}

.achievements-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.achievements-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.achievement-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.achievement-item.unlocked {
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.achievement-item.locked {
  opacity: 0.7;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

/* Редкость достижений */
.achievement-item.rarity-common {
  border-left: 4px solid #95a5a6;
}

.achievement-item.rarity-rare {
  border-left: 4px solid #3498db;
}

.achievement-item.rarity-epic {
  border-left: 4px solid #9b59b6;
}

.achievement-item.rarity-legendary {
  border-left: 4px solid #f39c12;
  background: linear-gradient(135deg, #fff9e6 0%, #fff2cc 100%);
  box-shadow: 0 2px 12px rgba(243, 156, 18, 0.3);
}

.achievement-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.achievement-icon {
  font-size: 1.8rem;
  filter: grayscale(1);
  transition: filter 0.3s ease;
}

.achievement-item.unlocked .achievement-icon {
  filter: grayscale(0);
}

.unlocked-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.achievement-description {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 10px;
  line-height: 1.4;
}

.achievement-date {
  font-size: 0.8rem;
  color: #27ae60;
  font-weight: 600;
}

/* Прогресс-бар */
.achievement-progress {
  margin-top: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.progress-text {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 600;
}

.progress-percent {
  font-size: 0.8rem;
  color: #3498db;
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-fill.rarity-common {
  background: linear-gradient(90deg, #95a5a6, #7f8c8d);
}

.progress-fill.rarity-rare {
  background: linear-gradient(90deg, #3498db, #2980b9);
}

.progress-fill.rarity-epic {
  background: linear-gradient(90deg, #9b59b6, #8e44ad);
}

.progress-fill.rarity-legendary {
  background: linear-gradient(90deg, #f39c12, #e67e22);
  box-shadow: 0 0 8px rgba(243, 156, 18, 0.5);
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.tablet-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #34495e;
  color: white;
  font-size: 0.9rem;
}

.battery, .time, .wifi {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .rating-modal {
    width: 95%;
    height: 85vh;
  }
  
  .content-section {
    height: calc(85vh - 140px);
  }
}

@media (max-width: 768px) {
  .rating-modal {
    width: 98%;
    height: 90vh;
  }
  
  .content-section {
    height: calc(90vh - 140px);
  }
  
  .player-card, .company-card, .minigame-card {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .player-stats, .company-stats, .game-stats {
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
  }
  
  .my-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .rating-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .nav-section {
    flex-wrap: wrap;
  }
  
  .nav-btn {
    min-width: 60px;
  }
  
  .nav-text {
    font-size: 0.7rem;
  }
}
</style>
