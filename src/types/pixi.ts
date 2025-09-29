// Типы для Pixi.js рендеринга

export interface GameSprite {
  id: string
  texture: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scale: { x: number; y: number }
  visible: boolean
  interactive: boolean
  tint?: number
}

export interface GameScene {
  id: string
  name: string
  sprites: GameSprite[]
  background: string
  width: number
  height: number
  camera: Camera
}

export interface Camera {
  x: number
  y: number
  zoom: number
  target?: { x: number; y: number }
}

export interface Animation {
  id: string
  spriteId: string
  type: 'move' | 'scale' | 'rotate' | 'fade' | 'bounce'
  duration: number
  from: any
  to: any
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  loop: boolean
  onComplete?: () => void
}

export interface ParticleSystem {
  id: string
  x: number
  y: number
  texture: string
  count: number
  speed: number
  lifetime: number
  gravity: number
  spread: number
}

// Типы для UI элементов
export interface UIElement {
  id: string
  type: 'button' | 'panel' | 'text' | 'input' | 'slider'
  x: number
  y: number
  width: number
  height: number
  visible: boolean
  interactive: boolean
  style: UIStyle
}

export interface UIStyle {
  backgroundColor?: number
  borderColor?: number
  borderWidth?: number
  borderRadius?: number
  fontSize?: number
  fontFamily?: string
  textColor?: number
  padding?: number
}

// Типы для игровых объектов
export interface Goose {
  id: string
  sprite: GameSprite
  position: { x: number; y: number }
  animation: 'idle' | 'walk' | 'work' | 'happy' | 'sad'
  direction: 'left' | 'right'
  speed: number
  energy: number
  maxEnergy: number
}

export interface Shop {
  id: string
  name: string
  sprite: GameSprite
  position: { x: number; y: number }
  level: number
  products: any[] // Временно используем any, пока не определим точный тип Product
  customers: Customer[]
  revenue: number
}

export interface Customer {
  id: string
  sprite: GameSprite
  position: { x: number; y: number }
  mood: 'happy' | 'neutral' | 'angry'
  budget: number
  preferences: string[]
  currentTarget?: string
}

export interface Factory {
  id: string
  name: string
  sprite: GameSprite
  position: { x: number; y: number }
  level: number
  productionQueue: ProductionOrder[]
  efficiency: number
  workers: number
  maxWorkers: number
}

export interface ProductionOrder {
  id: string
  productId: string
  quantity: number
  progress: number
  startTime: number
  estimatedTime: number
  quality: number
}
