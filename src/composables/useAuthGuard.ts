import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

export type AuthAction = 'company' | 'minigames' | 'game-start'

export function useAuthGuard() {
  const authStore = useAuthStore()
  const showAuthModal = ref(false)
  const pendingAction = ref<AuthAction | null>(null)
  const pendingCallback = ref<(() => void) | null>(null)

  /**
   * Проверяет авторизацию перед выполнением действия
   * @param action - тип действия, требующего авторизации
   * @param callback - функция для выполнения после успешной авторизации
   * @returns true если пользователь авторизован, false если нужно показать авторизацию
   */
  const requireAuth = (action: AuthAction, callback?: () => void): boolean => {
    if (authStore.isAuthenticated) {
      return true
    }

    // Сохраняем отложенное действие
    pendingAction.value = action
    pendingCallback.value = callback || null
    showAuthModal.value = true
    
    return false
  }

  /**
   * Выполняет действие после успешной авторизации
   */
  const onAuthSuccess = () => {
    showAuthModal.value = false
    
    // Выполняем отложенный callback если есть
    if (pendingCallback.value) {
      pendingCallback.value()
      pendingCallback.value = null
    }
    
    pendingAction.value = null
  }

  /**
   * Закрывает модальное окно авторизации и сбрасывает состояние
   */
  const closeAuthModal = () => {
    showAuthModal.value = false
    pendingAction.value = null
    pendingCallback.value = null
  }

  /**
   * Получает описание действия для пользователя
   */
  const getActionDescription = (action: AuthAction): string => {
    switch (action) {
      case 'company':
        return 'Для игры в компании'
      case 'minigames':
        return 'Для доступа к мини-играм'
      case 'game-start':
        return 'Для начала игры'
      default:
        return 'Для продолжения'
    }
  }

  return {
    // Состояние
    showAuthModal,
    pendingAction,
    
    // Методы
    requireAuth,
    onAuthSuccess,
    closeAuthModal,
    getActionDescription
  }
}
