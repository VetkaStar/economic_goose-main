import { ref } from 'vue'

export interface MusicTrack {
  id: string
  name: string
  path: string
  duration: number
}

// Глобальная музыкальная система (синглтон)
let globalAudio: Audio | null = null
let globalIsPlaying = false
let globalCurrentTrack: MusicTrack | null = null

export function useMusic() {
  // Состояние музыкальной системы
  const isPlaying = ref(false)
  const currentTrackIndex = ref(0)
  const currentTrack = ref<MusicTrack | null>(null)
  const volume = ref(0.36) // 0.0 - 1.0 (36% по умолчанию)
  const musicVolume = ref(0.6) // 0.0 - 1.0 (60% по умолчанию)
  const environmentVolume = ref(0.4) // 0.0 - 1.0 (40% по умолчанию)
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

  // Создаем или используем глобальный аудио элемент
  if (!globalAudio) {
    globalAudio = new Audio()
    console.log('🎵 Создан глобальный аудио элемент')
  }
  const audio = globalAudio
  let fadeTimeout: NodeJS.Timeout | null = null
  let fadeInterval: NodeJS.Timeout | null = null

  // Синхронизируем состояние с глобальным
  isPlaying.value = globalIsPlaying
  currentTrack.value = globalCurrentTrack

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
    console.log('🔊 Громкость аудио при воспроизведении:', audio.volume)
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
      
      console.log(`🎵 FadeIn: Целевая громкость ${Math.round(targetVolume * 100)}%`)
      
      // Начинаем с текущей громкости или очень тихой
      const startVolume = Math.min(0.01, targetVolume)
      audio.volume = startVolume
      let currentStep = 0
      
      fadeInterval = setInterval(() => {
        currentStep++
        // Используем экспоненциальную кривую для более естественного fade-in
        const progress = currentStep / steps
        const easedProgress = 1 - Math.pow(1 - progress, 3) // easeOutCubic
        audio.volume = startVolume + (targetVolume - startVolume) * easedProgress
        
        if (currentStep >= steps || audio.volume >= targetVolume) {
          audio.volume = targetVolume
          clearInterval(fadeInterval!)
          fadeInterval = null
          console.log(`🎵 FadeIn завершён: ${Math.round(audio.volume * 100)}%`)
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
    globalCurrentTrack = track

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
      const finalVolume = volume.value * musicVolume.value
      audio.volume = finalVolume
      console.log(`🎵 Громкость после загрузки трека: ${Math.round(finalVolume * 100)}%`)
      
      console.log('✅ Трек загружен:', track.name)
    } catch (error) {
      console.error('❌ Ошибка загрузки трека:', error)
    }
  }

  // Переход к следующему треку
  const nextTrack = async (): Promise<void> => {
    if (!isPlaying.value) return

    console.log('🎵 Переходим к следующему треку...')
    
    // Затухание текущего трека
    await fadeOut(2000)
    
    // Переход к следующему треку
    const nextIndex = (currentTrackIndex.value + 1) % tracks.value.length
    await loadTrack(nextIndex)
    
    // Устанавливаем правильную громкость перед воспроизведением
    const finalVolume = volume.value * musicVolume.value
    audio.volume = finalVolume
    console.log(`🎵 Устанавливаем громкость для нового трека: ${Math.round(finalVolume * 100)}%`)
    
    // Воспроизведение без fade-in (чтобы сохранить громкость)
    if (isPlaying.value) {
      await audio.play()
      console.log('▶️ Следующий трек запущен')
    }
  }

  // Переход к предыдущему треку
  const previousTrack = async (): Promise<void> => {
    if (!isPlaying.value) return

    console.log('🎵 Переходим к предыдущему треку...')
    
    await fadeOut(2000)
    
    const prevIndex = currentTrackIndex.value === 0 
      ? tracks.value.length - 1 
      : currentTrackIndex.value - 1
    
    await loadTrack(prevIndex)
    
    // Устанавливаем правильную громкость перед воспроизведением
    const finalVolume = volume.value * musicVolume.value
    audio.volume = finalVolume
    console.log(`🎵 Устанавливаем громкость для предыдущего трека: ${Math.round(finalVolume * 100)}%`)
    
    // Воспроизведение без fade-in (чтобы сохранить громкость)
    if (isPlaying.value) {
      await audio.play()
      console.log('▶️ Предыдущий трек запущен')
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

  // Загрузка настроек из localStorage
  const loadSettings = (): void => {
    try {
      const savedSettings = localStorage.getItem('fashion_goose_settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        console.log('🎵 Загружаем настройки из localStorage:', settings)
        
        if (settings.masterVolume !== undefined && settings.masterVolume !== null) {
          volume.value = settings.masterVolume / 100
          console.log('🔊 Загружена общая громкость:', settings.masterVolume + '%')
        }
        if (settings.musicVolume !== undefined && settings.musicVolume !== null) {
          musicVolume.value = settings.musicVolume / 100
          console.log('🎵 Загружена громкость музыки:', settings.musicVolume + '%')
        }
        if (settings.ambientVolume !== undefined && settings.ambientVolume !== null) {
          environmentVolume.value = settings.ambientVolume / 100
          console.log('🌍 Загружена громкость окружения:', settings.ambientVolume + '%')
        }
        
        // Обновляем громкость аудио элемента
        const finalVolume = volume.value * musicVolume.value
        audio.volume = finalVolume
        
        console.log('🎵 Настройки громкости загружены из localStorage:', {
          master: Math.round(volume.value * 100) + '%',
          music: Math.round(musicVolume.value * 100) + '%',
          ambient: Math.round(environmentVolume.value * 100) + '%',
          final: Math.round(finalVolume * 100) + '%'
        })
      } else {
        console.log('🎵 Нет сохранённых настроек, используем значения по умолчанию')
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки настроек громкости:', error)
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
    
    // Загружаем настройки перед запуском
    loadSettings()
    
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
    globalIsPlaying = true
    
    if (!currentTrack.value) {
      await loadTrack(0)
    }
    
    try {
      // Устанавливаем громкость перед воспроизведением
      const finalVolume = volume.value * musicVolume.value
      audio.volume = finalVolume
      console.log(`🎵 Устанавливаем громкость перед воспроизведением: ${Math.round(finalVolume * 100)}%`)
      
      await audio.play()
      
      // Принудительно проверяем, что музыка действительно играет
      setTimeout(() => {
        if (audio.paused) {
          console.log('⚠️ Аудио на паузе после запуска, пытаемся снова...')
          audio.play().catch(err => console.error('❌ Повторная попытка запуска:', err))
        }
        console.log(`🎵 Проверка после запуска: paused=${audio.paused}, volume=${Math.round(audio.volume * 100)}%`)
      }, 200)
      
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
    globalIsPlaying = false
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
    globalIsPlaying = false
    console.log('⏹️ Музыка остановлена')
  }

  // Обновление общей громкости
  const updateVolume = async (newVolume: number): Promise<void> => {
    volume.value = Math.max(0, Math.min(1, newVolume))
    const finalVolume = volume.value * musicVolume.value
    
    console.log(`🔊 Общая громкость: ${Math.round(volume.value * 100)}% → Финальная громкость: ${Math.round(finalVolume * 100)}%`)
    console.log(`🎵 Детали расчёта: volume=${volume.value}, musicVolume=${musicVolume.value}, final=${finalVolume}`)
    console.log(`🎵 Аудио элемент: paused=${audio.paused}, ended=${audio.ended}, readyState=${audio.readyState}`)
    
    // Если аудио не загружено, перезагружаем
    if (audio.readyState === 0 || !audio.src) {
      console.log('🔊 Аудио не загружено, перезагружаем...')
      if (currentTrack.value) {
        await loadTrack(currentTrackIndex.value)
      } else {
        await loadTrack(0)
      }
    }
    
    // Устанавливаем громкость
    audio.volume = finalVolume
    
    // Если музыка должна играть, принудительно возобновляем воспроизведение
    if (isPlaying.value) {
      if (audio.paused) {
        console.log('🔊 Возобновляем воспроизведение...')
        try {
          await audio.play()
          console.log('✅ Воспроизведение возобновлено')
          // Принудительно обновляем громкость после возобновления
          audio.volume = finalVolume
        } catch (error) {
          console.error('❌ Ошибка возобновления воспроизведения:', error)
        }
      } else {
        // Если музыка уже играет, принудительно обновляем громкость
        console.log('🔊 Музыка играет, обновляем громкость...')
        audio.volume = finalVolume
      }
    }
    
    console.log(`🎵 Текущая громкость аудио: ${Math.round(audio.volume * 100)}%`)
    
    // Принудительно проверяем, что громкость применилась
    setTimeout(() => {
      console.log(`🔊 Проверка громкости через 100мс: ${Math.round(audio.volume * 100)}%`)
    }, 100)
  }

  // Обновление громкости музыки
  const updateMusicVolume = async (newVolume: number): Promise<void> => {
    musicVolume.value = Math.max(0, Math.min(1, newVolume))
    const finalVolume = volume.value * musicVolume.value
    
    console.log(`🎵 Громкость музыки: ${Math.round(musicVolume.value * 100)}% → Финальная громкость: ${Math.round(finalVolume * 100)}%`)
    console.log(`🎵 Детали расчёта: volume=${volume.value}, musicVolume=${musicVolume.value}, final=${finalVolume}`)
    console.log(`🎵 Аудио элемент: paused=${audio.paused}, ended=${audio.ended}, readyState=${audio.readyState}`)
    
    // Если аудио не загружено, перезагружаем
    if (audio.readyState === 0 || !audio.src) {
      console.log('🎵 Аудио не загружено, перезагружаем...')
      if (currentTrack.value) {
        await loadTrack(currentTrackIndex.value)
      } else {
        await loadTrack(0)
      }
    }
    
    // Устанавливаем громкость
    audio.volume = finalVolume
    
    // Если музыка должна играть, принудительно возобновляем воспроизведение
    if (isPlaying.value) {
      if (audio.paused) {
        console.log('🎵 Возобновляем воспроизведение...')
        try {
          await audio.play()
          console.log('✅ Воспроизведение возобновлено')
          // Принудительно обновляем громкость после возобновления
          audio.volume = finalVolume
        } catch (error) {
          console.error('❌ Ошибка возобновления воспроизведения:', error)
        }
      } else {
        // Если музыка уже играет, принудительно обновляем громкость
        console.log('🎵 Музыка играет, обновляем громкость...')
        audio.volume = finalVolume
      }
    }
    
    console.log(`🎵 Текущая громкость аудио: ${Math.round(audio.volume * 100)}%`)
    
    // Принудительно проверяем, что громкость применилась
    setTimeout(() => {
      console.log(`🎵 Проверка громкости через 100мс: ${Math.round(audio.volume * 100)}%`)
    }, 100)
  }

  // Обновление громкости окружения (пока не используется)
  const updateEnvironmentVolume = (newVolume: number): void => {
    environmentVolume.value = Math.max(0, Math.min(1, newVolume))
    console.log(`🌍 Громкость окружения: ${Math.round(environmentVolume.value * 100)}%`)
  }

  // Принудительное обновление громкости (для отладки)
  const forceUpdateVolume = async (): Promise<void> => {
    const finalVolume = volume.value * musicVolume.value
    
    console.log(`🔧 Принудительное обновление громкости: ${Math.round(finalVolume * 100)}%`)
    console.log(`🔧 Аудио элемент существует: ${audio !== null}`)
    console.log(`🔧 Аудио элемент готов: ${audio.readyState}`)
    console.log(`🔧 Текущая громкость: ${audio.volume}`)
    console.log(`🔧 Состояние аудио: paused=${audio.paused}, ended=${audio.ended}, currentTime=${audio.currentTime}`)
    console.log(`🔧 Источник аудио: ${audio.src}`)
    
    // Если аудио не загружено или нет источника, перезагружаем
    if (audio.readyState === 0 || !audio.src) {
      console.log('🔧 Аудио не загружено, перезагружаем...')
      if (currentTrack.value) {
        await loadTrack(currentTrackIndex.value)
      } else {
        await loadTrack(0)
      }
    }
    
    // Устанавливаем громкость
    audio.volume = finalVolume
    
    // Если музыка должна играть, принудительно возобновляем воспроизведение
    if (isPlaying.value) {
      if (audio.paused) {
        console.log('🔧 Возобновляем воспроизведение...')
        try {
          await audio.play()
          console.log('✅ Воспроизведение возобновлено')
          // Принудительно обновляем громкость после возобновления
          audio.volume = finalVolume
        } catch (error) {
          console.error('❌ Ошибка возобновления воспроизведения:', error)
        }
      } else {
        // Если музыка уже играет, принудительно обновляем громкость
        console.log('🔧 Музыка играет, обновляем громкость...')
        audio.volume = finalVolume
      }
    }
    
    console.log(`🔧 Громкость установлена: ${Math.round(audio.volume * 100)}%`)
  }

  // Проверка состояния аудио (для отладки)
  const checkAudioState = (): void => {
    console.log('🔍 Состояние аудио элемента:')
    console.log(`  - Громкость: ${audio.volume} (${Math.round(audio.volume * 100)}%)`)
    console.log(`  - Пауза: ${audio.paused}`)
    console.log(`  - Завершено: ${audio.ended}`)
    console.log(`  - Готовность: ${audio.readyState}`)
    console.log(`  - Текущее время: ${audio.currentTime}`)
    console.log(`  - Длительность: ${audio.duration}`)
    console.log(`  - Источник: ${audio.src}`)
    console.log(`  - Ошибка: ${audio.error ? audio.error.message : 'Нет'}`)
    console.log(`  - Наши настройки: volume=${volume.value}, musicVolume=${musicVolume.value}`)
  }

  // Принудительный перезапуск музыки (для отладки)
  const forceRestartMusic = async (): Promise<void> => {
    console.log('🔄 Принудительный перезапуск музыки...')
    
    // Останавливаем текущее воспроизведение
    stop()
    
    // Ждем немного
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Перезагружаем трек
    if (currentTrack.value) {
      await loadTrack(currentTrackIndex.value)
    } else {
      await loadTrack(0)
    }
    
    // Устанавливаем громкость
    const finalVolume = volume.value * musicVolume.value
    audio.volume = finalVolume
    
    // Запускаем воспроизведение
    isPlaying.value = true
    globalIsPlaying = true
    try {
      await audio.play()
      console.log('✅ Музыка перезапущена успешно')
      
      // Принудительно обновляем громкость после запуска
      setTimeout(() => {
        audio.volume = finalVolume
        console.log(`🔄 Громкость после перезапуска: ${Math.round(audio.volume * 100)}%`)
        
        // Проверяем состояние после перезапуска
        console.log(`🔄 Состояние после перезапуска: paused=${audio.paused}, volume=${audio.volume}`)
      }, 100)
      
    } catch (error) {
      console.error('❌ Ошибка перезапуска музыки:', error)
    }
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
    loadSettings,
    updateVolume,
    updateMusicVolume,
    updateEnvironmentVolume,
    forceUpdateVolume,
    checkAudioState,
    forceRestartMusic,
    addTrack,
    removeTrack,
    cleanup
  }
}
