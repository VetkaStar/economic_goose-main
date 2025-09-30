import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useTimeStore = defineStore('time', () => {
  const STORAGE_KEY = 'eg_time_state_v1'
  // Игровое время
  const gameTime = ref({
    day: 1,
    hour: 9, // 9:00 утра - начало рабочего дня
    minute: 0,
    isPaused: false
  })

  // Настройки времени
  const timeSettings = ref({
    realTimeToGameTime: 5, // 5 реальных минут = 1 игровой день
    dayDuration: 24, // 24 часа в игровом дне
    workStartHour: 9, // Начало рабочего дня
    workEndHour: 18 // Конец рабочего дня
  })

  // Состояние ускорения времени (1x или 2x)
  const timeAcceleration = ref(1)
  const isFastForward = computed(() => timeAcceleration.value > 1)

  // Вычисляемые свойства
  const currentTime = computed(() => {
    const { day, hour, minute } = gameTime.value
    return {
      day,
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      isWorkTime: hour >= timeSettings.value.workStartHour && hour < timeSettings.value.workEndHour,
      isNight: hour < 6 || hour >= 22
    }
  })

  const gameDate = computed(() => {
    const { day } = gameTime.value
    return `День ${day}`
  })

  const timeProgress = computed(() => {
    const { hour, minute } = gameTime.value
    return (hour * 60 + minute) / (timeSettings.value.dayDuration * 60) * 100
  })

  // Методы управления временем
  const addTime = (minutes: number) => {
    const { hour, minute } = gameTime.value
    let newMinute = minute + minutes
    let newHour = hour
    let newDay = gameTime.value.day

    // Обработка переполнения минут
    while (newMinute >= 60) {
      newMinute -= 60
      newHour += 1
    }

    // Обработка переполнения часов
    while (newHour >= timeSettings.value.dayDuration) {
      newHour -= timeSettings.value.dayDuration
      newDay += 1
    }

    gameTime.value = {
      ...gameTime.value,
      day: newDay,
      hour: newHour,
      minute: newMinute
    }
  }

  const nextDay = () => {
    gameTime.value = {
      ...gameTime.value,
      day: gameTime.value.day + 1,
      hour: timeSettings.value.workStartHour,
      minute: 0
    }
  }

  const toggleAccelerationX2 = () => {
    timeAcceleration.value = timeAcceleration.value === 1 ? 2 : 1
  }

  const pauseTime = () => {
    gameTime.value.isPaused = !gameTime.value.isPaused
  }

  const resetTime = () => {
    gameTime.value = {
      day: 1,
      hour: 9,
      minute: 0,
      isPaused: false
    }
    timeAcceleration.value = 1
  }

  // Автоматическое продвижение времени (если не на паузе)
  const tick = () => {
    if (gameTime.value.isPaused) return

    // Добавляем время в зависимости от ускорения
    // Каждую секунду добавляем 1 минуту * ускорение
    const timeStep = timeAcceleration.value
    console.log('⏰ TimeStore tick:', { timeStep, currentTime: gameTime.value })
    addTime(timeStep)
    
    // Проверяем ежемесячные события
    checkMonthlyEvents()
  }

  // Проверка на начало нового месяца (каждые 30 дней)
  const checkMonthlyEvents = () => {
    const { day } = gameTime.value
    if (day % 30 === 0) {
      // Импортируем банк store только когда нужно
      import('./bankStore').then(({ useBankStore }) => {
        const bankStore = useBankStore()
        bankStore.processMonthlyPayments()
        console.log('🏦 Обработаны ежемесячные банковские платежи')
      })
    }
  }

  // Форматирование времени для отображения
  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  const formatDate = (day: number) => {
    return `День ${day}`
  }

  const getTimeOfDay = () => {
    const { hour } = gameTime.value
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 22) return 'evening'
    return 'night'
  }

  const getSeason = () => {
    const { day } = gameTime.value
    const seasonLength = 30 // 30 дней в сезоне
    const seasonIndex = Math.floor((day - 1) / seasonLength) % 4
    const seasons = ['spring', 'summer', 'autumn', 'winter']
    return seasons[seasonIndex]
  }

  const getWeather = () => {
    const season = getSeason()
    // const timeOfDay = getTimeOfDay() // Пока не используется
    
    // Простая система погоды на основе сезона и времени
    const weatherChances = {
      spring: { sunny: 0.4, cloudy: 0.3, rainy: 0.3 },
      summer: { sunny: 0.6, cloudy: 0.2, rainy: 0.2 },
      autumn: { sunny: 0.3, cloudy: 0.4, rainy: 0.3 },
      winter: { sunny: 0.2, cloudy: 0.3, snowy: 0.5 }
    }

    const chances = weatherChances[season as keyof typeof weatherChances]
    const random = Math.random()
    
    if (random < chances.sunny) return 'sunny'
    if (random < chances.sunny + chances.cloudy) return 'cloudy'
    if ('rainy' in chances && chances.rainy && random < chances.sunny + chances.cloudy + chances.rainy) return 'rainy'
    if ('snowy' in chances && chances.snowy && random < chances.sunny + chances.cloudy + ('rainy' in chances ? (chances as any).rainy : 0) + chances.snowy) return 'snowy'
    
    return 'sunny'
  }

  // Persistence
  const saveState = () => {
    try {
      const payload = {
        gameTime: gameTime.value,
        timeAcceleration: timeAcceleration.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {}
  }

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.gameTime) {
        gameTime.value = {
          day: Number(parsed.gameTime.day) || 1,
          hour: Number(parsed.gameTime.hour) || 9,
          minute: Number(parsed.gameTime.minute) || 0,
          isPaused: Boolean(parsed.gameTime.isPaused)
        }
      }
      if (parsed?.timeAcceleration) {
        const acc = Number(parsed.timeAcceleration)
        timeAcceleration.value = acc === 2 ? 2 : 1
      }
    } catch {}
  }

  loadState()
  watch([gameTime, timeAcceleration], saveState, { deep: true })

  return {
    // Состояние
    gameTime,
    timeSettings,
    timeAcceleration,
    isFastForward,
    
    // Вычисляемые свойства
    currentTime,
    gameDate,
    timeProgress,
    
    // Методы
    addTime,
    nextDay,
    toggleAccelerationX2,
    pauseTime,
    resetTime,
    tick,
    formatTime,
    formatDate,
    getTimeOfDay,
    getSeason,
    getWeather
  }
})
