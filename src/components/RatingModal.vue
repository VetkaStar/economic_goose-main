<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal rating-modal tablet" @click.stop>
      <!-- Экран планшета -->
      <div class="tablet-screen">
        <!-- Заголовок планшета -->
        <div class="tablet-header">
          <div class="tablet-camera"></div>
          <h2>🏆 Рейтинг игроков</h2>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>
        
        <!-- Навигация по рейтингам -->
        <div class="tablet-nav">
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
        <div class="tablet-content">
          <!-- Общий рейтинг -->
          <div v-if="activeTab === 'overall'" class="rating-content">
            <div class="rating-header">
              <h3>🌟 Общий рейтинг</h3>
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
              <h3>🏢 Рейтинг компаний</h3>
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
              <h3>🎮 Рейтинг мини-игр</h3>
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
              <h3>📊 Моя статистика</h3>
            </div>
            
            <div class="my-stats-grid">
              <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-info">
                  <div class="stat-title">Общий рейтинг</div>
                  <div class="stat-value">{{ myStats.overallRank }}</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                  <div class="stat-title">Заработано</div>
                  <div class="stat-value">{{ myStats.totalEarned.toLocaleString() }}</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">🎮</div>
                <div class="stat-info">
                  <div class="stat-title">Игр сыграно</div>
                  <div class="stat-value">{{ myStats.gamesPlayed }}</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-info">
                  <div class="stat-title">Достижений</div>
                  <div class="stat-value">{{ myStats.achievements }}</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                  <div class="stat-title">Друзей</div>
                  <div class="stat-value">{{ myStats.friends }}</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">🏢</div>
                <div class="stat-info">
                  <div class="stat-title">Уровень компании</div>
                  <div class="stat-value">{{ myStats.companyLevel }}</div>
                </div>
              </div>
            </div>
            
            <div class="achievements-section">
              <h4>🏆 Последние достижения</h4>
              <div class="achievements-list">
                <div 
                  v-for="achievement in myStats.recentAchievements" 
                  :key="achievement.id"
                  class="achievement-item"
                >
                  <span class="achievement-icon">{{ achievement.icon }}</span>
                  <div class="achievement-info">
                    <div class="achievement-name">{{ achievement.name }}</div>
                    <div class="achievement-date">{{ achievement.date }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Подвал планшета -->
        <div class="tablet-footer">
          <div class="battery">🔋 85%</div>
          <div class="time">{{ currentTime }}</div>
          <div class="wifi">📶</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Эмиты
const emit = defineEmits<{
  close: []
}>()

// Состояние
const activeTab = ref('overall')
const timeFilter = ref('all')
const companySort = ref('revenue')
const selectedGame = ref('all')
const currentTime = ref('')

// Медиали
const medals = ['🥇', '🥈', '🥉']

// Вкладки рейтинга
const ratingTabs = ref([
  { id: 'overall', name: 'Общий', icon: '🌟' },
  { id: 'company', name: 'Компании', icon: '🏢' },
  { id: 'minigames', name: 'Мини-игры', icon: '🎮' },
  { id: 'my-stats', name: 'Мои данные', icon: '📊' }
])

// Общий рейтинг
const overallRankings = ref([
  {
    id: 1,
    name: 'Гусь-Модник',
    avatar: '🦆',
    level: 25,
    points: 125000,
    achievements: 45,
    badge: 'Легенда',
    isOnline: true,
    isCurrentPlayer: true
  },
  {
    id: 2,
    name: 'FashionQueen',
    avatar: '👑',
    level: 23,
    points: 118000,
    achievements: 42,
    badge: 'Мастер',
    isOnline: false,
    isCurrentPlayer: false
  },
  {
    id: 3,
    name: 'StyleGuru',
    avatar: '🎨',
    level: 22,
    points: 112000,
    achievements: 40,
    badge: 'Эксперт',
    isOnline: true,
    isCurrentPlayer: false
  },
  {
    id: 4,
    name: 'TrendSetter',
    avatar: '⭐',
    level: 21,
    points: 108000,
    achievements: 38,
    badge: 'Профи',
    isOnline: false,
    isCurrentPlayer: false
  },
  {
    id: 5,
    name: 'Fashionista',
    avatar: '👗',
    level: 20,
    points: 105000,
    achievements: 36,
    badge: 'Профи',
    isOnline: true,
    isCurrentPlayer: false
  }
])

// Рейтинг компаний
const companyRankings = ref([
  {
    id: 1,
    name: 'Гусиная Мода',
    logo: '🦆',
    owner: 'Гусь-Модник',
    level: 15,
    revenue: 2500000,
    reputation: 95,
    employees: 25,
    badge: 'Топ-компания'
  },
  {
    id: 2,
    name: 'Fashion Empire',
    logo: '👑',
    owner: 'FashionQueen',
    level: 14,
    revenue: 2200000,
    reputation: 92,
    employees: 22,
    badge: 'Лидер рынка'
  },
  {
    id: 3,
    name: 'Style Studio',
    logo: '🎨',
    owner: 'StyleGuru',
    level: 13,
    revenue: 2000000,
    reputation: 90,
    employees: 20,
    badge: 'Инновации'
  }
])

// Мини-игры
const minigames = ref([
  { id: 'sewing_master', name: 'Мастер шитья' },
  { id: 'fashion_show', name: 'Модный показ' },
  { id: 'color_matching', name: 'Подбор цветов' }
])

// Рейтинг мини-игр
const minigameRankings = ref([
  {
    id: 1,
    name: 'Гусь-Модник',
    avatar: '🦆',
    gameName: 'Мастер шитья',
    score: 15000,
    gamesPlayed: 45,
    wins: 38,
    winRate: 84
  },
  {
    id: 2,
    name: 'FashionQueen',
    avatar: '👑',
    gameName: 'Мастер шитья',
    score: 14200,
    gamesPlayed: 42,
    wins: 35,
    winRate: 83
  },
  {
    id: 3,
    name: 'StyleGuru',
    avatar: '🎨',
    gameName: 'Мастер шитья',
    score: 13800,
    gamesPlayed: 40,
    wins: 32,
    winRate: 80
  }
])

// Моя статистика
const myStats = ref({
  overallRank: 1,
  totalEarned: 2500000,
  gamesPlayed: 156,
  achievements: 45,
  friends: 23,
  companyLevel: 15,
  recentAchievements: [
    { id: 1, name: 'Первая продажа', icon: '💰', date: '2 дня назад' },
    { id: 2, name: 'Мастер дизайна', icon: '🎨', date: '1 неделя назад' },
    { id: 3, name: 'Социальный гусь', icon: '👥', date: '2 недели назад' }
  ]
})

// Таймер для времени
let timeInterval: NodeJS.Timeout

// Установка активной вкладки
const setActiveTab = (tabId: string) => {
  activeTab.value = tabId
}

// Обновление рейтингов
const updateRankings = () => {
  console.log('Обновление рейтинга с фильтром:', timeFilter.value)
}

const updateCompanyRankings = () => {
  console.log('Обновление рейтинга компаний по:', companySort.value)
}

const updateMinigameRankings = () => {
  console.log('Обновление рейтинга мини-игр:', selectedGame.value)
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
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
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
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.rating-modal {
  background: #2c3e50;
  border-radius: 30px;
  max-width: 1000px;
  width: 95%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
}

.tablet {
  position: relative;
}

.tablet-screen {
  background: #ecf0f1;
  border-radius: 25px;
  margin: 10px;
  height: calc(100% - 20px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tablet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #34495e;
  color: white;
  position: relative;
}

.tablet-camera {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: #2c3e50;
  border-radius: 50%;
}

.tablet-header h2 {
  margin: 0;
  font-size: 1.3rem;
  flex: 1;
  text-align: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: white;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tablet-nav {
  display: flex;
  background: #34495e;
  padding: 10px;
  gap: 5px;
  overflow-x: auto;
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #bdc3c7;
  min-width: 80px;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-btn.active {
  background: #e74c3c;
  color: white;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-text {
  font-size: 0.8rem;
  font-weight: 600;
}

.tablet-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #ecf0f1;
}

.rating-content h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.5rem;
  text-align: center;
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

.player-card, .company-card, .minigame-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.player-card:hover, .company-card:hover, .minigame-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.player-card.top-3, .company-card.top-3, .minigame-card.top-3 {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.player-card.current-player {
  border: 3px solid #3498db;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #ecf0f1;
  border-radius: 50%;
  font-weight: bold;
}

.top-3 .rank {
  background: rgba(255, 255, 255, 0.2);
}

.medal {
  font-size: 1.5rem;
}

.rank-number {
  font-size: 1.2rem;
  color: #2c3e50;
}

.top-3 .rank-number {
  color: white;
}

.player-avatar, .company-logo {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecf0f1;
  border-radius: 50%;
}

.avatar-emoji, .logo-emoji {
  font-size: 2rem;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #27ae60;
  border: 2px solid white;
  border-radius: 50%;
}

.player-info, .company-info {
  flex: 1;
}

.player-name, .company-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.player-level, .company-level, .company-owner {
  font-size: 0.9rem;
  opacity: 0.8;
}

.game-name {
  font-size: 0.9rem;
  color: #7f8c8d;
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
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.achievement-icon {
  font-size: 1.5rem;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 2px;
}

.achievement-date {
  font-size: 0.8rem;
  color: #7f8c8d;
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
@media (max-width: 768px) {
  .rating-modal {
    width: 98%;
    margin: 10px;
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
  
  .tablet-nav {
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
