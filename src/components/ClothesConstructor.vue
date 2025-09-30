<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="constructor-modal">
      <div class="modal-header">
        <h2 class="modal-title">◉ Конструктор одежды</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="left-preview">
          <div class="preview-area">
            <div class="shape" :class="design.base"></div>
            <div class="label">{{ baseLabel }} — {{ colorLabel }} — {{ patternLabel }}</div>
          </div>
          <div class="controls">
            <button class="btn" @click="ensureMaterials">Проверить материалы</button>
          </div>
        </div>

        <div class="right-controls">
          <div class="section">
            <div class="section-title">Базовые элементы</div>
            <div class="grid">
              <button class="pill" :class="{active: design.base==='tshirt'}" @click="design.base='tshirt'">Футболка</button>
              <button class="pill" :class="{active: design.base==='shirt'}" @click="design.base='shirt'">Рубашка</button>
              <button class="pill" :class="{active: design.base==='dress'}" @click="design.base='dress'">Платье</button>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Цвет</div>
            <div class="grid">
              <button class="dot red" :class="{active: design.color==='red'}" @click="design.color='red'"></button>
              <button class="dot blue" :class="{active: design.color==='blue'}" @click="design.color='blue'"></button>
              <button class="dot green" :class="{active: design.color==='green'}" @click="design.color='green'"></button>
              <button class="dot orange" :class="{active: design.color==='orange'}" @click="design.color='orange'"></button>
              <button class="dot purple" :class="{active: design.color==='purple'}" @click="design.color='purple'"></button>
              <button class="dot gray" :class="{active: design.color==='gray'}" @click="design.color='gray'"></button>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Узор</div>
            <div class="grid">
              <button class="pill" :class="{active: design.pattern==='plain'}" @click="design.pattern='plain'">Однотонный</button>
              <button class="pill" :class="{active: design.pattern==='dots'}" @click="design.pattern='dots'">Горошек</button>
              <button class="pill" :class="{active: design.pattern==='stripes'}" @click="design.pattern='stripes'">Полоски</button>
              <button class="pill" :class="{active: design.pattern==='flowers'}" @click="design.pattern='flowers'">Цветы</button>
            </div>
          </div>

          <div class="section card">
            <div class="row"><span>Себестоимость:</span><strong>₽{{ cost }}</strong></div>
            <div class="row"><span>Реком. цена:</span><strong>₽{{ price }}</strong></div>
            <div class="row"><span>Прогноз спроса:</span><strong>{{ demandLabel }}</strong></div>
            <button class="btn primary" @click="createItem" :disabled="missing.length>0">Создать товар</button>
            <div v-if="missing.length>0" class="notice">
              Не хватает: {{ missingLabels.join(', ') }}
              <div class="actions">
                <button class="btn" @click="$emit('openSupplies')">Купить у поставщика</button>
                <button class="btn" @click="$emit('openAuction')">Открыть аукцион</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useWarehouseStore } from '@/stores/warehouseStore'
import { useCompanyStore } from '@/stores/companyStore'

const emit = defineEmits<{ close: []; openSupplies: []; openAuction: [] }>()
const warehouse = useWarehouseStore()
const company = useCompanyStore()

type Base = 'tshirt'|'shirt'|'dress'
type Color = 'red'|'blue'|'green'|'orange'|'purple'|'gray'
type Pattern = 'plain'|'dots'|'stripes'|'flowers'

const design = reactive<{ base: Base; color: Color; pattern: Pattern }>({
  base: 'shirt', color: 'blue', pattern: 'dots'
})

// Требования материалов (v1): ткань + краситель
const requirements = computed(() => ({
  fabric: 3, // метры
  dye: 1,    // условная единица
}))

const has = computed(() => ({
  fabric: (warehouse.materials.find(m => m.name.toLowerCase().includes('ткан'))?.quantity || 0),
  dye: (warehouse.materials.find(m => m.name.toLowerCase().includes('красител'))?.quantity || 0),
}))

const missing = computed(() => {
  const miss: string[] = []
  if (has.value.fabric < requirements.value.fabric) miss.push('ткань')
  if (has.value.dye < requirements.value.dye) miss.push('краситель')
  return miss
})

