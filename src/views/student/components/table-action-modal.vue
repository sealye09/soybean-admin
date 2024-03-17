<script setup lang="ts">
import type { FormInst, SelectOption, TreeOption, UploadCustomRequestOptions, UploadFileInfo } from 'naive-ui';
import { computed, reactive, ref, watch } from 'vue';

import type { OptionType, StudentForm } from '@/service';
import {
  addStudent,
  getDeptOptions,
  getDictOptions,
  updateStudent,
  uploadImageApi,
} from '@/service';

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
  editData?: StudentForm;
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
    add: '新增学生',
    edit: '编辑学生',
  };
  return titles[props.type];
});

type TreeOptions = (TreeOption & OptionType)[];
type SelectOptions = (SelectOption & OptionType)[];
const genderOptions = ref<SelectOptions>();

const formRef = ref<HTMLElement & FormInst>();

type FormModel = StudentForm;

const formModel = reactive<FormModel>(createDefaultFormModel());
const menuOptions = ref<(OptionType & TreeOption)[]>([]);

function createDefaultFormModel(): FormModel {
  return {
    name: '',
    studentNo: '',
    gender: undefined,
    idCard: '',
    mobile: '',
    photo: '',
    nation: '',
    nativePlace: '',
    homeAddress: '',
    birthday: '',
    address: '',
    admissionTime: '',
    graduationTime: '',
    schoolingLength: '4',
    deptId: 0,
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
      if (props.editData?.deptId)
        formModel.deptId = props.editData.deptId;
    },
    edit: () => {
      if (props.editData)
        handleUpdateFormModel(props.editData);
    },
  };

  // promise all get options
  Promise.all([
    getDeptOptions(),
    getDictOptions('gender'),
  ],
  ).then(([
    deptOptions,
    dictOptions,
  ]) => {
    if (deptOptions.error) {
      window.$message?.error(deptOptions.error.msg);
      return;
    }
    menuOptions.value = [{ value: 0, label: '顶级部门', children: deptOptions.data }] as TreeOptions;

    if (dictOptions.error) {
      window.$message?.error(dictOptions.error.msg);
      return;
    }
    genderOptions.value = dictOptions.data.map(item => ({ value: Number(item.value), label: item.label })) as SelectOptions;
  }).then(() => handlers[props.type]());
}

/** 学生表单提交 */
async function handleSubmit() {
  await formRef.value?.validate();

  if (props.type === 'add') {
    const { error } = await addStudent(formModel);
    if (error) return;

    window.$message?.success('添加成功');
    closeModal();
    emit('refresh');
  }

  if (props.type === 'edit') {
    if (!props.editData || !props.editData.id) throw new Error('缺少编辑的数据');

    const { error } = await updateStudent(props.editData.id, formModel);
    if (error) return;

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

const previewFileList = computed<UploadFileInfo[]>(() => {
  if (formModel.photo)
    return [{ id: formModel.photo, name: formModel.photo, url: formModel.photo, status: 'finished' }];
  return [];
});

const showPreviewModal = ref(false);

function handlePreview() {
  showPreviewModal.value = true;
}

function customRequest({
  file,
  onFinish,
  onError,
}: UploadCustomRequestOptions) {
  if (!file.file) {
    window.$message?.error('文件不存在');
    return;
  }

  uploadImageApi(file.file).then(({ error, data }) => {
    if (error) {
      window.$message?.error(error.msg);
      onError();
    }
    if (data) {
      formModel.photo = data.url;
      onFinish();
    }
  });
}
</script>

<template>
  <NModal v-model:show="modalVisible" preset="card" :title="title" class="w-700px <lg:w-screen">
    <NForm ref="formRef" label-placement="left" :label-width="80" :model="formModel">
      <NGrid :cols="24" :x-gap="18">
        <NFormItemGridItem :span="24" label="所属班级" path="deptId" required>
          <NTreeSelect
            v-model:value="formModel.deptId"
            :options="menuOptions"
            key-field="value"
            clearable
            disabled
          />
        </NFormItemGridItem>

        <NFormItemGridItem
          :span="24"
          label="学生姓名"
          path="name"
          required
        >
          <NInput v-model:value="formModel.name" />
        </NFormItemGridItem>

        <NFormItemGridItem
          :span="24"
          label="照片"
          path="photo"
        >
          <NUpload
            :default-file-list="previewFileList"
            list-type="image-card"
            :custom-request="customRequest"
            accept=".png,.jpg"
            :default-upload="true"
            :max="1"
            @preview="handlePreview"
          />
          <NModal
            v-model:show="showPreviewModal"
            preset="card"
            style="width: 600px"
          >
            <img :src="formModel.photo" style="width: 100%">
          </NModal>
        </NFormItemGridItem>

        <NFormItemGridItem :span="12" label="性别" path="gender">
          <NSelect v-model:value="formModel.gender" :options="genderOptions" clearable remote />
        </NFormItemGridItem>

        <NFormItemGridItem
          :span="24"
          label="学号"
          path="studentNo"
          required
        >
          <NInput
            v-model:value="formModel.studentNo"
            :disabled="props.type === 'edit'"
          />
        </NFormItemGridItem>

        <NFormItemGridItem
          :span="24"
          label="身份证号"
          path="idCard"
          required
        >
          <NInput v-model:value="formModel.idCard" />
        </NFormItemGridItem>

        <NFormItemGridItem
          :span="24"
          label="手机号"
          path="mobile"
        >
          <NInput v-model:value="formModel.mobile" />
        </NFormItemGridItem>

        <NFormItemGridItem
          :span="24"
          label="民族"
          path="nation"
        >
          <NInput v-model:value="formModel.nation" />
        </NFormItemGridItem>

        <NFormItemGridItem
          :span="24"
          label="籍贯"
          path="nativePlace"
        >
          <NInput v-model:value="formModel.nativePlace" />
        </NFormItemGridItem>

        <NFormItemGridItem
          :span="24"
          label="家庭住址"
          path="homeAddress"
        >
          <NInput v-model:value="formModel.homeAddress" />
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
