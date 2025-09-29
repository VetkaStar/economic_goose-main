<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal hotkeys-modal" @click.stop>
      <div class="modal-header">
        <h2 class="menu-title">⌨️ Горячие клавиши</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      
      <div class="modal-content">
        <div class="hotkeys-grid">
          <div class="hotkeys-section">
            <h3>🎮 Основные действия</h3>
            <div class="hotkey-item">
              <span class="key">ESC</span>
              <span class="description">Закрыть модальное окно</span>
            </div>
            <div class="hotkey-item">
              <span class="key">ENTER</span>
              <span class="description">Подтвердить действие</span>
            </div>
            <div class="hotkey-item">
              <span class="key">SPACE</span>
              <span class="description">Пауза / Продолжить</span>
            </div>
          </div>
          
          <div class="hotkeys-section">
            <h3>🏢 Управление компанией</h3>
            <div class="hotkey-item">
              <span class="key">1-5</span>
              <span class="description">Быстрый выбор зданий</span>
            </div>
            <div class="hotkey-item">
              <span class="key">TAB</span>
              <span class="description">Переключение вкладок</span>
            </div>
            <div class="hotkey-item">
              <span class="key">S</span>
              <span class="description">Сохранить игру</span>
            </div>
          </div>
          
          <div class="hotkeys-section">
            <h3>🎯 Мини-игры</h3>
            <div class="hotkey-item">
              <span class="key">WASD</span>
              <span class="description">Движение персонажа</span>
            </div>
            <div class="hotkey-item">
              <span class="key">SHIFT</span>
              <span class="description">Бег / Ускорение</span>
            </div>
            <div class="hotkey-item">
              <span class="key">E</span>
              <span class="description">Взаимодействие</span>
            </div>
          </div>
          
          <div class="hotkeys-section">
            <h3>⚙️ Интерфейс</h3>
            <div class="hotkey-item">
              <span class="key">F11</span>
              <span class="description">Полноэкранный режим</span>
            </div>
            <div class="hotkey-item">
              <span class="key">F1</span>
              <span class="description">Справка</span>
            </div>
            <div class="hotkey-item">
              <span class="key">CTRL+S</span>
              <span class="description">Быстрое сохранение</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-primary" @click="closeModal">
          Понятно
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Эмиты
const emit = defineEmits<{
  close: []
}>()

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.hotkeys-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: clamp(15px, 2vw, 30px);
  max-width: 900px;
  width: 95%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 clamp(10px, 2vw, 20px) clamp(30px, 6vw, 60px) var(--shadow-dark, rgba(0, 0, 0, 0.3));
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text, #5D4037);
}

.modal-content {
  padding: clamp(20px, 3vw, 40px);
}

.hotkeys-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(20px, 3vw, 40px);
}

.hotkeys-section {
  margin-bottom: 0;
}

.hotkeys-section h3 {
  margin: 0 0 clamp(15px, 2vw, 25px) 0;
  color: var(--color-text);
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  border-bottom: clamp(2px, 0.3vw, 4px) solid var(--color-buttons);
  padding-bottom: clamp(8px, 1vw, 15px);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.hotkey-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(10px, 1.5vw, 20px);
  padding: clamp(10px, 1.5vw, 15px);
  background: var(--color-bg-menu-light);
  border-radius: clamp(8px, 1.5vw, 15px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
  transition: all 0.3s ease;
}

.hotkey-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-medium);
}

.key {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: clamp(0.9rem, 1.6vw, 1.3rem);
  color: white;
  background: var(--gradient-buttons);
  padding: clamp(5px, 1vw, 10px) clamp(10px, 1.5vw, 15px);
  border-radius: clamp(5px, 1vw, 10px);
  box-shadow: 0 2px 4px var(--shadow-medium);
  text-shadow: none;
  border: 1px solid var(--color-text);
  min-width: clamp(60px, 8vw, 80px);
  text-align: center;
}

.description {
  flex: 1;
  margin-left: clamp(15px, 2vw, 25px);
  font-size: clamp(0.8rem, 1.4vw, 1.1rem);
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
  font-family: 'Orbitron', sans-serif;
}

@media (max-width: 768px) {
  .hotkeys-grid {
    grid-template-columns: 1fr;
  }
  
  .hotkey-item {
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(5px, 1vw, 10px);
  }

  .description {
    margin-left: 0;
  }
}

.hotkeys-section {
  margin-bottom: clamp(25px, 4vw, 40px);
}

.hotkeys-section h3 {
  margin: 0 0 clamp(15px, 2vw, 25px) 0;
  color: var(--color-text);
  font-size: clamp(1.1rem, 2.2vw, 1.6rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  border-bottom: clamp(2px, 0.3vw, 4px) solid var(--color-buttons);
  padding-bottom: clamp(8px, 1vw, 15px);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.hotkey-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(12px, 2vw, 20px);
  padding: clamp(12px, 2vw, 20px);
  background: var(--gradient-bg);
  border-radius: clamp(8px, 1.5vw, 15px);
  transition: all 0.3s ease;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
}

.hotkey-item:hover {
  background: var(--color-bg-menu-light);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-medium);
}

.key {
  background: var(--gradient-accents);
  color: white;
  padding: clamp(6px, 1vw, 12px) clamp(12px, 2vw, 20px);
  border-radius: clamp(6px, 1vw, 12px);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: clamp(0.8rem, 1.5vw, 1.2rem);
  text-shadow: 1px 1px 0px var(--color-accents-dark);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium);
  min-width: clamp(60px, 10vw, 100px);
  text-align: center;
}

.description {
  flex: 1;
  margin-left: clamp(15px, 2.5vw, 25px);
  color: var(--color-text);
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(0.9rem, 1.6vw, 1.3rem);
  font-weight: 500;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

/* Адаптивность */
@media (max-width: 768px) {
  .hotkeys-modal {
    width: 95%;
    margin: clamp(5px, 1vw, 10px);
  }
  
  .modal-content {
    padding: clamp(15px, 2vw, 25px);
  }
  
  .hotkey-item {
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(8px, 1.5vw, 15px);
  }
  
  .key {
    min-width: auto;
    width: 100%;
    text-align: center;
  }
  
  .description {
    margin-left: 0;
    text-align: center;
  }
}
</style>
