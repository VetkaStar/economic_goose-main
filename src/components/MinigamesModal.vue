<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>🎮 Мини-игры</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <!-- Онлайн статус -->
        <div class="online-banner">
          <div class="online-info">
            <span class="online-dot"></span>
            <span class="online-text">Онлайн: <strong>{{ onlinePlayers }}</strong> игроков</span>
          </div>
          <button class="quick-join-btn" @click="quickJoinGame">
            🚀 Быстрая игра
          </button>
        </div>

        <!-- Прокручиваемая область -->
        <div class="scrollable-content">
          <!-- Активные события (еженедельные/ежемесячные) -->
          <div class="section" v-if="activeEvents.length > 0">
            <h3 class="section-title">🎉 Активные события</h3>
            <div class="events-grid">
              <div 
                v-for="event in activeEvents" 
                :key="event.id"
                class="event-card"
                :class="{ 'event-weekly': event.eventType === 'weekly', 'event-monthly': event.eventType === 'monthly' }"
                @click="playGame(event)"
              >
                <div class="event-icon">{{ event.icon }}</div>
                <div class="event-info">
                  <div class="event-name">{{ event.name }}</div>
                  <div class="event-description">{{ event.description }}</div>
                  <div class="event-meta">
                    <span class="event-badge" :class="event.eventType">
                      {{ event.eventType === 'weekly' ? '📅 Неделя' : '📆 Месяц' }}
                    </span>
                    <span class="event-participants">👥 {{ event.onlinePlayers }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Социальные игры -->
          <div class="section">
            <h3 class="section-title">👥 Социальные игры</h3>
            <div class="games-list">
              <div 
                v-for="game in socialGames" 
                :key="game.id"
                class="game-card"
                @click="playGame(game)"
              >
                <div class="game-icon">{{ game.icon }}</div>
                <div class="game-info">
                  <div class="game-name">{{ game.name }}</div>
                  <div class="game-description">{{ game.description }}</div>
                  <div class="game-meta">
                    <span class="meta-item">👥 {{ game.players }}</span>
                    <span class="meta-item">⏱️ {{ game.duration }}</span>
                    <span class="meta-item online" v-if="game.onlinePlayers > 0">
                      🟢 {{ game.onlinePlayers }} онлайн
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Кооперативные игры -->
          <div class="section">
            <h3 class="section-title">🤝 Кооперативные игры</h3>
            <div class="games-list">
              <div 
                v-for="game in cooperativeGames" 
                :key="game.id"
                class="game-card"
                :class="{ locked: game.locked }"
                @click="playGame(game)"
              >
                <div class="game-icon">{{ game.icon }}</div>
                <div class="game-info">
                  <div class="game-name">{{ game.name }}</div>
                  <div class="game-description">{{ game.description }}</div>
                  <div class="game-meta">
                    <span class="meta-item">👥 {{ game.players }}</span>
                    <span class="meta-item">⏱️ {{ game.duration }}</span>
                    <span class="meta-item" v-if="game.locked">🔒 {{ game.unlockRequirement }}</span>
                    <span class="meta-item online" v-else-if="game.onlinePlayers > 0">
                      🟢 {{ game.onlinePlayers }} онлайн
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Одиночные игры -->
          <div class="section">
            <h3 class="section-title">🎯 Одиночные игры</h3>
            <div class="games-list">
              <div 
                v-for="game in soloGames" 
                :key="game.id"
                class="game-card"
                @click="playGame(game)"
              >
                <div class="game-icon">{{ game.icon }}</div>
                <div class="game-info">
                  <div class="game-name">{{ game.name }}</div>
                  <div class="game-description">{{ game.description }}</div>
                  <div class="game-meta">
                    <span class="meta-item">👤 Одиночная</span>
                    <span class="meta-item">⏱️ {{ game.duration }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Статистика игрока (фиксированная панель) -->
        <div class="stats-panel">
          <div class="stat-item">
            <span class="stat-label">Игр сыграно</span>
            <span class="stat-value">{{ gamesPlayed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Побед</span>
            <span class="stat-value">{{ gamesWon }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Заработано</span>
            <span class="stat-value">₽{{ totalEarned.toLocaleString() }}</span>
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
const onlinePlayers = ref(127)
const gamesPlayed = ref(15)
const gamesWon = ref(12)
const totalEarned = ref(2500)

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
    onlinePlayers: 8,
    type: 'cooperative',
    locked: false
  },
  {
    id: 'fashion_collaboration',
    name: 'Модная коллаборация',
    description: 'Разработайте коллекцию в команде',
    icon: '🎨',
    category: 'cooperative',
    players: '2-6',
    duration: '15 мин',
    onlinePlayers: 5,
    type: 'cooperative',
    locked: true,
    unlockRequirement: 'Уровень 8'
  },
  
  // События и челленджи
  {
    id: 'weekly_challenge',
    name: 'Челлендж недели',
    description: 'Достигните максимальной капитализации за игровой год',
    icon: '📈',
    category: 'events',
    players: '1',
    duration: '20 мин',
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
    onlinePlayers: 0,
    type: 'solo'
  }
])

// Фильтрованные игры по категориям
const socialGames = computed(() => 
  allGames.value.filter(game => game.category === 'social')
)

const cooperativeGames = computed(() => 
  allGames.value.filter(game => game.category === 'cooperative')
)

const soloGames = computed(() => 
  allGames.value.filter(game => game.category === 'solo')
)

const activeEvents = computed(() => 
  allGames.value.filter(game => game.eventType)
)

// Быстрое подключение к игре
const quickJoinGame = () => {
  const isAuthenticated = requireAuth('quick-join', () => {
    const popularGame = allGames.value
      .filter(game => game.onlinePlayers > 0)
      .sort((a, b) => b.onlinePlayers - a.onlinePlayers)[0]
    
    if (popularGame) {
      startGame(popularGame)
    } else {
      alert('Сейчас нет доступных игр для быстрого подключения')
    }
  })
  
  if (isAuthenticated) {
    const popularGame = allGames.value
      .filter(game => game.onlinePlayers > 0)
      .sort((a, b) => b.onlinePlayers - a.onlinePlayers)[0]
    
    if (popularGame) {
      startGame(popularGame)
    } else {
      alert('Сейчас нет доступных игр для быстрого подключения')
    }
  }
}

// Запуск игры
const playGame = (game: any) => {
  if (game.locked) {
    alert(`Игра заблокирована! Требование: ${game.unlockRequirement}`)
    return
  }
  
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
    ? `🎮 Запускаем "${game.name}"\n👥 Онлайн: ${game.onlinePlayers} игроков\n⏱️ Время: ${game.duration}`
    : `🎮 Запускаем "${game.name}"\n⏱️ Время: ${game.duration}\n🎯 Режим: Одиночная игра`
  
  alert(gameInfo)
  console.log('Запуск игры:', game)
}

// Закрытие модального окна
const close = () => {
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
  z-index: 100;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #fff7e6 0%, #fef3c7 100%);
  border: 4px solid #d8b86a;
  border-radius: 20px;
  padding: 30px;
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #d8b86a;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 800;
  color: #3a2b16;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7a4b16;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Онлайн баннер */
.online-banner {
  background: #fef4d1;
  border: 2px solid #d8b86a;
  border-radius: 12px;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.online-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #3a2b16;
}

.online-dot {
  width: 10px;
  height: 10px;
  background: #16a34a;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.online-text strong {
  font-weight: 700;
  color: #16a34a;
}

.quick-join-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-join-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

/* Прокручиваемая область */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  max-height: 500px;
  padding-right: 10px;
}

/* Секции */
.section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #3a2b16;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #d8b86a;
}

/* События */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 10px;
}

