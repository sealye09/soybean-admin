<script setup lang="tsx">
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import { NButton, NPopconfirm, NSpace } from 'naive-ui';
import { computed, onMounted, reactive, ref } from 'vue';

import type { DeptVO, StudentForm, StudentPageQuery, StudentPageVO } from '@/service';
import {
  // deleteDept,
  getDeptsByParentId,
  getStudentForm,
  getStudentList,
} from '@/service';

import TableActionModal from './components/table-action-modal.vue';

defineOptions({ name: 'Student' });

const rootId = 1;

const loading = ref<boolean>(false);
const optionsLoading = ref<boolean>(false);
const collegeId = ref<number>();
const colleges = ref<DeptVO[]>([]);
const majorId = ref<number>();
const majors = ref<DeptVO[]>([]);
const classId = ref<number>();
const classes = ref<DeptVO[]>([]);

const keywords = ref<string>('');

const students = ref<StudentPageVO[]>([]);

const modalType = ref<'add' | 'edit'>();
const modalVisible = ref<boolean>(false);
const editData = ref<StudentForm>();

const pagination: PaginationProps = reactive({
  disabled: loading.value,
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  showQuickJumper: true,
  pageSizes: [10, 20, 30, 50],
  onChange: (page: number) => {
    pagination.page = page;
    handleQuery();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    handleQuery();
  },
});

const queryParams = computed<StudentPageQuery>(() => {
  return {
    pageNum: pagination.page ?? 1,
    pageSize: pagination.pageSize ?? 10,
    keywords: keywords.value,
    deptId: classId.value,
  };
});

function showAddModal() {
  if (!queryParams.value.deptId) {
    window.$message?.error('请选择班级');
    return;
  }
  modalType.value = 'add';
  editData.value = { deptId: queryParams.value.deptId } as StudentForm;
  modalVisible.value = true;
}

function showEditModal(id?: number) {
  if (!id) {
    window.$message?.error('id 不能为空');
    return;
  }

  getStudentForm(id).then(({ data, error }) => {
    if (!data) {
      window.$message?.error(error?.msg ?? '获取数据失败');
      return;
    }
    editData.value = data;
    modalType.value = 'edit';
    modalVisible.value = true;
  });
}

const columns = ref<DataTableColumns<StudentPageVO>>([
  {
    key: 'index',
    title: '#',
    width: 80,
    align: 'center',
    render: (_, index) => index + 1,
  },
  {
    key: 'id',
    title: 'id',
    align: 'center',
    width: 80,
  },
  {
    key: 'photo',
    title: '照片',
    align: 'center',
    render: row => (
      <n-image
        width="100"
        src={row.photo}
      />
    ),
  },
  {
    key: 'name',
    title: '姓名',
    align: 'center',
  },
  {
    key: 'studentNo',
    title: '学号',
    align: 'center',
  },
  {
    key: 'nativePlace',
    title: '籍贯',
    align: 'center',
  },
  {
    key: 'actions',
    title: '操作',
    align: 'center',
    width: 300,
    fixed: 'right',
    render: (row) => {
      return (
        <NSpace justify="center">
          <NButton
            size="small"
            type="warning"
            ghost
            onClick={() => showEditModal(row.id)}
          >
            编辑
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
            {{
              default: () => '确认删除',
              trigger: () => (
                <NButton
                  size="small"
                  type="error"
                  ghost
                >
                  删除
                </NButton>
              ),
            }}
          </NPopconfirm>
        </NSpace>
      );
    },
  },
]);

function handleDelete(id: number | undefined): any {
  if (id === undefined) return;

  // const ids = [id].join(',');
  // deleteDept(ids).then(({ error }) => {
  //   if (error) {
  //     window.$message?.error(error.msg);
  //     return;
  //   }
  //   window.$message?.success('删除成功');
  //   handleQuery();
  // });

  window.$message?.success(`删除成功: ${id}`);
}

async function loadCollegeOptions() {
  optionsLoading.value = true;
  const res = await getDeptsByParentId(rootId);
  if (res.data)
    colleges.value = res.data;
  else
    console.error(res.error);

  optionsLoading.value = false;
}

