<template>
  <div class="company-page">
    <!-- Выбор типа бизнеса -->
    <div v-if="!businessTypeSelected" class="business-selection">
      <!-- Кнопка назад -->
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
        <span class="back-text">Назад</span>
      </button>
      
      <div class="selection-container">
        <h1 class="selection-title">Какой бизнес для развития ты выбираешь?</h1>
        <div class="business-options">
          <div 
            class="business-option production-option"
            @click="selectBusinessType('production')"
          >
            <div class="option-icon">🏭</div>
            <h3 class="option-title">Производство</h3>
            <p class="option-description">
              Создавайте одежду с нуля, контролируйте весь процесс от дизайна до продажи
            </p>
            <div class="option-features">
              <span class="feature">✓ Полный контроль качества</span>
              <span class="feature">✓ Уникальные дизайны</span>
              <span class="feature">✓ Высокая маржинальность</span>
            </div>
          </div>

          <div 
            class="business-option secondhand-option"
            @click="selectBusinessType('secondhand')"
          >
            <div class="option-icon">♻️</div>
            <h3 class="option-title">Секонд-хенд</h3>
            <p class="option-description">
              Покупайте винтажную одежду, улучшайте и продавайте с прибылью
            </p>
            <div class="option-features">
              <span class="feature">✓ Низкие стартовые затраты</span>
              <span class="feature">✓ Экологичность</span>
              <span class="feature">✓ Уникальные находки</span>
            </div>
            <div class="coming-soon">В разработке</div>
          </div>

          <div 
            class="business-option resale-option"
            @click="selectBusinessType('resale')"
          >
            <div class="option-icon">📦</div>
            <h3 class="option-title">Перепродажа</h3>
            <p class="option-description">
              Закупайте готовую одежду у поставщиков и продавайте с наценкой
            </p>
            <div class="option-features">
              <span class="feature">✓ Быстрый старт</span>
              <span class="feature">✓ Широкий ассортимент</span>
              <span class="feature">✓ Меньше рисков</span>
            </div>
            <div class="coming-soon">В разработке</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2D Карта города -->
    <CityMap 
      v-if="businessTypeSelected"
      @exit-to-main-menu="exitToMainMenu"
    />
    
    <!-- Модальное окно авторизации -->
    <AuthModal 
      v-if="showAuthModal"
      @close="closeAuthModal"
      @success="onAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CityMap from './CityMap.vue'
import AuthModal from './AuthModal.vue'
import { useAuthGuard } from '@/composables/useAuthGuard'

const emit = defineEmits<{
  exitToMainMenu: []
}>()

// Используем auth guard
const { requireAuth, showAuthModal, onAuthSuccess, closeAuthModal } = useAuthGuard()

// Состояние выбора бизнеса
const businessTypeSelected = ref(false)
const selectedBusinessType = ref('')

const selectBusinessType = (type: string) => {
  if (type === 'production') {
    // Проверяем авторизацию перед началом игры в компании
    const isAuthenticated = requireAuth('company', () => {
      selectedBusinessType.value = type
      businessTypeSelected.value = true
    })
    
    if (isAuthenticated) {
      selectedBusinessType.value = type
      businessTypeSelected.value = true
    }
  } else {
    // Для других типов показываем уведомление
    alert('Эта опция находится в разработке!')
  }
}

// Автоматически выбираем production для тестирования
onMounted(() => {
  selectedBusinessType.value = 'production'
  businessTypeSelected.value = true
})

const exitToMainMenu = () => {
  emit('exitToMainMenu')
}

const goBack = () => {
  emit('exitToMainMenu')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.company-page {
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


/* Выбор типа бизнеса */
.business-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: clamp(20px, 3vw, 40px);
  position: relative;
}

/* Кнопка назад */
.back-button {
  position: absolute;
  top: 30px;
  left: 30px;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 15px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  color: var(--color-text);
  box-shadow: 0 4px 12px var(--shadow-medium);
  z-index: 10;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--shadow-dark);
  background: var(--color-buttons);
  color: white;
}

.back-icon {
  font-size: 18px;
  font-weight: 900;
}

.back-text {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.selection-container {
  max-width: 1200px;
  width: 100%;
  text-align: center;
}

.selection-title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 900;
  color: white;
  text-shadow: 
    3px 3px 0px var(--color-accents),
    6px 6px 0px var(--color-accents-dark);
  margin: 0 0 clamp(40px, 6vw, 80px) 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.business-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: clamp(20px, 3vw, 40px);
}

.business-option {
  background: var(--color-bg-menu-light);
  border-radius: clamp(15px, 2vw, 30px);
  padding: clamp(25px, 4vw, 50px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-buttons);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 clamp(8px, 1.6vw, 16px) clamp(16px, 3.2vw, 32px) var(--shadow-medium);
}

.business-option:hover {
  transform: translateY(-10px);
  box-shadow: 0 clamp(12px, 2.4vw, 24px) clamp(20px, 4vw, 40px) var(--shadow-dark);
}

.business-option.production-option {
  background: linear-gradient(135deg, var(--color-bg-menu-light) 0%, #E8F4FD 100%);
}

.business-option.secondhand-option,
.business-option.resale-option {
  opacity: 0.7;
  cursor: not-allowed;
}

.option-icon {
  font-size: clamp(3rem, 6vw, 5rem);
  margin-bottom: clamp(15px, 2vw, 25px);
}

.option-title {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  margin: 0 0 clamp(15px, 2vw, 25px) 0;
}

.option-description {
  font-size: clamp(1rem, 1.8vw, 1.4rem);
  color: var(--color-text);
  line-height: 1.5;
  margin: 0 0 clamp(20px, 3vw, 30px) 0;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.option-features {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.2vw, 12px);
  text-align: left;
}

.feature {
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  color: var(--color-secondary);
  font-weight: 600;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.coming-soon {
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--gradient-accents);
  color: white;
  padding: clamp(8px, 1.2vw, 12px) clamp(15px, 2vw, 20px);
  border-radius: clamp(8px, 1.2vw, 15px);
  font-size: clamp(0.8rem, 1.4vw, 1.1rem);
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-dark);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium);
}

/* Адаптивность */
@media (max-width: 768px) {
  .business-options {
    grid-template-columns: 1fr;
  }
}
</style>
