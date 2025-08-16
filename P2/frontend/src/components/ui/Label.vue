<template>
  <label
    :for="htmlFor"
    :class="cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )"
  >
    <slot />
  </label>
</template>

<script setup>
import { cn } from '@/utils/cn'

defineProps({
  htmlFor: {
    type: String,
    default: '',
  },
  className: {
    type: String,
    default: '',
  },
})
</script>