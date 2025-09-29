<template>
  <div class="auth-modal-overlay" @click="closeModal">
    <div class="auth-modal" @click.stop>
      <!-- Заголовок -->
      <div class="auth-header">
        <h2>🔐 Авторизация</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- Формы авторизации -->
      <div class="auth-content">
        <!-- Переключатель режимов -->
        <div class="auth-tabs">
          <button 
            @click="mode = 'signin'" 
            :class="{ active: mode === 'signin' }"
            class="tab-btn"
          >
            Вход
          </button>
          <button 
            @click="mode = 'signup'" 
            :class="{ active: mode === 'signup' }"
            class="tab-btn"
          >
            Регистрация
          </button>
        </div>

        <!-- Форма входа -->
        <form v-if="mode === 'signin'" @submit.prevent="handleSignIn" class="auth-form">
          <div class="form-group">
            <label for="signin-email">Email:</label>
            <input
              id="signin-email"
              v-model="signInForm.email"
              type="email"
              required
              placeholder="Введите email"
            />
          </div>
          
          <div class="form-group">
            <label for="signin-password">Пароль:</label>
            <input
              id="signin-password"
              v-model="signInForm.password"
              type="password"
              required
              placeholder="Введите пароль"
            />
          </div>

          <button type="submit" :disabled="loading" class="submit-btn">
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>
        </form>

        <!-- Форма регистрации -->
        <form v-if="mode === 'signup'" @submit.prevent="handleSignUp" class="auth-form">
          <div class="form-group">
            <label for="signup-email">Email:</label>
            <input
              id="signup-email"
              v-model="signUpForm.email"
              type="email"
              required
              placeholder="Введите email"
            />
          </div>

          <div class="form-group">
            <label for="signup-username">Имя пользователя:</label>
            <input
              id="signup-username"
              v-model="signUpForm.username"
              type="text"
              required
              placeholder="Введите имя пользователя"
            />
          </div>

          <div class="form-group">
            <label for="signup-fullname">Полное имя:</label>
            <input
              id="signup-fullname"
              v-model="signUpForm.fullName"
              type="text"
              required
              placeholder="Введите полное имя"
            />
          </div>
          
          <div class="form-group">
            <label for="signup-password">Пароль:</label>
            <input
              id="signup-password"
              v-model="signUpForm.password"
              type="password"
              required
              placeholder="Введите пароль"
            />
          </div>

          <button type="submit" :disabled="loading" class="submit-btn">
            {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
          </button>
        </form>

        <!-- Уведомления -->
        <div v-if="notification" class="notification" :class="notification.type">
          <span class="notification-icon">{{ notification.type === 'success' ? '✅' : '❌' }}</span>
          <span class="notification-message">{{ notification.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()

// Состояние компонента
const mode = ref<'signin' | 'signup'>('signin')
const notification = ref<{ type: 'success' | 'error', message: string } | null>(null)

// Формы
const signInForm = reactive({
  email: '',
  password: ''
})

const signUpForm = reactive({
  email: '',
  username: '',
  fullName: '',
  password: ''
})

// Вычисляемые свойства
const loading = computed(() => authStore.loading)

// Обработчики
const handleSignIn = async () => {
  const success = await authStore.signIn(signInForm.email, signInForm.password)
  
  if (success) {
    showNotification('success', 'Успешный вход!')
    setTimeout(() => {
      emit('success')
      closeModal()
    }, 1000)
  } else {
    showNotification('error', authStore.error || 'Ошибка входа')
  }
}

const handleSignUp = async () => {
  const success = await authStore.signUp(
    signUpForm.email, 
    signUpForm.password, 
    signUpForm.username, 
    signUpForm.fullName
  )
  
  if (success) {
    showNotification('success', 'Регистрация успешна! Теперь войдите в аккаунт.')
    setTimeout(() => {
      mode.value = 'signin' // Переключаемся на режим входа
      signInForm.email = signUpForm.email // Предзаполняем email
    }, 1500)
  } else {
    showNotification('error', authStore.error || 'Ошибка регистрации')
  }
}

const showNotification = (type: 'success' | 'error', message: string) => {
  notification.value = { type, message }
  setTimeout(() => {
    notification.value = null
  }, 5000)
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';

.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  font-family: 'Orbitron', sans-serif;
}

.auth-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border: 4px solid var(--color-text, #5D4037);
  border-radius: 20px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.auth-header {
  background: var(--gradient-accents, linear-gradient(135deg, #C85A54, #D4824A));
  color: white;
  padding: 20px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auth-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.auth-content {
  padding: 30px;
}

.auth-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--color-buttons, #D4824A);
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: none;
  color: var(--color-text, #5D4037);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-btn.active {
  color: var(--color-accents, #C85A54);
  border-bottom-color: var(--color-accents, #C85A54);
}

.tab-btn:hover {
  background: rgba(212, 130, 74, 0.1);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text, #5D4037);
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid var(--color-buttons, #D4824A);
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Orbitron', sans-serif;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-accents, #C85A54);
}

.submit-btn {
  background: var(--gradient-accents, linear-gradient(135deg, #C85A54, #D4824A));
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.notification {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.notification.success {
  background: #4CAF50;
  color: white;
}

.notification.error {
  background: #f44336;
  color: white;
}

.notification-icon {
  font-size: 16px;
}

.notification-message {
  font-size: 14px;
}
</style>
