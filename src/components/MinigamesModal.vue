<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal minigames-modal" @click.stop>
      <div class="modal-header">
        <h2 class="menu-title">🎮 Мини-игры</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      
      <div class="modal-content">
        <!-- Онлайн статус -->
        <div class="online-status">
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">Онлайн: {{ onlinePlayers }} игроков</span>
          </div>
          <div class="quick-join">
            <button class="btn btn-primary" @click="quickJoinGame">
              🚀 Быстрое подключение
            </button>
          </div>
        </div>

        <!-- Категории игр -->
        <div class="game-categories">
          <button 
            v-for="category in categories" 
            :key="category.id"
            class="category-btn"
            :class="{ active: activeCategory === category.id }"
            @click="setActiveCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </button>
        </div>
        
        <!-- Список игр -->
        <div class="games-grid">
          <div 
            v-for="game in filteredGames" 
            :key="game.id"
            class="game-card"
            :class="{ locked: game.locked, featured: game.featured }"
            @click="playGame(game)"
          >
            <div class="game-image">
              <span class="game-emoji">{{ game.icon }}</span>
              <div v-if="game.featured" class="featured-badge">⭐</div>
              <div v-if="game.locked" class="locked-overlay">
                <span class="lock-icon">🔒</span>
              </div>
            </div>
            
            <div class="game-info">
              <h3 class="game-title">{{ game.name }}</h3>
              <p class="game-description">{{ game.description }}</p>
              
              <div class="game-stats">
                <div class="stat">
                  <span class="stat-icon">👥</span>
                  <span class="stat-text">{{ game.players }}</span>
                </div>
                <div class="stat">
                  <span class="stat-icon">⏱️</span>
                  <span class="stat-text">{{ game.duration }}</span>
                </div>
                <div class="stat">
                  <span class="stat-icon">⭐</span>
                  <span class="stat-text">{{ game.difficulty }}</span>
                </div>
                <div v-if="game.onlinePlayers > 0" class="stat online-stat">
                  <span class="stat-icon">🟢</span>
                  <span class="stat-text">{{ game.onlinePlayers }} онлайн</span>
                </div>
              </div>
              
              <div class="game-rewards">
                <span class="reward-label">Награды:</span>
                <div class="rewards">
                  <span v-for="reward in game.rewards" :key="reward" class="reward">
                    {{ reward }}
                  </span>
                </div>
              </div>
              
              <div v-if="game.locked" class="unlock-requirement">
                <span class="requirement-text">{{ game.unlockRequirement }}</span>
              </div>
            </div>
            
            <button 
              class="play-btn"
              :disabled="game.locked"
              @click.stop="playGame(game)"
            >
              {{ game.locked ? 'Заблокировано' : 'Играть' }}
            </button>
          </div>
        </div>
        
        <!-- Рекомендуемые игры -->
        <div class="recommended-section">
          <h3>🔥 Рекомендуемые игры</h3>
          <div class="recommended-games">
            <div 
              v-for="game in recommendedGames" 
              :key="game.id"
              class="recommended-card"
              @click="playGame(allGames.find(g => g.id === game.id))"
            >
              <span class="game-emoji">{{ game.icon }}</span>
              <div class="game-details">
                <h4>{{ game.name }}</h4>
                <p>{{ game.shortDescription }}</p>
              </div>
              <div class="play-arrow">▶️</div>
            </div>
          </div>
        </div>
        
        <!-- Активные события -->
        <div class="events-section">
          <h3>🎉 Активные события</h3>
          <div class="events-grid">
            <div 
              v-for="event in activeEvents" 
              :key="event.id"
              class="event-card"
              :class="{ 'event-weekly': event.eventType === 'weekly', 'event-monthly': event.eventType === 'monthly' }"
              @click="playGame(event)"
            >
              <div class="event-header">
                <span class="event-icon">{{ event.icon }}</span>
                <div class="event-badge" :class="event.eventType">
                  {{ event.eventType === 'weekly' ? 'Еженедельно' : 'Ежемесячно' }}
                </div>
              </div>
              <div class="event-content">
                <h4>{{ event.name }}</h4>
                <p>{{ event.description }}</p>
                <div class="event-participants">
                  <span class="participants-count">👥 {{ event.onlinePlayers }} участников</span>
                  <span class="event-time">⏰ {{ event.duration }}</span>
                </div>
              </div>
              <button class="event-join-btn">Присоединиться</button>
            </div>
          </div>
        </div>
        
        <!-- Статистика игр -->
        <div class="games-stats">
          <h3>📊 Ваша статистика</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-icon">🎮</span>
              <span class="stat-label">Игр сыграно:</span>
              <span class="stat-value">{{ gamesPlayed }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🏆</span>
              <span class="stat-label">Побед:</span>
              <span class="stat-value">{{ gamesWon }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⭐</span>
              <span class="stat-label">Средний рейтинг:</span>
              <span class="stat-value">{{ averageRating }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💰</span>
              <span class="stat-label">Заработано:</span>
              <span class="stat-value">{{ totalEarned }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно авторизации -->
    <AuthModal 
      v-if="showAuthModal"
      @close="closeAuthModal"
      @success="onAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AuthModal from './AuthModal.vue'
import { useAuthGuard } from '@/composables/useAuthGuard'

// Эмиты
const emit = defineEmits<{
  close: []
}>()

// Используем auth guard
const { requireAuth, showAuthModal, onAuthSuccess, closeAuthModal } = useAuthGuard()

// Состояние
const activeCategory = ref('all')
const gamesPlayed = ref(15)
const gamesWon = ref(12)
const averageRating = ref(4.2)
const totalEarned = ref(2500)

// Онлайн статус
const onlinePlayers = ref(127)

// Категории игр
const categories = ref([
  { id: 'all', name: 'Все', icon: '🎮' },
  { id: 'social', name: 'Социальные', icon: '👥' },
  { id: 'competitive', name: 'Соревнования', icon: '🏆' },
  { id: 'cooperative', name: 'Кооператив', icon: '🤝' },
  { id: 'events', name: 'События', icon: '🎉' },
  { id: 'solo', name: 'Одиночные', icon: '🎯' }
])

// Список всех игр
const allGames = ref([
  // Социальные мини-игры
  {
    id: 'material_auction',
    name: 'Аукцион материалов',
    description: 'Соревнуйтесь за дефицитную ткань в режиме реального времени',
    icon: '🔨',
    category: 'social',
    players: '2-8',
    duration: '5 мин',
    difficulty: '⭐⭐⭐',
    rewards: ['🧵', '💰', '⭐'],
    locked: false,
    featured: true,
    onlinePlayers: 23,
    type: 'competitive'
  },
  {
    id: 'fashion_battle',
    name: 'Fashion Battle',
    description: 'Покажите свои дизайны и победите в модном состязании',
    icon: '👗',
    category: 'social',
    players: '2-4',
    duration: '8 мин',
    difficulty: '⭐⭐⭐',
    rewards: ['🏆', '💰', '⭐'],
    locked: false,
    featured: true,
    onlinePlayers: 15,
    type: 'competitive'
  },
  {
    id: 'logistics_race',
    name: 'Логистическая гонка',
    description: 'Разведите заказы по городам быстрее всех',
    icon: '🚚',
    category: 'social',
    players: '2-6',
    duration: '10 мин',
    difficulty: '⭐⭐⭐⭐',
    rewards: ['🚚', '💰', '⭐'],
    locked: false,
    featured: true,
    onlinePlayers: 31,
    type: 'competitive'
  },
  
  // Кооперативные игры
  {
    id: 'team_production',
    name: 'Командное производство',
    description: 'Создавайте одежду вместе с друзьями',
    icon: '🏭',
    category: 'cooperative',
    players: '2-4',
    duration: '12 мин',
    difficulty: '⭐⭐⭐',
    rewards: ['🧵', '⭐', '🎁'],
    locked: false,
    featured: false,
    onlinePlayers: 8,
    type: 'cooperative'
  },
  {
    id: 'fashion_collaboration',
    name: 'Модная коллаборация',
    description: 'Разработайте коллекцию в команде',
    icon: '🎨',
    category: 'cooperative',
    players: '2-6',
    duration: '15 мин',
    difficulty: '⭐⭐⭐⭐',
    rewards: ['🎨', '🏆', '💰'],
    locked: true,
    featured: false,
    onlinePlayers: 5,
    type: 'cooperative',
    unlockRequirement: 'Уровень 8'
  },
  
  // События и челленджи
  {
    id: 'weekly_challenge',
    name: 'Еженедельный челлендж',
    description: 'Достигните максимальной капитализации за игровой год',
    icon: '📈',
    category: 'events',
    players: '1',
    duration: '20 мин',
    difficulty: '⭐⭐⭐⭐⭐',
    rewards: ['🏆', '💰', '🎁', '⭐'],
    locked: false,
    featured: true,
    onlinePlayers: 89,
    type: 'solo',
    eventType: 'weekly'
  },
  {
    id: 'eco_challenge',
    name: 'Эко-инициатива',
    description: 'Изготовьте 1,000,000 масок за неделю с другими игроками',
    icon: '🌱',
    category: 'events',
    players: '∞',
    duration: '7 дней',
    difficulty: '⭐⭐⭐⭐',
    rewards: ['🌱', '🏆', '💰', '🎁'],
    locked: false,
    featured: true,
    onlinePlayers: 156,
    type: 'cooperative',
    eventType: 'monthly'
  },
  
  // Одиночные игры
  {
    id: 'design_master',
    name: 'Мастер дизайна',
    description: 'Создавайте уникальные дизайны одежды',
    icon: '✏️',
    category: 'solo',
    players: '1',
    duration: '6 мин',
    difficulty: '⭐⭐',
    rewards: ['🎨', '⭐'],
    locked: false,
    featured: false,
    onlinePlayers: 0,
    type: 'solo'
  },
  {
    id: 'business_simulator',
    name: 'Бизнес-симулятор',
    description: 'Управляйте своим модным бизнесом',
    icon: '📊',
    category: 'solo',
    players: '1',
    duration: '15 мин',
    difficulty: '⭐⭐⭐⭐',
    rewards: ['💰', '📈', '⭐'],
    locked: false,
    featured: false,
    onlinePlayers: 0,
    type: 'solo'
  }
])

// Рекомендуемые игры
const recommendedGames = ref([
  {
    id: 'material_auction',
    name: 'Аукцион материалов',
    shortDescription: 'Горячие торги за ткань!',
    icon: '🔨'
  },
  {
    id: 'fashion_battle',
    name: 'Fashion Battle',
    shortDescription: 'Соревнование дизайнеров',
    icon: '👗'
  },
  {
    id: 'weekly_challenge',
    name: 'Еженедельный челлендж',
    shortDescription: 'Проверь свои навыки!',
    icon: '📈'
  }
])

// Фильтрованные игры
const filteredGames = computed(() => {
  if (activeCategory.value === 'all') {
    return allGames.value
  }
  return allGames.value.filter(game => game.category === activeCategory.value)
})

// Активные события
const activeEvents = computed(() => {
  return allGames.value.filter(game => game.eventType)
})

// Установка активной категории
const setActiveCategory = (categoryId: string) => {
  activeCategory.value = categoryId
}

// Быстрое подключение к игре
const quickJoinGame = () => {
  const isAuthenticated = requireAuth('quick-join', () => {
    // Находим самую популярную игру
    const popularGame = allGames.value
      .filter(game => game.onlinePlayers > 0)
      .sort((a, b) => b.onlinePlayers - a.onlinePlayers)[0]
    
    if (popularGame) {
      alert(`Подключаемся к "${popularGame.name}" (${popularGame.onlinePlayers} игроков онлайн)`)
      console.log('Быстрое подключение к:', popularGame)
    } else {
      alert('Сейчас нет доступных игр для быстрого подключения')
    }
  })
  
  if (isAuthenticated) {
    const popularGame = allGames.value
      .filter(game => game.onlinePlayers > 0)
      .sort((a, b) => b.onlinePlayers - a.onlinePlayers)[0]
    
    if (popularGame) {
      alert(`Подключаемся к "${popularGame.name}" (${popularGame.onlinePlayers} игроков онлайн)`)
      console.log('Быстрое подключение к:', popularGame)
    } else {
      alert('Сейчас нет доступных игр для быстрого подключения')
    }
  }
}

// Запуск игры
const playGame = (game: any) => {
  if (game.locked) {
    alert(`Игра заблокирована! ${game.unlockRequirement}`)
    return
  }
  
  // Проверяем авторизацию перед запуском игры
  const isAuthenticated = requireAuth('game-start', () => {
    startGame(game)
  })
  
  if (isAuthenticated) {
    startGame(game)
  }
}

// Функция запуска игры
const startGame = (game: any) => {
  const gameInfo = game.onlinePlayers > 0 
    ? `🎮 Запускаем "${game.name}"\n👥 Онлайн: ${game.onlinePlayers} игроков\n⏱️ Время: ${game.duration}\n🏆 Тип: ${game.type === 'competitive' ? 'Соревнование' : game.type === 'cooperative' ? 'Кооператив' : 'Одиночная'}`
    : `🎮 Запускаем "${game.name}"\n⏱️ Время: ${game.duration}\n🎯 Режим: Одиночная игра`
  
  alert(gameInfo)
  console.log('Запуск игры:', game)
}

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
@import '@/styles/menu-common.css';

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

.minigames-modal {
  background: var(--color-bg-menu);
  border-radius: clamp(15px, 2vw, 30px);
  max-width: 1200px;
  width: 95%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 clamp(10px, 2vw, 20px) clamp(30px, 6vw, 60px) var(--shadow-dark);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  font-family: 'Orbitron', sans-serif;
  color: var(--color-text);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(15px, 2vw, 30px);
  border-bottom: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  background: var(--gradient-accents);
  color: white;
  border-radius: clamp(15px, 2vw, 30px) clamp(15px, 2vw, 30px) 0 0;
}

.modal-header .menu-title {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  text-shadow: 2px 2px 0px var(--color-accents-dark);
  color: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: clamp(1.2rem, 2vw, 1.8rem);
  cursor: pointer;
  color: white;
  padding: clamp(5px, 1vw, 10px);
  border-radius: 50%;
  width: clamp(30px, 5vw, 45px);
  height: clamp(30px, 5vw, 45px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
  transform: scale(1.1);
}

.modal-content {
  padding: clamp(20px, 3vw, 40px);
}

/* Онлайн статус */
.online-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gradient-bg);
  padding: clamp(15px, 2vw, 25px);
  border-radius: clamp(10px, 1.5vw, 20px);
  margin-bottom: clamp(20px, 3vw, 30px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 12px);
}

.status-dot {
  width: clamp(8px, 1.5vw, 12px);
  height: clamp(8px, 1.5vw, 12px);
  background: #27ae60;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.status-text {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(0.9rem, 1.5vw, 1.3rem);
  font-weight: 600;
  color: var(--color-text);
}

.quick-join .btn {
  padding: clamp(8px, 1.5vw, 12px) clamp(16px, 3vw, 24px);
  font-size: clamp(0.8rem, 1.3vw, 1.1rem);
}

.game-categories {
  display: flex;
  gap: clamp(8px, 1.5vw, 15px);
  margin-bottom: clamp(20px, 3vw, 30px);
  overflow-x: auto;
  padding-bottom: clamp(8px, 1.5vw, 15px);
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(4px, 0.8vw, 8px);
  padding: clamp(12px, 2vw, 20px) clamp(16px, 2.5vw, 24px);
  background: var(--gradient-bg);
  border: clamp(2px, 0.3vw, 3px) solid var(--color-buttons);
  border-radius: clamp(10px, 1.5vw, 15px);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: clamp(80px, 12vw, 120px);
  white-space: nowrap;
  font-family: 'Orbitron', sans-serif;
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
}

.category-btn:hover {
  background: var(--color-bg-menu-light);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-medium);
}

.category-btn.active {
  background: var(--gradient-buttons);
  color: white;
  border-color: var(--color-buttons-dark);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-medium);
}

.category-icon {
  font-size: clamp(1.2rem, 2.5vw, 2rem);
  filter: drop-shadow(0 1px 2px var(--shadow-light));
}

.category-name {
  font-size: clamp(0.7rem, 1.3vw, 1.1rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(280px, 30vw, 350px), 1fr));
  gap: clamp(15px, 2.5vw, 25px);
  margin-bottom: clamp(30px, 4vw, 40px);
}

