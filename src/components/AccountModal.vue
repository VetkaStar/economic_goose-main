<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal account-modal" @click.stop>
      <div class="modal-header">
        <h2 class="menu-title">👤 Учетная запись</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      
      <div class="modal-content">
        <!-- Информация о пользователе -->
        <div class="user-info-section">
          <div class="user-avatar">
            <div class="avatar-icon">🦆</div>
          </div>
          <div class="user-details">
            <h3 class="username">{{ userInfo.username }}</h3>
            <p class="user-level">Уровень: {{ userInfo.level }}</p>
            <p class="user-experience">Опыт: {{ userInfo.experience }}/{{ userInfo.nextLevelExp }}</p>
          </div>
        </div>
        
        <!-- Прогресс-бар опыта -->
        <div class="experience-bar">
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: experiencePercentage + '%' }"></div>
          </div>
          <span class="progress-text">{{ experiencePercentage }}%</span>
        </div>
        
        
        <!-- Настройки аккаунта -->
        <div class="account-settings-section">
          <h3>⚙️ Настройки аккаунта</h3>
          <div class="setting-item">
            <label>Имя пользователя</label>
            <input 
              type="text" 
              v-model="userInfo.username"
              class="text-input"
              placeholder="Введите имя пользователя"
            />
          </div>
          <div class="setting-item">
            <label>Email</label>
            <input 
              type="email" 
              v-model="userInfo.email"
              class="text-input"
              placeholder="Введите email"
            />
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="resetAccount">
          Сбросить прогресс
        </button>
        <button class="btn btn-primary" @click="saveAccount">
          Сохранить
        </button>
        <button class="btn btn-exit" @click="logout">
          🚪 Выйти из аккаунта
        </button>
      </div>
    </div>

    <!-- Модальное окно подтверждения сброса прогресса -->
    <div v-if="showResetConfirm" class="modal-overlay" @click.self="cancelReset">
      <div class="confirm-modal">
        <div class="confirm-header">
          <h3>⚠️ Сброс прогресса компании</h3>
        </div>
        <div class="confirm-body">
          <div class="warning-icon">🚨</div>
          <p class="warning-text">
            Вы уверены, что хотите сбросить весь прогресс компании?
          </p>
          <div class="warning-details">
            <p><strong>Будет сброшено:</strong></p>
            <ul>
              <li>Уровень и опыт компании</li>
              <li>Все материалы и готовая одежда</li>
              <li>Арендованные помещения</li>
              <li>Деньги (сброс до 5000₽)</li>
              <li>Все заказы и социальные посты</li>
            </ul>
            <p><strong>НЕ будет затронуто:</strong></p>
            <ul>
              <li>Ваш аккаунт и данные входа</li>
              <li>Позиция в лидерборде мультиплеера</li>
              <li>Достижения и награды</li>
            </ul>
          </div>
          <p class="final-warning">
            <strong>Это действие нельзя отменить!</strong>
          </p>
        </div>
        <div class="confirm-footer">
          <button class="btn btn-cancel" @click="cancelReset">
            Отмена
          </button>
          <button class="btn btn-danger" @click="confirmReset">
            Да, сбросить прогресс
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// Эмиты
const emit = defineEmits<{
  close: []
}>()

// Auth store
const authStore = useAuthStore()

// Информация о пользователе
const userInfo = ref({
  username: authStore.user?.username || '',
  level: authStore.user?.level || 1,
  experience: authStore.user?.experience || 0,
  nextLevelExp: 1000,
  email: authStore.user?.email || ''
})

// Состояние модального окна подтверждения сброса
const showResetConfirm = ref(false)


// Вычисляемые свойства
const experiencePercentage = computed(() => {
  return Math.round((userInfo.value.experience / userInfo.value.nextLevelExp) * 100)
})


const saveAccount = async () => {
  try {
    if (!authStore.user) return
    // Здесь можно обновить username/full_name/email при необходимости
    console.log('Сохранение данных аккаунта:', userInfo.value)
    closeModal()
  } catch (e) {
    console.error(e)
  }
}

const resetAccount = () => {
  showResetConfirm.value = true
}

