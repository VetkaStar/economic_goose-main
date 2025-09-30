<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal market-modal">
      <div class="modal-header">
        <h2 class="menu-title">🏪 Рынок</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="modal-content">
        <div class="day-info">
          <span class="day-label">День {{ traderStore.currentDay }}</span>
        </div>

        <div class="traders-section">
          <h3>🛒 Активные торговцы</h3>
          
          <div v-if="traderStore.activeTraders.length === 0" class="no-traders">
            <p>Сегодня торговцев нет. Попробуйте завтра!</p>
          </div>
          
          <div v-else class="traders-list">
            <div 
              v-for="trader in traderStore.activeTraders" 
              :key="trader.id"
              class="trader-card"
            >
              <div class="trader-header">
                <span class="trader-icon">{{ trader.icon }}</span>
                <div class="trader-details">
                  <h4 class="trader-name">{{ trader.name }}</h4>
                  <p class="trader-description">{{ trader.description }}</p>
                </div>
              </div>
              
              <div class="trader-materials">
                <h5>Товары:</h5>
                <div class="materials-grid">
                  <div 
                    v-for="material in trader.materials" 
                    :key="material.id"
                    class="material-card"
                  >
                    <div class="material-header">
                      <span class="material-icon">{{ material.icon }}</span>
                      <span class="material-name">{{ material.name }}</span>
                    </div>
                    
                    <p class="material-description">{{ material.description }}</p>
                    
                    <div class="material-stats">
                      <div class="stat-row">
                        <span class="stat-label">Цена:</span>
                        <span class="stat-value">₽{{ material.basePrice.toLocaleString() }}</span>
                      </div>
                      <div class="stat-row">
                        <span class="stat-label">В наличии:</span>
                        <span class="stat-value">{{ material.quantity }}/{{ material.maxQuantity }}</span>
                      </div>
                    </div>
                    
                    <div class="material-actions">
                      <button 
                        class="buy-btn"
                        @click="buyMaterial(trader.id, material.id)"
                        :disabled="!canBuy(material)"
                      >
                        Купить за ₽{{ material.basePrice.toLocaleString() }}
                      </button>
                    </div>
                  </div>
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
import { ref, computed, onMounted } from 'vue'
import { useTraderStore } from '@/stores/traderStore'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits<{
  close: []
}>()

const traderStore = useTraderStore()
const authStore = useAuthStore()

const canBuy = (material: any) => {
  return authStore.user?.money >= material.basePrice && material.quantity > 0
}

const buyMaterial = async (traderId: string, materialId: string) => {
  const success = await traderStore.buyMaterial(traderId, materialId, 1)
  
  if (success) {
    console.log(`✅ Куплен материал ${materialId}`)
  } else {
    console.log('❌ Не удалось купить материал')
  }
}

