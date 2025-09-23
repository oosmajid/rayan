<script setup>
import { useDataStore } from '@/stores/dataStore.js'
import BaseTable from '@/components/BaseTable.vue'

const dataStore = useDataStore()
const tableColumns = [
  { key: 'groupNumber', label: 'شماره گروه', sortable: true, filterable: true },
  { key: 'termName', label: 'نام ترم', sortable: true, filterable: true },
  { key: 'course', label: 'دوره', sortable: true, filterable: true },
  { key: 'studentCount', label: 'تعداد هنرجویان', sortable: true, filterable: false },
  { key: 'actions', label: '', sortable: false, filterable: false },
]
</script>
<template>
  <BaseTable :columns="tableColumns" :data="dataStore.groupsForTable" :rows-per-page="10">
    <template #cell-actions
      ><button class="btn-sm"><i class="fa-solid fa-cogs"></i> ویرایش</button></template
    >
  </BaseTable>
</template>
<style scoped></style>
