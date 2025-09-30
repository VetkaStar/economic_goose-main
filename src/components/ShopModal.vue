<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal shop-modal">
      <div class="modal-header">
        <h2 class="menu-title">🛍️ Магазин материалов</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="modal-content">
        <!-- Информация о балансе -->
        <div class="balance-info">
          <span class="balance-label">Ваш баланс:</span>
          <span class="balance-value">₽{{ (authStore.user?.money || 0).toLocaleString() }}</span>
        </div>

        <!-- Категории материалов -->
        <div class="categories-section">
          <h3>📦 Категории материалов</h3>
          <div class="categories-tabs">
            <button 
              v-for="category in categories" 
              :key="category.id"
              class="category-tab"
              :class="{ active: selectedCategory === category.id }"
              @click="selectedCategory = category.id"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </button>
          </div>
        </div>

        <!-- Список материалов -->
        <div class="materials-section">
          <h3>{{ getCurrentCategoryName() }}</h3>
          
          <div class="materials-grid">
            <div 
              v-for="material in getCurrentMaterials()" 
              :key="material.id"
              class="material-card"
            >
              <div class="material-header">
                <span class="material-icon">{{ material.icon }}</span>
                <div class="material-info">
                  <h4 class="material-name">{{ material.name }}</h4>
                  <p class="material-description">{{ material.description }}</p>
                </div>
                <div class="material-price">
                  <span class="price-value">₽{{ material.price.toLocaleString() }}</span>
                  <span class="price-per-unit">за единицу</span>
                </div>
              </div>
              
              <div class="material-stats">
                <div class="stat-item">
                  <span class="stat-label">Качество:</span>
                  <span class="stat-value">{{ material.quality }}%</span>
                </div>
                <div v-if="material.durability" class="stat-item">
                  <span class="stat-label">🛡️ Прочность:</span>
                  <span class="stat-value">{{ material.durability }}/10</span>
                </div>
                <div v-if="material.comfort" class="stat-item">
                  <span class="stat-label">😌 Комфорт:</span>
                  <span class="stat-value">{{ material.comfort }}/10</span>
                </div>
                <div v-if="material.style" class="stat-item">
                  <span class="stat-label">✨ Стиль:</span>
                  <span class="stat-value">{{ material.style }}/10</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Доступно:</span>
                  <span class="stat-value">{{ material.available }} шт.</span>
                </div>
              </div>
              
              <div class="material-actions">
                <div class="quantity-selector">
                  <button 
                    class="qty-btn" 
                    @click="decreaseQuantity(material.id)"
                    :disabled="selectedQuantities[material.id] <= 1"
                  >-</button>
                  <span class="qty-value">{{ selectedQuantities[material.id] || 1 }}</span>
                  <button 
                    class="qty-btn" 
                    @click="increaseQuantity(material.id, material.available)"
                    :disabled="(selectedQuantities[material.id] || 1) >= material.available"
                  >+</button>
                </div>
                
                <button 
                  class="buy-btn"
                  @click="buyMaterial(material)"
                  :disabled="!canBuy(material)"
                >
                  Купить за ₽{{ getTotalPrice(material).toLocaleString() }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { supabase } from '@/lib/supabase'

// Интерфейс для материала в магазине
interface ShopMaterial {
  id: string
  name: string
  description: string
  icon: string
  category: string
  price: number
  quality: number
  durability?: number
  comfort?: number
  style?: number
  available: number
}

// Эмиты
const emit = defineEmits<{
  close: []
}>()

// Сторы
const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()

// Состояние
const selectedCategory = ref('fabric')
const selectedQuantities = ref<Record<string, number>>({})

// Категории материалов
const categories = [
  { id: 'fabric', name: 'Ткани', icon: '🧵' },
  { id: 'accessories', name: 'Аксессуары', icon: '🔘' },
  { id: 'tools', name: 'Инструменты', icon: '🔧' },
  { id: 'special', name: 'Особые', icon: '✨' }
]

// Материалы магазина (загружаются из базы данных)
const shopMaterials = ref<ShopMaterial[]>([])

// Функция загрузки материалов из базы данных
const loadMaterials = async () => {
  try {
    const { data, error } = await supabase
      .from('warehouse_materials')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Ошибка загрузки материалов:', error)
      return
    }

    // Добавляем поле available для каждого материала
    shopMaterials.value = data.map((material: any): ShopMaterial => ({
      id: material.id,
      name: material.name,
      description: material.description || '',
      icon: material.icon || '🧵',
      category: material.category || 'material',
      price: Number(material.price) || 0,
      quality: material.quality || 1,
      durability: material.durability,
      comfort: material.comfort,
      style: material.style,
      available: Math.floor(Math.random() * 50) + 10 // Случайное количество от 10 до 60
    }))

    console.log('✅ Материалы магазина загружены:', shopMaterials.value.length)
  } catch (error) {
    console.error('Ошибка при загрузке материалов:', error)
  }
}

