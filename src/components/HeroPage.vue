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
              <div class="character-details">
                <div class="character-capital">
                  <span class="capital-label">Стартовый капитал:</span>
                  <span class="capital-value">{{ character.startCapital.toLocaleString() }} ₽</span>
                </div>
                <div class="character-location">
                  <span class="location-label">Локация:</span>
                  <span class="location-value">{{ character.location }}</span>
                </div>
                <div v-if="!character.isUnlocked" class="character-locked">
                  <span class="locked-text">Требуется уровень {{ character.requiredLevel }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Центральная панель - Информация о персонаже -->
      <div class="character-info-panel">
        <div v-if="selectedCharacter" class="character-display">
          <div class="character-avatar-display">
            <img :src="selectedCharacter.image" :alt="selectedCharacter.name" class="character-img" />
          </div>
          <h3 class="character-name-display">{{ selectedCharacter.name }}</h3>
          <div class="character-stats">
            <div class="stat-item">
              <span class="stat-label">💰 Капитал:</span>
              <span class="stat-value">{{ selectedCharacter.startCapital.toLocaleString() }} ₽</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">📍 Локация:</span>
              <span class="stat-value">{{ selectedCharacter.location }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">⭐ Уровень:</span>
              <span class="stat-value">{{ selectedCharacter.level }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">🎓 Очки навыков:</span>
              <span class="stat-value">{{ selectedCharacter.skillPoints }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">📊 Прогресс:</span>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" :style="{ width: selectedCharacter.levelProgress + '%' }"></div>
            </div>
          </div>
            <div class="stat-item">
              <span class="stat-label">🛠️ Оборудование:</span>
              <span class="stat-value equipment-value">{{ selectedCharacter.equipment.join(', ') }}</span>
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
                <div class="skill-explanation">
                  <div class="game-effect">
                    <strong>Эффект в игре:</strong> {{ skill.gameEffect }}
                  </div>
                  <div class="real-explanation">
                    <strong>Реальное объяснение:</strong> {{ skill.realExplanation }}
                  </div>
                </div>
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
                  <button 
                    class="skill-tutorial-btn"
                    @click="openTutorial(skill)"
                  >
                    {{ getTutorialButtonText(skill.tutorialType) }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Подсказка наставника -->
      <div class="mentor-tip" v-if="selectedCharacter">
        <div class="tip-content">
          <div class="tip-icon">🎓</div>
          <div class="tip-text">
            <strong>Наставник:</strong> {{ getMentorTip(selectedCharacter) }}
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

const openTutorial = (skill: any) => {
  console.log(`📚 Открываем обучалку для навыка: ${skill.name}`)
  // TODO: Реализовать открытие обучающих материалов
}

const getTutorialButtonText = (tutorialType: string) => {
  switch (tutorialType) {
    case 'video': return '📹 Видео'
    case 'text': return '📖 Текст'
    case 'case': return '📋 Кейс'
    default: return '📚 Обучалка'
  }
}

const getMentorTip = (character: any) => {
  const tips: Record<number, string> = {
    1: 'Этот гусь может начать с простых вещей - рубашки, платья. Сначала изучи основы дизайна, а потом переходи к работе с тканью.',
    2: 'Этот гусь уже знает основы, но нужно развивать организацию труда. Найми помощника, когда будет готов к дополнительным расходам.',
    3: 'Этот гусь готов к большим делам! Сосредоточься на управлении брендом и работе с персоналом для масштабирования бизнеса.'
  }
  return tips[character.id] || 'Выберите персонажа для получения совета.'
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
  top: clamp(10px, 1.5vh, 20px);
  left: clamp(10px, 1.5vw, 20px);
  background: var(--gradient-buttons);
  color: white;
  border: clamp(2px, 0.25vw, 3px) solid var(--color-text);
  border-radius: clamp(6px, 1vw, 12px);
  padding: clamp(6px, 1vh, 10px) clamp(12px, 2vw, 20px);
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 clamp(3px, 0.6vw, 6px) clamp(6px, 1vw, 10px) var(--shadow-medium);
  text-shadow: 1px 1px 0px var(--shadow-light);
  z-index: 100;
}

.back-btn:hover {
  background: var(--gradient-accents);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.5vw, 15px) var(--shadow-dark);
}

.hero-content {
  display: grid;
  grid-template-columns: 18% 1fr 35%;
  grid-template-rows: 1fr auto;
  gap: clamp(8px, 1vw, 12px);
  padding: clamp(45px, 5vh, 65px) clamp(10px, 1vw, 15px) clamp(10px, 1vh, 15px);
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
}

.character-selection {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  background: var(--color-bg-menu-light);
  border-radius: clamp(8px, 1vw, 12px);
  padding: clamp(10px, 1.2vw, 15px);
  border: 2px solid var(--color-buttons);
  backdrop-filter: blur(5px);
  box-shadow: 0 8px 16px var(--shadow-medium);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.skills-section {
  grid-column: 3 / 4;
  grid-row: 1 / 2;
  background: var(--color-bg-menu-light);
  border-radius: clamp(8px, 1vw, 12px);
  padding: clamp(10px, 1.2vw, 15px);
  border: 2px solid var(--color-buttons);
  backdrop-filter: blur(5px);
  box-shadow: 0 8px 16px var(--shadow-medium);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: clamp(0.75rem, 1.1vw, 0.95rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin: 0 0 clamp(6px, 0.8vh, 10px) 0;
  text-align: center;
  border-bottom: 2px solid var(--color-buttons);
  padding-bottom: clamp(5px, 0.6vh, 8px);
  flex-shrink: 0;
}

.characters-list {
  display: flex;
  flex-direction: column;
  gap: clamp(5px, 0.8vh, 8px);
  flex: 1;
  overflow: hidden;
  padding-right: 0;
  justify-content: space-evenly;
}

.character-card {
  background: var(--color-bg-menu);
  border-radius: clamp(6px, 0.8vw, 10px);
  padding: clamp(5px, 0.8vw, 8px);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.character-card:hover {
  background: var(--color-bg-menu-light);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium);
}

.character-card.selected {
  border-color: var(--color-highlights);
  background: var(--color-bg-menu-light);
  box-shadow: 0 0 clamp(20px, 4vw, 40px) rgba(129, 196, 231, 0.5);
  transform: scale(1.02);
}

.character-portrait {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: clamp(4px, 0.6vh, 6px);
  position: relative;
}

.character-avatar {
  width: clamp(35px, 4.5vw, 55px);
  height: clamp(35px, 4.5vw, 55px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: clamp(2px, 0.25vw, 3px) solid var(--color-highlights);
  box-shadow: 0 clamp(2px, 0.3vw, 4px) clamp(3px, 0.6vw, 6px) var(--shadow-medium);
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
  top: -6px;
  right: -6px;
  background: var(--gradient-accents);
  color: white;
  padding: clamp(3px, 0.5vh, 5px) clamp(6px, 1vw, 10px);
  border-radius: clamp(5px, 0.8vw, 10px);
  font-size: clamp(0.55rem, 0.9vw, 0.75rem);
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-dark);
  box-shadow: 0 clamp(2px, 0.3vw, 3px) clamp(3px, 0.5vw, 5px) var(--shadow-medium);
  z-index: 3;
}

.character-info {
  text-align: center;
}

.character-name {
  font-size: clamp(0.65rem, 1vw, 0.85rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin: 0 0 2px 0;
}

.character-title {
  font-size: clamp(0.55rem, 0.9vw, 0.7rem);
  color: var(--color-accents);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.character-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.character-capital,
.character-location {
  display: flex;
  flex-direction: column;
  gap: clamp(1px, 0.3vh, 3px);
}

.capital-label,
.location-label {
  font-size: clamp(0.5rem, 0.8vw, 0.65rem);
  color: var(--color-accents);
  font-weight: 600;
}

.capital-value,
.location-value {
  font-size: clamp(0.6rem, 1vw, 0.85rem);
  color: var(--color-highlights);
  font-weight: 700;
}

.character-locked {
  margin-top: clamp(3px, 0.5vh, 5px);
  padding: clamp(3px, 0.5vh, 5px);
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: clamp(3px, 0.5vw, 6px);
  text-align: center;
}

.locked-text {
  font-size: clamp(0.5rem, 0.85vw, 0.7rem);
  color: #ff6b6b;
  font-weight: 600;
}

/* Центральная панель - Информация о персонаже */
.character-info-panel {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  background: var(--color-bg-menu-light);
  border-radius: clamp(8px, 1vw, 12px);
  padding: clamp(10px, 1.2vw, 15px);
  border: 2px solid var(--color-buttons);
  backdrop-filter: blur(5px);
  box-shadow: 0 8px 16px var(--shadow-medium);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.character-display {
  text-align: center;
  width: 100%;
}

.character-avatar-display {
  width: clamp(220px, 30vw, 400px);
  height: clamp(220px, 30vw, 400px);
  margin: 0 auto clamp(5px, 0.8vh, 10px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.character-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.character-name-display {
  font-size: clamp(0.85rem, 1.3vw, 1.05rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin: 0 0 clamp(5px, 0.8vh, 8px) 0;
}

.character-stats {
  background: var(--color-bg-menu);
  border-radius: clamp(6px, 0.8vw, 10px);
  padding: clamp(6px, 0.8vw, 10px);
  border: 2px solid var(--color-buttons);
  display: flex;
  flex-direction: column;
  gap: clamp(3px, 0.5vh, 5px);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(2px, 0.3vh, 4px) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  color: var(--color-accents);
  font-weight: 600;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.stat-value {
  font-size: clamp(0.65rem, 1.1vw, 0.85rem);
  color: var(--color-highlights);
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.equipment-value {
  font-size: clamp(0.55rem, 0.9vw, 0.75rem);
  text-align: right;
  max-width: 200px;
  line-height: 1.2;
}

.progress-bar-container {
  flex: 1;
  height: clamp(8px, 1vh, 12px);
  background: rgba(0, 0, 0, 0.3);
  border-radius: clamp(4px, 0.5vh, 6px);
  overflow: hidden;
  margin-left: clamp(6px, 0.8vw, 8px);
}

.progress-bar-fill {
  height: 100%;
  background: var(--gradient-highlights);
  border-radius: clamp(4px, 0.5vh, 6px);
  transition: width 0.5s ease;
}

.skills-content {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.2vh, 15px);
  flex: 1;
  overflow: hidden;
}

.skill-points {
  background: var(--color-bg-menu);
  border-radius: clamp(6px, 1vw, 10px);
  padding: clamp(6px, 1vh, 12px);
  text-align: center;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  flex-shrink: 0;
}

.skill-points-label {
  font-size: clamp(0.7rem, 1.2vw, 0.95rem);
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin-right: clamp(4px, 0.8vw, 8px);
}

.skill-points-value {
  font-size: clamp(0.85rem, 1.5vw, 1.15rem);
  font-weight: 700;
  color: var(--color-highlights);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.skills-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: clamp(6px, 0.8vw, 10px);
  flex: 1;
  overflow: hidden;
  padding-right: 0;
}

.skill-item {
  background: var(--color-bg-menu);
  border-radius: clamp(6px, 0.8vw, 10px);
  padding: clamp(5px, 0.8vw, 10px);
  border: 2px solid var(--color-buttons);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
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
  width: clamp(25px, 3.5vw, 40px);
  height: clamp(25px, 3.5vw, 40px);
  background: var(--gradient-buttons);
  border-radius: 50%;
  margin-bottom: clamp(4px, 0.6vh, 8px);
  border: clamp(2px, 0.25vw, 3px) solid var(--color-text);
  box-shadow: 0 clamp(2px, 0.3vw, 4px) clamp(3px, 0.5vw, 6px) var(--shadow-medium);
  align-self: center;
  flex-shrink: 0;
}

.skill-number {
  font-size: clamp(0.8rem, 1.5vw, 1.2rem);
  font-weight: 700;
  color: white;
  text-shadow: 1px 1px 0px var(--shadow-dark);
}

.skill-info {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.skill-name {
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin: 0 0 clamp(3px, 0.5vh, 5px) 0;
  flex-shrink: 0;
}

.skill-description {
  font-size: clamp(0.55rem, 0.9vw, 0.7rem);
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  line-height: 1.2;
  margin: 0 0 clamp(3px, 0.5vh, 5px) 0;
  flex-shrink: 0;
}

.skill-explanation {
  background: rgba(255, 255, 255, 0.05);
  border-radius: clamp(4px, 0.6vw, 8px);
  padding: clamp(4px, 0.6vw, 8px);
  margin-bottom: clamp(4px, 0.6vh, 6px);
  border-left: 2px solid var(--color-accents);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.game-effect,
.real-explanation {
  font-size: clamp(0.5rem, 0.85vw, 0.65rem);
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  line-height: 1.1;
  margin-bottom: clamp(2px, 0.3vh, 3px);
}

.game-effect:last-child,
.real-explanation:last-child {
  margin-bottom: 0;
}

.game-effect strong,
.real-explanation strong {
  color: var(--color-highlights);
  font-weight: 700;
}

.skill-level-bar {
  width: 100%;
  height: clamp(4px, 0.6vh, 6px);
  background: rgba(0, 0, 0, 0.3);
  border-radius: clamp(2px, 0.3vh, 3px);
  overflow: hidden;
  margin-bottom: clamp(4px, 0.6vh, 6px);
  flex-shrink: 0;
}

.skill-level-progress {
  height: 100%;
  background: var(--gradient-highlights);
  border-radius: clamp(2px, 0.3vh, 3px);
  transition: width 0.5s ease;
}

.skill-actions {
  display: flex;
  flex-direction: column;
  gap: clamp(4px, 0.6vh, 6px);
  text-align: center;
  margin-top: auto;
  flex-shrink: 0;
}

.skill-upgrade-btn {
  background: var(--gradient-buttons);
  color: white;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-text);
  border-radius: clamp(4px, 0.6vw, 8px);
  padding: clamp(4px, 0.6vh, 8px) clamp(8px, 1.2vw, 12px);
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 clamp(2px, 0.3vw, 4px) clamp(3px, 0.5vw, 6px) var(--shadow-medium);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.skill-upgrade-btn:hover:not(:disabled) {
  background: var(--gradient-accents);
  transform: translateY(-1px);
  box-shadow: 0 clamp(3px, 0.5vw, 6px) clamp(4px, 0.8vw, 8px) var(--shadow-dark);
}

.skill-upgrade-btn:disabled {
  background: rgba(128, 128, 128, 0.5);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.skill-tutorial-btn {
  background: var(--gradient-accents);
  color: white;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-text);
  border-radius: clamp(4px, 0.6vw, 8px);
  padding: clamp(3px, 0.5vh, 6px) clamp(6px, 1vw, 10px);
  font-size: clamp(0.55rem, 0.9vw, 0.7rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 clamp(1px, 0.2vw, 3px) clamp(2px, 0.4vw, 5px) var(--shadow-medium);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.skill-tutorial-btn:hover {
  background: var(--gradient-highlights);
  transform: translateY(-1px);
  box-shadow: 0 clamp(2px, 0.4vw, 5px) clamp(3px, 0.6vw, 8px) var(--shadow-dark);
}

/* Подсказка наставника */
.mentor-tip {
  grid-column: 1 / 4;
  grid-row: 2 / 3;
  background: var(--color-bg-menu-light);
  border-radius: clamp(8px, 1vw, 12px);
  padding: clamp(8px, 1vw, 12px);
  border: 2px solid var(--color-buttons);
  backdrop-filter: blur(5px);
  box-shadow: 0 6px 12px var(--shadow-medium);
  z-index: 10;
}

.tip-content {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.2vw, 12px);
}

.tip-icon {
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  flex-shrink: 0;
}

.tip-text {
  font-size: clamp(0.65rem, 1.1vw, 0.9rem);
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  line-height: 1.3;
}

.tip-text strong {
  color: var(--color-highlights);
  font-weight: 700;
}

/* Адаптивность */
@media (max-width: 1400px) {
  .skill-explanation {
    padding: 6px;
  }
  
  .game-effect,
  .real-explanation {
    font-size: clamp(0.55rem, 0.9vw, 0.7rem);
  }
}
</style>
