<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

import type { DictPageVO } from '@/service';
import { getDictPage } from '@/service';

const props = defineProps<{
  typeCode: string;
  show: boolean;
  title: string;
}>();

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const title = ref<string>('');
const dictList = ref<DictPageVO[]>();

async function handleQuery() {
  const { data, error } = await getDictPage({
    typeCode: props.typeCode,
    pageNum: 1,
    pageSize: 10,
  });
  if (!error)
    dictList.value = data?.list;
}

watchEffect(() => {
  if (props.show)
    handleQuery();
  else
    dictList.value = [];
});
</script>

<template>
  <n-modal
    class="w-700px <lg:w-screen"
    preset="card"
    :show="show"
    :title="title"
    mask-closable
    @close="emits('update:show', false)"
    @mask-click="emits('update:show', false)"
  >
    <div v-for="dict in dictList" :key="dict.id">
      <div class="flex justify-between">
        <div class="text-gray-500">
          {{ dict.id }}
        </div>
        <div class="text-gray-500">
          {{ dict.name }}
        </div>
        <div class="text-gray-500">
          {{ dict.status }}
        </div>
      </div>
      <div class="flex justify-between">
        <div class="text-gray-500">
          {{ dict.value }}
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
</style>