.game-card {
  background: var(--gradient-bg);
  border-radius: clamp(12px, 2vw, 20px);
  overflow: hidden;
  box-shadow: 0 clamp(3px, 0.6vw, 6px) clamp(8px, 1.5vw, 15px) var(--shadow-medium);
  transition: all 0.3s ease;
  position: relative;
  border: clamp(2px, 0.3vw, 3px) solid var(--color-buttons);
  font-family: 'Orbitron', sans-serif;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 clamp(6px, 1.2vw, 12px) clamp(12px, 2.5vw, 25px) var(--shadow-dark);
}

.game-card.featured {
  border: clamp(3px, 0.5vw, 4px) solid var(--color-highlights);
  background: linear-gradient(135deg, var(--color-bg-menu) 0%, var(--color-highlights) 100%);
}

.game-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--color-bg-menu-light);
}

.game-image {
  position: relative;
  height: 120px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-emoji {
  font-size: 3rem;
}

.featured-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f39c12;
  color: white;
  padding: 5px 8px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.locked-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-icon {
  font-size: 2rem;
  color: white;
}

.game-info {
  padding: 20px;
}

.game-title {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
  color: #2c3e50;
}

.game-description {
  margin: 0 0 15px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.game-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.stat {
  display: flex;
  align-items: center;
  gap: clamp(4px, 0.8vw, 8px);
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  color: var(--color-text);
  font-family: 'Orbitron', sans-serif;
}

.stat-icon {
  font-size: clamp(0.9rem, 1.5vw, 1.2rem);
}

.online-stat {
  color: #27ae60;
  font-weight: 700;
  background: rgba(39, 174, 96, 0.1);
  padding: clamp(2px, 0.4vw, 4px) clamp(6px, 1vw, 8px);
  border-radius: clamp(4px, 0.8vw, 8px);
  border: 1px solid rgba(39, 174, 96, 0.3);
}

.game-rewards {
  margin-bottom: 15px;
}

.reward-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
  margin-right: 10px;
}

.rewards {
  display: inline-flex;
  gap: 5px;
}

.reward {
  font-size: 1rem;
}

.unlock-requirement {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
}

.requirement-text {
  font-size: 0.8rem;
  color: #e74c3c;
  font-weight: 600;
}

.play-btn {
  width: 100%;
  padding: 12px;
  background: #9b59b6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn:hover:not(:disabled) {
  background: #8e44ad;
  transform: translateY(-2px);
}

.play-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.recommended-section {
  margin-bottom: 40px;
}

.recommended-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.recommended-games {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recommended-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommended-card:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.game-emoji {
  font-size: 2rem;
}

.game-details {
  flex: 1;
}

.game-details h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.game-details p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.play-arrow {
  font-size: 1.2rem;
  color: #9b59b6;
}

.games-stats {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
}

.games-stats h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-label {
  flex: 1;
  color: #666;
  font-weight: 600;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
}

/* Секция событий */
.events-section {
  margin-bottom: clamp(30px, 4vw, 40px);
}

.events-section h3 {
  margin: 0 0 clamp(15px, 2.5vw, 25px) 0;
  color: var(--color-text);
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(300px, 35vw, 400px), 1fr));
  gap: clamp(15px, 2.5vw, 25px);
}

