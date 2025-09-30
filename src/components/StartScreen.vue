<template>
  <div class="start-screen">
    <!-- Фоновое изображение -->
    <div class="background">
      <img src="/main-menu/bg_start_menu.webp" alt="Фон стартового экрана" class="bg-image" />
    </div>

    <!-- Основной контент -->
    <div class="content">
      <!-- Название игры -->
      <div class="game-title">
        <div class="welcome-text">Добро пожаловать в</div>
        <h1 class="title-main">МОДНАЯ ИМПЕРИЯ</h1>
        <div class="title-subtitle">Гусь предприниматель</div>
      </div>

      <!-- Кнопка начать -->
      <div class="start-section">
        <button @click="startGame" class="start-button">
          НАЧАТЬ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMusic } from '@/composables/useMusic'

// Музыкальная система
const musicSystem = useMusic()

// Эмиты
const emit = defineEmits<{
  start: []
}>()

// Инициализация при монтировании
onMounted(() => {
  console.log('🎵 Стартовый экран загружен, ждем взаимодействия пользователя...')
  // НЕ запускаем музыку автоматически - ждем нажатия кнопки
})

// Запуск игры
const startGame = () => {
  console.log('🎮 Пользователь нажал "Начать" - запускаем игру!')
  emit('start')
}
</script>

<style scoped>
.start-screen {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe Print', cursive, sans-serif;
}

/* Фоновое изображение */
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Основной контент */
.content {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

/* Название игры */
.game-title {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 4rem;
  position: relative;
  padding: clamp(2rem, 4vw, 3rem) clamp(3rem, 6vw, 5rem);
}


.game-title::before {
  content: '';
  position: absolute;
  top: -25px;
  left: -40px;
  right: -40px;
  bottom: -20px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(255, 255, 255, 0.8) 50%, 
    rgba(255, 255, 255, 0.9) 100%);
  border: 4px solid rgba(139, 69, 19, 0.8);
  border-radius: clamp(25px, 4vw, 40px);
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.3),
    inset 0 2px 8px rgba(255, 255, 255, 0.6);
  z-index: -1;
}

.welcome-text {
  font-size: clamp(1.3rem, 2.3vw, 1.8rem);
  font-weight: bold;
  color: #8B4513;
  font-family: 'Segoe Print', cursive, sans-serif;
  margin-bottom: 0.5rem;
  text-shadow: 
    2px 2px 0px rgba(255, 255, 255, 0.9),
    -1px -1px 0px rgba(255, 255, 255, 0.9),
    1px -1px 0px rgba(255, 255, 255, 0.9),
    -1px 1px 0px rgba(255, 255, 255, 0.9),
    0 3px 8px rgba(0, 0, 0, 1),
    0 5px 15px rgba(0, 0, 0, 1),
    0 8px 25px rgba(0, 0, 0, 0.8);
}

.title-main {
  font-size: clamp(3.5rem, 7.5vw, 6.5rem);
  font-weight: bold;
  color: #C85A54;
  font-family: 'Segoe Print', cursive, sans-serif;
  margin: 0.3rem 0;
  line-height: 1.1;
  text-shadow: 
    3px 3px 0px rgba(255, 255, 255, 0.9),
    -2px -2px 0px rgba(255, 255, 255, 0.9),
    2px -2px 0px rgba(255, 255, 255, 0.9),
    -2px 2px 0px rgba(255, 255, 255, 0.9),
    0 4px 10px rgba(0, 0, 0, 1),
    0 6px 20px rgba(0, 0, 0, 1),
    0 10px 30px rgba(0, 0, 0, 0.9);
}

.title-subtitle {
  font-size: clamp(1.5rem, 3.2vw, 2.4rem);
  font-weight: bold;
  color: #8B4513;
  font-family: 'Segoe Print', cursive, sans-serif;
  margin: 0;
  text-shadow: 
    2px 2px 0px rgba(255, 255, 255, 0.9),
    -1px -1px 0px rgba(255, 255, 255, 0.9),
    1px -1px 0px rgba(255, 255, 255, 0.9),
    -1px 1px 0px rgba(255, 255, 255, 0.9),
    0 3px 8px rgba(0, 0, 0, 1),
    0 5px 15px rgba(0, 0, 0, 1),
    0 8px 25px rgba(0, 0, 0, 0.8);
}

/* Кнопка начать */
.start-section {
  display: flex;
  justify-content: center;
}

.start-button {
  padding: clamp(1rem, 2.2vw, 1.8rem) clamp(2.5rem, 5vw, 4.5rem);
  font-size: clamp(1.6rem, 2.8vw, 2.5rem);
  font-weight: bold;
  color: #ffffff;
  font-family: 'Segoe Print', cursive, sans-serif;
  background: linear-gradient(135deg, var(--color-buttons, #D4824A) 0%, var(--color-buttons-dark, #B86B3A) 100%);
  border: clamp(3px, 0.5vw, 5px) solid var(--color-text, #5D4037);
  border-radius: clamp(15px, 2.5vw, 25px);
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  box-shadow: 
    0 6px 20px rgba(93, 64, 55, 0.3),
    inset 0 1px 3px rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.start-button:hover {
  transform: translateY(-3px) scale(1.03);
  background: linear-gradient(135deg, var(--color-accents, #C85A54) 0%, var(--color-accents-dark, #A84842) 100%);
  box-shadow: 
    0 8px 25px rgba(93, 64, 55, 0.4),
    inset 0 1px 3px rgba(255, 255, 255, 0.4);
}

.start-button:active {
  transform: translateY(-1px) scale(1.01);
}

.start-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.start-button:hover::before {
  left: 100%;
}

/* Адаптивность */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
  }
  
  .game-title {
    margin-bottom: 3rem;
    padding: clamp(1.5rem, 3vw, 2rem) clamp(2rem, 4vw, 3rem);
  }
}

@media (max-width: 480px) {
  .game-title {
    margin-bottom: 2rem;
    padding: 1.2rem 1.5rem;
  }
}
</style>
