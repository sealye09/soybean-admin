<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import { onMounted, ref } from 'vue';

import { getStatusLabel } from '@/constants';
import type { DeptForm, DeptVO, Status } from '@/service';
import { deleteDept, getDeptForm, getDeptsByParentId } from '@/service';

import TableActionModal from './components/table-action-modal.vue';

const parentId = 1;

const loading = ref<boolean>(false);
const colleges = ref<DeptVO[]>([]);

const modalType = ref<'add' | 'edit'>();
const modalVisible = ref<boolean>(false);
const editData = ref<DeptForm>();

function showAddModal() {
  modalType.value = 'add';
  modalVisible.value = true;
}

function showEditModal(id?: number) {
  if (!id) {
    window.$message?.error('id 不能为空');
    return;
  }

  getDeptForm(id).then(({ data, error }) => {
    if (!data) {
      window.$message?.error(error?.msg ?? '获取数据失败');
      return;
    }
    editData.value = data;
    modalType.value = 'edit';
    modalVisible.value = true;
  });
}

const columns = ref<DataTableColumns<DeptVO>>([
  {
    key: 'index',
    title: '#',
    width: 80,
    align: 'center',
    render: (_, index) => index + 1,
  },
  {
    key: 'id',
    title: '学院id',
    align: 'center',
    width: 80,
  },
  {
    key: 'name',
    title: '学院名称',
    align: 'center',
  },
  {
    key: 'sort',
    title: '排序',
    align: 'center',
    width: 80,
  },
  {
    key: 'status',
    title: '状态',
    align: 'center',
    minWidth: 80,
    render: (row) => {
      const status: Status = row.status as Status;
      const tag = getStatusLabel(status);

      return <NTag type={tag.color}>{tag.label}</NTag>;
    },
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

  const ids = [id].join(',');
  deleteDept(ids).then(({ error }) => {
    if (error) {
      window.$message?.error(error.msg);
      return;
    }
    window.$message?.success('删除成功');
    handleQuery();
  });
}

function handleQuery(): void {
  loading.value = true;
  getDeptsByParentId(parentId).then((res) => {
    if (res.data)
      colleges.value = res.data;
    else
      console.error(res.error);
  }).finally(() => {
    loading.value = false;
  });
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="h-full flex flex-col gap-16px overflow-hidden">
    <NCard :bordered="false" class="h-full shadow">
      <div class="h-full flex flex-col gap-12px">
        <NSpace justify="space-between">
          <NSpace>
            <NButton type="primary" @click="() => showAddModal()">
              <template #icon>
                <SvgIcon icon="lucide:plus" class="text-20px" />
              </template>
              新增学院
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
          :bordered="false" remote flex-height
          single-column
          single-line
          :scroll-x="1000"
          :columns="columns"
          :data="colleges"
          :loading="loading"
          :row-key="row => row.id"
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
