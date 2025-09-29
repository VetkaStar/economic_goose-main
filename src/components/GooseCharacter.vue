<template>
  <div class="goose-character" :class="gooseClass">
    <!-- Основной спрайт гуся -->
    <div class="goose-sprite" :style="spriteStyle">
      <div class="goose-body">
        <span class="goose-emoji">{{ currentGoose.emoji }}</span>
      </div>
      
      <!-- Аксессуары -->
      <div v-if="currentGoose.accessories" class="accessories">
        <span 
          v-for="(accessory, index) in currentGoose.accessories" 
          :key="index"
          class="accessory"
          :style="{ '--delay': index * 0.1 + 's' }"
        >
          {{ accessory }}
        </span>
      </div>
      
      <!-- Эффекты -->
      <div v-if="showEffects" class="effects">
        <div class="sparkle" v-for="n in 3" :key="n" :style="{ '--delay': n * 0.3 + 's' }">
          ✨
        </div>
      </div>
    </div>
    
    <!-- Имя персонажа -->
    <div class="goose-name" v-if="showName">
      {{ currentGoose.name }}
    </div>
    
    <!-- Уровень персонажа -->
    <div class="goose-level" v-if="showLevel">
      <span class="level-icon">⭐</span>
      <span class="level-text">{{ currentGoose.level }}</span>
    </div>
    
    <!-- Статус -->
    <div class="goose-status" v-if="currentGoose.status">
      <span class="status-icon">{{ currentGoose.statusIcon }}</span>
      <span class="status-text">{{ currentGoose.status }}</span>
    </div>
    
    <!-- Прогресс-бар опыта -->
    <div class="experience-bar" v-if="showExperience">
      <div class="exp-fill" :style="{ width: experiencePercentage + '%' }"></div>
      <span class="exp-text">{{ currentGoose.experience }}/{{ currentGoose.maxExperience }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Пропсы
interface Props {
  heroId?: string
  size?: 'small' | 'medium' | 'large'
  showName?: boolean
  showLevel?: boolean
  showExperience?: boolean
  showEffects?: boolean
  animation?: 'idle' | 'walk' | 'work' | 'happy' | 'sad'
}

const props = withDefaults(defineProps<Props>(), {
  heroId: 'fashion_goose',
  size: 'medium',
  showName: true,
  showLevel: true,
  showExperience: false,
  showEffects: false,
  animation: 'idle'
})

// Доступные персонажи
const gooseCharacters = ref({
  fashion_goose: {
    id: 'fashion_goose',
    name: 'Гусь-Модник',
    emoji: '🦆',
    level: 1,
    experience: 0,
    maxExperience: 1000,
    status: 'Готов к работе',
    statusIcon: '💼',
    accessories: ['👔', '🎩'],
    colors: {
      primary: '#3498db',
      secondary: '#2980b9',
      accent: '#f39c12'
    }
  },
  business_goose: {
    id: 'business_goose',
    name: 'Гусь-Бизнесмен',
    emoji: '🦆',
    level: 5,
    experience: 750,
    maxExperience: 1500,
    status: 'Управляет компанией',
    statusIcon: '💼',
    accessories: ['👔', '📊', '💼'],
    colors: {
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#e74c3c'
    }
  },
  creative_goose: {
    id: 'creative_goose',
    name: 'Гусь-Художник',
    emoji: '🦆',
    level: 3,
    experience: 400,
    maxExperience: 1200,
    status: 'Создает шедевры',
    statusIcon: '🎨',
    accessories: ['🎨', '🖌️', '👨‍🎨'],
    colors: {
      primary: '#9b59b6',
      secondary: '#8e44ad',
      accent: '#f39c12'
    }
  },
  social_goose: {
    id: 'social_goose',
    name: 'Гусь-Общительный',
    emoji: '🦆',
    level: 2,
    experience: 200,
    maxExperience: 1000,
    status: 'Общается с клиентами',
    statusIcon: '💬',
    accessories: ['😊', '💬', '🤝'],
    colors: {
      primary: '#27ae60',
      secondary: '#2ecc71',
      accent: '#f1c40f'
    }
  },
  tech_goose: {
    id: 'tech_goose',
    name: 'Гусь-Технолог',
    emoji: '🦆',
    level: 4,
    experience: 600,
    maxExperience: 1300,
    status: 'Автоматизирует процессы',
    statusIcon: '⚙️',
    accessories: ['💻', '⚙️', '🔧'],
    colors: {
      primary: '#34495e',
      secondary: '#2c3e50',
      accent: '#3498db'
    }
  }
})

// Текущий персонаж
const currentGoose = computed(() => {
  return gooseCharacters.value[props.heroId as keyof typeof gooseCharacters.value] || gooseCharacters.value.fashion_goose
})

// Класс гуся
const gooseClass = computed(() => {
  return `goose-${props.heroId} goose-${props.size} goose-${props.animation}`
})

// Стили спрайта
const spriteStyle = computed(() => {
  const goose = currentGoose.value
  return {
    '--primary-color': goose.colors.primary,
    '--secondary-color': goose.colors.secondary,
    '--accent-color': goose.colors.accent
  }
})

// Процент опыта
const experiencePercentage = computed(() => {
  const goose = currentGoose.value
  return (goose.experience / goose.maxExperience) * 100
})

// Следим за изменениями анимации
watch(() => props.animation, (newAnimation) => {
  // Здесь можно добавить логику смены анимации
  console.log('Смена анимации на:', newAnimation)
})

// Методы для управления персонажем
const changeHero = (heroId: string) => {
  // Эмитим событие смены героя
  emit('heroChange', heroId)
}

const addExperience = (amount: number) => {
  // Логика добавления опыта
  console.log('Добавлено опыта:', amount)
}

const levelUp = () => {
  // Логика повышения уровня
  console.log('Повышение уровня!')
}

// Эмиты
const emit = defineEmits<{
  heroChange: [heroId: string]
  levelUp: []
  experienceGain: [amount: number]
}>()

// Экспортируем методы для использования в родительском компоненте
defineExpose({
  changeHero,
  addExperience,
  levelUp
})
</script>

<style scoped>
.goose-character {
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
}

.goose-sprite {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.goose-body {
  position: relative;
  z-index: 2;
}

.goose-emoji {
  font-size: inherit;
  display: block;
  transition: all 0.3s ease;
}

.accessories {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.accessory {
  position: absolute;
  font-size: 0.6em;
  animation: float 2s ease-in-out infinite;
  animation-delay: var(--delay);
}

.effects {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
}

.sparkle {
  position: absolute;
  font-size: 0.8em;
  animation: sparkle 1.5s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.goose-name {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  z-index: 5;
}

.goose-level {
  position: absolute;
  top: -15px;
  right: -10px;
  background: var(--accent-color, #f39c12);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 2px;
  z-index: 5;
}

.goose-status {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color, #3498db);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  z-index: 5;
}

.experience-bar {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
  z-index: 5;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color, #f39c12), var(--primary-color, #3498db));
  transition: width 0.5s ease;
  position: relative;
}

.exp-text {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.6rem;
  color: #333;
  font-weight: bold;
  white-space: nowrap;
}

/* Размеры */
.goose-small .goose-emoji {
  font-size: 2rem;
}

.goose-medium .goose-emoji {
  font-size: 4rem;
}

.goose-large .goose-emoji {
  font-size: 6rem;
}

/* Анимации */
.goose-idle .goose-emoji {
  animation: idle 3s ease-in-out infinite;
}

.goose-walk .goose-emoji {
  animation: walk 1s ease-in-out infinite;
}

.goose-work .goose-emoji {
  animation: work 2s ease-in-out infinite;
}

.goose-happy .goose-emoji {
  animation: happy 1s ease-in-out infinite;
}

.goose-sad .goose-emoji {
  animation: sad 2s ease-in-out infinite;
}

@keyframes idle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes walk {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(2px) rotate(2deg);
  }
  75% {
    transform: translateX(-2px) rotate(-2deg);
  }
}

@keyframes work {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes happy {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(5deg);
  }
  75% {
    transform: scale(1.1) rotate(-5deg);
  }
}

@keyframes sad {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2px);
  }
}

/* Стили для разных персонажей */
.goose-fashion_goose .goose-emoji {
  filter: hue-rotate(200deg);
}

.goose-business_goose .goose-emoji {
  filter: hue-rotate(0deg) brightness(0.8);
}

.goose-creative_goose .goose-emoji {
  filter: hue-rotate(280deg) saturate(1.2);
}

.goose-social_goose .goose-emoji {
  filter: hue-rotate(120deg) brightness(1.1);
}

.goose-tech_goose .goose-emoji {
  filter: hue-rotate(0deg) brightness(0.7) contrast(1.2);
}

/* Адаптивность */
@media (max-width: 768px) {
  .goose-small .goose-emoji {
    font-size: 1.5rem;
  }
  
  .goose-medium .goose-emoji {
    font-size: 3rem;
  }
  
  .goose-large .goose-emoji {
    font-size: 4rem;
  }
  
  .goose-name {
    font-size: 0.7rem;
  }
  
  .goose-status {
    font-size: 0.6rem;
  }
}
</style>