const confirmReset = async () => {
  try {
    // Сбрасываем только прогресс компании, НЕ удаляем из лидерборда
    const success = await authStore.resetCompanyProgress()
    if (success) {
      // Обновляем локальные данные пользователя
      userInfo.value.money = 5000
      userInfo.value.level = 1
      userInfo.value.experience = 0
      
      console.log('✅ Локальные данные пользователя обновлены:', {
        money: userInfo.value.money,
        level: userInfo.value.level,
        experience: userInfo.value.experience
      })
      
      showResetConfirm.value = false
      closeModal()
      
      // Принудительно перезагружаем страницу для обновления всех компонентов
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      console.error('Ошибка при сбросе прогресса')
    }
  } catch (error) {
    console.error('Ошибка при сбросе прогресса:', error)
  }
}

const cancelReset = () => {
  showResetConfirm.value = false
}

const closeModal = () => {
  emit('close')
}

const logout = async () => {
  const success = await authStore.signOut()
  if (success) closeModal()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.account-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: clamp(15px, 2vw, 30px);
  max-width: 900px;
  width: 95%;
  height: auto;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 clamp(10px, 2vw, 20px) clamp(30px, 6vw, 60px) var(--shadow-dark, rgba(0, 0, 0, 0.3));
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text, #5D4037);
}

.modal-content {
  padding: clamp(20px, 3vw, 40px);
}

.user-info-section {
  display: flex;
  align-items: center;
  gap: clamp(20px, 3vw, 30px);
  margin-bottom: clamp(25px, 4vw, 40px);
  padding: clamp(20px, 3vw, 30px);
  background: var(--gradient-bg);
  border-radius: clamp(12px, 2vw, 20px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-buttons);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium);
}

.user-avatar {
  width: clamp(80px, 12vw, 120px);
  height: clamp(80px, 12vw, 120px);
  background: var(--gradient-accents);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-dark);
}

.avatar-icon {
  font-size: clamp(2.5rem, 5vw, 4rem);
}

.user-details h3 {
  margin: 0 0 clamp(8px, 1vw, 12px) 0;
  color: var(--color-text);
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  text-shadow: 2px 2px 0px var(--shadow-light);
}

