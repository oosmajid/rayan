<script setup>
import { useDataStore } from '@/stores/dataStore.js'
import BaseTable from '@/components/BaseTable.vue'

const dataStore = useDataStore()
const tableColumns = [
  { key: 'name', label: 'نام و نام خانوادگی', sortable: true, filterable: true },
  { key: 'phone', label: 'شماره تلفن', sortable: false, filterable: true },
  { key: 'urgentCalls', label: 'تماس‌های ضروری', sortable: true, filterable: false },
  { key: 'avgScore', label: 'میانگین امتیاز', sortable: true, filterable: false },
  { key: 'actions', label: '', sortable: false, filterable: false },
]
</script>
<template>
  <BaseTable :columns="tableColumns" :data="dataStore.apollonyarsForTable" :rows-per-page="10">
    <template #cell-avgScore="{ item }">{{ item.avgScore }} ⭐</template>
    <template #cell-actions
      ><button class="btn-sm"><i class="fa-solid fa-cogs"></i> ویرایش</button></template
    >
  </BaseTable>
</template>
<style scoped></style>
