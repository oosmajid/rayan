<script setup>
import { ref } from 'vue';
import { useDataStore } from '@/stores/dataStore.js';
import BaseModal from '@/components/BaseModal.vue';
import BaseTable from '@/components/BaseTable.vue'; 

const dataStore = useDataStore();
const showCourseModal = ref(false);

const tableColumns = [
  { key: 'name', label: 'نام دوره', sortable: true, filterable: true },
  { key: 'totalStudents', label: 'تعداد کل هنرجویان', sortable: true, filterable: false },
  { key: 'graduates', label: 'تعداد فارغ‌التحصیلان', sortable: true, filterable: false },
  { key: 'assignmentCount', label: 'تعداد تکالیف', sortable: true, filterable: false },
  { key: 'callCount', label: 'تعداد تماس‌ها', sortable: true, filterable: false },
  { key: 'actions', label: '', sortable: false, filterable: false },
];
</script>

<template>
  <div>
    <div class="pane-header">
      <h2>مدیریت دوره‌ها</h2>
      <button @click="showCourseModal = true" class="btn">
        <i class="fa-solid fa-plus"></i> افزودن دوره جدید
      </button>
    </div>

    <BaseTable :columns="tableColumns" :data="dataStore.coursesForTable" :rows-per-page="10">
      <template #cell-actions>
        <button @click="showCourseModal = true" class="btn-sm">
          <i class="fa-solid fa-cogs"></i> ویرایش
        </button>
      </template>
    </BaseTable>

    <BaseModal :show="showCourseModal" @close="showCourseModal = false">
      <template #header>
        <h2>افزودن دوره جدید</h2>
      </template>
      <form>
        <div class="form-group">
          <label for="course-name">نام دوره</label>
          <input type="text" id="course-name" required>
        </div>
        <button type="submit" class="btn">ثبت دوره</button>
      </form>
    </BaseModal>
  </div>
</template>


<style scoped>
.pane-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 20px; text-align: right; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
thead { background-color: var(--background-color); }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; }
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-color);
  font-family: 'Vazirmatn', sans-serif;
}
</style>