onMounted(() => {
  traderStore.updateActiveTraders()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
@import '@/styles/colors.css';
@import '@/styles/menu-common.css';

.market-modal {
  background: var(--color-bg-menu, #F4E6D1);
  border-radius: clamp(15px, 2vw, 30px);
  max-width: 1200px;
  width: 95%;
  height: 90vh;
  overflow-y: auto;
  box-shadow: 0 clamp(10px, 2vw, 20px) clamp(30px, 6vw, 60px) var(--shadow-dark, rgba(0, 0, 0, 0.3));
  border: clamp(2px, 0.3vw, 4px) solid var(--color-text, #5D4037);
}

.modal-content {
  padding: clamp(20px, 3vw, 40px);
}

.day-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(20px, 3vw, 30px);
  padding: clamp(15px, 2vw, 25px);
  background: var(--gradient-bg, linear-gradient(135deg, #F4E6D1 0%, #E6D3B7 100%));
  border-radius: clamp(10px, 1.5vw, 15px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-buttons, #C85A54);
}

.day-label {
  font-size: clamp(1.2rem, 2.5vw, 2rem);
  font-weight: 900;
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
}

.traders-section h3 {
  margin: 0 0 clamp(15px, 2vw, 25px) 0;
  font-size: clamp(1.1rem, 2.2vw, 1.6rem);
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
}

.no-traders {
  text-align: center;
  padding: clamp(40px, 6vw, 60px);
  color: var(--color-text, #5D4037);
  font-size: clamp(1rem, 2vw, 1.4rem);
  font-family: 'Orbitron', sans-serif;
}

.traders-list {
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 3vw, 30px);
}

.trader-card {
  background: var(--color-bg-menu-light, #F9F1E8);
  border-radius: clamp(12px, 2vw, 20px);
  padding: clamp(20px, 3vw, 30px);
  border: clamp(2px, 0.3vw, 4px) solid var(--color-buttons, #C85A54);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(8px, 1.6vw, 16px) var(--shadow-medium, rgba(0,0,0,0.2));
  transition: all 0.3s ease;
}

.trader-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 clamp(6px, 1.2vw, 12px) clamp(12px, 2.4vw, 24px) var(--shadow-dark, rgba(0,0,0,0.3));
}

.trader-header {
  display: flex;
  gap: clamp(15px, 2vw, 20px);
  margin-bottom: clamp(20px, 3vw, 30px);
}

.trader-icon {
  font-size: clamp(2rem, 4vw, 3rem);
  filter: drop-shadow(0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium, rgba(0,0,0,0.2)));
}

.trader-details {
  flex: 1;
}

.trader-name {
  margin: 0 0 clamp(8px, 1vw, 12px) 0;
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  font-weight: 900;
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
}

.trader-description {
  margin: 0;
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  color: var(--color-text, #5D4037);
  opacity: 0.8;
}

.trader-materials h5 {
  margin: 0 0 clamp(15px, 2vw, 20px) 0;
  font-size: clamp(1rem, 1.8vw, 1.3rem);
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: clamp(15px, 2vw, 20px);
}

.material-card {
  background: white;
  border-radius: clamp(8px, 1.2vw, 12px);
  padding: clamp(15px, 2vw, 20px);
  border: clamp(1px, 0.2vw, 2px) solid var(--color-buttons-light, #D4824A);
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-light, rgba(0,0,0,0.1));
  transition: all 0.3s ease;
}

.material-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-medium, rgba(0,0,0,0.2));
}

.material-header {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.2vw, 12px);
  margin-bottom: clamp(8px, 1vw, 12px);
}

.material-icon {
  font-size: clamp(1.2rem, 2.2vw, 1.6rem);
}

.material-name {
  flex: 1;
  font-size: clamp(0.9rem, 1.6vw, 1.2rem);
  font-weight: 700;
  color: var(--color-text, #5D4037);
  font-family: 'Orbitron', sans-serif;
}

.material-description {
  margin: 0 0 clamp(12px, 1.8vw, 18px) 0;
  font-size: clamp(0.8rem, 1.4vw, 1rem);
  color: var(--color-text, #5D4037);
  opacity: 0.8;
  line-height: 1.4;
}

.material-stats {
  margin-bottom: clamp(12px, 1.8vw, 18px);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: clamp(4px, 0.8vw, 6px);
  font-size: clamp(0.8rem, 1.4vw, 1rem);
  font-family: 'Orbitron', sans-serif;
}

.stat-label {
  color: var(--color-text, #5D4037);
  opacity: 0.7;
}

.stat-value {
  font-weight: 700;
  color: var(--color-text, #5D4037);
}

.material-actions {
  display: flex;
  justify-content: center;
}

.buy-btn {
  padding: clamp(8px, 1.2vw, 12px) clamp(12px, 2vw, 18px);
  background: var(--gradient-buttons, linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%));
  color: white;
  border: none;
  border-radius: clamp(6px, 1vw, 8px);
  font-size: clamp(0.8rem, 1.4vw, 1rem);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  box-shadow: 0 clamp(2px, 0.4vw, 4px) clamp(4px, 0.8vw, 8px) var(--shadow-medium, rgba(0,0,0,0.2));
}

.buy-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 clamp(4px, 0.8vw, 8px) clamp(6px, 1.2vw, 12px) var(--shadow-dark, rgba(0,0,0,0.3));
}

.buy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #9E9E9E;
}

@media (max-width: 768px) {
  .market-modal {
    width: 98%;
    height: 95vh;
  }
  
  .materials-grid {
    grid-template-columns: 1fr;
  }
}
</style>