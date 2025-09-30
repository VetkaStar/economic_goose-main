import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { usePantryStore } from '@/stores/pantryStore'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { useCompanyStore } from '@/stores/companyStore'

export interface SocialPost {
  id: string
  authorId: string
  authorName: string
  type: 'offer' | 'request' // предложение товара или запрос на покупку
  title: string
  description: string
  itemName: string
  itemIcon: string
  quantity: number
  pricePerUnit: number
  totalPrice: number
  createdAt: string
  status: 'active' | 'completed' | 'cancelled'
  responses: SocialResponse[]
}

export interface SocialResponse {
  id: string
  postId: string
  responderId: string
  responderName: string
  message: string
  offeredQuantity: number
  offeredPrice: number
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export interface DemoOrder {
  id: string
  title: string
  itemName: string
  itemIcon: string
  quantity: number
  pricePerUnit: number
  customer: string
  createdAt: string
  // Критерии выполнения
  requirements: {
    color?: string
    type?: string // 'tshirt' | 'shirt' | 'dress'
    pattern?: string // 'plain' | 'dots' | 'stripes' | 'flowers'
    material?: string
    quality?: number // 0-100, пока заглушка
  }
}

export interface TakenOrder extends DemoOrder {
  takenAt: string
  status: 'in_progress' | 'completed' | 'failed'
  submittedItems?: Array<{
    name: string
    color: string
    type: string
    pattern: string
    material: string
    quality: number
  }>
}

export const useSocialStore = defineStore('social', () => {
  const auth = useAuthStore()
  const pantry = usePantryStore()
  const warehouse = useWarehouseStore()
  const company = useCompanyStore()

  const posts = ref<SocialPost[]>([])
  const responses = ref<SocialResponse[]>([])
  // Демо-заказы: одновременно показываем до 3, пополняем каждые 5 минут из очереди 10-15
  const demoQueue = ref<DemoOrder[]>([])
  const visibleOrders = ref<DemoOrder[]>([])
  const takenOrders = ref<TakenOrder[]>([])
  let spawnerTimer: number | null = null

  // Генерируем ID
  function generateId() {
    if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
      return (crypto as any).randomUUID()
    }
    return Math.random().toString(36).slice(2)
  }

  // --- Демо заказы ---
  function seedDemoOrders() {
    if (demoQueue.value.length > 0 || visibleOrders.value.length > 0) return
    const names = ['Лилия','Мия','София','Максим','Арсений','Алиса','Ева','Никита','Матвей','Даша','Кира','Илья','Оля','Варя','Гриша']
    const items = [
      { name: 'Футболка', icon: '👕', type: 'tshirt' },
      { name: 'Рубашка', icon: '👔', type: 'shirt' },
      { name: 'Платье', icon: '👗', type: 'dress' },
      { name: 'Худи', icon: '🧥', type: 'hoodie' },
      { name: 'Брюки', icon: '👖', type: 'pants' },
      { name: 'Юбка', icon: '👗', type: 'skirt' }
    ]
    const colors = ['красный', 'синий', 'зелёный', 'жёлтый', 'розовый', 'фиолетовый', 'оранжевый', 'чёрный', 'белый']
    const patterns = ['plain', 'dots', 'stripes', 'flowers']
    const materials = ['хлопок', 'шёлк', 'джинс', 'трикотаж', 'фланель']
    
    const count = 12 + Math.floor(Math.random() * 4) // 12-15
    const now = Date.now()
    for (let i = 0; i < count; i++) {
      const item = items[Math.floor(Math.random() * items.length)]
      const qty = 3 + Math.floor(Math.random() * 8)
      const price = 150 + Math.floor(Math.random() * 200)
      const color = colors[Math.floor(Math.random() * colors.length)]
      const pattern = patterns[Math.floor(Math.random() * patterns.length)]
      const material = materials[Math.floor(Math.random() * materials.length)]
      
      demoQueue.value.push({
        id: generateId(),
        title: `Нужно сшить: ${item.name}`,
        itemName: item.name,
        itemIcon: item.icon,
        quantity: qty,
        pricePerUnit: price,
        customer: names[Math.floor(Math.random() * names.length)],
        createdAt: new Date(now + i * 60000).toISOString(),
        requirements: {
          color,
          type: item.type,
          pattern,
          material,
          quality: 70 + Math.floor(Math.random() * 30) // 70-100
        }
      })
    }
    // Первые заявки сразу показываем до 3
    refillVisibleOrders()
  }

  function refillVisibleOrders() {
    // Пополняем только до 3 заказов максимум
    while (visibleOrders.value.length < 3 && demoQueue.value.length > 0) {
      const next = demoQueue.value.shift()!
      visibleOrders.value.push(next)
    }
  }

  function startOrderSpawner() {
    if (spawnerTimer) return
    // Каждые 5 минут подкидываем новые заявки до лимита 3
    spawnerTimer = setInterval(() => {
      refillVisibleOrders()
    }, 5 * 60 * 1000) as unknown as number
  }

  function stopOrderSpawner() {
    if (spawnerTimer) {
      clearInterval(spawnerTimer)
      spawnerTimer = null
    }
  }

  function takeOrder(orderId: string) {
    const idx = visibleOrders.value.findIndex(o => o.id === orderId)
    if (idx === -1) return false
    
    const order = visibleOrders.value[idx]
    // Перемещаем в взятые заказы
    const takenOrder: TakenOrder = {
      ...order,
      takenAt: new Date().toISOString(),
      status: 'in_progress',
      submittedItems: []
    }
    takenOrders.value.push(takenOrder)
    
    // Убираем из видимых, НЕ пополняем сразу
    visibleOrders.value.splice(idx, 1)
    // Новые заказы появятся только через 5 минут
    return true
  }

  function submitOrder(orderId: string, submittedItems: Array<{
    name: string
    color: string
    type: string
    pattern: string
    material: string
    quality: number
  }>) {
    const order = takenOrders.value.find(o => o.id === orderId)
    if (!order) return false

    // Проверяем соответствие критериям
    const isValid = validateOrder(order, submittedItems)
    
    order.submittedItems = submittedItems
    order.status = isValid ? 'completed' : 'failed'
    
    // Если заказ не прошел валидацию, сбрасываем статус на in_progress для повторной попытки
    if (!isValid) {
      // Небольшая задержка перед сбросом статуса, чтобы пользователь увидел ошибку
      setTimeout(() => {
        const orderToReset = takenOrders.value.find(o => o.id === orderId)
        if (orderToReset && orderToReset.status === 'failed') {
          orderToReset.status = 'in_progress'
        }
      }, 2000)
    }
    
    return isValid
  }

  function validateOrder(order: TakenOrder, items: Array<{
    name: string
    color: string
    type: string
    pattern: string
    material: string
    quality: number
  }>): boolean {
    const req = order.requirements
    
    // Проверяем количество
    if (items.length !== order.quantity) return false
    
    // Проверяем каждый предмет
    for (const item of items) {
      // Проверяем название изделия
      if (item.name !== order.itemName) return false
      if (req.color && item.color !== req.color) return false
      if (req.type && item.type !== req.type) return false
      if (req.pattern && item.pattern !== req.pattern) return false
      if (req.material && item.material !== req.material) return false
      // Качество пока заглушка
      if (req.quality && item.quality < req.quality) return false
    }
    
    return true
  }

  function getTakenOrders() {
    return takenOrders.value
  }

  function getOrderById(orderId: string) {
    return takenOrders.value.find(o => o.id === orderId)
  }

  // Получить все активные посты
  const activePosts = computed(() => 
    posts.value.filter(post => post.status === 'active')
  )

  // Получить мои посты
  const myPosts = computed(() => 
    posts.value.filter(post => post.authorId === auth.user?.id)
  )

  // Получить мои отклики
  const myResponses = computed(() => 
    responses.value.filter(response => response.responderId === auth.user?.id)
  )

  // Создать пост с предложением товара
  function createOfferPost(item: {
    name: string
    icon: string
    quantity: number
    pricePerUnit: number
    description?: string
  }) {
    if (!auth.user?.id) return false

    const post: SocialPost = {
      id: generateId(),
      authorId: auth.user.id,
      authorName: auth.user.username || 'Гусь',
      type: 'offer',
      title: `Продаю: ${item.name}`,
      description: item.description || `Предлагаю ${item.quantity} шт. по ${item.pricePerUnit}₽ за штуку`,
      itemName: item.name,
      itemIcon: item.icon,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      totalPrice: item.quantity * item.pricePerUnit,
      createdAt: new Date().toISOString(),
      status: 'active',
      responses: []
    }

    posts.value.unshift(post)
    return true
  }

  // Создать пост с запросом на покупку
  function createRequestPost(item: {
    name: string
    icon: string
    quantity: number
    maxPricePerUnit: number
    description?: string
  }) {
    if (!auth.user?.id) return false

    const post: SocialPost = {
      id: generateId(),
      authorId: auth.user.id,
      authorName: auth.user.username || 'Гусь',
      type: 'request',
      title: `Ищу: ${item.name}`,
      description: item.description || `Нужно ${item.quantity} шт. до ${item.maxPricePerUnit}₽ за штуку`,
      itemName: item.name,
      itemIcon: item.icon,
      quantity: item.quantity,
      pricePerUnit: item.maxPricePerUnit,
      totalPrice: item.quantity * item.maxPricePerUnit,
      createdAt: new Date().toISOString(),
      status: 'active',
      responses: []
    }

    posts.value.unshift(post)
    return true
  }

  // Откликнуться на пост
  function respondToPost(postId: string, response: {
    message: string
    offeredQuantity: number
    offeredPrice: number
  }) {
    if (!auth.user?.id) return false

    const post = posts.value.find(p => p.id === postId)
    if (!post || post.status !== 'active') return false

    const socialResponse: SocialResponse = {
      id: generateId(),
      postId,
      responderId: auth.user.id,
      responderName: auth.user.username || 'Гусь',
      message: response.message,
      offeredQuantity: response.offeredQuantity,
      offeredPrice: response.offeredPrice,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    responses.value.unshift(socialResponse)
    post.responses.push(socialResponse)
    return true
  }

  // Принять отклик
  function acceptResponse(responseId: string) {
    const response = responses.value.find(r => r.id === responseId)
    if (!response) return false

    response.status = 'accepted'
    
    // Отклоняем остальные отклики на этот пост
    const post = posts.value.find(p => p.id === response.postId)
    if (post) {
      post.responses.forEach(r => {
        if (r.id !== responseId) {
          r.status = 'rejected'
        }
      })
      post.status = 'completed'
    }

    return true
  }

  // Отклонить отклик
  function rejectResponse(responseId: string) {
    const response = responses.value.find(r => r.id === responseId)
    if (!response) return false

    response.status = 'rejected'
    return true
  }

  // Получить доступные товары для размещения (из кладовой или склада)
  const availableItems = computed(() => {
    const items: Array<{
      name: string
      icon: string
      quantity: number
      price: number
      source: 'pantry' | 'warehouse'
    }> = []

    // Из кладовой
    pantry.materials.forEach(material => {
      if (material.quantity > 0) {
        items.push({
          name: material.name,
          icon: material.icon || '🧵',
          quantity: material.quantity,
          price: material.price || 0,
          source: 'pantry'
        })
      }
    })

    pantry.products.forEach(product => {
      if (product.quantity > 0) {
        items.push({
          name: product.name,
          icon: product.icon || '👕',
          quantity: product.quantity,
          price: product.price || 0,
          source: 'pantry'
        })
      }
    })

    // Из основного склада (если арендован)
    if (company.canUseWarehouse()) {
      warehouse.materials.forEach(material => {
        if (material.quantity > 0) {
          items.push({
            name: material.name,
            icon: material.icon || '🧵',
            quantity: material.quantity,
            price: material.price || 0,
            source: 'warehouse'
          })
        }
      })

      warehouse.clothing.forEach(item => {
        if (item.quantity > 0) {
          items.push({
            name: item.name,
            icon: item.icon || '👕',
            quantity: item.quantity,
            price: item.price || 0,
            source: 'warehouse'
          })
        }
      })
    }

    return items
  })

  // Удалить пост
  function deletePost(postId: string) {
    const index = posts.value.findIndex(p => p.id === postId)
    if (index !== -1) {
      posts.value.splice(index, 1)
      // Удаляем связанные отклики
      responses.value = responses.value.filter(r => r.postId !== postId)
      return true
    }
    return false
  }

  return {
    // State
    posts,
    responses,
    demoQueue,
    visibleOrders,
    takenOrders,
    
    // Computed
    activePosts,
    myPosts,
    myResponses,
    availableItems,
    
    // Actions
    seedDemoOrders,
    startOrderSpawner,
    stopOrderSpawner,
    takeOrder,
    submitOrder,
    validateOrder,
    getTakenOrders,
    getOrderById,
    createOfferPost,
    createRequestPost,
    respondToPost,
    acceptResponse,
    rejectResponse,
    deletePost,
    resetState() {
      posts.value = []
      responses.value = []
      demoQueue.value = []
      visibleOrders.value = []
      takenOrders.value = []
      if (spawnerTimer) {
        clearInterval(spawnerTimer)
        spawnerTimer = null
      }
    }
  }
})
