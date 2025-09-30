<template>
  <div class="time-controls">
    <!-- Основная информация о времени -->
    <div class="time-display">
      <div class="time-main">
        <span class="time-value">{{ timeStore.currentTime.time }}</span>
        <span class="time-acceleration" v-if="timeStore.timeAcceleration > 1">
          {{ timeStore.timeAcceleration }}x
        </span>
      </div>
      <div class="date-display">{{ timeStore.gameDate }}</div>
      <div class="time-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: timeStore.timeProgress + '%' }"
          ></div>
        </div>
        <span class="progress-text">{{ Math.round(timeStore.timeProgress) }}%</span>
      </div>
    </div>

    <!-- Кнопки управления временем -->
    <div class="time-buttons">
      <button 
        class="time-btn pause-btn"
        :class="{ active: timeStore.gameTime.isPaused }"
        @click="togglePause"
        :title="timeStore.gameTime.isPaused ? 'Продолжить' : 'Пауза'"
      >
        <span class="btn-icon">{{ timeStore.gameTime.isPaused ? '▶️' : '⏸️' }}</span>
        <span class="btn-text">{{ timeStore.gameTime.isPaused ? 'Продолжить' : 'Пауза' }}</span>
      </button>

      <button 
        class="time-btn next-day-btn"
        @click="nextDay"
        :disabled="timeStore.isFastForward"
        title="Следующий день"
      >
        <span class="btn-icon">⏭️</span>
        <span class="btn-text">+1 день</span>
      </button>

      <button 
        class="time-btn fast-forward-btn"
        @click="fastForwardDay"
        :disabled="timeStore.isFastForward"
        title="Промотать день"
      >
        <span class="btn-icon">⏩</span>
        <span class="btn-text">Промотать</span>
      </button>

      <button 
        class="time-btn report-btn"
        @click="showDailyReport"
        title="Просмотр отчёта"
      >
        <span class="btn-icon">📊</span>
        <span class="btn-text">Отчёт</span>
      </button>
    </div>

    <!-- Информация о сезоне и погоде -->
    <div class="environment-info">
      <div class="season-info">
        <span class="info-icon">🌱</span>
        <span class="info-text">{{ getSeasonName() }}</span>
      </div>
      <div class="weather-info">
        <span class="info-icon">{{ getWeatherIcon() }}</span>
        <span class="info-text">{{ getWeatherName() }}</span>
      </div>
    </div>

    <!-- Уведомления о времени -->
    <div v-if="timeNotifications.length > 0" class="time-notifications">
      <div 
        v-for="notification in timeNotifications" 
        :key="notification.id"
        class="time-notification"
        :class="notification.type"
      >
        <span class="notification-icon">{{ notification.icon }}</span>
        <span class="notification-text">{{ notification.message }}</span>
        <button 
          class="notification-close"
          @click="removeNotification(notification.id)"
        >×</button>
      </div>
    </div>

    <!-- Модальное окно дневного отчёта -->
    <DailyReportModal 
      v-if="showReportModal"
      :day="timeStore.currentDay"
      @close="showReportModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTimeStore } from '@/stores/timeStore'
import { useEconomyStore } from '@/stores/economyStore'
import DailyReportModal from './DailyReportModal.vue'

// Сторы
const timeStore = useTimeStore()
const economyStore = useEconomyStore()

// Уведомления о времени
interface TimeNotification {
  id: string
  type: 'info' | 'warning' | 'success'
  icon: string
  message: string
}

const timeNotifications = ref<TimeNotification[]>([])
const showReportModal = ref(false)

// Интервал для автоматического тика времени
let timeInterval: NodeJS.Timeout | null = null

// Вычисляемые свойства
const getSeasonName = () => {
  const season = timeStore.getSeason()
  const names = {
    spring: 'Весна',
    summer: 'Лето',
    autumn: 'Осень',
    winter: 'Зима'
  }
  return names[season as keyof typeof names] || season
}

const getWeatherIcon = () => {
  const weather = timeStore.getWeather()
  const icons = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    snowy: '❄️'
  }
  return icons[weather as keyof typeof icons] || '☀️'
}

const getWeatherName = () => {
  const weather = timeStore.getWeather()
  const names = {
    sunny: 'Солнечно',
    cloudy: 'Облачно',
    rainy: 'Дождливо',
    snowy: 'Снежно'
  }
  return names[weather as keyof typeof names] || 'Солнечно'
}

