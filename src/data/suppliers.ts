export interface Supplier {
  id: string
  name: string
  icon: string
  specialty: string
  country: string
  reliability: number
  discountThreshold: number
  discountPercent: number
  contractStatus: 'locked' | 'none' | 'negotiating' | 'active'
  accessType: 'starter' | 'simple' | 'visit' | 'wealth' | 'reputation' | 'exclusive'
  requirement?: {
    type: 'auto' | 'visit' | 'money' | 'reputation' | 'combined'
    amount?: number
    money?: number
    reputation?: number
    location?: string
  }
  materials: SupplierMaterial[]
}

export interface SupplierMaterial {
  id: string
  name: string
  price: number
  quality: number
  description: string
  durability: number
  comfort: number
  style: number
  minOrderQuantity: number
  maxOrderQuantity: number
  deliveryTime: number
}

export const SUPPLIERS_DATA: Supplier[] = [
  {
    id: 'local_textile_farm',
    name: 'Местная текстильная ферма',
    icon: '🌾',
    specialty: 'Российские натуральные ткани',
    country: 'Россия',
    reliability: 95,
    discountThreshold: 50000,
    discountPercent: 5,
    contractStatus: 'active',
    accessType: 'starter',
    materials: [
      {
        id: 'cotton_local',
        name: 'Российский хлопок',
        price: 160,
        quality: 76,
        description: 'Местное производство, стабильное качество',
        durability: 70,
        comfort: 80,
        style: 60,
        minOrderQuantity: 10,
        maxOrderQuantity: 1000,
        deliveryTime: 1
      },
      {
        id: 'linen_pskov',
        name: 'Псковский лен',
        price: 200,
        quality: 52,
        description: 'Традиционный русский лен высокого качества',
        durability: 90,
        comfort: 90,
        style: 70,
        minOrderQuantity: 5,
        maxOrderQuantity: 500,
        deliveryTime: 2
      },
      {
        id: 'hemp_eco',
        name: 'Эко-конопля',
        price: 220,
        quality: 50,
        description: 'Экологически чистое волокно, очень прочное',
        durability: 90,
        comfort: 75,
        style: 65,
        minOrderQuantity: 5,
        maxOrderQuantity: 300,
        deliveryTime: 3
      }
    ]
  },
  {
    id: 'synthetic_pro_factory',
    name: 'Завод "Синтетик-Про"',
    icon: '🏭',
    specialty: 'Доступные синтетические материалы',
    country: 'Россия',
    reliability: 88,
    discountThreshold: 30000,
    discountPercent: 3,
    contractStatus: 'active',
    accessType: 'simple',
    requirement: {
      type: 'auto'
    },
    materials: [
      {
        id: 'polyester_standard',
        name: 'Полиэстер стандарт',
        price: 80,
        quality: 45,
        description: 'Базовый синтетический материал',
        durability: 60,
        comfort: 40,
        style: 30,
        minOrderQuantity: 50,
        maxOrderQuantity: 2000,
        deliveryTime: 1
      },
      {
        id: 'nylon_sport',
        name: 'Нейлон спортивный',
        price: 120,
        quality: 55,
        description: 'Легкий и прочный для спортивной одежды',
        durability: 80,
        comfort: 50,
        style: 40,
        minOrderQuantity: 20,
        maxOrderQuantity: 1000,
        deliveryTime: 1
      }
    ]
  },
  {
    id: 'wool_cooperative',
    name: 'Региональный шерстяной кооператив',
    icon: '🐑',
    specialty: 'Натуральная шерсть разных сортов',
    country: 'Россия',
    reliability: 92,
    discountThreshold: 75000,
    discountPercent: 7,
    contractStatus: 'locked',
    accessType: 'visit',
    requirement: {
      type: 'visit',
      location: 'textile_mill'
    },
    materials: [
      {
        id: 'wool_merino',
        name: 'Мериносовая шерсть',
        price: 800,
        quality: 85,
        description: 'Премиальная шерсть австралийских мериносов',
        durability: 95,
        comfort: 95,
        style: 90,
        minOrderQuantity: 5,
        maxOrderQuantity: 200,
        deliveryTime: 5
      },
      {
        id: 'wool_alpaca',
        name: 'Альпака',
        price: 1200,
        quality: 90,
        description: 'Роскошная шерсть альпака',
        durability: 90,
        comfort: 98,
        style: 95,
        minOrderQuantity: 2,
        maxOrderQuantity: 100,
        deliveryTime: 7
      }
    ]
  },
  {
    id: 'indigo_denim',
    name: 'Денимовая мануфактура "Индиго"',
    icon: '👖',
    specialty: 'Профессиональные джинсовые ткани',
    country: 'Россия',
    reliability: 90,
    discountThreshold: 100000,
    discountPercent: 10,
    contractStatus: 'locked',
    accessType: 'wealth',
    requirement: {
      type: 'money',
      amount: 100000
    },
    materials: [
      {
        id: 'denim_heavy',
        name: 'Тяжелый деним',
        price: 300,
        quality: 75,
        description: 'Классический деним для джинсов',
        durability: 95,
        comfort: 60,
        style: 85,
        minOrderQuantity: 20,
        maxOrderQuantity: 500,
        deliveryTime: 3
      },
      {
        id: 'denim_stretch',
        name: 'Стрейч деним',
        price: 350,
        quality: 70,
        description: 'Деним с добавлением эластана',
        durability: 85,
        comfort: 80,
        style: 75,
        minOrderQuantity: 15,
        maxOrderQuantity: 400,
        deliveryTime: 3
      }
    ]
  }
]

export function getQualityGrade(quality: number) {
  if (quality >= 90) {
    return { label: 'Превосходно', color: '#10b981' }
  } else if (quality >= 75) {
    return { label: 'Отлично', color: '#34d399' }
  } else if (quality >= 60) {
    return { label: 'Хорошо', color: '#fbbf24' }
  } else if (quality >= 45) {
    return { label: 'Среднее', color: '#f59e0b' }
  } else if (quality >= 30) {
    return { label: 'Ниже среднего', color: '#ef4444' }
  } else {
    return { label: 'Плохо', color: '#dc2626' }
  }
}