.event-card {
  background: var(--gradient-bg);
  border-radius: clamp(12px, 2vw, 20px);
  overflow: hidden;
  box-shadow: 0 clamp(3px, 0.6vw, 6px) clamp(8px, 1.5vw, 15px) var(--shadow-medium);
  transition: all 0.3s ease;
  position: relative;
  border: clamp(2px, 0.3vw, 3px) solid var(--color-buttons);
  font-family: 'Orbitron', sans-serif;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 clamp(6px, 1.2vw, 12px) clamp(12px, 2.5vw, 25px) var(--shadow-dark);
}

.event-card.event-weekly {
  border-color: var(--color-highlights);
  background: linear-gradient(135deg, var(--color-bg-menu) 0%, rgba(129, 196, 231, 0.1) 100%);
}

.event-card.event-monthly {
  border-color: var(--color-secondary);
  background: linear-gradient(135deg, var(--color-bg-menu) 0%, rgba(124, 179, 66, 0.1) 100%);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(15px, 2.5vw, 20px);
  background: var(--gradient-accents);
  color: white;
}

.event-icon {
  font-size: clamp(2rem, 4vw, 3rem);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.event-badge {
  padding: clamp(4px, 0.8vw, 8px) clamp(8px, 1.5vw, 12px);
  border-radius: clamp(6px, 1vw, 10px);
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.3);
}

