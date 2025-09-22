<script setup>
import { useDataStore } from '@/stores/dataStore.js';
const dataStore = useDataStore();
</script>

<template>
  <div>
    <div class="pane-header">
      <h2>مدیریت ترم‌ها</h2>
      <button class="btn">
        <i class="fa-solid fa-plus"></i> افزودن ترم جدید
      </button>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>نام ترم</th>
            <th>دوره</th>
            <th>تاریخ شروع</th>
            <th>تاریخ پایان</th>
            <th>هنرجویان</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="term in dataStore.termsForTable" :key="term.id">
            <td>{{ term.name }}</td>
            <td>{{ term.course }}</td>
            <td>{{ term.startDate }}</td>
            <td>{{ term.endDate }}</td>
            <td>{{ term.studentsCount }}</td>
            <td>
              <button class="btn-sm">
                <i class="fa-solid fa-cogs"></i> ویرایش
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td {
    padding: 14px 20px;
    text-align: right;
    border-bottom: 1px solid var(--border-color);
    white-space: nowrap;
}
thead { background-color: var(--background-color); }
</style>