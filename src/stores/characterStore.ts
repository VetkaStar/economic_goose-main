import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Character {
  id: number
  name: string
  title: string
  image: string
  level: number
  levelProgress: number
  skillPoints: number
  description: string
  startCapital: number
  location: string
  equipment: string[]
  skills: Skill[]
  isUnlocked: boolean
  requiredLevel: number
}

export interface Skill {
  id: number
  name: string
  description: string
  level: number
  maxLevel: number
  cost: number
  gameEffect: string
  realExplanation: string
  tutorialType: 'video' | 'text' | 'case'
}

export const useCharacterStore = defineStore('character', () => {
  // Данные персонажей
  const characters = ref<Character[]>([
    {
      id: 1,
      name: 'Начинающий дизайнер',
      title: 'Молодой гусь, только начинает путь в моде',
      image: '/characters/pers-1.svg',
      level: 1,
      levelProgress: 0,
      skillPoints: 0,
      description: 'Молодой гусь, только начинает путь в моде. Умеет шить простые вещи дома.',
      startCapital: 5000,
      location: 'Дом-мастерская',
      equipment: ['Старая швейная машинка'],
      isUnlocked: true,
      requiredLevel: 1,
      skills: [
        {
          id: 1,
          name: 'Основы дизайна',
          description: 'Можно шить новые модели (рубашки, платья)',
          level: 1,
          maxLevel: 5,
          cost: 1,
          gameEffect: 'Можно шить новые модели (рубашки, платья)',
          realExplanation: 'Курсы кройки и шитья = рост качества',
          tutorialType: 'text'
        },
        {
          id: 2,
          name: 'Работа с тканью',
          description: 'Меньше отходов, себестоимость ↓',
          level: 0,
          maxLevel: 3,
          cost: 2,
          gameEffect: 'Меньше отходов, себестоимость ↓',
          realExplanation: 'Оверлок/раскройный стол экономят материал',
          tutorialType: 'video'
        },
        {
          id: 3,
          name: 'Финансовая грамотность',
          description: 'Правильно считает налоги, меньше штрафов',
          level: 0,
          maxLevel: 3,
          cost: 2,
          gameEffect: 'Правильно считает налоги, меньше штрафов',
          realExplanation: 'Знание бухучёта и налогов',
          tutorialType: 'text'
        },
        {
          id: 4,
          name: 'Репутация',
          description: 'Открывает доступ к микрокредиту (10 000 ₽)',
          level: 0,
          maxLevel: 2,
          cost: 3,
          gameEffect: 'Открывает доступ к микрокредиту (10 000 ₽)',
          realExplanation: 'Доверие банка и поручитель',
          tutorialType: 'video'
        },
        {
          id: 5,
          name: 'Маркетинг',
          description: 'Доступна реклама в соцсетях',
          level: 0,
          maxLevel: 3,
          cost: 2,
          gameEffect: 'Доступна реклама в соцсетях',
          realExplanation: 'Платная реклама реально приводит клиентов',
          tutorialType: 'video'
        },
        {
          id: 6,
          name: 'Регистрация как самозанятый',
          description: 'Легальные продажи онлайн и офлайн',
          level: 0,
          maxLevel: 2,
          cost: 3,
          gameEffect: 'Выход на маркетплейсы (Ozon/WB)',
          realExplanation: 'Самозанятый платит 4% при продаже физлицам и 6% юрлицам',
          tutorialType: 'text'
        }
      ]
    },
    {
      id: 2,
      name: 'Опытный модельер',
      title: 'Уже шил вещи для заказчиков, понимает базовые законы рынка',
      image: '/characters/pers-2.svg',
      level: 3,
      levelProgress: 0,
      skillPoints: 0,
      description: 'Уже шил вещи для заказчиков, понимает базовые законы рынка.',
      startCapital: 15000,
      location: 'Мастерская (арендует небольшое помещение)',
      equipment: ['2 швейные машины', 'Оверлок'],
      isUnlocked: false,
      requiredLevel: 3,
      skills: [
        {
          id: 1,
          name: 'Организация труда',
          description: 'Можно нанять помощника → ↑ объём, но ↑ расходы',
          level: 0,
          maxLevel: 3,
          cost: 2,
          gameEffect: 'Можно нанять помощника → ↑ объём, но ↑ расходы',
          realExplanation: 'В реальности: найм увеличивает производительность, но требует зарплаты',
          tutorialType: 'text'
        },
        {
          id: 2,
          name: 'Технологии и оборудование',
          description: 'Производство быстрее и точнее',
          level: 0,
          maxLevel: 4,
          cost: 3,
          gameEffect: 'Производство быстрее и точнее',
          realExplanation: 'Новые машины = ↑ производительность, ↓ брак',
          tutorialType: 'video'
        },
        {
          id: 3,
          name: 'Репутация',
          description: 'Кредит до 50 000 ₽ под поручителя',
          level: 0,
          maxLevel: 2,
          cost: 4,
          gameEffect: 'Кредит до 50 000 ₽ под поручителя',
          realExplanation: 'Банк выдаёт больше при доказанном обороте',
          tutorialType: 'video'
        },
        {
          id: 4,
          name: 'Финансовая грамотность',
          description: 'Снижает проценты по кредиту',
          level: 0,
          maxLevel: 3,
          cost: 3,
          gameEffect: 'Снижает проценты по кредиту',
          realExplanation: 'Финансовая грамотность = выгоднее условия',
          tutorialType: 'text'
        },
        {
          id: 5,
          name: 'Маркетинг',
          description: 'Реклама эффективнее, открываются новые каналы',
          level: 0,
          maxLevel: 4,
          cost: 2,
          gameEffect: 'Реклама эффективнее, открываются новые каналы',
          realExplanation: 'Бюджет даёт больший охват',
          tutorialType: 'video'
        },
        {
          id: 6,
          name: 'Собственный шоурум',
          description: 'Офлайн-пространство для примерок',
          level: 0,
          maxLevel: 2,
          cost: 4,
          gameEffect: 'Рост прямых продаж, но фиксированные расходы на аренду',
          realExplanation: 'Шоурумы снижают расходы по сравнению с полноценным магазином',
          tutorialType: 'text'
        }
      ]
    },
    {
      id: 3,
      name: 'Модный магнат',
      title: 'Известный в районе предприниматель-гусь, у него уже есть собственный магазин',
      image: '/characters/pers-3.svg',
      level: 5,
      levelProgress: 0,
      skillPoints: 0,
      description: 'Известный в районе предприниматель-гусь, у него уже есть собственный магазин.',
      startCapital: 50000,
      location: 'Магазин в центре города',
      equipment: ['Мастерская', 'Витрина', '3 сотрудника'],
      isUnlocked: false,
      requiredLevel: 5,
      skills: [
        {
          id: 1,
          name: 'Управление брендом',
          description: 'Доступ к «Fashion Week»',
          level: 0,
          maxLevel: 3,
          cost: 4,
          gameEffect: 'Доступ к «Fashion Week»',
          realExplanation: 'Бренд = имидж = новые рынки',
          tutorialType: 'video'
        },
        {
          id: 2,
          name: 'Работа с персоналом',
          description: 'Нанимает модельеров, маркетолога → ↑ качество/продажи',
          level: 0,
          maxLevel: 4,
          cost: 3,
          gameEffect: 'Нанимает модельеров, маркетолога → ↑ качество/продажи',
          realExplanation: 'Команда специалистов = рост бизнеса',
          tutorialType: 'text'
        },
        {
          id: 3,
          name: 'Финансы и кредиты',
          description: 'Линия до 200 000 ₽, инвесторы',
          level: 0,
          maxLevel: 3,
          cost: 5,
          gameEffect: 'Линия до 200 000 ₽, инвесторы',
          realExplanation: 'Банки и инвесторы дают крупные суммы под бизнес',
          tutorialType: 'video'
        },
        {
          id: 4,
          name: 'Маркетинг и PR',
          description: 'Масштабные кампании (ТВ, блогеры)',
          level: 0,
          maxLevel: 4,
          cost: 4,
          gameEffect: 'Масштабные кампании (ТВ, блогеры)',
          realExplanation: 'PR повышает репутацию, продажи',
          tutorialType: 'video'
        },
        {
          id: 5,
          name: 'Экспансия',
          description: 'Открывает новый магазин',
          level: 0,
          maxLevel: 2,
          cost: 6,
          gameEffect: 'Открывает новый магазин',
          realExplanation: 'В реальности: франшиза, филиалы',
          tutorialType: 'text'
        },
        {
          id: 6,
          name: 'Выход на оптовых партнёров',
          description: 'Продажа коллекций B2B',
          level: 0,
          maxLevel: 3,
          cost: 5,
          gameEffect: 'Объём продаж растёт, маржа падает',
          realExplanation: 'Опт и ритейл — стандартный путь масштабирования бренда',
          tutorialType: 'video'
        }
      ]
    }
  ])

  // Выбранный персонаж
  const selectedCharacter = ref<Character | null>(null)

  // Действия
  const selectCharacter = (character: Character) => {
    if (character.isUnlocked) {
      selectedCharacter.value = character
      console.log('🎭 Выбран персонаж:', character.name)
    } else {
      console.log('🔒 Персонаж заблокирован. Требуется уровень:', character.requiredLevel)
    }
  }

  const upgradeSkill = (character: Character, skill: Skill) => {
    if (character.skillPoints >= skill.cost && skill.level < skill.maxLevel) {
      skill.level++
      character.skillPoints -= skill.cost
      skill.cost = Math.ceil(skill.cost * 1.5) // Увеличиваем стоимость следующего уровня
      console.log(`🔧 Навык "${skill.name}" улучшен до уровня ${skill.level}`)
    }
  }

  const checkCharacterUnlock = (character: Character, playerLevel: number) => {
    if (playerLevel >= character.requiredLevel) {
      character.isUnlocked = true
      console.log(`🔓 Персонаж "${character.name}" разблокирован!`)
    }
  }

  const unlockAllCharacters = (playerLevel: number) => {
    characters.value.forEach(character => {
      checkCharacterUnlock(character, playerLevel)
    })
  }

  const loadSelectedCharacter = () => {
    // Загружаем выбранного персонажа из localStorage
    const savedCharacterId = localStorage.getItem('selectedCharacterId')
    if (savedCharacterId) {
      const character = characters.value.find(c => c.id === parseInt(savedCharacterId))
      if (character) {
        selectedCharacter.value = character
        console.log('📂 Загружен сохраненный персонаж:', character.name)
      }
    } else {
      // Если нет сохраненного персонажа, выбираем первого
      selectedCharacter.value = characters.value[0]
      console.log('🎭 Выбран персонаж по умолчанию:', characters.value[0].name)
    }
  }

  const saveSelectedCharacter = () => {
    // Сохраняем ID выбранного персонажа в localStorage
    if (selectedCharacter.value) {
      localStorage.setItem('selectedCharacterId', selectedCharacter.value.id.toString())
      console.log('💾 Сохранен персонаж:', selectedCharacter.value.name)
    }
  }

  return {
    characters,
    selectedCharacter,
    selectCharacter,
    upgradeSkill,
    checkCharacterUnlock,
    unlockAllCharacters,
    loadSelectedCharacter,
    saveSelectedCharacter
  }
})