// Методы
const togglePause = () => {
  timeStore.pauseTime()
  
  if (timeStore.gameTime.isPaused) {
    addNotification('info', '⏸️', 'Время приостановлено')
  } else {
    addNotification('info', '▶️', 'Время продолжено')
  }
}

const nextDay = () => {
  timeStore.nextDay()
  addNotification('success', '🌅', 'Наступил новый день!')
  
  // Здесь можно добавить логику дневных расчётов
  processDailyCalculations()
}

const fastForwardDay = () => {
  timeStore.fastForwardDay()
  addNotification('info', '⏩', 'Промотка дня...')
  
  // Обрабатываем расчёты после промотки
  setTimeout(() => {
    processDailyCalculations()
    addNotification('success', '🌅', 'День промотан!')
  }, 1000)
}

const addNotification = (type: TimeNotification['type'], icon: string, message: string) => {
  const notification: TimeNotification = {
    id: Date.now().toString(),
    type,
    icon,
    message
  }
  
  timeNotifications.value.push(notification)
  
  // Автоматически удаляем уведомление через 5 секунд
  setTimeout(() => {
    removeNotification(notification.id)
  }, 5000)
}

const removeNotification = (id: string) => {
  const index = timeNotifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    timeNotifications.value.splice(index, 1)
  }
}

const showDailyReport = () => {
  showReportModal.value = true
}

const processDailyCalculations = async () => {
  try {
    console.log('🔄 Обработка дневных расчётов...')
    
    const report = await economyStore.processDailyCalculations()
    
    // Уведомления о результатах
    if (report.expenses.rent > 0) {
      addNotification('info', '💰', `Списана аренда: -₽${report.expenses.rent.toLocaleString()}`)
    }
    
    if (report.income.sales > 0) {
      addNotification('success', '📈', `Получен доход: +₽${report.income.sales.toLocaleString()}`)
    }
    
    if (report.expenses.taxes > 0) {
      addNotification('warning', '🏛️', `Уплачены налоги: -₽${report.expenses.taxes.toLocaleString()}`)
    }
    
    if (report.production.itemsProduced > 0) {
      addNotification('info', '🏭', `Произведено: ${report.production.itemsProduced} предметов`)
    }
    
    const profitText = report.netProfit >= 0 ? `+₽${report.netProfit.toLocaleString()}` : `-₽${Math.abs(report.netProfit).toLocaleString()}`
    addNotification(report.netProfit >= 0 ? 'success' : 'warning', '💼', `Итоговая прибыль: ${profitText}`)
    
  } catch (error) {
    console.error('❌ Ошибка при обработке дневных расчётов:', error)
    addNotification('warning', '⚠️', 'Ошибка при обработке расчётов')
  }
}

// Запуск автоматического тика времени
const startTimeTick = () => {
  if (timeInterval) return
  
  timeInterval = setInterval(() => {
    timeStore.tick()
  }, 1000) // Каждую секунду
}

const stopTimeTick = () => {
  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }
}

// Следим за изменениями времени для уведомлений
watch(() => timeStore.currentTime.time, (newTime, oldTime) => {
  if (newTime !== oldTime) {
    // Уведомления о смене времени дня
    const hour = parseInt(newTime.split(':')[0])
    
    if (hour === 9 && timeStore.currentTime.time === '09:00') {
      addNotification('info', '🌅', 'Начало рабочего дня')
    } else if (hour === 18 && timeStore.currentTime.time === '18:00') {
      addNotification('info', '🌆', 'Конец рабочего дня')
    } else if (hour === 22 && timeStore.currentTime.time === '22:00') {
      addNotification('info', '🌙', 'Поздний вечер')
    }
  }
})

// Жизненный цикл
onMounted(() => {
  startTimeTick()
})

