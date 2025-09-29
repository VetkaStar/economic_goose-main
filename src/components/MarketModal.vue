<template>
  <div class="market-modal-overlay" @click="closeModal">
    <div class="market-modal" @click.stop>
      <!-- Заголовок -->
      <div class="market-header">
        <h2>🛒 Рынок "Ткани"</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- Основной контент -->
      <div class="market-content">
        <!-- Левая панель - Товары -->
        <div class="products-panel">
          <h3>🧵 Материалы для закупки</h3>
          
          <div class="products-grid">
            <div v-for="product in products" :key="product.id" class="product-item">
              <div class="product-icon">{{ product.icon }}</div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-description">{{ product.description }}</div>
                <div class="product-price">{{ product.price.toLocaleString() }}₽ за {{ product.unit }}</div>
                <div class="product-stock">В наличии: {{ product.stock }} {{ product.unit }}</div>
              </div>
              <div class="product-actions">
                <div class="quantity-controls">
                  <button @click="decreaseQuantity(product.id)" class="qty-btn">-</button>
                  <span class="quantity">{{ getQuantity(product.id) }}</span>
                  <button @click="increaseQuantity(product.id)" class="qty-btn">+</button>
                </div>
                <button @click="addToCart(product.id)" class="add-to-cart-btn" :disabled="getQuantity(product.id) === 0">
                  В корзину
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Правая панель - Корзина и информация -->
        <div class="cart-panel">
          <!-- Корзина -->
          <div class="cart-section">
            <h3>🛒 Корзина</h3>
            <div v-if="cartItems.length === 0" class="empty-cart">
              Корзина пуста
            </div>
            <div v-else class="cart-items">
              <div v-for="item in cartItems" :key="item.id" class="cart-item">
                <div class="cart-item-info">
                  <div class="cart-item-name">{{ item.name }}</div>
                  <div class="cart-item-qty">{{ item.quantity }} {{ item.unit }}</div>
                </div>
                <div class="cart-item-price">{{ (item.quantity * item.price).toLocaleString() }}₽</div>
                <button @click="removeFromCart(item.id)" class="remove-btn">×</button>
              </div>
            </div>
            <div v-if="cartItems.length > 0" class="cart-total">
              <div class="total-label">Итого:</div>
              <div class="total-amount">{{ cartTotal.toLocaleString() }}₽</div>
            </div>
            <button v-if="cartItems.length > 0" @click="checkout" class="checkout-btn">
              💳 Оформить заказ
            </button>
          </div>

          <!-- Информация о рынке -->
          <div class="market-info">
            <h3>📊 Информация о рынке</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Режим работы:</span>
                <span class="info-value">8:00 - 20:00</span>
              </div>
              <div class="info-item">
                <span class="info-label">Доставка:</span>
                <span class="info-value">Бесплатно от 10,000₽</span>
              </div>
              <div class="info-item">
                <span class="info-label">Скидка постоянным клиентам:</span>
                <span class="info-value">5%</span>
              </div>
              <div class="info-item">
                <span class="info-label">Гарантия качества:</span>
                <span class="info-value">30 дней</span>
              </div>
            </div>
          </div>

          <!-- Поставщики -->
          <div class="suppliers-section">
            <h3>🏭 Поставщики</h3>
            <div class="suppliers-list">
              <div v-for="supplier in suppliers" :key="supplier.id" class="supplier-item">
                <div class="supplier-info">
                  <div class="supplier-name">{{ supplier.name }}</div>
                  <div class="supplier-rating">⭐ {{ supplier.rating }}/5</div>
                  <div class="supplier-specialty">{{ supplier.specialty }}</div>
                </div>
                <div class="supplier-actions">
                  <button @click="viewSupplier(supplier.id)" class="view-supplier-btn">
                    👁️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  close: []
}>()

