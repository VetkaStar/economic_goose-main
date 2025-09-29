<template>
  <div class="main-menu">
    <!-- Выбранный персонаж -->
    <div v-if="selectedCharacter" class="character-display">
      <img 
        :src="selectedCharacter.image" 
        :alt="selectedCharacter.name" 
        class="main-character"
        :title="selectedCharacter.name"
      />
    </div>
    
    <!-- Кнопка настроек -->
    <button class="settings-btn" @click="openSettings" title="Настройки">
      <img src="/main-menu/шестерня.svg" alt="Настройки" class="settings-icon">
    </button>
    
    <!-- Основные кнопки меню внизу -->
    <div class="bottom-menu">
      <div class="menu-item">
        <button class="menu-btn knowledge-btn" @click="openKnowledge">
          <img src="/main-menu/знания.svg" alt="Знания" class="btn-icon">
        </button>
        <div class="btn-label">ЗНАНИЯ</div>
      </div>
      
      <div class="menu-item">
        <button class="menu-btn hero-btn" @click="openHero">
          <img src="/main-menu/герой.svg" alt="Герой" class="btn-icon">
        </button>
        <div class="btn-label">ГЕРОЙ</div>
      </div>
      
      <div class="menu-item">
        <button class="menu-btn company-btn main-play-btn" @click="openCompany">
          <img src="/main-menu/компания.svg" alt="Компания" class="play-icon">
        </button>
        <div class="btn-label">КОМПАНИЯ</div>
      </div>
      
      <div class="menu-item">
        <button class="menu-btn minigames-btn" @click="openMinigames">
          <img src="/main-menu/мини-игры.svg" alt="Мини-игры" class="btn-icon">
        </button>
        <div class="btn-label">МИНИ-ИГРЫ</div>
      </div>
      
      <div class="menu-item">
        <button class="menu-btn rating-btn" @click="openRating">
          <img src="/main-menu/рейтинг.svg" alt="Рейтинг" class="btn-icon">
        </button>
        <div class="btn-label">РЕЙТИНГ</div>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'

// Используем store для персонажей
const characterStore = useCharacterStore()

// Получаем выбранного персонажа
const selectedCharacter = computed(() => characterStore.selectedCharacter)

// Инициализация при монтировании
onMounted(() => {
  characterStore.loadSelectedCharacter()
})

// Эмиты
const emit = defineEmits<{
  openSettings: []
  openKnowledge: []
  openHero: []
  openCompany: []
  openMinigames: []
  openRating: []
}>()

// Функции открытия модальных окон и страниц
const openSettings = () => emit('openSettings')
const openKnowledge = () => emit('openKnowledge')
const openHero = () => emit('openHero')
const openCompany = () => emit('openCompany')
const openMinigames = () => emit('openMinigames')
const openRating = () => emit('openRating')
</script>

<style scoped>
/* Подключение Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.main-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
  font-family: 'Orbitron', 'Arial', sans-serif;
  background: url('/main-menu/bg_main_menu.webp') center/cover no-repeat, #E8F4FD;
  position: relative;
}

.main-menu::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  z-index: 0;
  font-size: clamp(12px, 1.5vw, 24px);
}

/* Отображение персонажа на главном экране */
.character-display {
  position: absolute;
  bottom: -10%;
  right: 5%;
  z-index: 2;
  pointer-events: none;
  overflow: visible;
}

.main-character {
  width: clamp(500px, 65vw, 1000px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
  animation: characterFloat 6s ease-in-out infinite;
  transform-origin: bottom center;
}

@keyframes characterFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}



/* Кнопка настроек */
.settings-btn {
  position: absolute;
  top: clamp(15px, 2vh, 30px);
  right: clamp(15px, 2vw, 30px);
  width: clamp(90px, 9vw, 150px);
  height: clamp(90px, 9vw, 150px);
  border: none;
  background: transparent;
  font-size: clamp(1.2rem, 2vw, 2.5rem);
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-btn:hover {
  transform: scale(1.05) rotate(90deg);
}

/* Нижнее меню */
.bottom-menu {
  position: absolute;
  bottom: clamp(20px, 3vh, 50px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: clamp(12px, 2vw, 30px);
  z-index: 10;
  align-items: flex-end;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(4px, 0.8vw, 8px);
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(120px, 15vw, 210px);
  height: clamp(120px, 15vw, 210px);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.menu-btn:hover {
  transform: scale(1.05);
}

.knowledge-btn {
  background: transparent;
  color: white;
}

.hero-btn {
  background: transparent;
  color: white;
}

.company-btn.main-play-btn {
  width: clamp(150px, 18vw, 270px);
  height: clamp(150px, 18vw, 270px);
  background: transparent;
  color: white;
  border: none;
}

.minigames-btn {
  background: transparent;
  color: white;
}

.rating-btn {
  background: transparent;
  color: #333;
}

.btn-icon, .play-icon {
  font-size: clamp(5rem, 10vw, 12rem);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  width: clamp(5rem, 10vw, 12rem);
  height: clamp(5rem, 10vw, 12rem);
  object-fit: contain;
}

.settings-icon {
  width: clamp(3rem, 4.5vw, 5.25rem);
  height: clamp(3rem, 4.5vw, 5.25rem);
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.btn-label {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(0.6rem, 1.2vw, 1.4rem);
  font-weight: 700;
  text-align: center;
  line-height: 1;
  color: white;
  text-shadow: 
    2px 2px 0px #000,
    -1px -1px 0px #000,
    1px -1px 0px #000,
    -1px 1px 0px #000,
    0px 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: clamp(-25px, -4vw, -40px);
  z-index: 10;
  position: relative;
}


/* Адаптивность для персонажа */
@media (max-width: 1024px) {
  .main-character {
    width: clamp(400px, 55vw, 700px);
  }
  
  .character-display {
    right: 3%;
    bottom: -8%;
  }
}

@media (max-width: 768px) {
  .main-character {
    width: clamp(350px, 50vw, 600px);
  }
  
  .character-display {
    right: 2%;
    bottom: -6%;
  }
}

@media (max-width: 480px) {
  .main-character {
    width: clamp(300px, 45vw, 500px);
  }
  
  .character-display {
    right: 1%;
    bottom: -4%;
  }
  
  .bottom-menu {
    flex-wrap: wrap;
    justify-content: center;
    gap: clamp(8px, 1.5vw, 15px);
  }
  
  .menu-item {
    gap: clamp(-5px, -0.8vw, -10px);
  }
}
</style>
