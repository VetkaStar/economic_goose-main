<template>
  <div class="hero-page">
    <!-- Кнопка назад -->
    <button class="back-btn" @click="goBack">
      ← Назад
    </button>


    <!-- Основной контент -->
    <div class="hero-content">
      <!-- Левая панель - Выбор персонажа -->
      <div class="character-selection">
        <h2 class="section-title">Выбор персонажа</h2>
        <div class="characters-list">
          <div 
            v-for="character in characters" 
            :key="character.id"
            class="character-card"
            :class="{ selected: selectedCharacter?.id === character.id }"
            @click="selectCharacter(character)"
          >
            <div class="character-portrait">
              <div class="character-avatar">
                <img :src="character.image" :alt="character.name" class="character-image" />
              </div>
              <div v-if="selectedCharacter?.id === character.id" class="selected-badge">
                Выбрано
              </div>
            </div>
            <div class="character-info">
              <h3 class="character-name">{{ character.name }}</h3>
              <p class="character-title">{{ character.title }}</p>
              <div class="character-level">
                <span>Уровень {{ character.level }}</span>
                <div class="level-bar">
                  <div class="level-progress" :style="{ width: character.levelProgress + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Центральная панель - Выбранный персонаж -->
      <div class="selected-character-display">
        <div v-if="selectedCharacter" class="character-showcase">
          <div class="character-large">
            <div class="character-avatar-large">
              <img :src="selectedCharacter.image" :alt="selectedCharacter.name" class="character-image-large" />
            </div>
            <div class="character-glow"></div>
          </div>
          <div class="character-details">
            <h2 class="character-name-large">{{ selectedCharacter.name }}</h2>
            <p class="character-title-large">{{ selectedCharacter.title }}</p>
            <div class="character-description">
              {{ selectedCharacter.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- Правая панель - Прокачка навыков -->
      <div class="skills-section">
        <h2 class="section-title">Прокачка навыков</h2>
        <div v-if="selectedCharacter" class="skills-content">
          <div class="skill-points">
            <span class="skill-points-label">Очки навыков:</span>
            <span class="skill-points-value">{{ selectedCharacter.skillPoints }}</span>
          </div>
          
          <div class="skills-list">
            <div 
              v-for="skill in selectedCharacter.skills" 
              :key="skill.id"
              class="skill-item"
            >
              <div class="skill-icon">
                <span class="skill-number">{{ skill.level }}</span>
              </div>
              <div class="skill-info">
                <h4 class="skill-name">{{ skill.name }}</h4>
                <p class="skill-description">{{ skill.description }}</p>
                <div class="skill-level-bar">
                  <div class="skill-level-progress" :style="{ width: (skill.level / skill.maxLevel) * 100 + '%' }"></div>
                </div>
                <div class="skill-actions">
                  <button 
                    class="skill-upgrade-btn"
                    :disabled="selectedCharacter.skillPoints < skill.cost || skill.level >= skill.maxLevel"
                    @click="upgradeSkill(skill)"
                  >
                    Улучшить ({{ skill.cost }} очков)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'

const emit = defineEmits<{
  back: []
}>()

// Используем store для персонажей
const characterStore = useCharacterStore()

// Получаем данные из store
const characters = computed(() => characterStore.characters)
const selectedCharacter = computed(() => characterStore.selectedCharacter)

const selectCharacter = (character: any) => {
  characterStore.selectCharacter(character)
  characterStore.saveSelectedCharacter()
}

const upgradeSkill = (skill: any) => {
  if (selectedCharacter.value) {
    characterStore.upgradeSkill(selectedCharacter.value, skill)
    characterStore.saveSelectedCharacter()
  }
}

// Инициализация при монтировании
onMounted(() => {
  characterStore.loadSelectedCharacter()
})

const goBack = () => {
  emit('back')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.hero-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%);
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 165, 0, 0.1) 0%, transparent 50%);
  font-family: 'Orbitron', sans-serif;
  color: var(--color-text);
  overflow: hidden;
  z-index: 1;
}

.back-btn {
  position: absolute;
  top: clamp(15px, 2vw, 25px);
  left: clamp(15px, 2vw, 25px);
  background: var(--gradient-buttons);
  color: white;
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  border-radius: clamp(8px, 1.5vw, 15px);
  padding: clamp(8px, 1.5vw, 15px) clamp(15px, 3vw, 30px);
  font-size: clamp(0.8rem, 1.5vw, 1.2rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium);
  text-shadow: 1px 1px 0px var(--shadow-light);
  z-index: 100;
}

