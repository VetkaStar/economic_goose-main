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
import { ref } from 'vue'

// Эмиты
const emit = defineEmits<{
  start: []
}>()


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
  font-family: 'Orbitron', sans-serif;
}

/* Фоновое изображение - без прозрачности */
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
}

.welcome-text {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  font-family: Arial, sans-serif;
  text-shadow: 
    3px 3px 0px #000000,
    -3px -3px 0px #000000,
    3px -3px 0px #000000,
    -3px 3px 0px #000000,
    0 0 20px rgba(0, 0, 0, 1);
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
}

.title-main {
  font-size: 6rem;
  font-weight: 900;
  color: #ffffff;
  font-family: Arial, sans-serif;
  text-shadow: 
    4px 4px 0px #000000,
    -4px -4px 0px #000000,
    4px -4px 0px #000000,
    -4px 4px 0px #000000,
    0 0 30px rgba(0, 0, 0, 1);
  margin: 0 0 1rem 0;
  letter-spacing: 0.15em;
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShine 3s ease-in-out infinite;
}

.title-subtitle {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  font-family: Arial, sans-serif;
  text-shadow: 
    3px 3px 0px #000000,
    -3px -3px 0px #000000,
    3px -3px 0px #000000,
    -3px 3px 0px #000000,
    0 0 20px rgba(0, 0, 0, 1);
  margin: 0;
  letter-spacing: 0.1em;
}

/* Кнопка начать */
.start-section {
  display: flex;
  justify-content: center;
}

.start-button {
  padding: 2rem 5rem;
  font-size: 2.5rem;
  font-weight: 900;
  color: #ffffff;
  font-family: Arial, sans-serif;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  border: 4px solid #ffffff;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.5),
    0 0 0 0 rgba(76, 175, 80, 0.6);
  position: relative;
  overflow: hidden;
  text-shadow: 
    2px 2px 0px #000000,
    -2px -2px 0px #000000,
    2px -2px 0px #000000,
    -2px 2px 0px #000000;
}

.start-button:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 
    0 15px 40px rgba(0, 0, 0, 0.7),
    0 0 0 10px rgba(76, 175, 80, 0.1);
}

.start-button:active {
  transform: translateY(-2px) scale(1.02);
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

/* Анимации */
@keyframes titleAppear {
  0% {
    opacity: 0;
    transform: translateY(-50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes titleShine {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}


/* Адаптивность */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
  }
  
  .game-title {
    margin-bottom: 3rem;
  }
  
  .welcome-text {
    font-size: 1.4rem;
  }
  
  .title-main {
    font-size: 4rem;
  }
  
  .title-subtitle {
    font-size: 2rem;
  }
  
  .start-button {
    padding: 1.5rem 3rem;
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .welcome-text {
    font-size: 1.2rem;
  }
  
  .title-main {
    font-size: 3rem;
  }
  
  .title-subtitle {
    font-size: 1.5rem;
  }
  
  .start-button {
    padding: 1.2rem 2rem;
    font-size: 1.5rem;
  }
}
</style>