async function loadMajorOptions() {
  if (!collegeId.value) return;

  optionsLoading.value = true;
  const res = await getDeptsByParentId(collegeId.value);
  if (res.data)
    majors.value = res.data;
  else
    console.error(res.error);

  optionsLoading.value = false;
}

async function loadClassOptions() {
  if (!majorId.value) return;

  optionsLoading.value = true;
  const res = await getDeptsByParentId(majorId.value);
  if (res.data)
    classes.value = res.data;
  else
    console.error(res.error);

  optionsLoading.value = false;
}

async function handleQuery() {
  loading.value = true;
  try {
    const res = await getStudentList({ ...queryParams.value });
    students.value = res.data?.list ?? [];
    pagination.itemCount = res.data?.total ?? 0;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadCollegeOptions();
});

function handleCollegeChange(value: number) {
  collegeId.value = value;
  majors.value = [];
  majorId.value = undefined;
  classes.value = [];
  classId.value = undefined;
  loadMajorOptions();
}

function handleMajorChange(value: number) {
  majorId.value = value;
  classes.value = [];
  classId.value = undefined;
  loadClassOptions();
}

function handleClassChange(value: number) {
  classId.value = value;
  handleQuery();
}
</script>

<template>
  <div class="h-full flex flex-col gap-16px overflow-hidden">
    <NCard :bordered="false" class="h-fit shadow">
      <div class="flex flex-col gap-16px overflow-hidden">
        <NSpace class="simple-search">
          <NFormItem label="学院" label-placement="left" :show-feedback="false">
            <NSelect
              :value="collegeId"
              placeholder="请选择学院"
              clearable
              value-field="id"
              label-field="name"
              :options="colleges"
              :disabled="optionsLoading"
              class="w-250px"
              @update:value="handleCollegeChange"
            />
          </NFormItem>

          <NFormItem label="专业" label-placement="left" :show-feedback="false">
            <NSelect
              :value="majorId"
              placeholder="请选择专业"
              clearable
              value-field="id"
              label-field="name"
              :options="majors"
              :disabled="optionsLoading"
              class="w-250px"
              :fallback-option="false"
              @update:value="handleMajorChange"
            />
          </NFormItem>

          <NFormItem label="班级" label-placement="left" :show-feedback="false">
            <NSelect
              :value="classId"
              placeholder="请选择班级"
              clearable
              value-field="id"
              label-field="name"
              :options="classes"
              :disabled="optionsLoading"
              class="w-250px"
              :fallback-option="false"
              @update:value="handleClassChange"
            />
          </NFormItem>
        </NSpace>

        <NSpace class="simple-search">
          <NFormItem label="关键字" label-placement="left" :show-feedback="false">
            <NInput v-model:value="keywords" placeholder="请输入关键字" clearable />
          </NFormItem>

          <NButton type="primary" :disabled="loading" @click="handleQuery">
            <template #icon>
              <SvgIcon icon="lucide:search" class="text-20px" />
            </template>
            搜索
          </NButton>
        </NSpace>
      </div>
    </NCard>

    <NCard :bordered="false" class="h-full shadow">
      <div class="h-full flex flex-col gap-12px">
        <NSpace justify="space-between">
          <NSpace>
            <NButton type="primary" @click="() => showAddModal()">
              <template #icon>
                <SvgIcon icon="lucide:plus" class="text-20px" />
              </template>
              新增学生
            </NButton>
          </NSpace>
          <NSpace align="center" :size="18">
            <RefreshIconButton
              :loading="loading"
              @refresh="handleQuery"
            />
            <ColumnSetting v-model:columns="columns">
              <template #trigger>
                <ColumnSettingButton />
              </template>
            </ColumnSetting>
          </NSpace>
        </NSpace>

        <NDataTable
          class="flex-1-hidden"
          :bordered="false"
          remote
          single-column
          single-line
          flex-height
          :scroll-x="1000"
          :columns="columns"
          :data="students"
          :loading="loading"
          :row-key="row => row.id"
          :pagination="pagination"
        />
      </div>
    </NCard>

    <TableActionModal
      :visible="modalVisible"
      :type="modalType"
      :edit-data="editData"
      @refresh="handleQuery"
      @update:visible="(v) => modalVisible = v"
    />
  </div>
</template>