.event-card {
  background: #fef4d1;
  border: 2px solid #d8b86a;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 15px;
}

.event-card.event-weekly {
  border-left: 4px solid #3b82f6;
}

.event-card.event-monthly {
  border-left: 4px solid #16a34a;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.event-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.event-info {
  flex: 1;
}

.event-name {
  font-weight: 700;
  font-size: 16px;
  color: #3a2b16;
  margin-bottom: 5px;
}

.event-description {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 10px;
  line-height: 1.4;
}

.event-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
}

.event-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.event-badge.weekly {
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
}

.event-badge.monthly {
  background: rgba(22, 163, 74, 0.15);
  color: #16a34a;
}

.event-participants {
  color: #16a34a;
  font-weight: 600;
}

/* Список игр */
.games-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.game-card {
  background: #fef4d1;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 15px;
}

.game-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.game-card:hover:not(.locked) {
  border-color: #d8b86a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.game-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.game-info {
  flex: 1;
}

.game-name {
  font-weight: 700;
  font-size: 15px;
  color: #3a2b16;
  margin-bottom: 5px;
}

.game-description {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
  line-height: 1.4;
}

.game-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-item.online {
  color: #16a34a;
  font-weight: 600;
}

/* Статистика */
.stats-panel {
  background: rgba(216, 184, 106, 0.15);
  border: 2px solid #d8b86a;
  border-radius: 12px;
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #3a2b16;
}

/* Адаптивность */
@media (max-width: 768px) {
  .modal-content {
    width: 98%;
    padding: 20px;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .stats-panel {
    grid-template-columns: 1fr;
  }

  .online-banner {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}

/* Скроллбар */
.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: rgba(216, 184, 106, 0.1);
  border-radius: 10px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: #d8b86a;
  border-radius: 10px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: #b8860b;
}
</style>