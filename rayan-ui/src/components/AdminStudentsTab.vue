<script setup>
import { useDataStore } from '@/stores/dataStore.js';
import BaseTable from '@/components/BaseTable.vue';

const dataStore = useDataStore();
const tableColumns = [
  { key: 'name', label: 'نام هنرجو', sortable: true, filterable: true },
  { key: 'phone', label: 'شماره تلفن', sortable: false, filterable: true },
  { key: 'course', label: 'دوره', sortable: true, filterable: true },
  { key: 'status', label: 'وضعیت', sortable: true, filterable: true },
  { key: 'actions', label: '', sortable: false, filterable: false },
];
</script>

<template>
  <div>
    <div class="pane-header">
      <h2>مدیریت هنرجویان</h2>
      <button class="btn"><i class="fa-solid fa-user-plus"></i> افزودن هنرجو</button>
    </div>
    <BaseTable :columns="tableColumns" :data="dataStore.studentsWithDetails" :rows-per-page="10">
      <template #cell-status="{ item }">
        <span class="status-badge" :class="item.status">{{ item.status }}</span>
      </template>
      <template #cell-actions="{ item }">
        <RouterLink :to="{ name: 'student-profile', params: { id: item.id } }" class="btn-sm">
          <i class="fa-solid fa-user"></i> پروفایل
        </RouterLink>
      </template>
    </BaseTable>
  </div>
</template>

<style scoped>
.pane-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.status-badge { padding: 4px 12px; border-radius: 99px; font-size: 11px; }
.status-badge.فعال { background-color: var(--success-bg); color: var(--success-text); }
.status-badge.غیرفعال { background-color: #fee2e2; color: #b91c1c; }
.status-badge.خودخوان { background-color: #e0e7ff; color: #3730a3; }
.status-badge.انصراف { background-color: #fef9c3; color: #854d0e; }
</style>