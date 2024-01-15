<script setup lang="ts">
import type { DataTableColumn } from 'naive-ui';
import { ref, watch } from 'vue';
import VueDraggable from 'vuedraggable';

import type { DictTypePageVO } from '@/service';

type Column = DataTableColumn<DictTypePageVO>;

const props = defineProps<{
  columns: Column[];
}>();

const emit = defineEmits<{
  (e: 'update:columns', columns: Column[]): void;
}>();

type List = Column & { checked?: boolean };

const list = ref<List[]>(initList());

function initList() {
  return props.columns.map(item => ({ ...item, checked: true }));
}

watch(
  list,
  (newValue) => {
    const newColumns = newValue.filter(item => item.checked);

    const columns: Column[] = newColumns.map((item) => {
      const column = { ...item };
      delete column.checked;

      return column;
    }) as Column[];

    emit('update:columns', columns);
  },
  { deep: true },
);
</script>

<template>
  <NPopover placement="bottom" trigger="click">
    <template #trigger>
      <div>
        <slot name="trigger" />
      </div>
    </template>

    <div class="w-180px">
      <VueDraggable v-model="list" item-key="key">
        <template #item="{ element }">
          <div v-if="element.key" class="hover:bg-primary_active h-36px flex-y-center px-12px">
            <SvgIcon icon="lucide:grip" class="mr-8px cursor-move text-20px" />
            <NCheckbox v-model:checked="element.checked">
              {{ element.title }}
            </NCheckbox>
          </div>
        </template>
      </VueDraggable>
    </div>
  </NPopover>
</template>

<style scoped></style>
