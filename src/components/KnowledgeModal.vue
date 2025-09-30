<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="knowledge-modal" @click.stop>
      <!-- Заголовок -->
        <div class="modal-header">
          <h2 class="modal-title">■ База знаний</h2>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>
      
      <!-- Навигация по разделам -->
      <div class="nav-section">
        <button 
          v-for="section in sections" 
          :key="section.id"
          class="nav-btn"
          :class="{ active: activeSection === section.id }"
          @click="setActiveSection(section.id)"
        >
          <span class="nav-icon">{{ section.icon }}</span>
          <span class="nav-text">{{ section.name }}</span>
        </button>
      </div>
      
      <!-- Контент раздела -->
      <div class="content-section">
          <!-- Экономика -->
          <div v-if="activeSection === 'economy'" class="section-content">
            <h3>◉ Основы экономики</h3>
            
            <div class="knowledge-card">
              <h4>▲ Спрос и предложение</h4>
              <p>Спрос - это количество товара, которое покупатели готовы купить по определенной цене. Предложение - это количество товара, которое продавцы готовы продать.</p>
              <div class="formula">
                <strong>Цена ↑ → Спрос ↓</strong><br>
                <strong>Цена ↓ → Спрос ↑</strong>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>● Инфляция</h4>
              <p>Инфляция - это общий рост цен на товары и услуги в экономике. Она снижает покупательную способность денег.</p>
              <div class="tip">
                ◆ <strong>Совет:</strong> Инвестируйте в активы, которые растут быстрее инфляции!
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>■ Маркетинг</h4>
              <p>Маркетинг - это процесс создания, продвижения и продажи товаров или услуг. Включает в себя изучение потребностей клиентов и создание ценности.</p>
              <ul class="marketing-list">
                <li>Исследование рынка</li>
                <li>Разработка продукта</li>
                <li>Ценообразование</li>
                <li>Продвижение</li>
                <li>Продажи</li>
              </ul>
            </div>
          </div>
          
          <!-- Мода и дизайн -->
          <div v-if="activeSection === 'fashion'" class="section-content">
            <h3>◆ Мир моды</h3>
            
            <div class="knowledge-card">
              <h4>● Принципы дизайна</h4>
              <p>Хороший дизайн основывается на нескольких ключевых принципах:</p>
              <div class="principles-grid">
                <div class="principle">
                  <span class="principle-icon">◉</span>
                  <span class="principle-name">Баланс</span>
                </div>
                <div class="principle">
                  <span class="principle-icon">◆</span>
                  <span class="principle-name">Ритм</span>
                </div>
                <div class="principle">
                  <span class="principle-icon">●</span>
                  <span class="principle-name">Акцент</span>
                </div>
                <div class="principle">
                  <span class="principle-icon">■</span>
                  <span class="principle-name">Пропорции</span>
                </div>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>▲ Цветовая теория</h4>
              <p>Цвета влияют на эмоции и восприятие. Правильный выбор цветов может сделать ваш продукт более привлекательным.</p>
              <div class="color-wheel">
                <div class="color-primary">Основные цвета</div>
                <div class="color-secondary">Дополнительные</div>
                <div class="color-tertiary">Третичные</div>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>◆ Размеры и посадка</h4>
              <p>Правильная посадка одежды - залог успеха. Учитывайте особенности фигуры и предпочтения клиентов.</p>
            </div>
          </div>
          
          <!-- Бизнес -->
          <div v-if="activeSection === 'business'" class="section-content">
            <h3>■ Управление бизнесом</h3>
            
            <div class="knowledge-card">
              <h4>◉ Финансовое планирование</h4>
              <p>Планирование доходов и расходов помогает контролировать финансовое состояние бизнеса.</p>
              <div class="financial-formula">
                <strong>Прибыль = Доходы - Расходы</strong>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>● Управление персоналом</h4>
              <p>Сотрудники - основа успешного бизнеса. Правильная мотивация и обучение повышают эффективность.</p>
              <div class="employee-tips">
                <div class="tip-item">▲ Мотивация</div>
                <div class="tip-item">◆ Обучение</div>
                <div class="tip-item">■ Командная работа</div>
                <div class="tip-item">◉ Развитие</div>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>◆ Анализ рынка</h4>
              <p>Изучение конкурентов и трендов помогает принимать правильные бизнес-решения.</p>
            </div>
          </div>
          
          <!-- Мини-игры -->
          <div v-if="activeSection === 'minigames'" class="section-content">
            <h3>● Мини-игры</h3>
            
            <div class="knowledge-card">
              <h4>◉ Типы мини-игр</h4>
              <div class="minigame-types">
                <div class="minigame-type">
                  <span class="type-icon">■</span>
                  <span class="type-name">Производство</span>
                  <span class="type-desc">Управление фабрикой</span>
                </div>
                <div class="minigame-type">
                  <span class="type-icon">◆</span>
                  <span class="type-name">Продажи</span>
                  <span class="type-desc">Обслуживание клиентов</span>
                </div>
                <div class="minigame-type">
                  <span class="type-icon">●</span>
                  <span class="type-name">Дизайн</span>
                  <span class="type-desc">Создание одежды</span>
                </div>
                <div class="minigame-type">
                  <span class="type-icon">▲</span>
                  <span class="type-name">Кооператив</span>
                  <span class="type-desc">Совместная игра</span>
                </div>
              </div>
            </div>
            
            <div class="knowledge-card">
              <h4>◆ Награды</h4>
              <p>За участие в мини-играх вы получаете различные награды:</p>
              <ul>
                <li>■ Монеты</li>
                <li>● Опыт</li>
                <li>▲ Предметы</li>
                <li>◉ Достижения</li>
              </ul>
            </div>
          </div>
          
          <!-- Советы -->
          <div v-if="activeSection === 'tips'" class="section-content">
            <h3>▲ Полезные советы</h3>
            
            <div class="tips-grid">
              <div class="tip-card">
                <span class="tip-icon">■</span>
                <h4>Экономия</h4>
                <p>Покупайте материалы оптом - это дешевле!</p>
              </div>
              
              <div class="tip-card">
                <span class="tip-icon">◉</span>
                <h4>Время</h4>
                <p>Планируйте производство заранее</p>
              </div>
              
              <div class="tip-card">
                <span class="tip-icon">●</span>
                <h4>Клиенты</h4>
                <p>Изучайте предпочтения покупателей</p>
              </div>
              
              <div class="tip-card">
                <span class="tip-icon">◆</span>
                <h4>Анализ</h4>
                <p>Отслеживайте прибыльность товаров</p>
              </div>
              
              <div class="tip-card">
                <span class="tip-icon">▲</span>
                <h4>Креатив</h4>
                <p>Экспериментируйте с новыми стилями</p>
              </div>
              
              <div class="tip-card">
                <span class="tip-icon">◉</span>
                <h4>Сотрудничество</h4>
                <p>Играйте с друзьями для больших наград</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Эмиты
