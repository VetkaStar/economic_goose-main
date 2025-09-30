<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="pantry-modal">
      <div class="header">
        <h2>🗄️ Кладовая дома</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="content">
        <div class="column">
          <div class="section-title">🧵 Материалы ({{ materialsUsedSlots }}/{{ materialsSlots }})</div>
          <div v-if="materials.length === 0" class="empty">Пусто</div>
          <div class="grid">
            <div v-for="m in materials" :key="m.id" class="slot">
              <div class="icon">{{ m.icon || '🧵' }}</div>
              <div class="name">{{ m.name }}</div>
              <div class="qty">x{{ m.quantity }}</div>
              <div class="stats">
                <div v-if="m.quality !== null && m.quality !== undefined" class="stat">Качество: {{ m.quality }}%</div>
                <div v-if="m.durability !== null && m.durability !== undefined" class="stat">🛡️ Прочность: {{ m.durability }}/10</div>
                <div v-if="m.comfort !== null && m.comfort !== undefined" class="stat">😌 Комфорт: {{ m.comfort }}/10</div>
                <div v-if="m.style !== null && m.style !== undefined" class="stat">✨ Стиль: {{ m.style }}/10</div>
              </div>
              <button 
                v-if="company.isWarehouseAvailable" 
                class="transfer-btn" 
                @click="transferMaterial(m.id, m.quantity)"
                :disabled="transferring"
              >
                📦
              </button>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="section-title">👕 Изделия ({{ productsUsedSlots }}/{{ productsSlots }})</div>
          <div v-if="products.length === 0" class="empty">Пусто</div>
          <div class="grid">
            <div v-for="p in products" :key="p.id" class="slot">
              <div class="icon">{{ p.icon || '👕' }}</div>
              <div class="name">{{ p.name }}</div>
              <div class="qty">x{{ p.quantity }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="hint" v-if="!company.isWarehouseAvailable">
          До аренды склада все покупки и изделия будут попадать сюда автоматически.
        </div>
        <div class="hint" v-else>
          Склад арендован! Используйте кнопку 📦 для переноса материалов на склад.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePantryStore } from '@/stores/pantryStore'
import { useCompanyStore } from '@/stores/companyStore'

defineEmits<{ close: [] }>()

const pantry = usePantryStore()
const company = useCompanyStore()

const { materials, products, materialsSlots, productsSlots, materialsUsedSlots, productsUsedSlots } = storeToRefs(pantry)

const transferring = ref(false)

const transferMaterial = async (materialId: string, quantity: number) => {
  if (transferring.value) return

  transferring.value = true
  try {
    const success = await pantry.transferMaterialToWarehouse(materialId, quantity)
    if (success) {
      console.log(`✅ Материал перенесен на склад`)
    } else {
      console.log(`❌ Ошибка при переносе материала`)
    }
  } catch (error) {
    console.error('Ошибка при переносе материала:', error)
  } finally {
    transferring.value = false
  }
}

</script>

<style scoped>
@import '@/styles/colors.css';

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:1000; }
.pantry-modal { width: 900px; max-width: 96vw; background: var(--color-bg-menu-light); border: 2px solid var(--color-buttons); border-radius: 14px; box-shadow: 0 8px 16px var(--shadow-medium); display:flex; flex-direction:column; }
.header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background: var(--color-bg-menu); border-bottom: 2px solid var(--color-buttons); border-radius: 14px 14px 0 0; }
.close-btn { background: var(--color-buttons); border: 2px solid var(--color-accents); border-radius: 10px; color: var(--color-text); padding: 6px 10px; }
.content { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; }
.column { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 12px; padding: 10px; }
.section-title { color: var(--color-text); font-weight: 700; margin-bottom: 8px; }
.empty { color: var(--color-text); opacity: .8; font-style: italic; border: 2px dashed var(--color-buttons); border-radius: 10px; padding: 16px; text-align: center; }
.grid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; }
.slot { display:flex; flex-direction: column; align-items:center; gap:8px; background: var(--color-bg-menu-light); border: 2px solid var(--color-buttons); border-radius: 10px; padding: 8px; }
.icon { font-size: 20px; width: 28px; text-align:center; }
.name { color: var(--color-text); font-weight:600; flex:1; }
.qty { color:#555; font-weight:600; }
.stats {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #666;
}

.stat {
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.stat:last-child {
  margin-bottom: 0;
}
.transfer-btn { background: var(--color-accents); border: 2px solid var(--color-buttons); border-radius: 8px; color: var(--color-text); padding: 4px 8px; font-size: 16px; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; }
.transfer-btn:hover:not(:disabled) { background: var(--color-buttons); transform: scale(1.05); }
.transfer-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.footer { padding: 10px 12px; border-top: 2px solid var(--color-buttons); color: var(--color-text); border-radius: 0 0 14px 14px; background: var(--color-bg-menu); }
.hint { opacity:.9; }
</style>


