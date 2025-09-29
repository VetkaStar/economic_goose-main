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
  skills: Skill[]
}

export interface Skill {
  id: number
  name: string
  description: string
  level: number
  maxLevel: number
  cost: number
}

export const useCharacterStore = defineStore('character', () => {
  // Данные персонажей
  const characters = ref<Character[]>([
    {
      id: 1,
      name: 'Персонаж 1',
      title: 'Начинающий дизайнер',
      image: '/characters/pers-1.svg',
      level: 1,
      levelProgress: 25,
      skillPoints: 3,
      description: 'Молодой гусь с большими амбициями в мире моды. Начинает свой путь с простых дизайнов.',
      skills: [
        {
          id: 1,
          name: 'Основы дизайна',
          description: 'Улучшает качество базовых дизайнов на 10% за уровень',
          level: 1,
          maxLevel: 5,
          cost: 1
        },
        {
          id: 2,
          name: 'Работа с тканью',
          description: 'Снижает расход материала на 5% за уровень',
          level: 0,
          maxLevel: 3,
          cost: 2
        },
        {
          id: 3,
          name: 'Креативность',
          description: 'Увеличивает скорость создания новых дизайнов на 15% за уровень',
          level: 0,
          maxLevel: 4,
          cost: 1
        }
      ]
    },
    {
      id: 2,
      name: 'Персонаж 2',
      title: 'Опытный модельер',
      image: '/characters/pers-2.svg',
      level: 3,
      levelProgress: 60,
      skillPoints: 5,
      description: 'Гусь с хорошим опытом в моде. Знает тренды и может создавать стильные коллекции.',
      skills: [
        {
          id: 1,
          name: 'Модные тренды',
          description: 'Увеличивает популярность одежды на 12% за уровень',
          level: 2,
          maxLevel: 5,
          cost: 2
        },
        {
          id: 2,
          name: 'Управление коллекцией',
          description: 'Повышает эффективность производства на 8% за уровень',
          level: 1,
          maxLevel: 4,
          cost: 3
        },
        {
          id: 3,
          name: 'Маркетинг',
          description: 'Снижает стоимость рекламы на 7% за уровень',
          level: 0,
          maxLevel: 3,
          cost: 2
        }
      ]
    },
    {
      id: 3,
      name: 'Персонаж 3',
      title: 'Модный магнат',
      image: '/characters/pers-3.svg',
      level: 5,
      levelProgress: 80,
      skillPoints: 8,
      description: 'Великолепный гусь-дизайнер, владеющий собственной модной империей. Создает эксклюзивные коллекции.',
      skills: [
        {
          id: 1,
          name: 'Эксклюзивные дизайны',
          description: 'Создает уникальную одежду, увеличивая прибыль на 15% за уровень',
          level: 3,
          maxLevel: 5,
          cost: 3
        },
        {
          id: 2,
          name: 'Международные связи',
          description: 'Открывает доступ к премиум материалам, снижая их стоимость на 10% за уровень',
          level: 2,
          maxLevel: 4,
          cost: 4
        },
        {
          id: 3,
          name: 'Брендинг',
          description: 'Повышает узнаваемость бренда, увеличивая лояльность клиентов на 20% за уровень',
          level: 1,
          maxLevel: 3,
          cost: 5
        }
      ]
    }
  ])

  // Выбранный персонаж
  const selectedCharacter = ref<Character | null>(null)

  // Действия
  const selectCharacter = (character: Character) => {
    selectedCharacter.value = character
    console.log('🎭 Выбран персонаж:', character.name)
  }

  const upgradeSkill = (character: Character, skill: Skill) => {
    if (character.skillPoints >= skill.cost && skill.level < skill.maxLevel) {
      skill.level++
      character.skillPoints -= skill.cost
      skill.cost = Math.ceil(skill.cost * 1.5) // Увеличиваем стоимость следующего уровня
      console.log(`🔧 Навык "${skill.name}" улучшен до уровня ${skill.level}`)
    }
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
    loadSelectedCharacter,
    saveSelectedCharacter
  }
})
