<template>
  <div class="time-controls">
    <!-- Дата -->
    <div class="date-info">
      <span class="date-value">{{ timeStore.gameDate }}</span>
    </div>

    <!-- Прогресс дня -->
    <div class="time-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: timeStore.timeProgress + '%' }"
        ></div>
      </div>
      <span class="progress-text">{{ Math.round(timeStore.timeProgress) }}%</span>
    </div>

    <!-- Кнопки управления -->
    <div class="time-buttons">
      <button 
        class="time-btn pause-btn"
        :class="{ active: timeStore.gameTime.isPaused }"
        @click="togglePause"
        :title="timeStore.gameTime.isPaused ? 'Продолжить' : 'Пауза'"
      >
        <span class="btn-icon">{{ timeStore.gameTime.isPaused ? '▶️' : '⏸️' }}</span>
      </button>

      <button 
        class="time-btn next-day-btn"
        @click="nextDay"
        title="Следующий день"
      >
        <span class="btn-icon">⏭️</span>
      </button>

      <button 
        class="time-btn fast-forward-btn"
        @click="toggleAccelerationX2"
        :title="timeStore.isFastForward ? 'Скорость x1' : 'Скорость x2'"
      >
        <span class="btn-icon">{{ timeStore.isFastForward ? 'x1' : 'x2' }}</span>
      </button>

      <button 
        class="time-btn report-btn"
        @click="showDailyReport(true)"
        title="Просмотр отчёта"
      >
        <span class="btn-icon">📊</span>
      </button>
    </div>

    <!-- Сезон -->
    <div class="season-info">
      <span class="info-icon">🌱</span>
      <span class="info-text">{{ getSeasonName() }}</span>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTimeStore } from '@/stores/timeStore'
import { useEconomyStore } from '@/stores/economyStore'
// Эмиты
const emit = defineEmits<{
  'show-report': [day: number]
  'hide-report': []
}>()

// Сторы
const timeStore = useTimeStore()
const economyStore = useEconomyStore()

const reportDay = ref(1)

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


// Методы
const togglePause = () => {
  timeStore.pauseTime()
}

const toggleAccelerationX2 = () => {
  timeStore.toggleAccelerationX2()
}

const nextDay = async () => {
  // Сначала создаем отчет за ТЕКУЩИЙ день
  await processDailyCalculations()
  
  // Потом переходим на следующий день
  timeStore.nextDay()
}



const showDailyReport = (isManual = false) => {
  // Проверяем настройку пользователя только для автоматического показа
  if (!isManual) {
    const dontShow = localStorage.getItem('dontShowDailyReport') === 'true'
    if (dontShow) {
      console.log('📊 Автоматический показ ежедневного отчета отключен пользователем')
      return
    }
  }
  
  // Для ручного показа ищем последний доступный отчет
  let targetDay = reportDay.value
  if (isManual) {
    const reports = economyStore.dailyReports
    if (reports.length > 0) {
      // Берем последний созданный отчет
      const lastReport = reports[reports.length - 1]
      targetDay = lastReport.day
      console.log('📊 Показываем последний отчет за день', targetDay)
    } else {
      console.log('📊 Отчеты отсутствуют')
      return
    }
  }
  
  console.log('📊 Показываем отчет', isManual ? 'вручную' : 'автоматически', 'за день', targetDay)
  emit('show-report', targetDay)
}

const processDailyCalculations = async () => {
  try {
    console.log('🔄 Обработка дневных расчётов...')
    
    // Создаем отчет за ТЕКУЩИЙ день (до перехода на следующий)
    const currentDay = timeStore.gameTime.day
    const report = await economyStore.processDailyCalculations(currentDay)
    console.log('✅ Дневной отчёт создан для дня', currentDay, ':', report)
    
    // Сохраняем день отчета для показа
    reportDay.value = currentDay
    
    // Автоматически показываем отчет после создания (с проверкой галочки)
    showDailyReport(false) // false = автоматический показ
    
  } catch (error) {
    console.error('❌ Ошибка при обработке дневных расчётов:', error)
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

// Убрали уведомления о смене времени дня

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
  border-radius: clamp(8px, 1.2vw, 15px);
  padding: clamp(12px, 2vw, 18px) clamp(18px, 2.5vw, 25px);
  border: clamp(2px, 0.3vw, 3px) solid var(--color-text, #5D4037);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium, rgba(0,0,0,0.2));
  font-family: 'Orbitron', sans-serif;
  display: flex;
  align-items: center;
  gap: clamp(12px, 2vw, 20px);
  flex-wrap: nowrap;
  min-width: 700px;
  height: fit-content;
  backdrop-filter: blur(5px);
}

/* Информация о дате */
.date-info {
  display: flex;
  align-items: center;
}

.date-value {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 700;
  color: var(--color-text, #5D4037);
  white-space: nowrap;
}

.time-progress {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 12px);
  min-width: clamp(140px, 20vw, 200px);
}

.progress-bar {
  flex: 1;
  height: clamp(8px, 1.5vw, 12px);
  background: var(--color-bg-menu-light, #E6D3B7);
  border-radius: clamp(6px, 1vw, 8px);
  overflow: hidden;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-text, #5D4037);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: clamp(0.7rem, 1.2vw, 0.9rem);
  font-weight: 700;
  color: var(--color-text, #5D4037);
  min-width: clamp(25px, 4vw, 35px);
}

/* Кнопки управления */
.time-buttons {
  display: flex;
  gap: clamp(6px, 1vw, 8px);
}

.time-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(40px, 6vw, 50px);
  height: clamp(40px, 6vw, 50px);
  border: clamp(2px, 0.3vw, 3px) solid var(--color-text, #5D4037);
  border-radius: clamp(8px, 1.2vw, 10px);
  background: var(--color-bg-menu-light, #F9F1E8);
  color: var(--color-text, #5D4037);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
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
  font-size: clamp(1.2rem, 2.2vw, 1.6rem);
}

/* Информация о сезоне */
.season-info {
  display: flex;
  align-items: center;
  gap: clamp(6px, 1.2vw, 10px);
  padding: clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px);
  background: var(--color-bg-menu-light, #F9F1E8);
  border-radius: clamp(6px, 1vw, 8px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons-light, #D4824A);
  white-space: nowrap;
  min-width: fit-content;
}

.info-icon {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
}

.info-text {
  font-size: clamp(1rem, 1.8vw, 1.3rem);
  font-weight: 600;
  color: var(--color-text, #5D4037);
}



/* Адаптивность */
@media (max-width: 768px) {
  .time-controls {
    min-width: auto;
    width: 100%;
    gap: clamp(8px, 1.5vw, 12px);
    padding: clamp(8px, 1.5vw, 12px);
  }
  
  .time-buttons {
    gap: clamp(4px, 0.8vw, 6px);
  }
  
  .time-btn {
    width: clamp(36px, 5.5vw, 44px);
    height: clamp(36px, 5.5vw, 44px);
  }
  
  .btn-icon {
    font-size: clamp(1rem, 1.8vw, 1.3rem);
  }
  
  .season-info {
    padding: clamp(6px, 1.2vw, 8px) clamp(8px, 1.5vw, 12px);
  }
  
  .info-text {
    font-size: clamp(0.8rem, 1.4vw, 1rem);
  }
  
  .report-modal-center {
    max-width: 95vw;
    max-height: 95vh;
  }
}
</style>