.back-btn:hover {
  background: var(--gradient-accents);
  transform: translateY(-2px);
  box-shadow: 0 clamp(6px, 1.2vw, 12px) clamp(10px, 2vw, 20px) var(--shadow-dark);
}

.hero-content {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: clamp(15px, 2vw, 25px);
  padding: clamp(60px, 8vw, 80px) clamp(15px, 2vw, 25px) clamp(15px, 2vw, 25px);
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
}

.character-selection {
  background: var(--color-bg-menu-light);
  border-radius: clamp(8px, 1.2vw, 15px);
  padding: clamp(12px, 1.8vw, 20px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  backdrop-filter: blur(5px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium);
  overflow-y: auto;
  height: fit-content;
  max-height: calc(100vh - 120px);
}

.skills-section {
  background: var(--color-bg-menu-light);
  border-radius: clamp(8px, 1.2vw, 15px);
  padding: clamp(12px, 1.8vw, 20px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  backdrop-filter: blur(5px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium);
  overflow-y: auto;
  height: 100%;
}

.section-title {
  font-size: clamp(1rem, 1.8vw, 1.4rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin: 0 0 clamp(12px, 2vw, 18px) 0;
  text-align: center;
  border-bottom: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  padding-bottom: clamp(6px, 1vw, 10px);
}

.characters-list {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.2vw, 12px);
}

.character-card {
  background: var(--color-bg-menu);
  border-radius: clamp(6px, 1vw, 10px);
  padding: clamp(8px, 1.2vw, 12px);
  border: clamp(1px, 0.2vw, 2px) solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.character-card:hover {
  background: var(--color-bg-menu-light);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium);
}

.character-card.selected {
  border-color: var(--color-highlights);
  background: var(--color-bg-menu-light);
  box-shadow: 0 0 clamp(20px, 4vw, 40px) rgba(129, 196, 231, 0.3);
}

.character-portrait {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: clamp(6px, 1vw, 8px);
  position: relative;
}

.character-avatar {
  width: clamp(40px, 5vw, 60px);
  height: clamp(40px, 5vw, 60px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: clamp(2px, 0.3vw, 3px) solid var(--color-highlights);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium);
  position: relative;
  z-index: 2;
  overflow: hidden;
  background: linear-gradient(135deg, #FFE4B5 0%, #F0E68C 100%);
}

.character-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

.selected-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--gradient-accents);
  color: white;
  padding: clamp(4px, 0.8vw, 8px) clamp(8px, 1.5vw, 15px);
  border-radius: clamp(8px, 1.5vw, 15px);
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-dark);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium);
  z-index: 3;
}

.character-info {
  text-align: center;
}

.character-name {
  font-size: clamp(0.8rem, 1.4vw, 1.1rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin: 0 0 clamp(3px, 0.5vw, 5px) 0;
}

.character-title {
  font-size: clamp(0.7rem, 1.1vw, 0.9rem);
  color: var(--color-accents);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin: 0 0 clamp(6px, 1vw, 8px) 0;
}

.character-level {
  display: flex;
  flex-direction: column;
  gap: clamp(5px, 1vw, 8px);
}

.character-level span {
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  color: var(--color-highlights);
  font-weight: 600;
}

.level-bar {
  width: 100%;
  height: clamp(6px, 1vw, 10px);
  background: rgba(0, 0, 0, 0.3);
  border-radius: clamp(3px, 0.5vw, 5px);
  overflow: hidden;
}

.level-progress {
  height: 100%;
  background: var(--gradient-highlights);
  border-radius: clamp(3px, 0.5vw, 5px);
  transition: width 0.5s ease;
}

.selected-character-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-menu-light);
  border-radius: clamp(8px, 1.2vw, 15px);
  padding: clamp(15px, 2vw, 25px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  backdrop-filter: blur(5px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium);
  position: relative;
  overflow: hidden;
  height: 100%;
}

.character-showcase {
  text-align: center;
  position: relative;
}

.character-large {
  position: relative;
  margin-bottom: clamp(20px, 3vw, 30px);
}

