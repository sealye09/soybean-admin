<script setup lang="ts">
import type { FormInst, TreeOption } from 'naive-ui';
import { computed, reactive, ref, watch } from 'vue';

import { menuTypes } from '@/constants';
import { MenuTypeEnum } from '@/enum';
import type { MenuForm, OptionType } from '@/service';
import { addMenu, getMenuOptions, updateMenu } from '@/service';

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
  editData?: MenuForm;
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
    add: '新增菜单',
    edit: '编辑菜单',
  };
  return titles[props.type];
});

const formRef = ref<HTMLElement & FormInst>();

type FormModel = MenuForm;

const formModel = reactive<FormModel>(createDefaultFormModel());
const menuOptions = ref<(OptionType & TreeOption)[]>([]);

function createDefaultFormModel(): FormModel {
  return {
    name: '',
    visible: 1,
    path: '',
    component: '',
    perm: '',
    sort: 1,
    keepAlive: 1,
    alwaysShow: 1,
    type: MenuTypeEnum.CATALOG,
    parentId: 0,
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

  getMenuOptions().then((res) => {
    if (res.error) {
      window.$message?.error(res.error.msg);
      return;
    }
    menuOptions.value = [{ value: 0, label: '顶级菜单', children: res.data }] as (OptionType & TreeOption)[];
  });

  handlers[props.type]();
}

/** 菜单表单提交 */
async function handleSubmit() {
  await formRef.value?.validate();

  if (props.type === 'add') {
    const { error } = await addMenu(formModel);
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

    const { error } = await updateMenu(props.editData.id, formModel);
    if (error) {
      window.$message?.error(error.msg);
      return;
    }
    window.$message?.success('编辑成功');
    closeModal();
    emit('refresh');
  }
}

function updateType(type: MenuTypeEnum) {
  const parentId = formModel.parentId;
  const name = formModel.name;
  Object.assign(formModel, createDefaultFormModel());
  formModel.parentId = parentId;
  formModel.name = name;
  formModel.type = type;
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
        <NFormItemGridItem :span="24" label="父级菜单" path="parentId" required>
          <NTreeSelect
            v-model:value="formModel.parentId"
            :options="menuOptions"
            clearable
            key-field="value"
          />
        </NFormItemGridItem>

        <NFormItemGridItem
          :span="24"
          label="菜单名称"
          path="name"
          required
        >
          <NInput v-model:value="formModel.name" />
        </NFormItemGridItem>

        <NFormItemGridItem :span="24" label="菜单类型" path="type" required>
          <NRadioGroup
            :value="formModel.type"
            @update:value="updateType"
          >
            <NSpace>
              <NRadio v-for="item in menuTypes" :key="item.value" :value="item.value">
                {{ item.label }}
              </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItemGridItem>

        <NFormItemGridItem
          v-if="formModel.type === MenuTypeEnum.MENU || formModel.type === MenuTypeEnum.CATALOG"
          :span="24"
          feedback="vue router 路径，例如：/system/menu"
          label="路由路径"
          path="path"
          required
        >
          <NInput v-model:value="formModel.path" />
        </NFormItemGridItem>

        <NFormItemGridItem
          v-if="formModel.type === MenuTypeEnum.EXTLINK"
          :span="24" label="外链地址" path="path"
        >
          <NInput v-model:value="formModel.path" />
        </NFormItemGridItem>

        <NFormItemGridItem
          v-if="formModel.type === MenuTypeEnum.MENU"
          label="组件路径"
          path="component"
          feedback="组件路径，例如：src/views/system/menu/index.vue"
          required
          :span="24"
        >
          <NInput v-model:value="formModel.component" placeholder="请输入组件路径">
            <template #prefix>
              <NText>
                src/views/
              </NText>
            </template>
            <template #suffix>
              <NText>
                .vue
              </NText>
            </template>
          </NInput>
        </NFormItemGridItem>

        <NFormItemGridItem
          v-if="formModel.type !== MenuTypeEnum.BUTTON"
          :span="12" label="显示状态" path="visible" required
          feedback="是否在侧边栏中显示"
        >
          <NSwitch
            v-model:value="formModel.visible"
            :checked-value="1"
            :unchecked-value="0"
          />
        </NFormItemGridItem>

        <NFormItemGridItem
          v-if="formModel.type === MenuTypeEnum.CATALOG"
          :span="12" label="始终显示" path="alwaysShow"
          feedback="是否在只有一个子路由时显示"
        >
          <NSwitch
            v-model:value="formModel.alwaysShow"
            :checked-value="1"
            :unchecked-value="0"
          />
        </NFormItemGridItem>

        <NFormItemGridItem
          v-if="formModel.type === MenuTypeEnum.MENU"
          :span="12" label="是否缓存" path="keepAlive"
        >
          <NSwitch
            v-model:value="formModel.keepAlive"
            :checked-value="1"
            :unchecked-value="0"
          />
        </NFormItemGridItem>

        <NFormItemGridItem
          :span="12" label="排序" path="sort"
        >
          <NInputNumber v-model:value="formModel.sort" :min="1" />
        </NFormItemGridItem>

        <NFormItemGridItem
          v-if="formModel.type !== MenuTypeEnum.BUTTON"
          :span="24" label="图标" path="icon"
        >
          <NInput v-model:value="formModel.icon" />
        </NFormItemGridItem>

        <NFormItemGridItem
          v-if="formModel.type === MenuTypeEnum.BUTTON"
          :span="24" label="权限值" path="perm"
        >
          <NInput v-model:value="formModel.perm" />
        </NFormItemGridItem>

        <NFormItemGridItem
          v-if="formModel.type === MenuTypeEnum.CATALOG"
          :span="24" label="重定向" path="redirect"
        >
          <NInput v-model:value="formModel.redirect" />
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