// Товары на рынке
const products = ref([
  {
    id: 1,
    name: 'Хлопок',
    description: 'Высококачественный хлопок',
    icon: '🧵',
    price: 500,
    unit: 'метр',
    stock: 1000
  },
  {
    id: 2,
    name: 'Шелк',
    description: 'Натуральный шелк премиум класса',
    icon: '🕸️',
    price: 2000,
    unit: 'метр',
    stock: 200
  },
  {
    id: 3,
    name: 'Джинсовая ткань',
    description: 'Прочная джинсовая ткань',
    icon: '👖',
    price: 800,
    unit: 'метр',
    stock: 500
  },
  {
    id: 4,
    name: 'Пуговицы',
    description: 'Различные размеры и цвета',
    icon: '🔘',
    price: 50,
    unit: 'шт',
    stock: 2000
  },
  {
    id: 5,
    name: 'Молнии',
    description: 'Металлические и пластиковые',
    icon: '⚡',
    price: 100,
    unit: 'шт',
    stock: 500
  },
  {
    id: 6,
    name: 'Нитки',
    description: 'Прочные швейные нитки',
    icon: '🧶',
    price: 30,
    unit: 'катушка',
    stock: 1000
  },
  {
    id: 7,
    name: 'Подкладка',
    description: 'Ткань для подкладки',
    icon: '📋',
    price: 300,
    unit: 'метр',
    stock: 300
  },
  {
    id: 8,
    name: 'Фурнитура',
    description: 'Крючки, кнопки, застежки',
    icon: '🔗',
    price: 200,
    unit: 'набор',
    stock: 100
  }
])

// Поставщики
const suppliers = ref([
  {
    id: 1,
    name: 'Ткани+',
    rating: 4.8,
    specialty: 'Хлопок, лен'
  },
  {
    id: 2,
    name: 'Шелк Премиум',
    rating: 4.9,
    specialty: 'Шелк, атлас'
  },
  {
    id: 3,
    name: 'Джинс Мастер',
    rating: 4.6,
    specialty: 'Джинсовые ткани'
  },
  {
    id: 4,
    name: 'Фурнитура Про',
    rating: 4.7,
    specialty: 'Фурнитура, аксессуары'
  }
])

// Корзина
const cartItems = ref([])
const quantities = ref({})

// Функции для работы с корзиной
const getQuantity = (productId: number) => {
  return quantities.value[productId] || 0
}

const increaseQuantity = (productId: number) => {
  const product = products.value.find(p => p.id === productId)
  if (product && getQuantity(productId) < product.stock) {
    quantities.value[productId] = (quantities.value[productId] || 0) + 1
  }
}

const decreaseQuantity = (productId: number) => {
  if (getQuantity(productId) > 0) {
    quantities.value[productId] = quantities.value[productId] - 1
  }
}

const addToCart = (productId: number) => {
  const product = products.value.find(p => p.id === productId)
  const quantity = getQuantity(productId)
  
  if (product && quantity > 0) {
    const existingItem = cartItems.value.find(item => item.id === productId)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cartItems.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        unit: product.unit
      })
    }
    
    // Обновляем остатки
    product.stock -= quantity
    quantities.value[productId] = 0
  }
}

const removeFromCart = (itemId: number) => {
  const item = cartItems.value.find(i => i.id === itemId)
  if (item) {
    // Возвращаем товар на склад
    const product = products.value.find(p => p.id === itemId)
    if (product) {
      product.stock += item.quantity
    }
    
    // Удаляем из корзины
    cartItems.value = cartItems.value.filter(i => i.id !== itemId)
  }
}

const checkout = () => {
  if (cartItems.value.length > 0) {
    const total = cartTotal.value
    alert(`Заказ оформлен! Сумма: ${total.toLocaleString()}₽\nТовары будут доставлены на склад.`)
    cartItems.value = []
  }
}

const viewSupplier = (supplierId: number) => {
  const supplier = suppliers.value.find(s => s.id === supplierId)
  if (supplier) {
    alert(`Поставщик: ${supplier.name}\nРейтинг: ${supplier.rating}/5\nСпециализация: ${supplier.specialty}`)
  }
}

