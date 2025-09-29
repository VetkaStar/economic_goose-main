<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal settings-modal" @click.stop>
      <div class="modal-header">
        <h2 class="menu-title">⚙️ Настройки</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      
      <div class="modal-content">
        <!-- Звук -->
        <div class="settings-section">
          <div class="setting-item">
            <label>Общая громкость</label>
            <div class="slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                :value="localSettings.masterVolume"
                @input="updateMasterVolume($event)"
                @change="updateMasterVolume($event)"
                class="slider"
              />
              <span class="value">{{ localSettings.masterVolume }}%</span>
            </div>
          </div>
          
          <div class="setting-item">
            <label>Громкость музыки</label>
            <div class="slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                :value="localSettings.musicVolume"
                @input="updateMusicVolume($event)"
                @change="updateMusicVolume($event)"
                class="slider"
              />
              <span class="value">{{ localSettings.musicVolume }}%</span>
            </div>
          </div>
          
          <div class="setting-item">
            <label>Громкость окружения</label>
            <div class="slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                :value="localSettings.ambientVolume"
                @input="updateAmbientVolume($event)"
                @change="updateAmbientVolume($event)"
                class="slider"
              />
              <span class="value">{{ localSettings.ambientVolume }}%</span>
            </div>
          </div>
        </div>
        
        <!-- Графика -->
        <div class="settings-section">
          <div class="setting-item">
            <label>Полноэкранный режим</label>
            <div class="toggle-container">
              <input 
                type="checkbox" 
                v-model="localSettings.fullscreen"
                @change="toggleFullscreen"
                class="toggle"
                id="fullscreen"
              />
              <label for="fullscreen" class="toggle-label"></label>
            </div>
          </div>
        </div>

        <!-- Дополнительные функции -->
        <div class="settings-section">
          <div class="setting-item">
            <button class="btn btn-secondary settings-action-btn" @click="openHotkeys">
              ⌨️ Горячие клавиши
            </button>
          </div>
          <div class="setting-item">
            <button class="btn btn-secondary settings-action-btn" @click="openAccount">
              👤 Профиль
            </button>
          </div>
        </div>


        
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="resetSettings">
          Сбросить
        </button>
        <button class="btn btn-primary" @click="closeModal">
          Сохранить
        </button>
        <button v-if="props.showExitButton" class="btn btn-exit" @click="exitToMainMenu">
          🏠 Главное меню
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMusic } from '@/composables/useMusic'

// Пропсы
const props = defineProps<{
  showExitButton?: boolean
}>()

// Эмиты
const emit = defineEmits<{
  close: []
  exitToMainMenu: []
  openHotkeys: []
  openAccount: []
}>()


// Музыкальная система
const musicSystem = useMusic()


// Локальные значения для ползунков
const localSettings = ref({
  masterVolume: 36, // Соответствует значению из вашего сообщения
  musicVolume: 60,
  ambientVolume: 40,
  fullscreen: false
})

// Загрузка настроек
onMounted(() => {
  loadSettings()
  // Принудительно возобновляем музыку при открытии настроек
  if (musicSystem.isPlaying.value) {
    console.log('🎵 Настройки открыты, принудительно возобновляем музыку...')
    musicSystem.forceUpdateVolume()
  }
})

const loadSettings = () => {
  // Сначала загружаем настройки из музыкальной системы
  musicSystem.loadSettings()
  
  const savedSettings = localStorage.getItem('fashion_goose_settings')
  if (savedSettings) {
    try {
      const savedData = JSON.parse(savedSettings)
      localSettings.value = { ...localSettings.value, ...savedData }
      
      console.log('🎵 Настройки загружены в SettingsModal:', localSettings.value)
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
    }
  } else {
    // Если нет сохраненных настроек, используем значения из музыкальной системы
    localSettings.value.masterVolume = Math.round(musicSystem.volume.value * 100)
    localSettings.value.musicVolume = Math.round(musicSystem.musicVolume.value * 100)
    localSettings.value.ambientVolume = Math.round(musicSystem.environmentVolume.value * 100)
    
    console.log('🎵 Используем значения по умолчанию из музыкальной системы:', localSettings.value)
  }
}

// Функции для обновления громкости
const updateMasterVolume = async (event: Event) => {
  const value = Number((event.target as HTMLInputElement)?.value)
  localSettings.value.masterVolume = value
  await musicSystem.updateVolume(value / 100)
  saveSettings()
  console.log(`🔊 Общая громкость изменена на: ${value}%`)
}

const updateMusicVolume = async (event: Event) => {
  const value = Number((event.target as HTMLInputElement)?.value)
  localSettings.value.musicVolume = value
  await musicSystem.updateMusicVolume(value / 100)
  saveSettings()
  console.log(`🎵 Громкость музыки изменена на: ${value}%`)
}

