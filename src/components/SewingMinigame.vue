<template>
  <div class="sewing-minigame">
    <div class="game-header">
      <h3>{{ order?.itemName || 'Пошив одежды' }}</h3>
      <div class="progress-info">
        <span>Прогресс: {{ currentProgress }}%</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: currentProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="game-area">
      <!-- Режим кликера -->
      <div v-if="gameMode === 'clicker'" class="clicker-mode">
        <div class="sewing-machine">
          <div class="machine-body" @click="handleClick">
            <div class="needle" :class="{ active: isClicking }">📌</div>
            <div class="thread" :style="{ opacity: threadOpacity }">🧵</div>
          </div>
          <div class="speed-indicator">
            <span>Скорость: {{ currentSpeed }}/мин</span>
            <div class="speed-bar">
              <div class="speed-fill" :style="{ width: speedProgress + '%' }"></div>
            </div>
          </div>
        </div>
        
        <div class="click-instructions">
          <p>Кликайте по швейной машине для поддержания скорости!</p>
          <p>Минимальная скорость: {{ minSpeed }}/мин</p>
        </div>
      </div>

      <!-- Режим точности -->
      <div v-else-if="gameMode === 'precision'" class="precision-mode">
        <div class="target-area">
          <div 
            v-for="target in targets" 
            :key="target.id"
            class="target"
            :class="{ 
              active: target.isActive, 
              hit: target.isHit,
              missed: target.isMissed 
            }"
            :style="{ 
              left: target.x + '%', 
              top: target.y + '%',
              '--target-size': target.size + 'px'
            }"
            @click="hitTarget(target.id)"
          >
            {{ target.icon }}
          </div>
        </div>
        
        <div class="precision-info">
          <span>Попаданий: {{ hits }}/{{ targets.length }}</span>
          <span>Точность: {{ accuracy }}%</span>
        </div>
      </div>

      <!-- Ручной режим (конструктор) -->
      <div v-else-if="gameMode === 'manual'" class="manual-mode">
        <div class="constructor-placeholder">
          <h4>Конструктор одежды</h4>
          <p>Здесь будет интегрирован конструктор одежды</p>
          <button @click="completeManualWork" class="complete-btn">
            Завершить работу
          </button>
        </div>
      </div>
    </div>

    <div class="game-controls">
      <button @click="startGame" :disabled="isPlaying" class="start-btn">
        {{ isPlaying ? 'В процессе...' : 'Начать работу' }}
      </button>
      <button @click="pauseGame" :disabled="!isPlaying" class="pause-btn">
        Пауза
      </button>
      <button @click="stopGame" class="stop-btn">
        Остановить
      </button>
    </div>

    <div class="game-stats">
      <div class="stat">
        <span>Время: {{ formatTime(gameTime) }}</span>
      </div>
      <div class="stat">
        <span>Качество: {{ quality }}%</span>
      </div>
      <div class="stat">
        <span>Скорость: {{ averageSpeed }}/мин</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Target {
  id: string
  x: number
  y: number
  size: number
  icon: string
  isActive: boolean
  isHit: boolean
  isMissed: boolean
  timeout: number
}

interface Props {
  orderId?: string
  gameMode?: 'clicker' | 'precision' | 'manual'
  onComplete?: (progress: number, quality: number) => void
}

const props = withDefaults(defineProps<Props>(), {
  gameMode: 'clicker'
})

const emit = defineEmits<{
  complete: [progress: number, quality: number]
  close: []
}>()

// Игровое состояние
const isPlaying = ref(false)
const gameTime = ref(0)
const currentProgress = ref(0)
const quality = ref(100)
const currentSpeed = ref(0)
const averageSpeed = ref(0)
const isClicking = ref(false)
const threadOpacity = ref(1)

// Режим кликера
const minSpeed = ref(30)
const speedDecay = ref(2) // скорость падения в секунду
const speedGain = ref(5) // прирост при клике
const speedInterval = ref<NodeJS.Timeout | null>(null)

// Режим точности
const targets = ref<Target[]>([])
const hits = ref(0)
const targetSpawnRate = ref(2000) // мс между появлением целей
const targetTimeout = ref(3000) // мс на попадание
const targetSpawnInterval = ref<NodeJS.Timeout | null>(null)

// Игровые интервалы
let gameInterval: NodeJS.Timeout | null = null

// Computed
const speedProgress = computed(() => {
  return Math.min(100, (currentSpeed.value / minSpeed.value) * 100)
})

const accuracy = computed(() => {
  const totalTargets = targets.value.length
  return totalTargets > 0 ? Math.round((hits.value / totalTargets) * 100) : 0
})

