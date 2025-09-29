<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal minigames-modal" @click.stop>
      <div class="modal-header">
        <h2>🎮 Мини-игры</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      
      <div class="modal-content">
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
              @click="playGame(game)"
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

// Категории игр
const categories = ref([
  { id: 'all', name: 'Все', icon: '🎮' },
  { id: 'production', name: 'Производство', icon: '🏭' },
  { id: 'sales', name: 'Продажи', icon: '🛍️' },
  { id: 'design', name: 'Дизайн', icon: '🎨' },
  { id: 'coop', name: 'Кооператив', icon: '🤝' },
  { id: 'puzzle', name: 'Головоломки', icon: '🧩' }
])

// Список всех игр
const allGames = ref([
  {
    id: 'sewing_master',
    name: 'Мастер шитья',
    description: 'Создавайте одежду на швейной машинке',
    icon: '🧵',
    category: 'production',
    players: '1-2',
    duration: '5 мин',
    difficulty: '⭐⭐⭐',
    rewards: ['💰', '⭐', '🧵'],
    locked: false,
    featured: true
  },
  {
    id: 'fashion_show',
    name: 'Модный показ',
    description: 'Проведите показ мод и привлеките зрителей',
    icon: '👗',
    category: 'sales',
    players: '1-4',
    duration: '10 мин',
    difficulty: '⭐⭐⭐⭐',
    rewards: ['💰', '⭐', '🏆'],
    locked: false,
    featured: true
  },
  {
    id: 'color_matching',
    name: 'Подбор цветов',
    description: 'Создавайте гармоничные цветовые сочетания',
    icon: '🎨',
    category: 'design',
    players: '1',
    duration: '3 мин',
    difficulty: '⭐⭐',
    rewards: ['⭐', '🎨'],
    locked: false,
    featured: false
  },
  {
    id: 'customer_service',
    name: 'Обслуживание клиентов',
    description: 'Помогайте покупателям выбрать одежду',
    icon: '🛍️',
    category: 'sales',
    players: '1-2',
    duration: '7 мин',
    difficulty: '⭐⭐⭐',
    rewards: ['💰', '⭐'],
    locked: false,
    featured: false
  },
  {
    id: 'fabric_cutting',
    name: 'Раскрой ткани',
    description: 'Точно вырезайте детали одежды',
    icon: '✂️',
    category: 'production',
    players: '1',
    duration: '4 мин',
    difficulty: '⭐⭐',
    rewards: ['⭐', '🧵'],
    locked: false,
    featured: false
  },
  {
    id: 'team_design',
    name: 'Командный дизайн',
    description: 'Создавайте коллекции вместе с друзьями',
    icon: '👥',
    category: 'coop',
    players: '2-6',
    duration: '15 мин',
    difficulty: '⭐⭐⭐⭐⭐',
    rewards: ['💰', '⭐', '🏆', '🎁'],
    locked: true,
    featured: false,
    unlockRequirement: 'Уровень 10'
  },
  {
    id: 'pattern_puzzle',
    name: 'Головоломка узоров',
    description: 'Создавайте красивые узоры на ткани',
    icon: '🧩',
    category: 'puzzle',
    players: '1',
    duration: '6 мин',
    difficulty: '⭐⭐⭐',
    rewards: ['⭐', '🎨'],
    locked: true,
    featured: false,
    unlockRequirement: '5 побед в дизайне'
  },
  {
    id: 'fashion_quiz',
    name: 'Модная викторина',
    description: 'Проверьте свои знания о моде',
    icon: '❓',
    category: 'puzzle',
    players: '1-4',
    duration: '8 мин',
    difficulty: '⭐⭐',
    rewards: ['⭐', '📚'],
    locked: false,
    featured: false
  }
])

// Рекомендуемые игры
const recommendedGames = ref([
  {
    id: 'sewing_master',
    name: 'Мастер шитья',
    shortDescription: 'Быстрая игра для новичков',
    icon: '🧵'
  },
  {
    id: 'fashion_show',
    name: 'Модный показ',
    shortDescription: 'Популярная игра с друзьями',
    icon: '👗'
  },
  {
    id: 'color_matching',
    name: 'Подбор цветов',
    shortDescription: 'Расслабляющая творческая игра',
    icon: '🎨'
  }
])

// Фильтрованные игры
const filteredGames = computed(() => {
  if (activeCategory.value === 'all') {
    return allGames.value
  }
  return allGames.value.filter(game => game.category === activeCategory.value)
})

// Установка активной категории
const setActiveCategory = (categoryId: string) => {
  activeCategory.value = categoryId
}

// Запуск игры
const playGame = (game: any) => {
  if (game.locked) {
    alert(`Игра заблокирована! ${game.unlockRequirement}`)
    return
  }
  
  // Проверяем авторизацию перед запуском игры
  const isAuthenticated = requireAuth('game-start', () => {
    // Здесь будет логика запуска игры после авторизации
    alert(`Запускаем игру: ${game.name}`)
    console.log('Запуск игры:', game)
  })
  
  if (isAuthenticated) {
    // Здесь будет логика запуска игры
    alert(`Запускаем игру: ${game.name}`)
    console.log('Запуск игры:', game)
  }
}

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

.minigames-modal {
  background: white;
  border-radius: 20px;
  max-width: 1000px;
  width: 95%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
  border-radius: 20px 20px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-content {
  padding: 30px;
}

.game-categories {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 15px 20px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
  white-space: nowrap;
}

.category-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.category-btn.active {
  background: #9b59b6;
  color: white;
  border-color: #8e44ad;
}

.category-icon {
  font-size: 1.5rem;
}

.category-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.game-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.game-card.featured {
  border: 3px solid #f39c12;
}

.game-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
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
  gap: 5px;
  font-size: 0.8rem;
  color: #666;
}

.stat-icon {
  font-size: 1rem;
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

/* Адаптивность */
@media (max-width: 768px) {
  .minigames-modal {
    width: 98%;
    margin: 10px;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .game-categories {
    flex-wrap: wrap;
  }
  
  .category-btn {
    min-width: 80px;
  }
}
</style>
