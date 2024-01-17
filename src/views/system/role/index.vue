<script setup lang="tsx">
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import type { RowKey } from 'naive-ui/es/data-table/src/interface';
import { onMounted, reactive, ref } from 'vue';

import { getStatusLabel } from '@/constants';
import type { RoleForm, RolePageVO, RoleQuery, Status } from '@/service';
import { deleteRoles, getRoleForm, getRolePage } from '@/service';

import type { AssignRoleState } from './components/assign-permission-drawer.vue';
import DictDetailModal from './components/assign-permission-drawer.vue';
import type { ModalType } from './components/table-action-modal.vue';
import TableActionModal from './components/table-action-modal.vue';

defineOptions({ name: 'RolePage' });

const loading = ref<boolean>(false);
const selectedIds = ref<number[]>([]);
const roleList = ref<RolePageVO[]>();
const keywords = ref<string>('');

const modalVisible = ref<boolean>(false);
const modalType = ref<ModalType>('add');

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

const roleAssignState = reactive<AssignRoleState>({
  roleId: -1,
  show: false,
  title: '',
});

const columns = ref<DataTableColumns<RolePageVO>>([
  {
    type: 'selection',
    align: 'center',
  },
  {
    key: 'index',
    title: '#',
    align: 'center',
    width: 80,
    render: (_, index) => {
      return index + 1;
    },
  },
  {
    key: 'id',
    title: '角色id',
    align: 'center',
  },
  {
    key: 'name',
    title: '角色名称',
    align: 'center',
  },
  {
    key: 'code',
    title: '角色代码',
    align: 'center',
  },
  {
    key: 'status',
    title: '状态',
    align: 'center',
    render: (row) => {
      const status: Status = (row.status ?? 0) as Status;
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
            type="info"
            ghost
            onClick={() => {
              roleAssignState.roleId = row.id as number;
              roleAssignState.show = true;
              roleAssignState.title = `角色【${row.name}】分配权限`;
            }}
          >
            分配权限
          </NButton>
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

/** 查询 */
async function handleQuery() {
  loading.value = true;
  // 从 pagination 中获取 pageNum 和 pageSize
  const queryParams: RoleQuery = {
    pageNum: pagination.page || 1,
    pageSize: pagination.pageSize || 10,
    keywords: keywords.value,
  };
  const { data } = await getRolePage(queryParams);

  roleList.value = data?.list;
  pagination.itemCount = data?.total || 0;
  loading.value = false;
}

/**
 * 重置查询
 */
function resetQuery() {
  pagination.page = 1;
  keywords.value = '';
  handleQuery();
}

function handleSelect(selectedRowKeys: RowKey[]) {
  selectedIds.value = selectedRowKeys as number[];
}

function handleDelete(id?: number) {
  if (!id) return;

  const deleteIds = [id].join(',');

  deleteRoles(deleteIds).then(({ data, error }) => {
    if (!data && error) {
      window.$message?.error(error.msg);
      return;
    }
    window.$message?.success('删除成功');
    resetQuery();
  });
}

function handleDeleteMany() {
  const deleteIds = [selectedIds.value].join(',');

  if (!deleteIds) {
    window.$message?.warning('请勾选删除项');
    return;
  }

  window.$dialog?.info({
    title: '警告',
    content: '确认删除已选中的数据项?',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      deleteRoles(deleteIds).then(() => {
        window.$message?.success('删除成功');
        resetQuery();
      }).finally(() => {
        selectedIds.value = [];
      });
    },
  });
}

function showAddModal() {
  modalType.value = 'add';
  modalVisible.value = true;
}

const editData = ref<RoleForm | null>(null);

function showEditModal(id?: number) {
  if (!id) return;

  getRoleForm(id).then(({ data }) => {
    editData.value = data;
    modalType.value = 'edit';
    modalVisible.value = true;
  });
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="h-full flex flex-col gap-16px overflow-hidden">
    <NCard :bordered="false" class="h-fit shadow">
      <KeywordsSearch
        v-model:keywords="keywords"
        placeholder="请输入搜索关键字"
        label="关键字"
        @query="handleQuery"
        @reset="resetQuery"
      />
    </NCard>

    <NCard :bordered="false" class="h-full shadow">
      <div class="h-full flex flex-col gap-12px">
        <NSpace justify="space-between">
          <NSpace>
            <NButton type="primary" @click="showAddModal">
              <template #icon>
                <SvgIcon icon="lucide:plus" class="text-20px" />
              </template>
              新增
            </NButton>
            <NButton type="error" @click="handleDeleteMany">
              <template #icon>
                <SvgIcon icon="lucide:trash-2" class="text-20px" />
              </template>
              删除
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
          flex-height
          remote
          striped
          :scroll-x="1000"
          :single-line="false"
          :columns="columns"
          :data="roleList"
          :loading="loading"
          :row-key="row => row.id"
          :pagination="pagination"
          @update:checked-row-keys="handleSelect"
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

    <DictDetailModal
      v-model:show="roleAssignState.show"
      :title="roleAssignState.title"
      :role-id="roleAssignState.roleId"
      @refresh="handleQuery"
    />
  </div>
</template>

<style scoped></style>
