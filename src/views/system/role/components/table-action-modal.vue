<script setup lang="ts">
import type { FormInst } from 'naive-ui';
import { computed, reactive, ref, watch } from 'vue';

import { dataScopes } from '@/constants';
import type { RoleForm } from '@/service';
import { addRole, updateRole } from '@/service';

export interface Props {
  /** 弹窗可见性 */
  visible: boolean;
  /**
   * 弹窗类型
   * add: 新增
   * edit: 编辑
   */
  type?: 'add' | 'edit';
  /** 编辑的表格行数据 */
  editData: RoleForm | null;
}

export type ModalType = NonNullable<Props['type']>;

defineOptions({ name: 'TableActionModal' });

const props = withDefaults(defineProps<Props>(), {
  type: 'add',
  editData: undefined,
});

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'refresh'): void;
}>();

const modalVisible = computed({
  get() {
    return props.visible;
  },
  set(visible) {
    emit('update:visible', visible);
  },
});

function closeModal() {
  modalVisible.value = false;
}

const title = computed(() => {
  const titles: Record<ModalType, string> = {
    add: '添加角色',
    edit: '编辑角色',
  };
  return titles[props.type];
});

const formRef = ref<HTMLElement & FormInst>();

type FormModel = RoleForm;

const formModel = reactive<FormModel>(createDefaultFormModel());

function createDefaultFormModel(): FormModel {
  return {
    name: '',
    code: '',
    status: 1,
    sort: 1,
    dataScope: undefined,
  };
}

function handleUpdateFormModel(model: Partial<FormModel>) {
  Object.assign(formModel, model);
}

function handleUpdateFormModelByModalType() {
  const handlers: Record<ModalType, () => void> = {
    add: () => {
      const defaultFormModel = createDefaultFormModel();
      defaultFormModel.id = undefined;
      handleUpdateFormModel(defaultFormModel);
    },
    edit: () => {
      if (props.editData)
        handleUpdateFormModel(props.editData);
    },
  };

  handlers[props.type]();
}

/** 角色表单提交 */
async function handleSubmit() {
  await formRef.value?.validate();

  if (props.type === 'add') {
    const { error } = await addRole(formModel);
    if (error) {
      window.$message?.error(error.msg);
      return;
    }
    window.$message?.success('添加成功');
    closeModal();
    emit('refresh');
  }

  if (props.type === 'edit') {
    if (!props.editData || !props.editData.id) throw new Error('缺少编辑的数据');

    const { error } = await updateRole(props.editData.id, formModel);
    if (error) {
      window.$message?.error(error.msg);
      return;
    }
    window.$message?.success('编辑成功');
    closeModal();
    emit('refresh');
  }
}

watch(
  () => props.visible,
  (newValue) => {
    if (newValue)
      handleUpdateFormModelByModalType();
  },
);
</script>

<template>
  <NModal v-model:show="modalVisible" preset="card" :title="title" class="w-700px <lg:w-screen">
    <NForm ref="formRef" label-placement="left" :label-width="80" :model="formModel">
      <NGrid :cols="24" :x-gap="18">
        <NFormItemGridItem :span="24" label="角色名称" path="name">
          <NInput v-model:value="formModel.name" />
        </NFormItemGridItem>

        <NFormItemGridItem :span="24" label="角色编码" path="code">
          <NInput v-model:value="formModel.code" clearable />
        </NFormItemGridItem>

        <NFormItemGridItem :span="24" label="数据权限" path="dataScope">
          <NSelect
            v-model:value="formModel.dataScope"
            :options="dataScopes"
            :default-value="dataScopes[dataScopes.length - 1].value"
          />
        </NFormItemGridItem>

        <NFormItemGridItem :span="24" label="状态" path="status">
          <NSwitch
            v-model:value="formModel.status"
            :checked-value="1"
            :unchecked-value="0"
          />
        </NFormItemGridItem>

        <NFormItemGridItem :span="24" label="排序" path="sort">
          <NInputNumber v-model:value="formModel.sort" />
        </NFormItemGridItem>
      </NGrid>

      <NSpace class="w-full pt-16px" :size="24" justify="end">
        <NButton class="w-72px" @click="closeModal">
          取消
        </NButton>
        <NButton class="w-72px" type="primary" @click="handleSubmit">
          确定
        </NButton>
      </NSpace>
    </NForm>
  </NModal>
</template>

<style scoped></style>