// Вычисляемые свойства
const getCurrentMaterials = () => {
  return shopMaterials.value.filter(material => material.category === selectedCategory.value)
}

const getCurrentCategoryName = () => {
  const category = categories.find(cat => cat.id === selectedCategory.value)
  return category ? category.name : 'Материалы'
}

const canBuy = (material: any) => {
  const quantity = selectedQuantities.value[material.id] || 1
  const totalPrice = material.price * quantity
  return (authStore.user?.money || 0) >= totalPrice && material.available >= quantity
}

const getTotalPrice = (material: any) => {
  const quantity = selectedQuantities.value[material.id] || 1
  return material.price * quantity
}

// Методы
const increaseQuantity = (materialId: string, maxQuantity: number) => {
  const current = selectedQuantities.value[materialId] || 1
  if (current < maxQuantity) {
    selectedQuantities.value[materialId] = current + 1
  }
}

const decreaseQuantity = (materialId: string) => {
  const current = selectedQuantities.value[materialId] || 1
  if (current > 1) {
    selectedQuantities.value[materialId] = current - 1
  }
}

const buyMaterial = async (material: any) => {
  const quantity = selectedQuantities.value[material.id] || 1
  const totalPrice = material.price * quantity
  
  try {
    // Списываем деньги
    if (!authStore.user) {
      console.log('❌ Пользователь не авторизован')
      return
    }
    
    const success = await authStore.spendMoney(totalPrice)
    if (!success) {
      console.log('❌ Недостаточно средств')
      return
    }
    
    // Добавляем материал в правильное хранилище (кладовая или склад)
    await warehouseStore.addMaterialToCorrectStorage(material.id, quantity, material)
    
    // Уменьшаем доступное количество
    material.available -= quantity
    
    // Сбрасываем выбранное количество
    selectedQuantities.value[material.id] = 1
    
    console.log(`✅ Куплено ${quantity} единиц материала ${material.name}`)
  } catch (error) {
    console.error('❌ Ошибка при покупке материала:', error)
  }
}

