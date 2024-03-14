<script setup lang="ts">
import type { FormInst, TreeOption } from 'naive-ui';
import { computed, reactive, ref, watch } from 'vue';

import type { DeptForm, OptionType } from '@/service';
import { addDept, getDeptOptions, updateDept } from '@/service';

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
  editData?: DeptForm;
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
    add: '新增学院',
    edit: '编辑学院',
  };
  return titles[props.type];
});

const formRef = ref<HTMLElement & FormInst>();

type FormModel = DeptForm;

const formModel = reactive<FormModel>(createDefaultFormModel());
const menuOptions = ref<(OptionType & TreeOption)[]>([]);

function createDefaultFormModel(): FormModel {
  return {
    name: '',
    sort: 1,
    parentId: 1,
    status: 1,
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
      if (props.editData?.parentId)
        formModel.parentId = props.editData.parentId;
    },
    edit: () => {
      if (props.editData)
        handleUpdateFormModel(props.editData);
    },
  };

  getDeptOptions().then((res) => {
    if (res.error) {
      window.$message?.error(res.error.msg);
      return;
    }
    menuOptions.value = [{ value: 0, label: '顶级部门', children: res.data }] as (OptionType & TreeOption)[];
  });

  handlers[props.type]();
}

/** 学院表单提交 */
async function handleSubmit() {
  await formRef.value?.validate();

  if (props.type === 'add') {
    const { error } = await addDept(formModel);
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

    const { error } = await updateDept(props.editData.id, formModel);
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
        <NFormItemGridItem :span="24" label="父级部门" path="parentId" required>
          <NTreeSelect
            v-model:value="formModel.parentId"
            :options="menuOptions"
            clearable
            key-field="value"
            disabled
          />
        </NFormItemGridItem>

        <NFormItemGridItem
          :span="24"
          label="学院名称"
          path="name"
          required
        >
          <NInput v-model:value="formModel.name" />
        </NFormItemGridItem>

        <NFormItemGridItem :span="12" label="排序" path="sort">
          <NInputNumber v-model:value="formModel.sort" :min="1" />
        </NFormItemGridItem>

        <NFormItemGridItem :span="24" label="状态" path="status">
          <NSwitch
            v-model:value="formModel.status"
            :checked-value="1"
            :unchecked-value="0"
          />
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