.event-badge.weekly {
  background: var(--color-highlights);
  color: var(--color-text);
}

.event-badge.monthly {
  background: var(--color-secondary);
  color: white;
}

.event-content {
  padding: clamp(15px, 2.5vw, 20px);
}

.event-content h4 {
  margin: 0 0 clamp(8px, 1.5vw, 12px) 0;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  color: var(--color-text);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
}

.event-content p {
  margin: 0 0 clamp(12px, 2vw, 16px) 0;
  color: var(--color-text);
  font-size: clamp(0.8rem, 1.3vw, 1.1rem);
  line-height: 1.4;
  font-family: 'Orbitron', sans-serif;
}

.event-participants {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(12px, 2vw, 16px);
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  color: var(--color-text);
  font-family: 'Orbitron', sans-serif;
}

.participants-count {
  color: #27ae60;
  font-weight: 600;
}

.event-time {
  color: var(--color-accents);
  font-weight: 600;
}

.event-join-btn {
  width: 100%;
  padding: clamp(10px, 1.8vw, 14px);
  background: var(--gradient-buttons);
  color: white;
  border: none;
  border-radius: clamp(6px, 1vw, 10px);
  font-size: clamp(0.9rem, 1.5vw, 1.2rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 0px var(--shadow-dark);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium);
}

.event-join-btn:hover {
  background: var(--gradient-accents);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-dark);
}

/* Адаптивность */
@media (max-width: 768px) {
  .minigames-modal {
    width: 98%;
    margin: 10px;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .game-categories {
    flex-wrap: wrap;
  }
  
  .category-btn {
    min-width: clamp(70px, 10vw, 100px);
  }
  
  .online-status {
    flex-direction: column;
    gap: clamp(10px, 2vw, 15px);
    text-align: center;
  }
}
</style>
