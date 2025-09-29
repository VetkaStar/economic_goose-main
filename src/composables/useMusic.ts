import { ref, reactive } from 'vue'

export interface MusicTrack {
  id: string
  name: string
  path: string
  duration: number
}

export function useMusic() {
  // Состояние музыкальной системы
  const isPlaying = ref(false)
  const currentTrackIndex = ref(0)
  const currentTrack = ref<MusicTrack | null>(null)
  const volume = ref(1.0) // 0.0 - 1.0
  const musicVolume = ref(0.6) // 0.0 - 1.0
  const environmentVolume = ref(0.4) // 0.0 - 1.0
  const isWaitingForInteraction = ref(true) // Ожидание взаимодействия пользователя
  const hasUserInteracted = ref(false) // Флаг взаимодействия пользователя
  const isInitialized = ref(false) // Флаг инициализации
  
  // Список треков
  const tracks = ref<MusicTrack[]>([
    {
      id: 'track1',
      name: 'Фоновая мелодия 1',
      path: '/music/1 (1).mp3',
      duration: 0
    },
    {
      id: 'track2', 
      name: 'Фоновая мелодия 2',
      path: '/music/1 (2).mp3',
      duration: 0
    },
    {
      id: 'track3',
      name: 'Фоновая мелодия 3', 
      path: '/music/1 (3).mp3',
      duration: 0
    }
  ])

  // Создаем аудио элемент
  const audio = new Audio()
  let fadeTimeout: NodeJS.Timeout | null = null
  let fadeInterval: NodeJS.Timeout | null = null

  // Настройка аудио элемента
  audio.preload = 'auto'
  audio.loop = false
  
  // Обработчик окончания трека
  audio.addEventListener('ended', () => {
    console.log('🎵 Трек завершен, переходим к следующему')
    nextTrack()
  })

  // Обработчик загрузки метаданных
  audio.addEventListener('loadedmetadata', () => {
    if (currentTrack.value) {
      currentTrack.value.duration = audio.duration
      console.log(`🎵 Загружены метаданные трека: ${currentTrack.value.name}, длительность: ${audio.duration}с`)
    }
  })

  // Обработчик ошибок
  audio.addEventListener('error', (e) => {
    console.error('❌ Ошибка аудио:', e)
    console.error('❌ Код ошибки:', audio.error?.code)
    console.error('❌ Сообщение ошибки:', audio.error?.message)
  })

  // Обработчик паузы (для отладки)
  audio.addEventListener('pause', () => {
    console.log('⏸️ Аудио приостановлено')
  })

  // Обработчик воспроизведения (для отладки)
  audio.addEventListener('play', () => {
    console.log('▶️ Аудио воспроизводится')
  })

  // Функция затухания
  const fadeOut = (duration: number = 2000): Promise<void> => {
    return new Promise((resolve) => {
      const startVolume = audio.volume
      const steps = 20
      const stepDuration = duration / steps
      const volumeStep = startVolume / steps
      
      let currentStep = 0
      
      fadeInterval = setInterval(() => {
        currentStep++
        audio.volume = Math.max(0, startVolume - (volumeStep * currentStep))
        
        if (currentStep >= steps || audio.volume <= 0) {
          audio.volume = 0
          clearInterval(fadeInterval!)
          fadeInterval = null
          resolve()
        }
      }, stepDuration)
    })
  }

  // Функция появления звука
  const fadeIn = (duration: number = 3000): Promise<void> => {
    return new Promise((resolve) => {
      const targetVolume = volume.value * musicVolume.value
      const steps = 30 // Увеличиваем количество шагов для более плавного перехода
      const stepDuration = duration / steps
      
      // Начинаем с очень тихой громкости
      audio.volume = 0.01
      let currentStep = 0
      
      fadeInterval = setInterval(() => {
        currentStep++
        // Используем экспоненциальную кривую для более естественного fade-in
        const progress = currentStep / steps
        const easedProgress = 1 - Math.pow(1 - progress, 3) // easeOutCubic
        audio.volume = Math.min(targetVolume, targetVolume * easedProgress)
        
        if (currentStep >= steps || audio.volume >= targetVolume) {
          audio.volume = targetVolume
          clearInterval(fadeInterval!)
          fadeInterval = null
          resolve()
        }
      }, stepDuration)
    })
  }

  // Загрузка и воспроизведение трека
  const loadTrack = async (trackIndex: number): Promise<void> => {
    if (trackIndex < 0 || trackIndex >= tracks.value.length) {
      console.error('Неверный индекс трека:', trackIndex)
      return
    }

    const track = tracks.value[trackIndex]
    currentTrackIndex.value = trackIndex
    currentTrack.value = track

    try {
      // Проверяем состояние аудио перед загрузкой
      console.log('🎵 Загружаем трек:', track.name)
      console.log('🎵 Текущее состояние аудио:', {
        paused: audio.paused,
        ended: audio.ended,
        readyState: audio.readyState,
        error: audio.error
      })

      audio.src = track.path
      await audio.load()
      
      // Устанавливаем громкость после загрузки
      audio.volume = volume.value * musicVolume.value
      
      console.log('✅ Трек загружен:', track.name)
    } catch (error) {
      console.error('❌ Ошибка загрузки трека:', error)
    }
  }

  // Переход к следующему треку
  const nextTrack = async (): Promise<void> => {
    if (!isPlaying.value) return

    // Затухание текущего трека
    await fadeOut(2000)
    
    // Переход к следующему треку
    const nextIndex = (currentTrackIndex.value + 1) % tracks.value.length
    await loadTrack(nextIndex)
    
    // Воспроизведение с появлением
    if (isPlaying.value) {
      audio.play()
      await fadeIn(3000) // Увеличиваем время fade-in
    }
  }

  // Переход к предыдущему треку
  const previousTrack = async (): Promise<void> => {
    if (!isPlaying.value) return

    await fadeOut(2000)
    
    const prevIndex = currentTrackIndex.value === 0 
      ? tracks.value.length - 1 
      : currentTrackIndex.value - 1
    
    await loadTrack(prevIndex)
    
    if (isPlaying.value) {
      audio.play()
      await fadeIn(3000) // Увеличиваем время fade-in
    }
  }

  // Проверка и восстановление воспроизведения
  const checkAndRestorePlayback = async (): Promise<void> => {
    if (isPlaying.value && (audio.paused || audio.ended)) {
      console.log('🔧 Восстанавливаем воспроизведение...')
      try {
        await audio.play()
        console.log('✅ Воспроизведение восстановлено')
      } catch (error) {
        console.error('❌ Не удалось восстановить воспроизведение:', error)
      }
    }
  }

  // Инициализация музыки после взаимодействия пользователя
  const initializeAfterInteraction = async (): Promise<void> => {
    if (hasUserInteracted.value) {
      console.log('👆 Пользователь уже взаимодействовал с приложением')
      return
    }
    
    hasUserInteracted.value = true
    isWaitingForInteraction.value = false
    console.log('👆 Пользователь взаимодействовал с приложением, запускаем музыку')
    
    await play()
  }

  // Воспроизведение
  const play = async (): Promise<void> => {
    if (isPlaying.value || isInitialized.value) {
      console.log('🎵 Музыка уже запущена или инициализирована')
      return
    }

    isInitialized.value = true
    isPlaying.value = true
    
    if (!currentTrack.value) {
      await loadTrack(0)
    }
    
    try {
      await audio.play()
      await fadeIn(3000) // Увеличиваем время fade-in для более плавного появления
      console.log('▶️ Музыка запущена')
      
      // Запускаем периодическую проверку состояния
      const checkInterval = setInterval(() => {
        if (!isPlaying.value) {
          clearInterval(checkInterval)
          return
        }
        checkAndRestorePlayback()
      }, 5000) // Проверяем каждые 5 секунд
      
    } catch (error) {
      console.error('❌ Ошибка воспроизведения:', error)
      
      // Если ошибка связана с политикой браузера, ждем взаимодействия
      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.log('🚫 Автовоспроизведение заблокировано, ждем взаимодействия пользователя')
        isWaitingForInteraction.value = true
        isPlaying.value = false
        isInitialized.value = false // Сбрасываем флаг для повторной попытки
      } else {
        isPlaying.value = false
        isInitialized.value = false
      }
    }
  }

  // Пауза
  const pause = async (): Promise<void> => {
    if (!isPlaying.value) return

    await fadeOut(1000)
    audio.pause()
    isPlaying.value = false
    console.log('⏸️ Музыка приостановлена')
  }

  // Остановка
  const stop = (): void => {
    if (fadeInterval) {
      clearInterval(fadeInterval)
      fadeInterval = null
    }
    
    audio.pause()
    audio.currentTime = 0
    isPlaying.value = false
    console.log('⏹️ Музыка остановлена')
  }

  // Обновление общей громкости
  const updateVolume = (newVolume: number): void => {
    volume.value = Math.max(0, Math.min(1, newVolume))
    const finalVolume = volume.value * musicVolume.value
    
    // Всегда обновляем громкость аудио элемента, независимо от состояния воспроизведения
    audio.volume = finalVolume
    
    console.log(`🔊 Общая громкость: ${Math.round(volume.value * 100)}% → Финальная громкость: ${Math.round(finalVolume * 100)}%`)
    console.log(`🎵 Текущая громкость аудио: ${Math.round(audio.volume * 100)}%`)
  }

  // Обновление громкости музыки
  const updateMusicVolume = (newVolume: number): void => {
    musicVolume.value = Math.max(0, Math.min(1, newVolume))
    const finalVolume = volume.value * musicVolume.value
    
    // Всегда обновляем громкость аудио элемента, независимо от состояния воспроизведения
    audio.volume = finalVolume
    
    console.log(`🎵 Громкость музыки: ${Math.round(musicVolume.value * 100)}% → Финальная громкость: ${Math.round(finalVolume * 100)}%`)
    console.log(`🎵 Текущая громкость аудио: ${Math.round(audio.volume * 100)}%`)
  }

  // Обновление громкости окружения (пока не используется)
  const updateEnvironmentVolume = (newVolume: number): void => {
    environmentVolume.value = Math.max(0, Math.min(1, newVolume))
    console.log(`🌍 Громкость окружения: ${Math.round(environmentVolume.value * 100)}%`)
  }

  // Добавление нового трека
  const addTrack = (track: Omit<MusicTrack, 'duration'>): void => {
    tracks.value.push({
      ...track,
      duration: 0
    })
    console.log('🎵 Добавлен новый трек:', track.name)
  }

  // Удаление трека
  const removeTrack = (trackId: string): void => {
    const index = tracks.value.findIndex(track => track.id === trackId)
    if (index !== -1) {
      tracks.value.splice(index, 1)
      if (currentTrackIndex.value >= tracks.value.length) {
        currentTrackIndex.value = 0
      }
      console.log('🗑️ Трек удален:', trackId)
    }
  }

  // Очистка при размонтировании
  const cleanup = (): void => {
    stop()
    if (fadeTimeout) {
      clearTimeout(fadeTimeout)
    }
    audio.removeEventListener('ended', nextTrack)
    audio.removeEventListener('loadedmetadata', () => {})
  }

  return {
    // Состояние
    isPlaying,
    currentTrackIndex,
    currentTrack,
    volume,
    musicVolume,
    environmentVolume,
    tracks,
    isWaitingForInteraction,
    hasUserInteracted,
    isInitialized,
    
    // Методы
    play,
    pause,
    stop,
    nextTrack,
    previousTrack,
    loadTrack,
    checkAndRestorePlayback,
    initializeAfterInteraction,
    updateVolume,
    updateMusicVolume,
    updateEnvironmentVolume,
    addTrack,
    removeTrack,
    cleanup
  }
}