.character-avatar-large {
  width: clamp(120px, 15vw, 200px);
  height: clamp(120px, 15vw, 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  overflow: hidden;
  margin: 0 auto;
}

.character-image-large {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.character-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: clamp(150px, 18vw, 250px);
  height: clamp(150px, 18vw, 250px);
  background: radial-gradient(circle, rgba(255, 165, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
  animation: glow 3s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
}

.character-details {
  color: white;
}

.character-name-large {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 900;
  color: var(--color-accents);
  text-shadow: 2px 2px 0px var(--shadow-light);
  margin: 0 0 clamp(10px, 2vw, 20px) 0;
}

.character-title-large {
  font-size: clamp(1rem, 2vw, 1.5rem);
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin: 0 0 clamp(15px, 2.5vw, 25px) 0;
}

.character-description {
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  line-height: 1.5;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  max-width: clamp(200px, 25vw, 300px);
  margin: 0 auto;
}

.skills-content {
  display: flex;
  flex-direction: column;
  gap: clamp(15px, 2vw, 25px);
}

.skill-points {
  background: var(--color-bg-menu);
  border-radius: clamp(8px, 1.5vw, 15px);
  padding: clamp(10px, 2vw, 20px);
  text-align: center;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
}

.skill-points-label {
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin-right: clamp(5px, 1vw, 10px);
}

.skill-points-value {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 700;
  color: var(--color-highlights);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: clamp(15px, 2vw, 25px);
}

.skill-item {
  background: var(--color-bg-menu);
  border-radius: clamp(10px, 1.5vw, 20px);
  padding: clamp(15px, 2vw, 25px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  transition: all 0.3s ease;
}

.skill-item:hover {
  background: var(--color-bg-menu-light);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium);
}

.skill-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(40px, 6vw, 60px);
  height: clamp(40px, 6vw, 60px);
  background: var(--gradient-buttons);
  border-radius: 50%;
  margin-bottom: clamp(10px, 1.5vw, 15px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium);
}

.skill-number {
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-weight: 700;
  color: white;
  text-shadow: 1px 1px 0px var(--shadow-dark);
}

.skill-info {
  text-align: left;
}

.skill-name {
  font-size: clamp(1rem, 1.8vw, 1.3rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin: 0 0 clamp(8px, 1.2vw, 12px) 0;
}

.skill-description {
  font-size: clamp(0.8rem, 1.4vw, 1.1rem);
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  line-height: 1.4;
  margin: 0 0 clamp(10px, 1.5vw, 15px) 0;
}

.skill-level-bar {
  width: 100%;
  height: clamp(6px, 1vw, 10px);
  background: rgba(0, 0, 0, 0.3);
  border-radius: clamp(3px, 0.5vw, 5px);
  overflow: hidden;
  margin-bottom: clamp(10px, 1.5vw, 15px);
}

.skill-level-progress {
  height: 100%;
  background: var(--gradient-highlights);
  border-radius: clamp(3px, 0.5vw, 5px);
  transition: width 0.5s ease;
}

.skill-actions {
  text-align: center;
}

.skill-upgrade-btn {
  background: var(--gradient-buttons);
  color: white;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-text);
  border-radius: clamp(6px, 1vw, 12px);
  padding: clamp(8px, 1.5vw, 15px) clamp(15px, 2.5vw, 25px);
  font-size: clamp(0.8rem, 1.4vw, 1.1rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.skill-upgrade-btn:hover:not(:disabled) {
  background: var(--gradient-accents);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-dark);
}

.skill-upgrade-btn:disabled {
  background: rgba(128, 128, 128, 0.5);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Адаптивность */
@media (max-width: 1400px) {
  .hero-content {
    grid-template-columns: 260px 1fr 300px;
    gap: clamp(12px, 1.5vw, 20px);
  }
}

@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: clamp(8px, 1vw, 12px);
    padding: clamp(50px, 6vw, 70px) clamp(10px, 1.5vw, 20px) clamp(10px, 1.5vw, 20px);
  }
  
  .selected-character-display {
    order: -1;
    height: auto;
    min-height: 200px;
  }
  
  .character-selection,
  .skills-section {
    height: auto;
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .hero-content {
    padding: clamp(45px, 5vw, 60px) clamp(8px, 1vw, 15px) clamp(8px, 1vw, 15px);
    gap: clamp(6px, 1vw, 10px);
  }
  
  .character-selection,
  .skills-section {
    padding: clamp(8px, 1.2vw, 15px);
  }
  
  .selected-character-display {
    padding: clamp(10px, 1.5vw, 20px);
  }
  
  .back-btn {
    top: clamp(10px, 1.5vw, 20px);
    left: clamp(10px, 1.5vw, 20px);
    padding: clamp(6px, 1vw, 12px) clamp(12px, 2vw, 20px);
    font-size: clamp(0.7rem, 1.2vw, 1rem);
  }
}
</style>
