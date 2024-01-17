<script setup lang="ts">
import type { FormInst, SelectOption, TreeOption } from 'naive-ui';
import { computed, reactive, ref, watch } from 'vue';

import type { OptionType, UserForm } from '@/service';
import { addUser, getDeptOptions, getDictOptions, getRoleOptions, updateUser } from '@/service';

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
  editData: UserForm | null;
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
    add: '添加用户',
    edit: '编辑用户',
  };
  return titles[props.type];
});

const formRef = ref<HTMLElement & FormInst>();

type FormModel = UserForm;

const formModel = reactive<FormModel>(createDefaultFormModel());

type TreeOptions = (TreeOption & OptionType)[];
type SelectOptions = (SelectOption & OptionType)[];

const deptOptions = ref<TreeOptions>();
const roleOptions = ref<SelectOptions>();
const genderOptions = ref<SelectOptions>();

function createDefaultFormModel(): FormModel {
  return {
    deptId: undefined,
    email: '',
    gender: undefined,
    mobile: '',
    nickname: '',
    roleIds: [],
    status: undefined,
    username: '',
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
  // get options
  Promise.all([
    getDeptOptions(),
    getRoleOptions(),
    getDictOptions('gender'),
  ]).then(([
    { data: depts, error: deptErr },
    { data: roles, error: roleErr }
    , { data: genders, error: genderErr },

  ]) => {
    if (depts && depts.length)
      deptOptions.value = depts as TreeOptions;
    else
      window.$message?.error(deptErr?.msg || '获取部门列表失败');

    if (roles && roles.length)
      roleOptions.value = roles as SelectOptions;
    else
      window.$message?.error(roleErr?.msg || '获取角色列表失败');

    if (genders)
      genderOptions.value = genders as SelectOptions;
    else
      window.$message?.error(genderErr?.msg || '获取性别列表失败');
  });
}

/** 用户表单提交 */
async function handleSubmit() {
  await formRef.value?.validate();

  if (props.type === 'add') {
    const { error } = await addUser(formModel);
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

    const { error } = await updateUser(props.editData.id, formModel);
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
  <NModal v-model:show="modalVisible" preset="card" :title="title" class="w-800px <lg:w-screen">
    <NForm ref="formRef" label-placement="left" :label-width="80" :model="formModel">
      <NGrid :cols="24" :x-gap="18">
        <NFormItemGridItem :span="12" label="用户名" path="username">
          <NInput v-model:value="formModel.username" />
        </NFormItemGridItem>

        <NFormItemGridItem :span="12" label="昵称" path="nickname">
          <NInput v-model:value="formModel.nickname" clearable />
        </NFormItemGridItem>

        <NFormItemGridItem :span="12" label="所属部门" path="deptId">
          <NTreeSelect
            v-model:value="formModel.deptId"
            :options="deptOptions"
            clearable
            key-field="value"
          />
        </NFormItemGridItem>

        <NFormItemGridItem :span="12" label="角色" path="roleIds">
          <NSelect v-model:value="formModel.roleIds" :options="roleOptions" clearable multiple />
        </NFormItemGridItem>

        <NFormItemGridItem :span="12" label="性别" path="gender">
          <NSelect v-model:value="formModel.gender" :options="genderOptions" clearable />
        </NFormItemGridItem>

        <NFormItemGridItem :span="12" label="手机号" path="mobile">
          <NInput v-model:value="formModel.mobile" />
        </NFormItemGridItem>

        <NFormItemGridItem :span="12" label="邮箱" path="email">
          <NInput v-model:value="formModel.email" />
        </NFormItemGridItem>

        <NFormItemGridItem :span="12" label="状态" path="status">
          <NSwitch
            v-model:value="formModel.status"
            :checked-value="1"
            :unchecked-value="0"
          />
        </NFormItemGridItem>
      </NGrid>

      <NSpace class="w-full pt-16px" :size="12" justify="end">
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
