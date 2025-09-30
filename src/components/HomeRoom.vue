<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="room-modal">
      <div class="room-header">
        <h2 class="title">▲ Дом гуся</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="room-content">
        <!-- Сцена комнаты -->
        <div class="scene">
          <div class="machine" @click="showConstructor = true">Швейная машинка</div>
          <div class="laptop" @click="showSocial = true">Компьютер</div>
          <div class="shelves" @click="showPantry = true">Кладовая</div>
        </div>

        <!-- Правая панель статусов -->
        <div class="side-panel">
          <div class="card">
            <div class="card-title">Состояние</div>
            <div class="row">
              <span>Деньги</span>
              <strong>₽{{ money.toLocaleString() }}</strong>
            </div>
            <div class="row">
              <span>Уровень компании</span>
              <strong>{{ companyLevel }}</strong>
            </div>
            <div class="row">
              <span>Материалы</span>
              <strong>{{ materialsTotal }}</strong>
            </div>
          </div>

          <div class="actions">
            <button class="btn primary" @click="showConstructor = true">Открыть конструктор</button>
          </div>
        </div>
      </div>

      <ClothesConstructor v-if="showConstructor" @close="showConstructor = false" />
      <PantryModal v-if="showPantry" @close="showPantry = false" />
      <SocialNetworkModal v-if="showSocial" @close="showSocial = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'
import { useWarehouseStore } from '@/stores/warehouseStore'
import ClothesConstructor from './ClothesConstructor.vue'
import PantryModal from './PantryModal.vue'
import SocialNetworkModal from './SocialNetworkModal.vue'

const auth = useAuthStore()
const company = useCompanyStore()
const warehouse = useWarehouseStore()

const money = computed(() => auth.user?.money ?? 0)
const companyLevel = computed(() => company.state.progress.level)
const materialsTotal = computed(() => warehouse.materialsTotal)

const showConstructor = ref(false)
const showPantry = ref(false)
const showSocial = ref(false)
</script>

<style scoped>
@import '@/styles/colors.css';

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}
.room-modal {
  width: 1000px;
  height: 700px;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 15px;
  box-shadow: 0 8px 16px var(--shadow-medium);
  display: flex;
  flex-direction: column;
}
.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
  border-radius: 15px 15px 0 0;
}
.title { color: var(--color-text); font-weight: 700; text-shadow: 2px 2px 0 var(--shadow-light); }
.close-btn {
  background: var(--color-buttons);
  border: 2px solid var(--color-accents);
  border-radius: 12px;
  color: var(--color-text);
  padding: 8px 12px;
}
.room-content { display: flex; flex: 1; }
.scene {
  flex: 1;
  background: linear-gradient(180deg, #e9efe9 0%, #dfe6d0 100%);
  position: relative;
  overflow: hidden;
}
.machine, .laptop, .shelves {
  position: absolute; padding: 10px 14px; border: 2px solid var(--color-buttons);
  background: var(--color-bg-menu); color: var(--color-text);
  border-radius: 12px; cursor: pointer; box-shadow: 0 2px 4px var(--shadow-light);
}
.machine { left: 80px; bottom: 120px; }
.laptop { right: 120px; bottom: 140px; }
.shelves { left: 180px; top: 120px; }
.side-panel { width: 320px; padding: 16px; background: var(--color-bg-menu-light); border-left: 2px solid var(--color-buttons); }
.card { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 12px; padding: 12px; margin-bottom: 12px; }
.card-title { color: var(--color-text); font-weight: 700; margin-bottom: 8px; }
.row { display: flex; justify-content: space-between; color: var(--color-text); margin: 4px 0; }
.actions { display: grid; gap: 8px; }
.btn { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); color: var(--color-text); padding: 10px; border-radius: 10px; }
.btn.primary { background: var(--color-accents); border-color: var(--color-highlights); }
</style>