// Методы
const startGame = () => {
  if (isPlaying.value) return
  
  isPlaying.value = true
  gameTime.value = 0
  currentProgress.value = 0
  quality.value = 100
  currentSpeed.value = minSpeed.value
  hits.value = 0
  targets.value = []
  
  // Запускаем игровой цикл
  gameInterval = setInterval(() => {
    gameTime.value++
    updateGame()
  }, 1000)
  
  // Запускаем режим-специфичные интервалы
  if (props.gameMode === 'clicker') {
    startClickerMode()
  } else if (props.gameMode === 'precision') {
    startPrecisionMode()
  }
}

const pauseGame = () => {
  isPlaying.value = false
  stopIntervals()
}

const stopGame = () => {
  isPlaying.value = false
  stopIntervals()
  emit('close')
}

const stopIntervals = () => {
  if (gameInterval) {
    clearInterval(gameInterval)
    gameInterval = null
  }
  if (speedInterval.value) {
    clearInterval(speedInterval.value)
    speedInterval.value = null
  }
  if (targetSpawnInterval.value) {
    clearInterval(targetSpawnInterval.value)
    targetSpawnInterval.value = null
  }
}

const updateGame = () => {
  // Обновляем прогресс в зависимости от режима
  if (props.gameMode === 'clicker') {
    updateClickerProgress()
  } else if (props.gameMode === 'precision') {
    updatePrecisionProgress()
  }
  
  // Проверяем завершение
  if (currentProgress.value >= 100) {
    completeGame()
  }
}

const startClickerMode = () => {
  speedInterval.value = setInterval(() => {
    if (isPlaying.value) {
      currentSpeed.value = Math.max(0, currentSpeed.value - speedDecay.value)
      averageSpeed.value = Math.round((averageSpeed.value + currentSpeed.value) / 2)
    }
  }, 1000)
}

const updateClickerProgress = () => {
  if (currentSpeed.value >= minSpeed.value) {
    const progressGain = Math.min(2, currentSpeed.value / minSpeed.value)
    currentProgress.value = Math.min(100, currentProgress.value + progressGain)
    
    // Качество зависит от стабильности скорости
    const speedStability = Math.min(1, currentSpeed.value / (minSpeed.value * 1.5))
    quality.value = Math.max(50, quality.value - (1 - speedStability) * 2)
  } else {
    // Штраф за низкую скорость
    quality.value = Math.max(30, quality.value - 3)
  }
}

const handleClick = () => {
  if (!isPlaying.value) return
  
  isClicking.value = true
  currentSpeed.value = Math.min(100, currentSpeed.value + speedGain.value)
  
  // Анимация клика
  setTimeout(() => {
    isClicking.value = false
  }, 150)
  
  // Анимация нити
  threadOpacity.value = 0.3
  setTimeout(() => {
    threadOpacity.value = 1
  }, 200)
}

const startPrecisionMode = () => {
  targetSpawnInterval.value = setInterval(() => {
    if (isPlaying.value) {
      spawnTarget()
    }
  }, targetSpawnRate.value)
}

const spawnTarget = () => {
  const target: Target = {
    id: Date.now().toString(),
    x: Math.random() * 80 + 10, // 10-90%
    y: Math.random() * 60 + 20, // 20-80%
    size: 40 + Math.random() * 20, // 40-60px
    icon: ['🎯', '⭐', '💎', '🔸', '🔹'][Math.floor(Math.random() * 5)],
    isActive: true,
    isHit: false,
    isMissed: false,
    timeout: targetTimeout.value
  }
  
  targets.value.push(target)
  
  // Автоматически помечаем как промах через timeout
  setTimeout(() => {
    const targetIndex = targets.value.findIndex(t => t.id === target.id)
    if (targetIndex !== -1 && targets.value[targetIndex].isActive) {
      targets.value[targetIndex].isMissed = true
      targets.value[targetIndex].isActive = false
    }
  }, targetTimeout.value)
}

const hitTarget = (targetId: string) => {
  const target = targets.value.find(t => t.id === targetId)
  if (!target || !target.isActive) return
  
  target.isHit = true
  target.isActive = false
  hits.value++
  
  // Обновляем качество
  quality.value = Math.min(100, quality.value + 2)
}

const updatePrecisionProgress = () => {
  const totalTargets = targets.value.length
  if (totalTargets > 0) {
    const hitRate = hits.value / totalTargets
    const progressGain = hitRate * 3 // 3% за каждую цель
    currentProgress.value = Math.min(100, currentProgress.value + progressGain)
  }
}

const completeManualWork = () => {
  currentProgress.value = 100
  quality.value = 95 // Ручная работа всегда высокого качества
  completeGame()
}