const updateAmbientVolume = (event: Event) => {
  const value = Number((event.target as HTMLInputElement)?.value)
  localSettings.value.ambientVolume = value
  musicSystem.updateEnvironmentVolume(value / 100)
  saveSettings()
  console.log(`🌍 Громкость окружения изменена на: ${value}%`)
}

// Сохранение настроек
const saveSettings = () => {
  localStorage.setItem('fashion_goose_settings', JSON.stringify(localSettings.value))
  console.log('💾 Настройки сохранены:', localSettings.value)
}


// Сброс настроек
const resetSettings = () => {
  if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
    // Очищаем localStorage
    localStorage.removeItem('fashion_goose_settings')
    
    localSettings.value = {
      masterVolume: 36,
      musicVolume: 60,
      ambientVolume: 40,
      fullscreen: false
    }
    
    // Сбрасываем настройки музыкальной системы
    musicSystem.updateVolume(0.36)
    musicSystem.updateMusicVolume(0.6)
    musicSystem.updateEnvironmentVolume(0.4)
    
    saveSettings()
    
    console.log('🔄 Настройки сброшены к значениям по умолчанию')
  }
}

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}

// Переключение полноэкранного режима
const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      // Входим в полноэкранный режим
      await document.documentElement.requestFullscreen()
      console.log('🖥️ Включен полноэкранный режим')
    } else {
      // Выходим из полноэкранного режима
      await document.exitFullscreen()
      console.log('🖥️ Выключен полноэкранный режим')
    }
    
    // Сохраняем настройки после успешного переключения
    saveSettings()
  } catch (error) {
    console.error('❌ Ошибка переключения полноэкранного режима:', error)
    
    // Если переключение не удалось, возвращаем состояние переключателя
    localSettings.value.fullscreen = !localSettings.value.fullscreen
  }
}

// Открытие горячих клавиш
const openHotkeys = () => {
  emit('openHotkeys')
}

// Открытие профиля
const openAccount = () => {
  emit('openAccount')
}

// Выход в главное меню
const exitToMainMenu = () => {
  emit('exitToMainMenu')
}


</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.settings-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: clamp(15px, 2vw, 30px);
  max-width: 900px;
  width: 95%;
  max-height: 85vh;
  height: auto;
  overflow-y: auto;
  box-shadow: 0 clamp(10px, 2vw, 20px) clamp(30px, 6vw, 60px) var(--shadow-dark, rgba(0, 0, 0, 0.3));
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text, #5D4037);
}


.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(15px, 2vw, 30px);
  border-bottom: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  background: var(--gradient-accents, linear-gradient(135deg, #C85A54 0%, #A84842 100%));
  color: white;
  border-radius: clamp(15px, 2vw, 30px) clamp(15px, 2vw, 30px) 0 0;
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  border-bottom: none;
  margin: clamp(-2px, -0.3vw, -4px) clamp(-2px, -0.3vw, -4px) 0 clamp(-2px, -0.3vw, -4px);
}

.modal-header h2 {
  margin: 0;
  font-size: clamp(1.2rem, 2.5vw, 2rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  text-shadow: 2px 2px 0px var(--color-accents-dark);
}

.close-btn {
  background: none;
  border: none;
  font-size: clamp(1.2rem, 2vw, 1.8rem);
  cursor: pointer;
  color: white;
  padding: clamp(5px, 1vw, 10px);
  border-radius: 50%;
  width: clamp(30px, 5vw, 45px);
  height: clamp(30px, 5vw, 45px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
  transform: scale(1.1);
}

.modal-content {
  padding: clamp(20px, 3vw, 40px);
}

.settings-section {
  margin-bottom: clamp(20px, 3vw, 40px);
}

.settings-section h3 {
  margin: 0 0 clamp(15px, 2vw, 25px) 0;
  color: var(--color-text);
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  border-bottom: clamp(2px, 0.3vw, 4px) solid var(--color-buttons);
  padding-bottom: clamp(8px, 1vw, 15px);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(15px, 2vw, 25px);
  padding: clamp(12px, 2vw, 20px);
  background: var(--gradient-bg);
  border-radius: clamp(8px, 1.5vw, 15px);
  transition: all 0.3s ease;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
}

.setting-item:hover {
  background: var(--color-bg-menu-light);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-medium);
}

.setting-item label {
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(0.8rem, 1.5vw, 1.2rem);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: clamp(10px, 2vw, 20px);
  flex: 2;
}

.slider {
  flex: 1;
  height: clamp(6px, 1vw, 12px);
  border-radius: clamp(3px, 0.5vw, 6px);
  background: var(--color-buttons-light);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-text);
  box-shadow: inset 0 1px 3px var(--shadow-light);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  appearance: none;
  width: clamp(18px, 3vw, 28px);
  height: clamp(18px, 3vw, 28px);
  border-radius: 50%;
  background: var(--gradient-buttons);
  cursor: pointer;
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  transition: all 0.3s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 clamp(3px, 0.6vw, 6px) clamp(6px, 1.2vw, 12px) var(--shadow-dark);
}

.slider::-moz-range-thumb {
  width: clamp(18px, 3vw, 28px);
  height: clamp(18px, 3vw, 28px);
  border-radius: 50%;
  background: var(--gradient-buttons);
  cursor: pointer;
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium);
  transition: all 0.3s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 clamp(3px, 0.6vw, 6px) clamp(6px, 1.2vw, 12px) var(--shadow-dark);
}

