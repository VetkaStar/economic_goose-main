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
              <div class="meta" v-if="m.quality">{{ m.quality }}%</div>
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
        <div class="hint">До аренды склада все покупки и изделия будут попадать сюда автоматически.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePantryStore } from '@/stores/pantryStore'
import { useCompanyStore } from '@/stores/companyStore'

defineEmits<{ close: [] }>()

const pantry = usePantryStore()
const company = useCompanyStore()

const { materials, products, materialsSlots, productsSlots, materialsUsedSlots, productsUsedSlots } = storeToRefs(pantry)
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
.slot { display:flex; align-items:center; gap:8px; background: var(--color-bg-menu-light); border: 2px solid var(--color-buttons); border-radius: 10px; padding: 8px; }
.icon { font-size: 20px; width: 28px; text-align:center; }
.name { color: var(--color-text); font-weight:600; flex:1; }
.qty { color:#555; font-weight:600; }
.meta { color:#777; font-size: 12px; }
.footer { padding: 10px 12px; border-top: 2px solid var(--color-buttons); color: var(--color-text); border-radius: 0 0 14px 14px; background: var(--color-bg-menu); }
.hint { opacity:.9; }
</style>


