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
            <h4>▲ Последние достижения</h4>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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

// Медиали (однотонные)
const medals = ['●', '▲', '■']

// Вкладки рейтинга
const ratingTabs = ref([
  { id: 'overall', name: 'Общий', icon: '◉' },
  { id: 'company', name: 'Компании', icon: '■' },
  { id: 'minigames', name: 'Мини-игры', icon: '●' },
  { id: 'my-stats', name: 'Мои данные', icon: '◆' }
])

// Общий рейтинг (реальные данные из базы)
const overallRankings = ref([
  {
    id: '71bbeef1-6c5a-402e-953c-f7109a5efbdf',
    name: 'Jemov',
    avatar: '●',
    level: 1,
    points: 533450,
    achievements: 12,
    badge: 'Лидер',
    isOnline: true,
    isCurrentPlayer: false
  },
  {
    id: 'e9dcca5e-5360-43ae-856d-39baf617db7f',
    name: 'Vetka',
    avatar: '▲',
    level: 1,
    points: 138400,
    achievements: 8,
    badge: 'Новичок',
    isOnline: true,
    isCurrentPlayer: true
  }
])

// Рейтинг компаний (пока пустой, будет заполнен позже)
const companyRankings = ref([])

// Мини-игры
const minigames = ref([
  { id: 'material_auction', name: 'Аукцион материалов' },
  { id: 'fashion_battle', name: 'Fashion Battle' },
  { id: 'logistics_race', name: 'Логистическая гонка' }
])

// Рейтинг мини-игр (пока пустой, будет заполнен позже)
const minigameRankings = ref([])

// Моя статистика (базовые данные, будут обновлены из базы)
const myStats = ref({
  overallRank: 2,
  totalEarned: 138400,
  gamesPlayed: 0,
  achievements: 8,
  friends: 0,
  companyLevel: 1,
  recentAchievements: [
    { id: 1, name: 'Первые деньги', icon: '■', date: 'Сегодня' },
    { id: 2, name: 'Новичок', icon: '●', date: 'Сегодня' },
    { id: 3, name: 'Регистрация', icon: '▲', date: 'Сегодня' }
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