const cost = computed(() => {
  const fabricPrice = warehouse.materials.find(m => m.name.toLowerCase().includes('ткан'))?.price || 200
  const dyePrice = warehouse.materials.find(m => m.name.toLowerCase().includes('красител'))?.price || 50
  return Math.round(requirements.value.fabric * Number(fabricPrice) + requirements.value.dye * Number(dyePrice))
})

const price = computed(() => Math.round(cost.value * 2.5))
const demandLabel = computed(() => {
  const lvl = company.state.progress.level
  return lvl <= 1 ? 'Средний' : lvl <= 3 ? 'Высокий' : 'Очень высокий'
})

const baseLabel = computed(() => ({ tshirt: 'Футболка', shirt: 'Рубашка', dress: 'Платье' }[design.base]))
const colorLabel = computed(() => ({ red: 'Красный', blue: 'Синий', green: 'Зелёный', orange: 'Оранжевый', purple: 'Фиолетовый', gray: 'Серый' }[design.color]))
const patternLabel = computed(() => ({ plain: 'Однотонный', dots: 'Горошек', stripes: 'Полоски', flowers: 'Цветы' }[design.pattern]))
const missingLabels = computed(() => missing.value)

function ensureMaterials() {
  if (missing.value.length === 0) return
  // Предложить способы пополнения материалов
}

function createItem() {
  if (missing.value.length > 0) return
  // Здесь: списать материалы и создать заказ на пошив (в Доме — медленнее)
  company.addCompanyExp(5)
  emit('close')
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); }
.constructor-modal { width: 1000px; height: 700px; background: var(--color-bg-menu-light); border: 2px solid var(--color-buttons); border-radius: 15px; box-shadow: 0 8px 16px var(--shadow-medium); display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; background: var(--color-bg-menu); border-bottom: 2px solid var(--color-buttons); border-radius: 15px 15px 0 0; }
.modal-title { color: var(--color-text); font-weight: 700; text-shadow: 2px 2px 0 var(--shadow-light); }
.close-btn { background: var(--color-buttons); border: 2px solid var(--color-accents); border-radius: 12px; color: var(--color-text); padding: 8px 12px; }
.modal-body { flex: 1; display: grid; grid-template-columns: 1fr 420px; gap: 16px; padding: 16px; }
.left-preview { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; }
.preview-area { flex: 1; background: var(--color-bg-menu-light); border: 2px solid var(--color-buttons); border-radius: 12px; display: flex; align-items: center; justify-content: center; position: relative; }
.label { position: absolute; bottom: 8px; left: 8px; color: var(--color-text); opacity: .9; }
.shape { width: 220px; height: 280px; border-radius: 12px; background: #4c84ff; }
.shape.tshirt { border-radius: 12px 12px 40px 40px; }
.shape.shirt { clip-path: polygon(25% 10%, 75% 10%, 75% 60%, 85% 60%, 85% 75%, 15% 75%, 15% 60%, 25% 60%); }
.shape.dress { clip-path: polygon(35% 10%, 65% 10%, 80% 70%, 20% 70%); }
.controls { margin-top: 12px; display: flex; gap: 8px; }
.right-controls { display: grid; gap: 12px; }
.section { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 12px; padding: 12px; }
.section-title { color: var(--color-text); font-weight: 700; margin-bottom: 8px; }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; }
.pill { background: var(--color-bg-menu-light); border: 2px solid var(--color-buttons); color: var(--color-text); padding: 8px; border-radius: 10px; }
.pill.active { background: var(--color-accents); border-color: var(--color-highlights); }
.dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--color-buttons); }
.dot.red{background:#e74c3c}.dot.blue{background:#4c84ff}.dot.green{background:#27ae60}.dot.orange{background:#f39c12}.dot.purple{background:#8e44ad}.dot.gray{background:#7f8c8d}
.card { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); border-radius: 12px; padding: 12px; }
.row { display: flex; justify-content: space-between; color: var(--color-text); margin: 4px 0; }
.btn { background: var(--color-bg-menu); border: 2px solid var(--color-buttons); color: var(--color-text); padding: 10px; border-radius: 10px; }
.btn.primary { background: var(--color-accents); border-color: var(--color-highlights); }
.notice { margin-top: 8px; color: var(--color-text); opacity: .9; }
.actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
</style>


