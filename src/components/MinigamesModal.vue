<template>
  <div class="modal-overlay" @click.self="close">
    <div class="minigames-modal">
      <div class="modal-header">
        <h2 class="modal-title">● Мини-игры</h2>
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
            ◆ Быстрая игра
          </button>
        </div>
        
        <!-- Прокручиваемая область -->
        <div class="scrollable-content">
          <!-- Активные события (еженедельные/ежемесячные) -->
          <div class="section" v-if="activeEvents.length > 0">
            <h3 class="section-title">◉ Активные события</h3>
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
                      {{ event.eventType === 'weekly' ? '■ Неделя' : '● Месяц' }}
                    </span>
                    <span class="event-participants">▲ {{ event.onlinePlayers }}</span>
              </div>
            </div>
                </div>
                </div>
              </div>
              
          <!-- Социальные и кооперативные игры (объединены) -->
          <div class="section">
            <h3 class="section-title">● Совместные игры</h3>
            <div class="games-list">
              <div 
                v-for="game in combinedGroupGames" 
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
                    <span class="meta-item tag" :class="game.category">
                      {{ game.category === 'cooperative' ? 'кооперативная' : 'социальная' }}
                    </span>
                    <span class="meta-item">▲ {{ game.players }}</span>
                    <span class="meta-item">◉ {{ game.duration }}</span>
                    <span class="meta-item" v-if="game.locked">■ {{ game.unlockRequirement }}</span>
                    <span class="meta-item online" v-else-if="game.onlinePlayers > 0">
                      ● {{ game.onlinePlayers }} онлайн
                    </span>
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

    <!-- Игра аукциона -->
    <AuctionGame
      v-if="showAuctionGame"
      @close="closeAuctionGame"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AuthModal from './AuthModal.vue'
import AuctionGame from './AuctionGame.vue'
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
const showAuctionGame = ref(false)

// Список всех игр
const allGames = ref([
  // Социальные мини-игры
  {
    id: 'material_auction',
    name: 'Аукцион материалов',
    description: 'Соревнуйтесь за дефицитную ткань в режиме реального времени',
    icon: '■',
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
    icon: '◆',
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
    icon: '●',
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
    icon: '◉',
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
    icon: '▲',
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
    icon: '◆',
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
    icon: '●',
    category: 'events',
    players: '∞',
    duration: '7 дней',
    onlinePlayers: 156,
    type: 'cooperative',
    eventType: 'monthly'
  },
  
  
])

// Фильтрованные игры по категориям (объединены ниже)

// Объединённая категория: социальные + кооперативные с сортировкой по онлайну
const combinedGroupGames = computed(() =>
  allGames.value
    .filter(game => game.category === 'social' || game.category === 'cooperative')
    .sort((a, b) => (b.onlinePlayers || 0) - (a.onlinePlayers || 0))
)

// удалены одиночные игры и связанные вычисления

const activeEvents = computed(() => 
  allGames.value.filter(game => game.eventType)
)

