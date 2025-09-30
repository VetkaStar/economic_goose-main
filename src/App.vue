<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useMusic } from '@/composables/useMusic'
import MainMenu from './components/MainMenu.vue'
import SettingsModal from './components/SettingsModal.vue'
import HotkeysModal from './components/HotkeysModal.vue'
import AccountModal from './components/AccountModal.vue'
import GiftModal from './components/GiftModal.vue'
import KnowledgeModal from './components/KnowledgeModal.vue'
import MinigamesModal from './components/MinigamesModal.vue'
import RatingModal from './components/RatingModal.vue'
import HeroPage from './components/HeroPage.vue'
import CompanyPage from './components/CompanyPage.vue'
import AuthModal from './components/AuthModal.vue'
import StartScreen from './components/StartScreen.vue'

// Инициализация auth store
const authStore = useAuthStore()

// Инициализация музыкальной системы
const { 
  play: startMusic, 
  cleanup: cleanupMusic, 
  initializeAfterInteraction,
  hasUserInteracted
} = useMusic()

// Состояние приложения
const currentScreen = ref<'start-screen' | 'main-menu' | 'hero-page' | 'company-page'>('start-screen')
const showSettings = ref(false)
const showGift = ref(false)
const showKnowledge = ref(false)
const showMinigames = ref(false)
const showRating = ref(false)
const showHotkeys = ref(false)
const showAccount = ref(false)
const showAuth = ref(false)


// Инициализация авторизации при загрузке приложения
onMounted(async () => {
  await authStore.initAuth()
  // Больше не показываем авторизацию автоматически при загрузке
  // Она будет показана только при попытке начать игру
  
  // НЕ запускаем музыку автоматически - ждем взаимодействия пользователя
  console.log('🎵 Ожидаем взаимодействия пользователя для запуска музыки')
})

// Очистка при размонтировании
onUnmounted(() => {
  cleanupMusic()
})

// Переключение экранов
const startGame = () => {
  console.log('🎮 Запуск игры с стартового экрана')
  
  // Первое взаимодействие пользователя - запускаем музыку ГЛОБАЛЬНО
  if (!hasUserInteracted.value) {
    initializeAfterInteraction()
    console.log('🎵 Глобальная инициализация музыки после первого взаимодействия')
  }
  
  // Если не авторизован — показываем модалку логина, иначе идем в меню
  if (!authStore.isAuthenticated) {
    showAuth.value = true
  } else {
    currentScreen.value = 'main-menu'
  }
}

const switchToHero = () => {
  currentScreen.value = 'hero-page'
  if (!hasUserInteracted.value) {
    initializeAfterInteraction()
  }
}

const switchToCompany = () => {
  currentScreen.value = 'company-page'
  if (!hasUserInteracted.value) {
    initializeAfterInteraction()
  }
}

const backToMainMenu = () => {
  currentScreen.value = 'main-menu'
}

// Модальные окна
const openSettings = () => {
  showSettings.value = true
  // Просто пытаемся запустить музыку при первом взаимодействии
  if (!hasUserInteracted.value) {
    initializeAfterInteraction()
  }
}

const closeSettings = () => {
  showSettings.value = false
}

const openGift = () => {
  showGift.value = true
  if (!hasUserInteracted.value) {
    initializeAfterInteraction()
  }
}

const closeGift = () => {
  showGift.value = false
}

const openKnowledge = () => {
  showKnowledge.value = true
  if (!hasUserInteracted.value) {
    initializeAfterInteraction()
  }
}

const closeKnowledge = () => {
  showKnowledge.value = false
}

const openMinigames = () => {
  showMinigames.value = true
  if (!hasUserInteracted.value) {
    initializeAfterInteraction()
  }
}

const closeMinigames = () => {
  showMinigames.value = false
}

const openRating = () => {
  showRating.value = true
  if (!hasUserInteracted.value) {
    initializeAfterInteraction()
  }
}

const closeRating = () => {
  showRating.value = false
}

const openHotkeys = () => {
  console.log('Opening hotkeys modal')
  showHotkeys.value = true
  console.log('showHotkeys.value:', showHotkeys.value)
}

const closeHotkeys = () => {
  showHotkeys.value = false
}

const openAccount = () => {
  console.log('Opening account modal')
  showAccount.value = true
  console.log('showAccount.value:', showAccount.value)
}

const closeAccount = () => {
  showAccount.value = false
}

const closeAuth = () => {
  showAuth.value = false
}

const onAuthSuccess = () => {
  showAuth.value = false
  currentScreen.value = 'main-menu'
}
</script>

<template>
  <div id="app">
    <!-- Стартовый экран -->
    <StartScreen 
      v-if="currentScreen === 'start-screen'"
      @start="startGame"
    />
    
    <!-- Главное меню -->
    <MainMenu 
      v-else-if="currentScreen === 'main-menu'"
      @open-settings="openSettings"
      @open-gift="openGift"
      @open-knowledge="openKnowledge"
      @open-hero="switchToHero"
      @open-company="switchToCompany"
      @open-minigames="openMinigames"
      @open-rating="openRating"
      @exit-to-start="() => {}"
    />
    
    <!-- Страница героя -->
    <HeroPage 
      v-else-if="currentScreen === 'hero-page'"
      @back="backToMainMenu"
    />
    
    <!-- Страница компании -->
    <CompanyPage 
      v-else-if="currentScreen === 'company-page'"
      @exit-to-main-menu="backToMainMenu"
    />
    
    
    <!-- Модальные окна -->
    <SettingsModal 
      v-if="showSettings"
      :show-exit-button="false"
      @close="closeSettings"
      @open-hotkeys="openHotkeys"
      @open-account="openAccount"
    />
    
    <GiftModal 
      v-if="showGift"
      @close="closeGift"
    />
    
    <KnowledgeModal 
      v-if="showKnowledge"
      @close="closeKnowledge"
    />
    
    <MinigamesModal 
      v-if="showMinigames"
      @close="closeMinigames"
    />
    
    <RatingModal 
      v-if="showRating"
      @close="closeRating"
    />
    
    <!-- Модальные окна горячих клавиш и учетной записи -->
    <HotkeysModal 
      v-if="showHotkeys"
      @close="closeHotkeys"
    />
    
    <AccountModal 
      v-if="showAccount"
      @close="closeAccount"
    />
    
    <!-- Модальное окно авторизации -->
    <AuthModal 
      v-if="showAuth"
      @close="closeAuth"
      @success="onAuthSuccess"
    />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
}

.game-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Arial', sans-serif;
}

.game-screen h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

.game-screen p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.game-screen button {
  padding: 15px 30px;
  font-size: 1.1rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-screen button:hover {
  background: #ee5a24;
  transform: translateY(-2px);
}

/* Стили для страниц */
.page-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Arial', sans-serif;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.back-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.page-content {
  padding: 40px 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-content p {
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 40px;
  opacity: 0.9;
}

.placeholder-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.placeholder-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.placeholder-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.placeholder-card h3 {
  font-size: 1.5rem;
  margin: 0 0 15px 0;
  color: #fff;
}

.placeholder-card p {
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
  line-height: 1.6;
}

/* Адаптивность для страниц */
@media (max-width: 768px) {
  .page-header {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-content {
    padding: 20px;
  }
  
  .placeholder-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .placeholder-card {
    padding: 20px;
  }
}


/* Global button styles */
button {
  font-family: inherit;
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}


/* Animation utilities */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>