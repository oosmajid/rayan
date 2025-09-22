<script setup>
import { useDataStore } from '@/stores/dataStore.js'; 
import BaseTable from '@/components/BaseTable.vue';
import AssignmentStatusIcons from '@/components/AssignmentStatusIcons.vue';
import { onMounted } from 'vue';
import { useLayoutStore } from '@/stores/layout.js';
import HeartRating from '@/components/HeartRating.vue';

const layoutStore = useLayoutStore();
const dataStore = useDataStore(); 
onMounted(() => {
  layoutStore.setPageTitle('کل هنرجویان');
});




const tableColumns = [
  { key: 'actions', label: '', sortable: false, filterable: false },
  { key: 'name', label: 'نام هنرجو', sortable: true, filterable: true },
  { key: 'phone', label: 'شماره تلفن', sortable: false, filterable: true },
  { key: 'course', label: 'دوره', sortable: true, filterable: true },
  { key: 'term', label: 'ترم', sortable: true, filterable: true },
  { key: 'apollonyar', label: 'آپولون‌یار', sortable: true, filterable: true },
  { key: 'assignmentStatus', label: 'وضعیت تکالیف', sortable: false, filterable: false },
  { key: 'daysSinceLastContact', label: 'آخرین تماس (روز)', sortable: true, filterable: false },
  { key: 'accountStatus', label: 'وضعیت', sortable: true, filterable: true },
  { key: 'studentType', label: 'نوع', sortable: true, filterable: true },
  { key: 'enrollmentStatus', label: 'حضور', sortable: true, filterable: true },
  { key: 'accessStatus', label: 'دسترسی', sortable: true, filterable: true },
  { key: 'watchTime', label: 'مشاهده دوره', sortable: true, filterable: false },
  { key: 'hearts', label: 'جان', sortable: true, filterable: false },
  { key: 'score', label: 'امتیاز', sortable: true, filterable: false }
];

</script>

<template>
  <div class="view-container">
    <BaseTable :columns="tableColumns" :data="dataStore.studentsWithDetails" :rows-per-page="15">
      <template #cell-actions="{ item }">
        <RouterLink :to="{ name: 'student-profile', params: { id: item.id } }" class="btn-sm btn-icon-only" title="مشاهده پروفایل">
          <i class="fa-solid fa-user"></i>
        </RouterLink>
      </template>
      <template #cell-assignmentStatus="{ item }">
        <AssignmentStatusIcons :statuses="item.assignmentStatus" />
      </template>
      <template #cell-hearts="{ item }">
        <HeartRating :count="item.hearts" />
      </template>
    </BaseTable>
  </div>
</template>

<style scoped>
/* ۳. افزودن استایل برای دکمه آیکونی */
.view-container { padding-top: 20px; }
.btn-icon-only {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 1rem;
}
</style>