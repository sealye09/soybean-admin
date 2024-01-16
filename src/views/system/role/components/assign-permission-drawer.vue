<script lang="ts" setup>
import type { TreeOption } from 'naive-ui';
import { ref, watchEffect } from 'vue';

import type { OptionType } from '@/service';
import { getMenuOptions, getRoleMenuIds, updateRoleMenus } from '@/service';

export type AssignRoleState = {
  roleId: number;
  show: boolean;
  title: string;
};

const props = defineProps<AssignRoleState>();

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'refresh'): void;
}>();

type TreeOptions = (TreeOption & OptionType)[];

const menuTree = ref<TreeOptions>([]);
const menuIds = ref<number[]>([]);

function initFn() {
  Promise.all([
    getMenuOptions(),
    getRoleMenuIds(props.roleId),
  ]).then(([{ data: menuOptions, error: err1 }, { data: roleMenuIds, error: err2 }]) => {
    if (err1 || err2) {
      const message = err1?.msg || err2?.msg || '获取菜单失败';
      window.$message?.error(message);
      return;
    }

    menuTree.value = menuOptions as TreeOptions;
    menuIds.value = roleMenuIds as number[];
  });
}

function assignPermission() {
  if (!menuIds.value.length) {
    window.$message?.warning('请勾选权限');
    return;
  }

  window.$dialog?.warning({
    title: '确认分配权限？',
    content: '分配权限后，该角色的权限将会被覆盖',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { error } = await updateRoleMenus(props.roleId, menuIds.value);
      if (error) {
        window.$message?.error(error.msg);
        return;
      }
      window.$message?.success('分配成功');
      emits('update:show', false);
      emits('refresh');
    },
    onNegativeClick: () => {
    },
  });
}

watchEffect(() => {
  if (props.show) {
    if (props.roleId < 0) {
      window.$message?.error('角色ID错误');
      emits('update:show', false);
      return;
    }
    initFn();
  } else {
    menuTree.value = [];
    menuIds.value = [];
  }
});
</script>

<template>
  <NDrawer
    preset="card"
    :show="show"
    mask-closable
    :width="502"
    @close="emits('update:show', false)"
    @mask-click="emits('update:show', false)"
  >
    <NDrawerContent :title="title">
      <NTree
        v-model:checked-keys="menuIds"
        multiple
        block-line
        cascade
        checkable
        key-field="value"
        :data="menuTree"
      />

      <template #footer>
        <NButton type="primary" @click="assignPermission">
          提交
        </NButton>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
</style>