// Быстрое подключение к игре
const quickJoinGame = () => {
  const isAuthenticated = requireAuth('minigames', () => {
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
  // Если это аукцион материалов, открываем компонент игры
  if (game.id === 'material_auction') {
    showAuctionGame.value = true
    return
  }
  
  // Для остальных игр показываем заглушку
  const gameInfo = game.onlinePlayers > 0 
    ? `🎮 Запускаем "${game.name}"\n👥 Онлайн: ${game.onlinePlayers} игроков\n⏱️ Время: ${game.duration}`
    : `🎮 Запускаем "${game.name}"\n⏱️ Время: ${game.duration}\n🎯 Режим: Одиночная игра`
  
  alert(gameInfo)
  console.log('Запуск игры:', game)
}

// Закрыть аукцион
const closeAuctionGame = () => {
  showAuctionGame.value = false
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
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.minigames-modal {
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

.modal-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--color-bg-menu-light);
  height: calc(700px - 140px);
}

/* Онлайн баннер */
.online-banner {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.online-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  color: var(--color-text);
  font-weight: 600;
}

.online-dot {
  width: 10px;
  height: 10px;
  background: var(--color-accents);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.online-text strong {
  font-weight: 700;
  color: var(--color-accents);
}

.quick-join-btn {
  padding: 10px 20px;
  background: var(--color-buttons);
  color: var(--color-text);
  border: 2px solid var(--color-accents);
  border-radius: 12px;
  font-weight: 600;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.quick-join-btn:hover {
  background: var(--color-accents);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

/* Прокручиваемая область */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}

/* Секции */
.section {
  margin-bottom: 25px;
}

.section-title {
  font-size: clamp(1.1rem, 1.6vw, 1.3rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-buttons);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

/* События */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 10px;
}

.event-card {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  gap: 15px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.event-card.event-weekly {
  border-left: 4px solid var(--color-accents);
}

.event-card.event-monthly {
  border-left: 4px solid var(--color-highlights);
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-medium);
  border-color: var(--color-accents);
}

.event-icon {
  font-size: clamp(2rem, 3vw, 2.5rem);
  flex-shrink: 0;
  color: var(--color-accents);
}

.event-info {
  flex: 1;
}

.event-name {
  font-weight: 700;
  font-size: clamp(0.9rem, 1.4vw, 1.1rem);
  color: var(--color-text);
  margin-bottom: 5px;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.event-description {
  font-size: clamp(0.7rem, 1.1vw, 0.85rem);
  color: var(--color-text);
  margin-bottom: 10px;
  line-height: 1.4;
  opacity: 0.8;
}

.event-meta {
  display: flex;
  gap: 10px;
  font-size: clamp(0.6rem, 1vw, 0.8rem);
}

.event-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
  background: var(--color-bg-menu-light);
  border: 1px solid var(--color-buttons);
  color: var(--color-text);
}

.event-badge.weekly {
  background: var(--color-bg-menu-light);
  color: var(--color-accents);
}

.event-badge.monthly {
  background: var(--color-bg-menu-light);
  color: var(--color-highlights);
}

.event-participants {
  color: var(--color-accents);
  font-weight: 600;
}

/* Список игр */
.games-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.game-card {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  gap: 15px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.game-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--color-bg-menu-light);
}

.game-card:hover:not(.locked) {
  border-color: var(--color-accents);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

.game-icon {
  font-size: clamp(1.8rem, 2.5vw, 2.2rem);
  flex-shrink: 0;
  color: var(--color-accents);
}

.game-info {
  flex: 1;
}

.game-name {
  font-weight: 700;
  font-size: clamp(0.9rem, 1.3vw, 1rem);
  color: var(--color-text);
  margin-bottom: 5px;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.game-description {
  font-size: clamp(0.7rem, 1.1vw, 0.85rem);
  color: var(--color-text);
  margin-bottom: 8px;
  line-height: 1.4;
  opacity: 0.8;
}

.game-meta {
  display: flex;
  gap: 12px;
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  color: var(--color-text);
}

.meta-item {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.meta-item.online {
  color: var(--color-accents);
  font-weight: 600;
}

/* Теги категорий */
.meta-item.tag {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--color-buttons);
  background: var(--color-bg-menu-light);
  text-transform: lowercase;
}

.meta-item.tag.cooperative {
  color: var(--color-highlights);
}

.meta-item.tag.social {
  color: var(--color-accents);
}

/* Статистика */
.stats-panel {
  background: var(--color-bg-menu);
  border: 2px solid var(--color-buttons);
  border-radius: 12px;
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: 5px;
  opacity: 0.8;
}

.stat-value {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .minigames-modal {
    width: 95%;
    height: 85vh;
  }
  
  .modal-body {
    height: calc(85vh - 140px);
  }
}

@media (max-width: 768px) {
  .minigames-modal {
    width: 98%;
    height: 90vh;
  }
  
  .modal-body {
    height: calc(90vh - 140px);
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
  background: var(--color-bg-menu-light);
  border-radius: 10px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: var(--color-buttons);
  border-radius: 10px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-accents);
}
</style>