const emit = defineEmits<{
  close: []
}>()

// Состояние
const activeSection = ref('economy')

// Разделы знаний
const sections = ref([
  { id: 'economy', name: 'Экономика', icon: '◉' },
  { id: 'fashion', name: 'Мода', icon: '◆' },
  { id: 'business', name: 'Бизнес', icon: '■' },
  { id: 'minigames', name: 'Мини-игры', icon: '●' },
  { id: 'tips', name: 'Советы', icon: '▲' }
])

// Установка активного раздела
const setActiveSection = (sectionId: string) => {
  activeSection.value = sectionId
}

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.knowledge-modal {
  background: var(--color-bg-menu-light);
  border-radius: 15px;
  width: 1000px;
  height: 700px;
  overflow: hidden;
  box-shadow: 0 8px 16px var(--shadow-medium);
  border: 2px solid var(--color-buttons);
  display: flex;
  flex-direction: column;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: var(--color-bg-menu);
  border-bottom: 2px solid var(--color-buttons);
}

.modal-title {
  margin: 0;
  font-size: clamp(1.1rem, 1.8vw, 1.4rem);
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.close-btn {
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  font-size: 1rem;
  cursor: pointer;
  color: var(--color-text);
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-weight: 600;
}

.close-btn:hover {
  background: var(--gradient-accents);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.nav-section {
  display: flex;
  background: var(--color-bg-menu);
  padding: 10px;
  gap: 8px;
  overflow-x: auto;
  border-bottom: 2px solid var(--color-buttons);
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  background: var(--color-bg-menu-light);
  border: 2px solid var(--color-buttons);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-text);
  min-width: 80px;
  font-weight: 600;
}

.nav-btn:hover {
  background: var(--color-bg-menu);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.nav-btn.active {
  background: var(--gradient-accents);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px var(--shadow-dark);
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-text {
  font-size: clamp(0.7rem, 1.1vw, 0.85rem);
  font-weight: 600;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.content-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--color-bg-menu-light);
  height: calc(700px - 140px);
}

.section-content h3 {
  margin: 0 0 15px 0;
  color: var(--color-text);
  font-size: clamp(1.2rem, 1.8vw, 1.5rem);
  text-align: center;
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.knowledge-card {
  background: var(--color-bg-menu);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px var(--shadow-light);
  border: 2px solid var(--color-buttons);
  transition: all 0.3s ease;
}

.knowledge-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px var(--shadow-medium);
}

.knowledge-card h4 {
  margin: 0 0 10px 0;
  color: var(--color-text);
  font-size: clamp(0.9rem, 1.4vw, 1.1rem);
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.knowledge-card p {
  margin: 0 0 10px 0;
  line-height: 1.4;
  color: var(--color-text);
  font-size: clamp(0.75rem, 1.2vw, 0.9rem);
}

.formula {
  background: var(--color-bg-menu-light);
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  text-align: center;
  margin: 10px 0;
  border: 2px solid var(--color-buttons);
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  font-weight: 600;
  color: var(--color-highlights);
}

.tip {
  background: var(--color-bg-menu-light);
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid var(--color-accents);
  margin: 10px 0;
  font-size: clamp(0.75rem, 1.1vw, 0.85rem);
  color: var(--color-text);
}

.marketing-list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.marketing-list li {
  padding: 6px 0;
  border-bottom: 1px solid var(--color-buttons);
  position: relative;
  padding-left: 20px;
  font-size: clamp(0.7rem, 1.1vw, 0.85rem);
  color: var(--color-text);
}

.marketing-list li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-accents);
  font-weight: bold;
}

.principles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 10px 0;
}