// Вычисляемые свойства
const cartTotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.quantity * item.price), 0)
})

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.market-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: 'Orbitron', sans-serif;
}

.market-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border: 4px solid var(--color-text, #5D4037);
  border-radius: 20px;
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.market-header {
  background: var(--gradient-accents, linear-gradient(135deg, #FFC107, #FF9800));
  color: white;
  padding: 20px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.market-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.market-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.products-panel {
  flex: 1;
  padding: 20px;
  border-right: 2px solid var(--color-text, #5D4037);
  overflow-y: auto;
}

.cart-panel {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.products-panel h3,
.cart-panel h3 {
  color: var(--color-text, #5D4037);
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 700;
}

.products-grid {
  display: grid;
  gap: 15px;
}

.product-item {
  background: white;
  border: 2px solid var(--color-buttons, #D4824A);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.product-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.product-icon {
  font-size: 32px;
  width: 50px;
  text-align: center;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: var(--color-text, #5D4037);
  font-size: 16px;
  margin-bottom: 5px;
}

.product-description {
  color: #666;
  font-size: 12px;
  margin-bottom: 5px;
}

.product-price {
  color: var(--color-accents, #C85A54);
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 2px;
}

.product-stock {
  color: #4CAF50;
  font-size: 12px;
  font-weight: 600;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-btn {
  background: var(--color-buttons, #D4824A);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.qty-btn:hover {
  background: var(--color-accents, #C85A54);
  transform: scale(1.1);
}

.quantity {
  font-weight: 600;
  color: var(--color-text, #5D4037);
  min-width: 20px;
  text-align: center;
}

.add-to-cart-btn {
  background: var(--gradient-accents, linear-gradient(135deg, #4CAF50, #8BC34A));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 15px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.add-to-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cart-section {
  margin-bottom: 25px;
}

.empty-cart {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--color-buttons, #D4824A);
}

.cart-items {
  margin-bottom: 15px;
}

.cart-item {
  background: white;
  border: 1px solid var(--color-buttons, #D4824A);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-weight: 600;
  color: var(--color-text, #5D4037);
  font-size: 14px;
}

.cart-item-qty {
  color: #666;
  font-size: 12px;
}

.cart-item-price {
  color: var(--color-accents, #C85A54);
  font-weight: 700;
  font-size: 14px;
  margin-right: 10px;
}

.remove-btn {
  background: #F44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-total {
  background: var(--gradient-accents, linear-gradient(135deg, #4CAF50, #8BC34A));
  color: white;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 15px;
}

.checkout-btn {
  background: var(--gradient-buttons, linear-gradient(135deg, #D4824A, #C85A54));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.info-grid {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--color-buttons, #D4824A);
}

.info-label {
  font-weight: 600;
  color: var(--color-text, #5D4037);
}

.info-value {
  color: var(--color-accents, #C85A54);
  font-weight: 700;
}

.suppliers-section {
  margin-bottom: 20px;
}

.suppliers-list {
  display: grid;
  gap: 10px;
}

.supplier-item {
  background: white;
  border: 1px solid var(--color-buttons, #D4824A);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.supplier-info {
  flex: 1;
}

.supplier-name {
  font-weight: 600;
  color: var(--color-text, #5D4037);
  font-size: 14px;
  margin-bottom: 2px;
}

.supplier-rating {
  color: #FFC107;
  font-size: 12px;
  margin-bottom: 2px;
}

.supplier-specialty {
  color: #666;
  font-size: 12px;
}

.supplier-actions {
  margin-left: 10px;
}

.view-supplier-btn {
  background: var(--color-highlights, #81C4E7);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.view-supplier-btn:hover {
  background: var(--color-accents, #C85A54);
}

/* Адаптивность */
@media (max-width: 768px) {
  .market-modal {
    width: 95vw;
    height: 90vh;
  }
  
  .market-content {
    flex-direction: column;
  }
  
  .products-panel {
    border-right: none;
    border-bottom: 2px solid var(--color-text, #5D4037);
  }
}
</style>
