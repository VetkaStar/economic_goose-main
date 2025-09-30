<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="constructor-modal">
      <div class="modal-header">
        <h2 class="modal-title">✂️ Конструктор одежды</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Левая панель - превью -->
        <div class="left-preview">
          <div class="preview-area">
            <div class="clothing-preview" :class="[design.type, design.color, design.pattern]">
              <div class="clothing-icon">{{ getClothingIcon() }}</div>
            </div>
            <div class="preview-info">
              <h3>{{ getClothingName() }}</h3>
              <div class="preview-stats">
                <div class="stat">🎨 {{ colorLabel }}</div>
                <div class="stat">🎭 {{ patternLabel }}</div>
                <div class="stat">🧵 {{ materialLabel }}</div>
                <div class="stat">⭐ Качество: {{ design.quality }}%</div>
              </div>
            </div>
          </div>
          
          <div class="materials-check">
            <h4>📦 Материалы</h4>
            <div class="materials-list">
              <div v-for="req in materialRequirements" :key="req.name" class="material-item" :class="{ available: req.available, missing: !req.available }">
                <span class="material-icon">{{ req.icon }}</span>
                <span class="material-name">{{ req.name }}</span>
                <span class="material-count">{{ req.have }}/{{ req.need }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Правая панель - настройки -->
        <div class="right-controls">
          <!-- Тип одежды -->
          <div class="section">
            <div class="section-title">👕 Тип одежды</div>
            <div class="grid">
              <button 
                v-for="type in clothingTypes" 
                :key="type.id"
                class="pill" 
                :class="{active: design.type === type.id}" 
                @click="design.type = type.id"
              >
                {{ type.icon }} {{ type.name }}
              </button>
            </div>
          </div>

          <!-- Цвет -->
          <div class="section">
            <div class="section-title">🎨 Цвет</div>
            <div class="color-grid">
              <button 
                v-for="color in colors" 
                :key="color.id"
                class="color-btn" 
                :class="[color.id, {active: design.color === color.id}]" 
                @click="design.color = color.id"
                :title="color.name"
              ></button>
            </div>
          </div>

          <!-- Узор -->
          <div class="section">
            <div class="section-title">🎭 Узор</div>
            <div class="grid">
              <button 
                v-for="pattern in patterns" 
                :key="pattern.id"
                class="pill" 
                :class="{active: design.pattern === pattern.id}" 
                @click="design.pattern = pattern.id"
              >
                {{ pattern.icon }} {{ pattern.name }}
              </button>
            </div>
          </div>

          <!-- Материал -->
          <div class="section">
            <div class="section-title">🧵 Материал</div>
            <div class="materials-grid">
              <button 
                v-for="material in availableMaterials" 
                :key="material.id"
                class="material-btn" 
                :class="{active: design.material === material.id, rare: material.rare}" 
                @click="design.material = material.id"
                :disabled="!material.available"
              >
                <span class="material-icon">{{ material.icon }}</span>
                <span class="material-name">{{ material.name }}</span>
                <span v-if="material.rare" class="rare-badge">✨</span>
              </button>
            </div>
          </div>

          <!-- Качество -->
          <div class="section">
            <div class="section-title">⭐ Качество</div>
            <div class="quality-control">
              <input 
                type="range" 
                v-model.number="design.quality" 
                min="30" 
                max="100" 
                class="quality-slider"
              />
              <div class="quality-value">{{ design.quality }}%</div>
            </div>
            <div class="quality-hint">В разработке - пока демо</div>
          </div>

          <!-- Информация и создание -->
          <div class="section card">
            <div class="cost-info">
              <div class="row"><span>Себестоимость:</span><strong>₽{{ cost }}</strong></div>
              <div class="row"><span>Реком. цена:</span><strong>₽{{ price }}</strong></div>
              <div class="row"><span>Прогноз спроса:</span><strong>{{ demandLabel }}</strong></div>
            </div>
            
            <button 
              class="btn primary create-btn" 
              @click="createItem" 
              :disabled="!canCreate"
            >
              ✂️ Создать одежду
            </button>
            
            <div v-if="!canCreate" class="notice">
              <div class="missing-materials">
                Не хватает материалов:
                <ul>
                  <li v-for="req in materialRequirements.filter(r => !r.available)" :key="req.name">
                    {{ req.icon }} {{ req.name }} (нужно {{ req.need }}, есть {{ req.have }})
                  </li>
                </ul>
              </div>
              <div class="actions">
                <button class="btn" @click="$emit('openSupplies')">🛒 К поставщику</button>
                <button class="btn" @click="$emit('openAuction')">🎯 На аукцион</button>
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
import { usePantryStore } from '@/stores/pantryStore'

const emit = defineEmits<{ close: []; openSupplies: []; openAuction: [] }>()
const warehouse = useWarehouseStore()
const company = useCompanyStore()
const pantry = usePantryStore()

// Типы одежды
const clothingTypes = [
  { id: 'tshirt', name: 'Футболка', icon: '👕' },
  { id: 'shirt', name: 'Рубашка', icon: '👔' },
  { id: 'dress', name: 'Платье', icon: '👗' },
  { id: 'hoodie', name: 'Худи', icon: '🧥' },
  { id: 'pants', name: 'Брюки', icon: '👖' },
  { id: 'skirt', name: 'Юбка', icon: '👗' }
]

// Цвета
const colors = [
  { id: 'red', name: 'Красный' },
  { id: 'blue', name: 'Синий' },
  { id: 'green', name: 'Зелёный' },
  { id: 'yellow', name: 'Жёлтый' },
  { id: 'pink', name: 'Розовый' },
  { id: 'purple', name: 'Фиолетовый' },
  { id: 'orange', name: 'Оранжевый' },
  { id: 'black', name: 'Чёрный' },
  { id: 'white', name: 'Белый' },
  { id: 'gray', name: 'Серый' }
]

// Узоры
const patterns = [
  { id: 'plain', name: 'Однотонный', icon: '⬜' },
  { id: 'dots', name: 'Горошек', icon: '⚫' },
  { id: 'stripes', name: 'Полоски', icon: '〰️' },
  { id: 'flowers', name: 'Цветы', icon: '🌸' },
  { id: 'checkered', name: 'Клетка', icon: '🔲' },
  { id: 'geometric', name: 'Геометрия', icon: '🔷' }
]

// Дизайн одежды
const design = reactive({
  type: 'tshirt',
  color: 'blue',
  pattern: 'plain',
  material: 'cotton',
  quality: 80
})

// Доступные материалы (включая редкие с аукциона)
const availableMaterials = computed(() => {
  const usePantry = !company.canUseWarehouse()
  const materials = usePantry ? pantry.materials : warehouse.materials
  
  const baseMaterials = [
    { id: 'cotton', name: 'Хлопок', icon: '🧵', rare: false, basePrice: 50 },
    { id: 'linen', name: 'Лён', icon: '🌾', rare: false, basePrice: 80 },
    { id: 'wool', name: 'Шерсть', icon: '🐑', rare: false, basePrice: 120 },
    { id: 'silk', name: 'Шёлк', icon: '🕸️', rare: true, basePrice: 300 },
    { id: 'denim', name: 'Джинс', icon: '👖', rare: false, basePrice: 100 },
    { id: 'leather', name: 'Кожа', icon: '🦌', rare: true, basePrice: 500 },
    { id: 'cashmere', name: 'Кашемир', icon: '✨', rare: true, basePrice: 800 },
    { id: 'bamboo', name: 'Бамбук', icon: '🎋', rare: true, basePrice: 200 }
  ]

  return baseMaterials.map(material => {
    const available = materials.some(m => 
      m.name.toLowerCase().includes(material.name.toLowerCase()) && m.quantity > 0
    )
    return {
      ...material,
      available,
      quantity: materials.find(m => 
        m.name.toLowerCase().includes(material.name.toLowerCase())
      )?.quantity || 0
    }
  })
})

// Требования материалов
const materialRequirements = computed(() => {
  const selectedMaterial = availableMaterials.value.find(m => m.id === design.material)
  const usePantry = !company.canUseWarehouse()
  const materials = usePantry ? pantry.materials : warehouse.materials
  
  const requirements = [
    {
      name: selectedMaterial?.name || 'Материал',
      icon: selectedMaterial?.icon || '🧵',
      need: 2,
      have: selectedMaterial?.quantity || 0,
      available: (selectedMaterial?.quantity || 0) >= 2
    },
    {
      name: 'Краситель',
      icon: '🎨',
      need: 1,
      have: materials.find(m => m.name.toLowerCase().includes('красител'))?.quantity || 0,
      available: (materials.find(m => m.name.toLowerCase().includes('красител'))?.quantity || 0) >= 1
    }
  ]

  return requirements
})

const canCreate = computed(() => {
  return materialRequirements.value.every(req => req.available)
})

// Лейблы для отображения
const colorLabel = computed(() => 
  colors.find(c => c.id === design.color)?.name || design.color
)

const patternLabel = computed(() => 
  patterns.find(p => p.id === design.pattern)?.name || design.pattern
)

const materialLabel = computed(() => 
  availableMaterials.value.find(m => m.id === design.material)?.name || design.material
)

// Название и иконка одежды
const getClothingName = () => {
  const type = clothingTypes.find(t => t.id === design.type)?.name || 'Одежда'
  return `${type} ${colorLabel.value} ${patternLabel.value}`
}

const getClothingIcon = () => {
  return clothingTypes.find(t => t.id === design.type)?.icon || '👕'
}

// Стоимость и цена
const cost = computed(() => {
  const selectedMaterial = availableMaterials.value.find(m => m.id === design.material)
  const materialCost = selectedMaterial ? selectedMaterial.basePrice * 2 : 100
  const dyeCost = 30
  const qualityMultiplier = 1 + (design.quality - 50) / 100
  return Math.round((materialCost + dyeCost) * qualityMultiplier)
})

const price = computed(() => {
  const basePrice = cost.value * 2.5
  const qualityBonus = (design.quality - 50) * 2
  const rareBonus = availableMaterials.value.find(m => m.id === design.material)?.rare ? 200 : 0
  return Math.round(basePrice + qualityBonus + rareBonus)
})

const demandLabel = computed(() => {
  const lvl = company.state.progress.level
  return lvl <= 1 ? 'Средний' : lvl <= 3 ? 'Высокий' : 'Очень высокий'
})

// Создание одежды
function createItem() {
  if (!canCreate.value) return
  
  const usePantryDest = !company.canUseWarehouse()
  const selectedMaterial = availableMaterials.value.find(m => m.id === design.material)
  
  // Списание материалов
  if (usePantryDest) {
    // Списываем из кладовой
    const materialOk = pantry.removeMaterialByNameContains(
      selectedMaterial?.name.toLowerCase() || 'материал', 
      2
    )
    const dyeOk = pantry.removeMaterialByNameContains('красител', 1)
    
    if (!materialOk || !dyeOk) return
    
    // Добавляем готовое изделие в кладовую
    pantry.addProduct({
      name: getClothingName(),
      icon: getClothingIcon(),
      price: price.value,
      quantity: 1,
      meta: {
        type: design.type,
        color: design.color,
        pattern: design.pattern,
        material: design.material,
        quality: design.quality,
        rare: selectedMaterial?.rare || false
      }
    })
  } else {
    // Списываем со склада
    const material = warehouse.materials.find(m => 
      m.name.toLowerCase().includes(selectedMaterial?.name.toLowerCase() || '')
    )
    const dye = warehouse.materials.find(m => 
      m.name.toLowerCase().includes('красител')
    )
    
    if (!material || !dye) return
    
    warehouse.updateMaterialQuantity(material.id, -2, 'Пошив в конструкторе')
    warehouse.updateMaterialQuantity(dye.id, -1, 'Пошив в конструкторе')
    
    // TODO: Добавить готовое изделие в warehouse_clothing
  }
  
  company.addCompanyExp(5)
  emit('close')
}
</script>

<style scoped>
@import '@/styles/colors.css';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.constructor-modal {
  background: white;
  border-radius: 12px;
  width: 95vw;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.modal-header {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255,255,255,0.1);
}

.modal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Левая панель - превью */
.left-preview {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: #fafafa;
}

.preview-area {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.clothing-preview {
  width: 150px;
  height: 150px;
  margin: 0 auto 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.clothing-preview.tshirt { background: linear-gradient(135deg, #e3f2fd, #bbdefb); }
.clothing-preview.shirt { background: linear-gradient(135deg, #f3e5f5, #e1bee7); }
.clothing-preview.dress { background: linear-gradient(135deg, #e8f5e8, #c8e6c9); }
.clothing-preview.hoodie { background: linear-gradient(135deg, #fff3e0, #ffcc02); }
.clothing-preview.pants { background: linear-gradient(135deg, #f1f8e9, #dcedc8); }
.clothing-preview.skirt { background: linear-gradient(135deg, #fce4ec, #f8bbd9); }

.clothing-preview.red { background: linear-gradient(135deg, #ffebee, #ffcdd2); }
.clothing-preview.blue { background: linear-gradient(135deg, #e3f2fd, #bbdefb); }
.clothing-preview.green { background: linear-gradient(135deg, #e8f5e8, #c8e6c9); }
.clothing-preview.yellow { background: linear-gradient(135deg, #fffde7, #fff9c4); }
.clothing-preview.pink { background: linear-gradient(135deg, #fce4ec, #f8bbd9); }
.clothing-preview.purple { background: linear-gradient(135deg, #f3e5f5, #e1bee7); }
.clothing-preview.orange { background: linear-gradient(135deg, #fff3e0, #ffcc02); }
.clothing-preview.black { background: linear-gradient(135deg, #424242, #212121); color: white; }
.clothing-preview.white { background: linear-gradient(135deg, #fafafa, #f5f5f5); }
.clothing-preview.gray { background: linear-gradient(135deg, #f5f5f5, #eeeeee); }

.clothing-preview.dots::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, rgba(0,0,0,0.3) 2px, transparent 2px);
  background-size: 20px 20px;
}

.clothing-preview.stripes::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px);
}

.clothing-preview.flowers::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="3" fill="rgba(0,0,0,0.3)"/><circle cx="80" cy="20" r="3" fill="rgba(0,0,0,0.3)"/><circle cx="50" cy="50" r="3" fill="rgba(0,0,0,0.3)"/><circle cx="20" cy="80" r="3" fill="rgba(0,0,0,0.3)"/><circle cx="80" cy="80" r="3" fill="rgba(0,0,0,0.3)"/></svg>');
}

.preview-info h3 {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  color: #333;
}

.preview-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.stat {
  padding: 0.25rem 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
}

.materials-check {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.materials-check h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.material-item.available {
  background: #e8f5e8;
  color: #2e7d32;
}

.material-item.missing {
  background: #ffebee;
  color: #c62828;
}

.material-icon {
  font-size: 1.2rem;
}

.material-name {
  flex: 1;
  font-weight: 500;
}

.material-count {
  font-weight: 600;
}

/* Правая панель - настройки */
.right-controls {
  flex: 1.5;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-title {
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.pill {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
}

.pill:hover {
  border-color: var(--primary);
  background: #f0f8ff;
  transform: translateY(-1px);
}

.pill.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
}

.color-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.color-btn:hover {
  border-color: var(--primary);
  transform: scale(1.1);
}

.color-btn.active {
  border-color: var(--primary);
  border-width: 4px;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.color-btn.red { background: #f44336; }
.color-btn.blue { background: #2196f3; }
.color-btn.green { background: #4caf50; }
.color-btn.yellow { background: #ffeb3b; }
.color-btn.pink { background: #e91e63; }
.color-btn.purple { background: #9c27b0; }
.color-btn.orange { background: #ff9800; }
.color-btn.black { background: #212121; }
.color-btn.white { background: #ffffff; border-color: #ccc; }
.color-btn.gray { background: #9e9e9e; }

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.material-btn {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.material-btn:hover:not(:disabled) {
  border-color: var(--primary);
  background: #f0f8ff;
  transform: translateY(-1px);
}

.material-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.material-btn.rare {
  border-color: #ff9800;
  background: linear-gradient(135deg, #fff3e0, #ffcc02);
}

.material-btn.rare.active {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}

.material-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.material-icon {
  font-size: 1.5rem;
}

.material-name {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
}

.rare-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 1rem;
}

.quality-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.quality-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.quality-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.quality-value {
  font-weight: 600;
  color: var(--primary);
  min-width: 50px;
  text-align: center;
}

.quality-hint {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

.card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
}

.cost-info {
  margin-bottom: 1.5rem;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.row:last-child {
  margin-bottom: 0;
}

.row span {
  color: #666;
}

.row strong {
  color: #333;
  font-weight: 600;
}

.create-btn {
  background: linear-gradient(135deg, var(--success), #2e7d32);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%;
}

.create-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2e7d32, #1b5e20);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.3);
}

.create-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.notice {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  color: #856404;
}

.missing-materials {
  margin-bottom: 1rem;
}

.missing-materials ul {
  margin: 0.5rem 0 0 1rem;
  padding: 0;
}

.missing-materials li {
  margin-bottom: 0.25rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.actions .btn {
  background: var(--warning);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
}

.actions .btn:hover {
  background: #f57c00;
  transform: translateY(-1px);
}

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