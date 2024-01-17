<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  keywords: string;
  placeholder: string;
  label: string;
}>();

const emits = defineEmits<{
  (e: 'update:keywords', value: string): void;
  (e: 'query'): void;
  (e: 'reset'): void;
}>();

const searchKeywords = computed<string>({
  get() {
    return props.keywords;
  },
  set(value) {
    emits('update:keywords', value);
  },
});

function handleQuery() {
  emits('query');
}

function resetQuery() {
  emits('reset');
}
</script>

<template>
  <NSpace class="simple-search">
    <NFormItem :label="props.label" label-placement="left">
      <NInput v-model:value="searchKeywords" :placeholder="props.placeholder" />
    </NFormItem>

    <NButton type="primary" @click="handleQuery">
      <template #icon>
        <SvgIcon icon="lucide:plus" class="text-20px" />
      </template>
      搜索
    </NButton>

    <NButton
      @click="resetQuery"
    >
      <template #icon>
        <SvgIcon icon="lucide:x" class="text-20px" />
      </template>
      重置
    </NButton>
  </NSpace>
</template>

<style lang="scss" scoped>
.simple-search{
  ::v-deep(.n-form-item-feedback-wrapper){
    min-height: 6px !important;
  }
}
</style>