const completeGame = () => {
  isPlaying.value = false
  stopIntervals()
  
  const finalProgress = Math.min(100, currentProgress.value)
  const finalQuality = Math.max(30, quality.value)
  
  emit('complete', finalProgress, finalQuality)
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Очистка при размонтировании
onUnmounted(() => {
  stopIntervals()
})
</script>

<style scoped>
.sewing-minigame {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: 15px;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.game-header {
  text-align: center;
  margin-bottom: 20px;
}

.game-header h3 {
  color: var(--color-text, #5D4037);
  margin-bottom: 10px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.progress-bar {
  width: 200px;
  height: 20px;
  background: var(--color-bg-menu-light, #E6D3B7);
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--color-text, #5D4037);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
  transition: width 0.3s ease;
}

.game-area {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}

/* Режим кликера */
.clicker-mode {
  text-align: center;
}

.sewing-machine {
  position: relative;
  width: 200px;
  height: 150px;
  margin: 0 auto 20px;
  cursor: pointer;
}

.machine-body {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #8D6E63, #A1887F);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.1s ease;
  border: 3px solid var(--color-text, #5D4037);
}

.machine-body:hover {
  transform: scale(1.05);
}

.machine-body:active {
  transform: scale(0.95);
}

.needle {
  font-size: 2rem;
  transition: transform 0.1s ease;
}

.needle.active {
  transform: translateY(-5px);
}

.thread {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 1.5rem;
  transition: opacity 0.2s ease;
}

.speed-indicator {
  margin-top: 10px;
}

.speed-bar {
  width: 150px;
  height: 10px;
  background: var(--color-bg-menu-light, #E6D3B7);
  border-radius: 5px;
  overflow: hidden;
  margin: 5px auto 0;
  border: 1px solid var(--color-text, #5D4037);
}

.speed-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF9800, #FFC107);
  transition: width 0.3s ease;
}

/* Режим точности */
.precision-mode {
  position: relative;
  width: 100%;
  height: 300px;
}

.target-area {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #E8F5E8, #F1F8E9);
  border-radius: 15px;
  border: 2px solid var(--color-text, #5D4037);
  overflow: hidden;
}

.target {
  position: absolute;
  width: var(--target-size);
  height: var(--target-size);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s ease;
  animation: targetPulse 1s infinite;
}

.target.active {
  background: rgba(255, 193, 7, 0.3);
  border: 2px solid #FFC107;
}

.target.hit {
  background: rgba(76, 175, 80, 0.3);
  border: 2px solid #4CAF50;
  animation: targetHit 0.5s ease;
}

.target.missed {
  background: rgba(244, 67, 54, 0.3);
  border: 2px solid #F44336;
  animation: targetMiss 0.5s ease;
}

@keyframes targetPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes targetHit {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(0); }
}

@keyframes targetMiss {
  0% { transform: scale(1); }
  50% { transform: scale(0.8); }
  100% { transform: scale(0); }
}

.precision-info {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  font-weight: bold;
  color: var(--color-text, #5D4037);
}

/* Ручной режим */
.manual-mode {
  text-align: center;
}

.constructor-placeholder {
  padding: 40px;
  background: var(--color-bg-menu-light, #E6D3B7);
  border-radius: 15px;
  border: 2px dashed var(--color-text, #5D4037);
}

.complete-btn {
  background: var(--color-accents, #C85A54);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 15px;
}

.complete-btn:hover {
  background: var(--color-buttons, #D4824A);
}

/* Управление */
.game-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.start-btn, .pause-btn, .stop-btn {
  padding: 10px 20px;
  border: 2px solid var(--color-text, #5D4037);
  border-radius: 8px;
  background: var(--color-bg-menu-light, #F9F1E8);
  color: var(--color-text, #5D4037);
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.start-btn:hover:not(:disabled) {
  background: var(--color-accents, #C85A54);
  color: white;
}

.pause-btn:hover:not(:disabled) {
  background: var(--color-buttons, #D4824A);
  color: white;
}

.stop-btn:hover {
  background: #F44336;
  color: white;
}

.start-btn:disabled, .pause-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Статистика */
.game-stats {
  display: flex;
  justify-content: space-around;
  background: var(--color-bg-menu-light, #E6D3B7);
  padding: 15px;
  border-radius: 10px;
  border: 2px solid var(--color-text, #5D4037);
}

.stat {
  text-align: center;
  font-weight: bold;
  color: var(--color-text, #5D4037);
}

.click-instructions {
  text-align: center;
  color: var(--color-text, #5D4037);
  font-size: 0.9rem;
  margin-top: 10px;
}

.click-instructions p {
  margin: 5px 0;
}
</style>