.value {
  min-width: clamp(40px, 8vw, 60px);
  text-align: right;
  font-weight: bold;
  color: var(--color-text);
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(0.7rem, 1.2vw, 1rem);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

select {
  padding: clamp(6px, 1vw, 12px) clamp(8px, 1.5vw, 16px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  border-radius: clamp(6px, 1vw, 12px);
  background: var(--color-bg-menu);
  font-size: clamp(0.8rem, 1.5vw, 1.2rem);
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-text);
  box-shadow: 0 clamp(1px, 0.2vw, 2px) clamp(2px, 0.4vw, 4px) var(--shadow-light);
}

select:focus {
  outline: none;
  border-color: var(--color-buttons);
  box-shadow: 0 0 0 clamp(2px, 0.4vw, 4px) var(--color-buttons-light);
}

.toggle-container {
  position: relative;
}

.toggle {
  display: none;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: clamp(50px, 8vw, 70px);
  height: clamp(25px, 4vw, 35px);
  background: var(--color-buttons-light);
  border-radius: clamp(12px, 2vw, 18px);
  cursor: pointer;
  transition: all 0.3s ease;
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  box-shadow: inset 0 1px 3px var(--shadow-light);
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: clamp(2px, 0.3vw, 4px);
  left: clamp(2px, 0.3vw, 4px);
  width: clamp(18px, 3vw, 26px);
  height: clamp(18px, 3vw, 26px);
  background: var(--gradient-bg);
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 clamp(1px, 0.2vw, 2px) clamp(2px, 0.4vw, 4px) var(--shadow-medium);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-text);
}

.toggle:checked + .toggle-label {
  background: var(--gradient-buttons);
  box-shadow: inset 0 1px 3px var(--shadow-light);
}

.toggle:checked + .toggle-label::after {
  transform: translateX(clamp(26px, 4.2vw, 36px));
  background: white;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: clamp(10px, 2vw, 20px);
  padding: clamp(15px, 2vw, 30px);
  border-top: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  background: var(--gradient-bg);
  border-radius: 0 0 clamp(15px, 2vw, 30px) clamp(15px, 2vw, 30px);
}

.btn {
  padding: clamp(8px, 1.5vw, 16px) clamp(16px, 3vw, 32px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  border-radius: clamp(6px, 1vw, 12px);
  font-size: clamp(0.8rem, 1.5vw, 1.2rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 0px var(--shadow-light);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium);
}

.btn-primary {
  background: var(--gradient-buttons);
  color: white;
}

.btn-primary:hover {
  background: var(--gradient-accents);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-dark);
}

.btn-secondary {
  background: var(--gradient-bg);
  color: var(--color-text);
}

  .btn-secondary:hover {
    background: var(--color-bg-menu-light);
    transform: translateY(-2px);
    box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-medium);
  }

  .btn-exit {
    background: var(--gradient-accents);
    color: white;
    font-size: clamp(0.7rem, 1.3vw, 1rem);
    padding: clamp(6px, 1.2vw, 12px) clamp(12px, 2.5vw, 24px);
  }

  .btn-exit:hover {
    background: linear-gradient(135deg, var(--color-accents-dark) 0%, #8B3A3A 100%);
    transform: translateY(-2px);
    box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-dark);
  }

/* Кнопки действий в настройках */
.settings-action-btn {
  width: 100%;
  margin: clamp(5px, 1vw, 10px) 0;
  background: var(--color-buttons, #D4824A);
  color: white;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(5px, 1vw, 10px);
}

.settings-action-btn:hover {
  background: var(--color-highlights, #81C4E7);
  transform: translateY(-2px);
}

/* Адаптивность */
@media (max-width: 768px) {
  .settings-modal {
    width: 95%;
    margin: clamp(5px, 1vw, 10px);
  }
  
  .modal-content {
    padding: clamp(15px, 2vw, 25px);
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(8px, 1.5vw, 15px);
  }
  
  .slider-container {
    width: 100%;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: clamp(8px, 1.5vw, 15px);
  }
  
  .btn {
    width: 100%;
    text-align: center;
  }
}

</style>
