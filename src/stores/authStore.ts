import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  money: number
  level: number
  experience: number
  created_at: string
}

export const useAuthStore = defineStore('auth', () => {
  // Состояние авторизации
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  // Регистрация нового пользователя
  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    try {
      loading.value = true
      error.value = null

      console.log('🚀 Начинаем регистрацию пользователя:', { email, username })

      // Создаем пользователя в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName
          }
        }
      })

      if (authError) {
        console.error('❌ Ошибка Supabase Auth:', authError)
        throw authError
      }

      if (authData.user) {
        console.log('✅ Пользователь создан в auth.users:', authData.user.id)
        console.log('📧 Email подтвержден:', authData.user.email_confirmed_at)
        
        // НЕ создаем профиль при регистрации!
        console.log('⏭️ Пропускаем создание профиля - будет создан при входе')
      }

      console.log('🎉 Регистрация завершена успешно')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка регистрации'
      console.error('❌ Sign up error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Вход пользователя
  const signIn = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        await loadUserProfile(data.user.id)
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка входа'
      console.error('Sign in error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Выход пользователя
  const signOut = async () => {
    try {
      loading.value = true
      error.value = null

      const { error: authError } = await supabase.auth.signOut()

      if (authError) {
        throw authError
      }

      user.value = null
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка выхода'
      console.error('Sign out error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Загрузка профиля пользователя
  const loadUserProfile = async (userId: string) => {
    try {
      console.log('📋 Загружаем профиль пользователя:', userId)
      
      // Сначала пытаемся загрузить существующий профиль
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Ошибка загрузки профиля:', fetchError)
        throw fetchError
      }

      // Если профиль не найден, создаем новый
      if (!data) {
        console.log('🆕 Профиль пользователя не найден, создаем новый...')
        
        // Получаем данные пользователя из auth
        const { data: authUser, error: authError } = await supabase.auth.getUser()
        if (authError || !authUser.user) {
          throw new Error('Не удалось получить данные пользователя')
        }

        console.log('👤 Данные пользователя из auth:', {
          email: authUser.user.email,
          username: authUser.user.user_metadata?.username,
          full_name: authUser.user.user_metadata?.full_name
        })

        // Создаем новый профиль
        const profileData = {
          id: userId,
          email: authUser.user.email || '',
          username: authUser.user.user_metadata?.username || `user_${userId.slice(0, 8)}`,
          full_name: authUser.user.user_metadata?.full_name || 'Пользователь',
          money: 5000, // Начальные деньги для стартового персонажа
          level: 1,
          experience: 0
        }

        console.log('💾 Создаем профиль с данными:', profileData)
        
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert(profileData)

        if (insertError) {
          console.error('❌ Ошибка создания профиля:', insertError)
          throw insertError
        }

        console.log('✅ Профиль создан успешно')

        // Загружаем созданный профиль
        const { data: newProfile, error: newFetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (newFetchError) {
          console.error('❌ Ошибка загрузки созданного профиля:', newFetchError)
          throw newFetchError
        }

        console.log('📥 Профиль загружен:', newProfile)
        user.value = newProfile
      } else {
        console.log('📥 Профиль найден:', data)
        // Гарантируем стартовый капитал для новых аккаунтов, если поле пустое/0
        if ((data as any).money == null || (data as any).money === 0) {
          const start = 5000
          const { error: fixError } = await supabase
            .from('user_profiles')
            .update({ money: start })
            .eq('id', userId)
          if (!fixError) {
            ;(data as any).money = start
          } else {
            console.warn('Не удалось выставить стартовый капитал:', fixError)
          }
        }
        user.value = data
      }
    } catch (err) {
      console.error('❌ Error loading user profile:', err)
      throw err
    }
  }

  // Инициализация авторизации (проверка текущего пользователя)
  const initAuth = async () => {
    try {
      loading.value = true
      console.log('🔄 Инициализация авторизации...')
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log('👤 Найден пользователь в сессии:', session.user.id)
        console.log('📧 Email подтвержден:', session.user.email_confirmed_at)
        
        // Разрешаем работу без подтверждения email
        console.log('✅ Загружаем профиль (подтверждение email не требуется)...')
        await loadUserProfile(session.user.id)
      } else {
        console.log('❌ Пользователь не найден в сессии')
      }
    } catch (err) {
      console.error('❌ Auth init error:', err)
    } finally {
      loading.value = false
    }
  }

  // Обновление денег пользователя
  const updateMoney = async (amount: number) => {
    if (!user.value) return false

    try {
      const newAmount = user.value.money + amount
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ money: newAmount })
        .eq('id', user.value.id)

      if (updateError) {
        throw updateError
      }

      user.value.money = newAmount
      return true
    } catch (err) {
      console.error('Error updating money:', err)
      return false
    }
  }

  // Списание денег
  const spendMoney = async (amount: number) => {
    if (!user.value || user.value.money < amount) return false

    return await updateMoney(-amount)
  }

  // Добавление денег
  const addMoney = async (amount: number) => {
    return await updateMoney(amount)
  }

  // Сброс прогресса компании (НЕ удаляет из лидерборда)
  const resetCompanyProgress = async () => {
    if (!user.value) {
      console.error('❌ Пользователь не авторизован')
      return false
    }

    try {
      loading.value = true
      error.value = null

      console.log('🔄 Сбрасываем прогресс компании для пользователя:', user.value.id)

      // Сбрасываем только игровой прогресс, оставляем базовые данные аккаунта
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          money: 5000, // Начальные деньги (как у нового персонажа)
          level: 1,    // Начальный уровень
          experience: 0, // Начальный опыт
          updated_at: new Date().toISOString()
        })
        .eq('id', user.value.id)

      if (updateError) {
        console.error('❌ Ошибка при сбросе прогресса:', updateError)
        throw updateError
      }

      // Очищаем данные склада в базе данных
      console.log('🗑️ Очищаем данные склада для пользователя:', user.value.id)
      
      const { error: warehouseError } = await supabase
        .from('user_warehouse_inventory')
        .delete()
        .eq('user_id', user.value.id)

      if (warehouseError) {
        console.warn('⚠️ Ошибка при очистке склада:', warehouseError)
      } else {
        console.log('✅ Данные склада очищены')
      }

      const { error: clothingError } = await supabase
        .from('user_clothing_inventory')
        .delete()
        .eq('user_id', user.value.id)

      if (clothingError) {
        console.warn('⚠️ Ошибка при очистке одежды:', clothingError)
      } else {
        console.log('✅ Данные одежды очищены')
      }

      // Очищаем транзакции склада
      const { error: transactionsError } = await supabase
        .from('warehouse_transactions')
        .delete()
        .eq('user_id', user.value.id)

      if (transactionsError) {
        console.warn('⚠️ Ошибка при очистке транзакций:', transactionsError)
      } else {
        console.log('✅ Транзакции склада очищены')
      }

      // Обновляем локальное состояние
      user.value.money = 5000
      user.value.level = 1
      user.value.experience = 0
      
      console.log('✅ Локальное состояние обновлено:', {
        money: user.value.money,
        level: user.value.level,
        experience: user.value.experience
      })

      // Очищаем локальные данные игры
      console.log('🗑️ Очищаем localStorage...')
      localStorage.removeItem(`home_pantry_${user.value.id}`)
      localStorage.removeItem('social_posts')
      localStorage.removeItem('social_responses')
      localStorage.removeItem('social_demo_queue')
      localStorage.removeItem('social_visible_orders')
      localStorage.removeItem('social_taken_orders')
      localStorage.removeItem('warehouse_materials')
      localStorage.removeItem('warehouse_clothing')
      localStorage.removeItem('warehouse_stats')
      localStorage.removeItem('warehouse_transactions')
      localStorage.removeItem(`company_state_${user.value.id}`)
      localStorage.removeItem(`character_state_${user.value.id}`)
      
      // Очищаем все ключи, связанные с пользователем
      Object.keys(localStorage).forEach(key => {
        if (key.includes(user.value.id)) {
          localStorage.removeItem(key)
        }
      })
      
      // Очищаем кэш в window объекте
      if ((window as any).__warehouseMaterialsCatalog) {
        delete (window as any).__warehouseMaterialsCatalog
        console.log('✅ Кэш материалов очищен из window')
      }
      
      // Очищаем все возможные кэши
      Object.keys(window).forEach(key => {
        if (key.includes('warehouse') || key.includes('material') || key.includes('clothing')) {
          delete (window as any)[key]
        }
      })
      
      console.log('✅ localStorage и кэш очищены')

      // Сбрасываем состояние всех stores
      // Импортируем stores для сброса их состояния
      const { useCompanyStore } = await import('@/stores/companyStore')
      const { useWarehouseStore } = await import('@/stores/warehouseStore')
      const { usePantryStore } = await import('@/stores/pantryStore')
      const { useSocialStore } = await import('@/stores/socialStore')

      // Сбрасываем состояние stores
      const companyStore = useCompanyStore()
      const warehouseStore = useWarehouseStore()
      const pantryStore = usePantryStore()
      const socialStore = useSocialStore()

      // Сбрасываем состояния
      if (companyStore.resetState) companyStore.resetState()
      if (warehouseStore.resetWarehouse) warehouseStore.resetWarehouse()
      if (pantryStore.resetState) pantryStore.resetState()
      if (socialStore.resetState) socialStore.resetState()

      // Принудительно обновляем данные склада из базы (должно быть пусто)
      if (warehouseStore.fetchMaterials) {
        await warehouseStore.fetchMaterials()
        console.log('✅ Данные материалов склада обновлены после сброса:', warehouseStore.materials)
      }
      if (warehouseStore.fetchClothing) {
        await warehouseStore.fetchClothing()
        console.log('✅ Данные одежды склада обновлены после сброса:', warehouseStore.clothing)
      }

      // Принудительно обновляем все данные из базы
      await loadUserProfile(user.value.id)
      
      console.log('✅ Данные из базы перезагружены:', {
        money: user.value?.money,
        level: user.value?.level,
        experience: user.value?.experience
      })

      console.log('✅ Прогресс компании успешно сброшен')
      return true

    } catch (err) {
      console.error('❌ Ошибка при сбросе прогресса компании:', err)
      error.value = 'Ошибка при сбросе прогресса'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // Состояние
    user,
    loading,
    error,
    isAuthenticated,
    
    // Действия
    signUp,
    signIn,
    signOut,
    initAuth,
    updateMoney,
    spendMoney,
    addMoney,
    resetCompanyProgress
  }
})