.user-details p {
  margin: 0 0 clamp(4px, 0.8vw, 8px) 0;
  color: var(--color-text);
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-family: 'Orbitron', sans-serif;
  font-weight: 500;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.experience-bar {
  margin-bottom: clamp(25px, 4vw, 40px);
  padding: clamp(15px, 2vw, 25px);
  background: var(--gradient-bg);
  border-radius: clamp(10px, 1.5vw, 15px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
}

.progress-container {
  width: 100%;
  height: clamp(20px, 3vw, 30px);
  background: var(--color-buttons-light);
  border-radius: clamp(10px, 1.5vw, 15px);
  overflow: hidden;
  border: clamp(1px, 0.2vw, 2px) solid var(--color-text);
  margin-bottom: clamp(8px, 1vw, 12px);
}

.progress-bar {
  height: 100%;
  background: var(--gradient-buttons);
  transition: width 0.3s ease;
  border-radius: clamp(8px, 1.2vw, 12px);
}

.progress-text {
  color: var(--color-text);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: clamp(0.9rem, 1.6vw, 1.3rem);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.account-settings-section {
  margin-bottom: clamp(25px, 4vw, 40px);
}

.account-settings-section h3 {
  margin: 0 0 clamp(15px, 2vw, 25px) 0;
  color: var(--color-text);
  font-size: clamp(1.1rem, 2.2vw, 1.6rem);
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
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
}

.setting-item label {
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(0.9rem, 1.6vw, 1.3rem);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.text-input {
  flex: 2;
  padding: clamp(8px, 1.2vw, 12px) clamp(12px, 2vw, 16px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  border-radius: clamp(6px, 1vw, 12px);
  background: var(--color-bg-menu);
  font-size: clamp(0.9rem, 1.6vw, 1.3rem);
  font-family: 'Orbitron', sans-serif;
  color: var(--color-text);
  box-shadow: 0 clamp(1px, 0.2vw, 2px) clamp(2px, 0.4vw, 4px) var(--shadow-light);
  transition: all 0.3s ease;
}

.text-input:focus {
  outline: none;
  border-color: var(--color-buttons);
  box-shadow: 0 0 0 clamp(2px, 0.4vw, 4px) var(--color-buttons-light);
}

/* Адаптивность */
@media (max-width: 768px) {
  .account-modal {
    width: 95%;
    margin: clamp(5px, 1vw, 10px);
  }
  
  .modal-content {
    padding: clamp(15px, 2vw, 25px);
  }
  
  .user-info-section {
    flex-direction: column;
    text-align: center;
  }
  
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(8px, 1.5vw, 15px);
  }
  
  .text-input {
    width: 100%;
  }
}

/* Стили для кнопок */
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: clamp(10px, 2vw, 20px);
  padding: clamp(15px, 2vw, 30px);
  border-top: clamp(2px, 0.3vw, 4px) solid var(--color-text);
  background: var(--gradient-bg);
  border-radius: 0 0 clamp(15px, 2vw, 30px) clamp(15px, 2vw, 30px);
}

/* Стили для модального окна подтверждения */
.confirm-modal {
  background: var(--color-bg-menu-light);
  border: 3px solid var(--color-danger);
  border-radius: clamp(15px, 2vw, 20px);
  box-shadow: 0 clamp(8px, 1.5vw, 15px) clamp(15px, 3vw, 30px) rgba(0, 0, 0, 0.3);
  max-width: clamp(400px, 50vw, 600px);
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.confirm-header {
  background: linear-gradient(135deg, var(--color-danger), #c62828);
  color: white;
  padding: clamp(15px, 2vw, 25px);
  border-radius: clamp(12px, 1.5vw, 18px) clamp(12px, 1.5vw, 18px) 0 0;
  text-align: center;
}

.confirm-header h3 {
  margin: 0;
  font-size: clamp(1.2rem, 2.2vw, 1.8rem);
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
}

.confirm-body {
  padding: clamp(20px, 3vw, 30px);
  text-align: center;
}

.warning-icon {
  font-size: clamp(3rem, 6vw, 5rem);
  margin-bottom: clamp(15px, 2vw, 20px);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.warning-text {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: clamp(20px, 3vw, 25px);
  font-family: 'Orbitron', sans-serif;
}

.warning-details {
  background: var(--gradient-bg);
  border: 2px solid var(--color-buttons);
  border-radius: clamp(10px, 1.5vw, 15px);
  padding: clamp(15px, 2vw, 20px);
  margin-bottom: clamp(15px, 2vw, 20px);
  text-align: left;
}

.warning-details p {
  margin: 0 0 clamp(8px, 1vw, 12px) 0;
  font-weight: 600;
  color: var(--color-text);
  font-size: clamp(0.9rem, 1.6vw, 1.1rem);
}

.warning-details ul {
  margin: 0 0 clamp(12px, 2vw, 15px) clamp(15px, 2vw, 20px);
  padding: 0;
}

.warning-details li {
  margin-bottom: clamp(4px, 0.8vw, 6px);
  color: var(--color-text);
  font-size: clamp(0.8rem, 1.4vw, 1rem);
}

.final-warning {
  background: var(--color-danger);
  color: white;
  padding: clamp(10px, 1.5vw, 15px);
  border-radius: clamp(8px, 1.2vw, 12px);
  font-size: clamp(1rem, 1.8vw, 1.3rem);
  font-weight: 700;
  margin: 0;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.3);
  animation: warningGlow 2s infinite;
}

@keyframes warningGlow {
  0%, 100% { box-shadow: 0 0 10px rgba(244, 67, 54, 0.3); }
  50% { box-shadow: 0 0 20px rgba(244, 67, 54, 0.6); }
}

.confirm-footer {
  display: flex;
  gap: clamp(10px, 1.5vw, 15px);
  padding: clamp(15px, 2vw, 25px);
  justify-content: center;
}

.btn-cancel {
  background: var(--color-buttons);
  color: var(--color-text);
  border: 2px solid var(--color-buttons);
  padding: clamp(10px, 1.5vw, 15px) clamp(20px, 3vw, 30px);
  border-radius: clamp(8px, 1.2vw, 12px);
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 1px 1px 0px var(--shadow-light);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
}

.btn-cancel:hover {
  background: var(--color-buttons-light);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.6vw, 6px) clamp(6px, 1vw, 10px) var(--shadow-medium);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
  border: 2px solid var(--color-danger);
  padding: clamp(10px, 1.5vw, 15px) clamp(20px, 3vw, 30px);
  border-radius: clamp(8px, 1.2vw, 12px);
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 1px 1px 0px var(--shadow-light);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light);
}

.btn-danger:hover {
  background: var(--color-danger-dark);
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.6vw, 6px) clamp(6px, 1vw, 10px) var(--shadow-medium);
}
</style>
