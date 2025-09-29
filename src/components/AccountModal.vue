<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal account-modal" @click.stop>
      <div class="modal-header">
        <h2 class="menu-title">👤 Учетная запись</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      
      <div class="modal-content">
        <!-- Информация о пользователе -->
        <div class="user-info-section">
          <div class="user-avatar">
            <div class="avatar-icon">🦆</div>
          </div>
          <div class="user-details">
            <h3 class="username">{{ userInfo.username }}</h3>
            <p class="user-level">Уровень: {{ userInfo.level }}</p>
            <p class="user-experience">Опыт: {{ userInfo.experience }}/{{ userInfo.nextLevelExp }}</p>
          </div>
        </div>
        
        <!-- Прогресс-бар опыта -->
        <div class="experience-bar">
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: experiencePercentage + '%' }"></div>
          </div>
          <span class="progress-text">{{ experiencePercentage }}%</span>
        </div>
        
        <!-- Статистика -->
        <div class="stats-section">
          <h3>📊 Статистика</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-icon">🏢</span>
              <span class="stat-label">Компании создано:</span>
              <span class="stat-value">{{ userStats.companiesCreated }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💰</span>
              <span class="stat-label">Заработано:</span>
              <span class="stat-value">{{ formatMoney(userStats.totalEarned) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🎯</span>
              <span class="stat-label">Мини-игр сыграно:</span>
              <span class="stat-value">{{ userStats.minigamesPlayed }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⏱️</span>
              <span class="stat-label">Время в игре:</span>
              <span class="stat-value">{{ userStats.playTime }}</span>
            </div>
          </div>
        </div>
        
        <!-- Достижения -->
        <div class="achievements-section">
          <h3>🏆 Достижения</h3>
          <div class="achievements-grid">
            <div 
              v-for="achievement in achievements" 
              :key="achievement.id"
              class="achievement-item"
              :class="{ 'unlocked': achievement.unlocked }"
            >
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-info">
                <h4>{{ achievement.title }}</h4>
                <p>{{ achievement.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Настройки аккаунта -->
        <div class="account-settings-section">
          <h3>⚙️ Настройки аккаунта</h3>
          <div class="setting-item">
            <label>Имя пользователя</label>
            <input 
              type="text" 
              v-model="userInfo.username"
              class="text-input"
              placeholder="Введите имя пользователя"
            />
          </div>
          <div class="setting-item">
            <label>Email</label>
            <input 
              type="email" 
              v-model="userInfo.email"
              class="text-input"
              placeholder="Введите email"
            />
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="resetAccount">
          Сбросить прогресс
        </button>
        <button class="btn btn-primary" @click="saveAccount">
          Сохранить
        </button>
        <button class="btn btn-exit" @click="logout">
          🚪 Выйти из аккаунта
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// Эмиты
const emit = defineEmits<{
  close: []
}>()

// Auth store
const authStore = useAuthStore()

// Информация о пользователе
const userInfo = ref({
  username: 'Гусь-Предприниматель',
  level: 5,
  experience: 1250,
  nextLevelExp: 2000,
  email: 'goose@fashion-empire.com'
})

// Статистика пользователя
const userStats = ref({
  companiesCreated: 3,
  totalEarned: 125000,
  minigamesPlayed: 47,
  playTime: '12ч 34м'
})

// Достижения
const achievements = ref([
  {
    id: 1,
    icon: '🎯',
    title: 'Первый шаг',
    description: 'Создайте свою первую компанию',
    unlocked: true
  },
  {
    id: 2,
    icon: '💰',
    title: 'Миллионер',
    description: 'Заработайте 1,000,000 монет',
    unlocked: false
  },
  {
    id: 3,
    icon: '🏆',
    title: 'Чемпион',
    description: 'Займите 1 место в рейтинге',
    unlocked: false
  },
  {
    id: 4,
    icon: '⏰',
    title: 'Трудоголик',
    description: 'Играйте 24 часа подряд',
    unlocked: false
  }
])

// Вычисляемые свойства
const experiencePercentage = computed(() => {
  return Math.round((userInfo.value.experience / userInfo.value.nextLevelExp) * 100)
})

// Функции
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽'
}

const saveAccount = () => {
  // Здесь будет логика сохранения данных аккаунта
  console.log('Сохранение данных аккаунта:', userInfo.value)
  closeModal()
}

const resetAccount = () => {
  if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить!')) {
    // Здесь будет логика сброса прогресса
    console.log('Сброс прогресса аккаунта')
    closeModal()
  }
}

const closeModal = () => {
  emit('close')
}

const logout = async () => {
  if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
    const success = await authStore.signOut()
    if (success) {
      closeModal()
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.account-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: clamp(15px, 2vw, 30px);
  max-width: 900px;
  width: 95%;
  height: auto;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 clamp(10px, 2vw, 20px) clamp(30px, 6vw, 60px) var(--shadow-dark, rgba(0, 0, 0, 0.3));
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text, #5D4037);
}

.modal-content {
  padding: clamp(20px, 3vw, 40px);
}

.user-info-section {
  display: flex;
  align-items: center;
  gap: clamp(20px, 3vw, 30px);
  margin-bottom: clamp(25px, 4vw, 40px);
  padding: clamp(20px, 3vw, 30px);
  background: var(--gradient-bg);
  border-radius: clamp(12px, 2vw, 20px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-buttons);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium);
}

.user-avatar {
  width: clamp(80px, 12vw, 120px);
  height: clamp(80px, 12vw, 120px);
  background: var(--gradient-accents);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-dark);
}

.avatar-icon {
  font-size: clamp(2.5rem, 5vw, 4rem);
}

.user-details h3 {
  margin: 0 0 clamp(8px, 1vw, 12px) 0;
  color: var(--color-text);
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.user-details p {
  margin: 0 0 clamp(4px, 0.8vw, 8px) 0;
  color: var(--color-text);
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 500;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.experience-bar {
  margin-bottom: clamp(25px, 4vw, 40px);
  padding: clamp(15px, 2vw, 25px);
  background: var(--gradient-bg);
  border-radius: clamp(10px, 1.5vw, 15px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
}

.progress-container {
  width: 100%;
  height: clamp(20px, 3vw, 30px);
  background: var(--color-buttons-light);
  border-radius: clamp(10px, 1.5vw, 15px);
  overflow: hidden;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-text);
  margin-bottom: clamp(8px, 1vw, 12px);
}

.progress-bar {
  height: 100%;
  background: var(--gradient-buttons);
  transition: width 0.3s ease;
  border-radius: clamp(8px, 1.2vw, 12px);
}

.progress-text {
  color: var(--color-text);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: clamp(0.9rem, 1.6vw, 1.3rem);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.stats-section, .achievements-section, .account-settings-section {
  margin-bottom: clamp(25px, 4vw, 40px);
}

.stats-section h3, .achievements-section h3, .account-settings-section h3 {
  margin: 0 0 clamp(15px, 2vw, 25px) 0;
  color: var(--color-text);
  font-size: clamp(1.1rem, 2.2vw, 1.6rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  border-bottom: clamp(2px, 0.3vw, 4px) solid var(--color-buttons);
  padding-bottom: clamp(8px, 1vw, 15px);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: clamp(15px, 2vw, 20px);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: clamp(10px, 1.5vw, 15px);
  padding: clamp(12px, 2vw, 20px);
  background: var(--gradient-bg);
  border-radius: clamp(8px, 1.5vw, 15px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: var(--color-bg-menu-light);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-medium);
}

.stat-icon {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
}

.stat-label {
  flex: 1;
  color: var(--color-text);
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(0.9rem, 1.6vw, 1.3rem);
  font-weight: 500;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.stat-value {
  color: var(--color-accents);
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(0.9rem, 1.6vw, 1.3rem);
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(15px, 2vw, 20px);
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: clamp(12px, 2vw, 20px);
  padding: clamp(15px, 2vw, 25px);
  background: var(--gradient-bg);
  border-radius: clamp(10px, 1.5vw, 15px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
  transition: all 0.3s ease;
  opacity: 0.6;
}

.achievement-item.unlocked {
  opacity: 1;
  background: var(--color-bg-menu-light);
  border-color: var(--color-highlights);
}

.achievement-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-medium);
}

.achievement-icon {
  font-size: clamp(2rem, 3vw, 2.5rem);
}

.achievement-info h4 {
  margin: 0 0 clamp(4px, 0.8vw, 8px) 0;
  color: var(--color-text);
  font-size: clamp(1rem, 1.8vw, 1.4rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.achievement-info p {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(0.8rem, 1.4vw, 1.1rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 400;
  text-shadow: 1px 1px 0px var(--shadow-light);
  opacity: 0.8;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(15px, 2vw, 25px);
  padding: clamp(12px, 2vw, 20px);
  background: var(--gradient-bg);
  border-radius: clamp(8px, 1.5vw, 15px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
}

.setting-item label {
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(0.9rem, 1.6vw, 1.3rem);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.text-input {
  flex: 2;
  padding: clamp(8px, 1.2vw, 12px) clamp(12px, 2vw, 16px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  border-radius: clamp(6px, 1vw, 12px);
  background: var(--color-bg-menu);
  font-size: clamp(0.9rem, 1.6vw, 1.3rem);
  font-family: 'Orbitron', sans-serif;
  color: var(--color-text);
  box-shadow: 0 clamp(1px, 0.2vw, 2px) clamp(2px, 0.4vw, 4px) var(--shadow-light);
  transition: all 0.3s ease;
}

.text-input:focus {
  outline: none;
  border-color: var(--color-buttons);
  box-shadow: 0 0 0 clamp(2px, 0.4vw, 4px) var(--color-buttons-light);
}

/* Адаптивность */
@media (max-width: 768px) {
  .account-modal {
    width: 95%;
    margin: clamp(5px, 1vw, 10px);
  }
  
  .modal-content {
    padding: clamp(15px, 2vw, 25px);
  }
  
  .user-info-section {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-grid, .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(8px, 1.5vw, 15px);
  }
  
  .text-input {
    width: 100%;
  }
}

/* Стили для кнопок */
.btn {
  padding: clamp(8px, 1.5vw, 16px) clamp(16px, 3vw, 32px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  border-radius: clamp(6px, 1vw, 12px);
  font-size: clamp(0.8rem, 1.5vw, 1.2rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 0px var(--shadow-light);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium);
}

.btn-primary {
  background: var(--gradient-buttons);
  color: white;
}

.btn-primary:hover {
  background: var(--gradient-accents);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-dark);
}

.btn-secondary {
  background: var(--gradient-bg);
  color: var(--color-text);
}

.btn-secondary:hover {
  background: var(--color-bg-menu-light);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-medium);
}

.btn-exit {
  background: var(--gradient-accents);
  color: white;
  font-size: clamp(0.7rem, 1.3vw, 1rem);
  padding: clamp(6px, 1.2vw, 12px) clamp(12px, 2.5vw, 24px);
}

.btn-exit:hover {
  background: linear-gradient(135deg, var(--color-accents-dark) 0%, #8B3A3A 100%);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-dark);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: clamp(10px, 2vw, 20px);
  padding: clamp(15px, 2vw, 30px);
  border-top: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  background: var(--gradient-bg);
  border-radius: 0 0 clamp(15px, 2vw, 30px) clamp(15px, 2vw, 30px);
}
</style>
