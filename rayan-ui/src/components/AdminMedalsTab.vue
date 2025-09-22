<script setup>
import { ref } from 'vue';
import { useDataStore } from '@/stores/dataStore.js';
import BaseTable from '@/components/BaseTable.vue';
import BaseModal from '@/components/BaseModal.vue';

const dataStore = useDataStore();
const isStudentsModalOpen = ref(false);
const isDescriptionModalOpen = ref(false);
const selectedMedal = ref(null);

function openStudentsModal(medal) {
  selectedMedal.value = medal;
  isStudentsModalOpen.value = true;
}

function openDescriptionModal(medal) {
  selectedMedal.value = medal;
  isDescriptionModalOpen.value = true;
}

const tableColumns = [
  { key: 'name', label: 'نام مدال', sortable: true, filterable: true },
  { key: 'holderCount', label: 'هنرجویان دارای مدال', sortable: true, filterable: false },
  { key: 'description', label: 'توضیحات', sortable: false, filterable: false },
  { key: 'actions', label: '', sortable: false, filterable: false },
];

const studentTableColumns = [
    { key: 'name', label: 'نام هنرجو', sortable: true, filterable: true },
    { key: 'phone', label: 'شماره تلفن', sortable: false, filterable: true },
    { key: 'course', label: 'دوره', sortable: true, filterable: true },
    { key: 'term', label: 'ترم', sortable: true, filterable: true },
    { key: 'apollonyar', label: 'آپولون‌یار', sortable: true, filterable: true },
    { key: 'medalAwardDate', label: 'تاریخ دریافت', sortable: true, filterable: false },
];
</script>

<template>
  <div>
    <div class="pane-header">
      <h2>مدیریت مدال‌ها</h2>
      <button class="btn"><i class="fa-solid fa-plus"></i> افزودن مدال جدید</button>
    </div>

    <BaseTable :columns="tableColumns" :data="dataStore.medalsForTable" :rows-per-page="10">
      <template #cell-name="{ item }">
        <i :class="item.icon" class="medal-icon"></i> {{ item.name }}
      </template>
      
      <template #cell-holderCount="{ item }">
        <div class="holder-count-cell">
          <span>{{ item.holderCount }}</span>
          <button @click="openStudentsModal(item)" class="btn-sm btn-outline">
            <i class="fa-solid fa-users"></i>
          </button>
        </div>
      </template>

      <template #cell-description="{ item }">
        <button @click="openDescriptionModal(item)" class="btn-sm btn-outline">
          <i class="fa-solid fa-info-circle"></i>
        </button>
      </template>

      <template #cell-actions="{ item }">
        <button class="btn-sm"><i class="fa-solid fa-cogs"></i> ویرایش</button>
      </template>
    </BaseTable>

    <BaseModal :show="isStudentsModalOpen" @close="isStudentsModalOpen = false" size="lg">
      <template #header>
        <h2 v-if="selectedMedal">هنرجویان دارای مدال «{{ selectedMedal.name }}»</h2>
      </template>
      <div v-if="selectedMedal">
        <BaseTable 
          :columns="studentTableColumns" 
          :data="selectedMedal.students" 
          :rows-per-page="5"
        />
      </div>
    </BaseModal>

    <BaseModal :show="isDescriptionModalOpen" @close="isDescriptionModalOpen = false">
      <template #header>
        <h2 v-if="selectedMedal">توضیحات مدال «{{ selectedMedal.name }}»</h2>
      </template>
      <div v-if="selectedMedal">
        <p>{{ selectedMedal.description }}</p>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.pane-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 20px; 
}
.medal-icon { 
  color: var(--star-color); 
  font-size: 1.2rem; 
  margin-left: 8px; 
}
.holder-count-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}
.btn-outline:hover {
  background-color: var(--primary-color);
  color: #fff;
}
p {
  line-height: 1.8;
  text-align: justify;
}
</style>