onUnmounted(() => {
  stopTimeTick()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';

.time-controls {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: clamp(12px, 2vw, 20px);
  padding: clamp(15px, 2vw, 20px);
  border: clamp(2px, 0.3vw, 3px) solid var(--color-text, #5D4037);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium, rgba(0,0,0,0.2));
  font-family: 'Orbitron', sans-serif;
}

/* Отображение времени */
.time-display {
  text-align: center;
  margin-bottom: clamp(15px, 2vw, 20px);
}

.time-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 1.2vw, 12px);
  margin-bottom: clamp(8px, 1vw, 12px);
}

.time-value {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  font-weight: 900;
  color: var(--color-text, #5D4037);
  text-shadow: 1px 1px 0px var(--shadow-light, rgba(255,255,255,0.5));
}

.time-acceleration {
  background: var(--gradient-accents, linear-gradient(135deg, #C85A54 0%, #D4824A 100%));
  color: white;
  padding: clamp(4px, 0.8vw, 6px) clamp(8px, 1.2vw, 12px);
  border-radius: clamp(6px, 1vw, 8px);
  font-size: clamp(0.8rem, 1.4vw, 1rem);
  font-weight: 700;
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium, rgba(0,0,0,0.2));
}

.date-display {
  font-size: clamp(1rem, 2vw, 1.4rem);
  font-weight: 700;
  color: var(--color-text, #5D4037);
  opacity: 0.8;
  margin-bottom: clamp(8px, 1vw, 12px);
}

.time-progress {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.2vw, 12px);
}

.progress-bar {
  flex: 1;
  height: clamp(8px, 1.2vw, 12px);
  background: var(--color-bg-menu-light, #E6D3B7);
  border-radius: clamp(6px, 1vw, 10px);
  overflow: hidden;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-text, #5D4037);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: clamp(0.8rem, 1.4vw, 1rem);
  font-weight: 700;
  color: var(--color-text, #5D4037);
  min-width: clamp(30px, 5vw, 40px);
}

/* Кнопки управления */
.time-buttons {
  display: flex;
  gap: clamp(8px, 1.2vw, 12px);
  margin-bottom: clamp(15px, 2vw, 20px);
  flex-wrap: wrap;
}

.time-btn {
  display: flex;
  align-items: center;
  gap: clamp(6px, 1vw, 8px);
  padding: clamp(8px, 1.2vw, 12px) clamp(12px, 2vw, 16px);
  border: clamp(2px, 0.3vw, 3px) solid var(--color-text, #5D4037);
  border-radius: clamp(8px, 1.2vw, 12px);
  background: var(--color-bg-menu-light, #F9F1E8);
  color: var(--color-text, #5D4037);
  font-size: clamp(0.8rem, 1.4vw, 1rem);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  flex: 1;
  min-width: 0;
  justify-content: center;
}

.time-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium, rgba(0,0,0,0.2));
}

.time-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.time-btn.active {
  background: var(--gradient-accents, linear-gradient(135deg, #C85A54 0%, #D4824A 100%));
  color: white;
  border-color: var(--color-accents, #C85A54);
}

.btn-icon {
  font-size: clamp(1rem, 1.8vw, 1.2rem);
}

.btn-text {
  font-size: clamp(0.7rem, 1.2vw, 0.9rem);
}

/* Информация об окружении */
.environment-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: clamp(15px, 2vw, 20px);
  padding: clamp(8px, 1.2vw, 12px);
  background: var(--color-bg-menu-light, #F9F1E8);
  border-radius: clamp(6px, 1vw, 10px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons-light, #D4824A);
}

.season-info,
.weather-info {
  display: flex;
  align-items: center;
  gap: clamp(6px, 1vw, 8px);
}

.info-icon {
  font-size: clamp(1rem, 1.8vw, 1.2rem);
}

.info-text {
  font-size: clamp(0.8rem, 1.4vw, 1rem);
  font-weight: 600;
  color: var(--color-text, #5D4037);
}

/* Уведомления */
.time-notifications {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1vw, 8px);
}

.time-notification {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.2vw, 12px);
  padding: clamp(8px, 1.2vw, 12px);
  border-radius: clamp(6px, 1vw, 10px);
  font-size: clamp(0.8rem, 1.4vw, 1rem);
  font-weight: 600;
  animation: slideIn 0.3s ease;
}

.time-notification.info {
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid #2196F3;
  color: #1976D2;
}

.time-notification.warning {
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid #FF9800;
  color: #F57C00;
}

.time-notification.success {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4CAF50;
  color: #2E7D32;
}

.notification-icon {
  font-size: clamp(1rem, 1.8vw, 1.2rem);
}

.notification-text {
  flex: 1;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: clamp(1rem, 1.8vw, 1.2rem);
  cursor: pointer;
  padding: 0;
  width: clamp(20px, 3vw, 24px);
  height: clamp(20px, 3vw, 24px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .time-buttons {
    flex-direction: column;
  }
  
  .time-btn {
    flex: none;
  }
  
  .environment-info {
    flex-direction: column;
    gap: clamp(8px, 1.2vw, 12px);
  }
}
</style>