// Инициализация
onMounted(async () => {
  // Загружаем данные склада
  warehouseStore.loadWarehouseData()
  
  // Загружаем материалы из базы данных
  await loadMaterials()
  
  // Инициализация количества для каждого материала
  shopMaterials.value.forEach(material => {
    selectedQuantities.value[material.id] = 1
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.shop-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: clamp(15px, 2vw, 30px);
  max-width: 1000px;
  width: 95%;
  height: 90vh;
  overflow-y: auto;
  box-shadow: 0 clamp(10px, 2vw, 20px) clamp(30px, 6vw, 60px) var(--shadow-dark, rgba(0, 0, 0, 0.3));
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text, #5D4037);
}

.modal-content {
  padding: clamp(20px, 3vw, 40px);
}

/* Информация о балансе */
.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(20px, 3vw, 30px);
  padding: clamp(15px, 2vw, 25px);
  background: var(--gradient-bg, linear-gradient(135deg, #F4E6D1 0%, #E6D3B7 100%));
  border-radius: clamp(10px, 1.5vw, 15px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-buttons, #C85A54);
}

.balance-label {
  font-size: clamp(1rem, 2vw, 1.4rem);
  font-weight: 700;
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
}

.balance-value {
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  font-weight: 900;
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
}

/* Секция категорий */
.categories-section {
  margin-bottom: clamp(25px, 4vw, 35px);
}

.categories-section h3 {
  margin: 0 0 clamp(15px, 2vw, 20px) 0;
  font-size: clamp(1.1rem, 2.2vw, 1.6rem);
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
}

.categories-tabs {
  display: flex;
  gap: clamp(10px, 1.5vw, 15px);
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.2vw, 12px);
  padding: clamp(10px, 1.5vw, 15px) clamp(15px, 2vw, 20px);
  background: var(--color-bg-menu-light, #F9F1E8);
  border: clamp(2px, 0.3vw, 3px) solid var(--color-buttons-light, #D4824A);
  border-radius: clamp(8px, 1.2vw, 12px);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
}

.category-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium, rgba(0,0,0,0.2));
}

.category-tab.active {
  background: var(--gradient-accents, linear-gradient(135deg, #C85A54 0%, #D4824A 100%));
  color: white;
  border-color: var(--color-accents, #C85A54);
}

.category-icon {
  font-size: clamp(1.2rem, 2.2vw, 1.6rem);
}

.category-name {
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  font-weight: 700;
}

/* Секция материалов */
.materials-section h3 {
  margin: 0 0 clamp(20px, 3vw, 30px) 0;
  font-size: clamp(1.1rem, 2.2vw, 1.6rem);
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: clamp(20px, 3vw, 25px);
}

/* Карточка материала */
.material-card {
  background: white;
  border-radius: clamp(12px, 2vw, 18px);
  padding: clamp(20px, 3vw, 25px);
  border: clamp(2px, 0.3vw, 3px) solid var(--color-buttons-light, #D4824A);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-light, rgba(0,0,0,0.1));
  transition: all 0.3s ease;
}

.material-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 clamp(6px, 1.2vw, 12px) clamp(12px, 2.4vw, 24px) var(--shadow-medium, rgba(0,0,0,0.2));
}

.material-header {
  display: flex;
  align-items: flex-start;
  gap: clamp(15px, 2vw, 20px);
  margin-bottom: clamp(15px, 2vw, 20px);
}

.material-icon {
  font-size: clamp(2rem, 4vw, 2.5rem);
  filter: drop-shadow(0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium, rgba(0,0,0,0.2)));
}

.material-info {
  flex: 1;
}

.material-name {
  margin: 0 0 clamp(6px, 1vw, 10px) 0;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 900;
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
}

.material-description {
  margin: 0;
  font-size: clamp(0.9rem, 1.6vw, 1.1rem);
  color: var(--color-text, #5D4037);
  opacity: 0.8;
  line-height: 1.4;
}

.material-price {
  text-align: right;
}

.price-value {
  display: block;
  font-size: clamp(1.2rem, 2.2vw, 1.6rem);
  font-weight: 900;
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
}

.price-per-unit {
  display: block;
  font-size: clamp(0.8rem, 1.4vw, 1rem);
  color: var(--color-text, #5D4037);
  opacity: 0.7;
  font-family: 'Orbitron', sans-serif;
}

.material-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: clamp(8px, 1.2vw, 12px);
  margin-bottom: clamp(15px, 2vw, 20px);
  padding: clamp(10px, 1.5vw, 15px);
  background: var(--color-bg-menu-light, #F9F1E8);
  border-radius: clamp(8px, 1.2vw, 12px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons-light, #D4824A);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(4px, 0.8vw, 6px);
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.stat-label {
  font-size: clamp(0.7rem, 1.2vw, 0.9rem);
  color: var(--color-text, #5D4037);
  opacity: 0.7;
  font-family: 'Orbitron', sans-serif;
  text-align: center;
  line-height: 1.2;
}

.stat-value {
  font-size: clamp(0.9rem, 1.6vw, 1.1rem);
  font-weight: 700;
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
}

.material-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: clamp(15px, 2vw, 20px);
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.2vw, 12px);
  background: var(--color-bg-menu-light, #F9F1E8);
  border-radius: clamp(8px, 1.2vw, 12px);
  padding: clamp(6px, 1vw, 8px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons-light, #D4824A);
}

.qty-btn {
  width: clamp(28px, 4.5vw, 36px);
  height: clamp(28px, 4.5vw, 36px);
  border: none;
  background: var(--gradient-accents, linear-gradient(135deg, #C85A54 0%, #D4824A 100%));
  color: white;
  border-radius: 50%;
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium, rgba(0,0,0,0.2));
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-value {
  min-width: clamp(24px, 4vw, 32px);
  text-align: center;
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  font-weight: 700;
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
}

.buy-btn {
  flex: 1;
  padding: clamp(10px, 1.5vw, 15px) clamp(15px, 2.5vw, 25px);
  background: var(--gradient-buttons, linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%));
  color: white;
  border: none;
  border-radius: clamp(8px, 1.2vw, 12px);
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium, rgba(0,0,0,0.2));
}

.buy-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-dark, rgba(0,0,0,0.3));
}

.buy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #9E9E9E;
}

/* Адаптивность */
@media (max-width: 768px) {
  .shop-modal {
    width: 98%;
    height: 95vh;
  }
  
  .materials-grid {
    grid-template-columns: 1fr;
  }
  
  .material-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .categories-tabs {
    justify-content: center;
  }
}
</style>
