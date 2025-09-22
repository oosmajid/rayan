<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: { type: Number, default: 0 }
});
const emit = defineEmits(['update:modelValue']);

const hoverRating = ref(0);

// --- اصلاحیه اصلی اینجاست ---
function setRating(rating) {
  // اگر کاربر روی ستاره‌ای کلیک کند که از قبل فعال است، امتیاز صفر می‌شود
  if (props.modelValue === rating) {
    emit('update:modelValue', 0);
  } else {
    emit('update:modelValue', rating);
  }
}
</script>

<template>
  <div class="star-rating" @mouseleave="hoverRating = 0">
    <i
      v-for="star in 3"
      :key="star"
      class="fa-solid fa-star"
      :class="{ active: (hoverRating || modelValue) >= star }"
      @mouseenter="hoverRating = star"
      @click="setRating(star)"
    ></i>
  </div>
</template>

<style scoped>
.star-rating i {
  font-size: 1.8rem;
  color: var(--border-color);
  cursor: pointer;
  transition: color 0.2s;
  margin: 0 2px;
}
.star-rating i.active {
  color: var(--star-color);
}
</style>