.principle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--color-bg-menu-light);
  border-radius: 8px;
  border: 1px solid var(--color-buttons);
}

.principle-icon {
  font-size: 1.2rem;
}

.principle-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: clamp(0.7rem, 1.1vw, 0.85rem);
}

.color-wheel {
  display: flex;
  justify-content: space-around;
  margin: 10px 0;
}

.color-primary, .color-secondary, .color-tertiary {
  padding: 8px 12px;
  border-radius: 15px;
  color: white;
  font-weight: bold;
  text-align: center;
  font-size: clamp(0.7rem, 1.1vw, 0.85rem);
}

.color-primary {
  background: var(--color-accents);
}

.color-secondary {
  background: var(--color-highlights);
}

.color-tertiary {
  background: var(--color-buttons);
}

.financial-formula {
  background: var(--color-bg-menu-light);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  font-weight: bold;
  color: var(--color-highlights);
  margin: 10px 0;
  border: 2px solid var(--color-buttons);
}

.employee-tips {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin: 10px 0;
}

.tip-item {
  padding: 8px;
  background: var(--color-bg-menu-light);
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: var(--color-text);
  border: 1px solid var(--color-buttons);
  font-size: clamp(0.7rem, 1.1vw, 0.85rem);
}

.minigame-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 10px 0;
}

.minigame-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: var(--color-bg-menu-light);
  border-radius: 10px;
  text-align: center;
  border: 1px solid var(--color-buttons);
  transition: all 0.3s ease;
}

.minigame-type:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.type-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.type-name {
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 4px;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
}

.type-desc {
  font-size: clamp(0.7rem, 1.1vw, 0.85rem);
  color: var(--color-text);
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.tip-card {
  background: var(--color-bg-menu);
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 8px var(--shadow-light);
  transition: all 0.3s ease;
  border: 2px solid var(--color-buttons);
}

.tip-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px var(--shadow-medium);
}

.tip-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 8px;
}

.tip-card h4 {
  margin: 0 0 8px 0;
  color: var(--color-text);
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  font-weight: 700;
  text-shadow: 1px 1px 0px var(--shadow-light);
}

.tip-card p {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(0.7rem, 1.1vw, 0.85rem);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .knowledge-modal {
    width: 95%;
    height: 85vh;
  }
  
  .content-section {
    height: calc(85vh - 140px);
  }
}

@media (max-width: 768px) {
  .knowledge-modal {
    width: 98%;
    height: 90vh;
  }
  
  .content-section {
    height: calc(90vh - 140px);
  }
  
  .principles-grid,
  .employee-tips,
  .minigame-types,
  .tips-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-section {
    flex-wrap: wrap;
  }
  
  .nav-btn {
    min-width: 60px;
  }
  
  .nav-text {
    font-size: 0.7rem;
  }
  
  .content-section {
    padding: 15px;
  }
}
</style>
