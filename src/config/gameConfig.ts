// Конфигурация игры Fashion Goose

export const GAME_CONFIG = {
  // Основные настройки
  GAME_NAME: 'Fashion Goose',
  VERSION: '1.0.0',
  
  // Игровые константы
  STARTING_MONEY: 5000,
  STARTING_REPUTATION: 0,
  MAX_LEVEL: 100,
  EXPERIENCE_PER_LEVEL: 1000,
  
  // Экономические настройки
  ECONOMY: {
    INFLATION_RATE: 0.02, // 2% в месяц
    SEASON_DURATION: 30, // дней
    MARKET_UPDATE_INTERVAL: 24, // часов
    EVENT_PROBABILITY: 0.1, // 10% в день
  },
  
  // Настройки производства
  PRODUCTION: {
    BASE_PRODUCTION_TIME: 60, // секунд
    QUALITY_MULTIPLIER: 1.5,
    EFFICIENCY_BONUS: 0.1,
    WORKER_PRODUCTIVITY: 10,
  },
  
  // Настройки магазина
  SHOP: {
    MAX_CUSTOMERS: 20,
    CUSTOMER_SPAWN_RATE: 0.5, // в минуту
    BASE_SATISFACTION: 0.7,
    PRICE_SENSITIVITY: 0.3,
  },
  
  // Настройки UI
  UI: {
    ANIMATION_DURATION: 300,
    NOTIFICATION_DURATION: 3000,
    TOOLTIP_DELAY: 500,
    MODAL_FADE_DURATION: 200,
  },
  
  // Настройки мультиплеера
  MULTIPLAYER: {
    MAX_PLAYERS: 50,
    CHAT_HISTORY_LIMIT: 100,
    TRADE_OFFER_DURATION: 24, // часов
    COMPETITION_DURATION: 7, // дней
  },
  
  // Настройки Pixi.js
  PIXI: {
    WIDTH: 1920,
    HEIGHT: 1080,
    BACKGROUND_COLOR: 0x87CEEB, // Небесно-голубой
    FPS: 60,
    ANTIALIAS: true,
  },
  
  // Настройки анимаций
  ANIMATIONS: {
    GOOSE_WALK_SPEED: 2,
    GOOSE_IDLE_DURATION: 2000,
    CUSTOMER_WALK_SPEED: 1.5,
    UI_TRANSITION_DURATION: 200,
  },
  
  // Настройки звука
  AUDIO: {
    MASTER_VOLUME: 0.7,
    SFX_VOLUME: 0.8,
    MUSIC_VOLUME: 0.6,
    AMBIENT_VOLUME: 0.4,
  },
  
  // Настройки обучения
  TUTORIAL: {
    ENABLED: true,
    AUTO_PROGRESS: false,
    HIGHLIGHT_DURATION: 2000,
    TOOLTIP_OFFSET: { x: 10, y: -10 },
  },
  
  // Настройки достижений
  ACHIEVEMENTS: {
    FIRST_SALE: {
      id: 'first_sale',
      name: 'Первая продажа',
      description: 'Продайте свой первый товар',
      reward: { money: 100, experience: 50 },
    },
    MONEY_MAKER: {
      id: 'money_maker',
      name: 'Денежный мешок',
      description: 'Накопите 10,000 монет',
      reward: { money: 1000, experience: 200 },
    },
    FASHION_DESIGNER: {
      id: 'fashion_designer',
      name: 'Модный дизайнер',
      description: 'Создайте 50 уникальных предметов одежды',
      reward: { experience: 500, reputation: 100 },
    },
  },
} as const

// Типы для конфигурации
export type GameConfig = typeof GAME_CONFIG
export type EconomyConfig = typeof GAME_CONFIG.ECONOMY
export type ProductionConfig = typeof GAME_CONFIG.PRODUCTION
export type ShopConfig = typeof GAME_CONFIG.SHOP
export type UIConfig = typeof GAME_CONFIG.UI
export type MultiplayerConfig = typeof GAME_CONFIG.MULTIPLAYER
export type PixiConfig = typeof GAME_CONFIG.PIXI
export type AnimationConfig = typeof GAME_CONFIG.ANIMATIONS
export type AudioConfig = typeof GAME_CONFIG.AUDIO
export type TutorialConfig = typeof GAME_CONFIG.TUTORIAL
export type AchievementConfig = typeof GAME_CONFIG.ACHIEVEMENTS
