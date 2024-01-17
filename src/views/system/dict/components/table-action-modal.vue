<script setup lang="ts">
import type { FormInst } from 'naive-ui';
import { computed, reactive, ref, watch } from 'vue';

import type { DictTypeForm } from '@/service';
import { addDictType, updateDictType } from '@/service';

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
  editData: DictTypeForm | null;
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
    add: '添加字典类型',
    edit: '编辑字典类型',
  };
  return titles[props.type];
});

const formRef = ref<HTMLElement & FormInst>();

type FormModel = DictTypeForm;

const formModel = reactive<FormModel>(createDefaultFormModel());

function createDefaultFormModel(): FormModel {
  return {
    name: '',
    code: '',
    status: 1,
    remark: '',
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

/** 字典类型表单提交 */
async function handleSubmit() {
  await formRef.value?.validate();

  if (props.type === 'add') {
    const { error } = await addDictType(formModel);
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

    const { error } = await updateDictType(props.editData.id, formModel);
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
        <NFormItemGridItem :span="24" label="字典名称" path="name">
          <NInput v-model:value="formModel.name" />
        </NFormItemGridItem>

        <NFormItemGridItem :span="24" label="字典编码" path="code">
          <NInput v-model:value="formModel.code" clearable />
        </NFormItemGridItem>

        <NFormItemGridItem :span="24" label="状态" path="status">
          <NSwitch
            v-model:value="formModel.status"
            :checked-value="1"
            :unchecked-value="0"
          />
        </NFormItemGridItem>

        <NFormItemGridItem :span="24" label="备注" path="remark">
          <NInput v-model:value="formModel.remark" type="textarea" />
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
