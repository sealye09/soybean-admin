<script lang="tsx" setup>
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import type { RowKey } from 'naive-ui/es/data-table/src/interface';
import type { TreeNodeProps, TreeOption } from 'naive-ui/es/tree/src/interface';
import { onMounted, reactive, ref } from 'vue';

import { statusLabels } from '@/constants';
import type { OptionType, Status, UserForm, UserPageVO } from '@/service';
import { deleteUsers, getDeptOptions, getUserForm, getUserPage } from '@/service';

import type { ModalType } from './components/table-action-modal.vue';
import TableActionModal from './components/table-action-modal.vue';

defineOptions({ name: 'UserPage' });

const treeData = ref<(TreeOption & OptionType)[]>();
const loading = ref<boolean>(false);
const selectedIds = ref<number[]>([]);
const users = ref<UserPageVO[]>();

const queryParams = reactive<{
  keywords: string;
  status: Status | undefined;
  deptId: number | undefined;
}>({
  keywords: '',
  status: undefined,
  deptId: undefined,
});

const treeKeyword = ref('');
const nodeProps: TreeNodeProps = ({ option }) => {
  return {
    onclick() {
      queryParams.deptId = option.value as number;
      handleQuery();
      window.$message?.info(`点击了${option.label}`);
    },
  };
};

const modalVisible = ref<boolean>(false);
const modalType = ref<ModalType>('add');
const editData = ref<UserForm | null>(null);

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

function handleSelect(rowKeys: RowKey[]) {
  selectedIds.value = rowKeys as number[];
}

async function handleQuery() {
  loading.value = true;
  try {
    const { data } = await getUserPage({
      pageNum: pagination.page ?? 1,
      pageSize: pagination.pageSize ?? 10,
      ...queryParams,
    });
    users.value = data?.list;
    pagination.itemCount = data?.total ?? 0;
  } finally {
    loading.value = false;
  }
}

const columns = ref<DataTableColumns<UserPageVO>>([
  {
    type: 'selection',
    align: 'center',
  },
  {
    key: 'index',
    title: '#',
    width: 50,
    align: 'center',
    render: (_, index) => index + 1,
  },
  {
    key: 'id',
    title: '用户id',
    align: 'center',
  },
  {
    key: 'username',
    title: '用户名',
    align: 'center',
  },
  {
    key: 'nickname',
    title: '昵称',
    align: 'center',
  },
  {
    key: 'mobile',
    title: '手机号',
    width: 120,
    align: 'center',
  },
  {
    key: 'genderLabel',
    title: '性别',
    width: 80,
    align: 'center',
  },
  {
    key: 'status',
    title: '状态',
    width: 80,
    align: 'center',
    render: (row) => {
      const tagTypes: Record<Status, NaiveUI.ThemeColor> = {
        0: 'error',
        1: 'success',
      };
      const status = +Boolean(row.status) as Status;
      if (row.status)
        return <NTag type={tagTypes[status]}>{statusLabels[status]}</NTag>;
      else
        return <NTag type={tagTypes[status]}>{statusLabels[status]}</NTag>;
    },
  },
  {
    key: 'createTime',
    title: '创建时间',
    width: 120,
    align: 'center',
  },
  {
    key: 'actions',
    title: '操作',
    align: 'center',
    width: 150,
    render: _row => (
      <NSpace justify="center">
        <NButton
          size="small"
          type="warning"
          ghost
          onClick={() => showEditModal(_row)}
        >
          编辑
        </NButton>
        <NPopconfirm onPositiveClick={() => handleDeleteOne(_row.id)}>
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
    ),
  },
]);

function handleDeleteOne(id?: number) {
  if (!id) return;
  const ids = [id].join(',');
  deleteUsers(ids).then(({ error }) => {
    if (error) {
      window.$message?.error(error.msg);
      return;
    }
    window.$message?.success('删除成功');
    handleQuery();
  });
  console.log('delete one');
}

function handleDeleteMany() {
  console.log('delete many');
  if (!selectedIds.value.length) {
    window.$message?.info('请先选择要删除的用户');
    return;
  }

  const ids = selectedIds.value.join(',');

  window.$dialog?.info({
    title: '警告',
    content: '确认删除已选中的数据项?',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      deleteUsers(ids).then(({ error }) => {
        if (error) {
          window.$message?.error(error.msg);
          return;
        }
        window.$message?.success('删除成功');
        handleQuery();
      }).finally(() => {
        selectedIds.value = [];
      });
    },
  });
}

function showEditModal(row: UserPageVO) {
  if (!row.id) return;

  getUserForm(row.id).then(({ data }) => {
    editData.value = data;
    modalType.value = 'edit';
    modalVisible.value = true;
  });
}

function showAddModal() {
  modalType.value = 'add';
  modalVisible.value = true;
}

async function resetQuery() {
  queryParams.keywords = '';
  queryParams.status = undefined;
  queryParams.deptId = undefined;
  await handleQuery();
}

onMounted(() => {
  getDeptOptions().then(async ({ data }) => {
    console.log(data);
    treeData.value = (data as any || []);
    await handleQuery();
  });
});
</script>

<template>
  <div class="h-full w-full flex flex-row items-start gap-16px overflow-hidden <lg:flex-col">
    <NCard class="h-full min-w-fit w-1/5 <lg:h-fit <lg:w-full" :bordered="false">
      <NInput v-model:value="treeKeyword" placeholder="搜索" />
      <NTree
        class="mt-16px"
        :pattern="treeKeyword"
        :data="treeData"
        key-field="value"

        expand-on-click show-irrelevant-nodes accordion block-line
        :node-props="nodeProps"
      />
    </NCard>

    <NCard title="用户管理" :bordered="false" class="h-full rounded-8px shadow-sm">
      <div class="h-full flex flex-col">
        <NForm label-placement="left" inline>
          <NFormItem label="关键字">
            <NInput v-model:value="queryParams.keywords" placeholder="请输入搜索关键字" />
          </NFormItem>

          <NFormItem>
            <NButton type="primary" @click="handleQuery">
              <template #icon>
                <SvgIcon icon="lucide:plus" class="text-20px" />
              </template>
              搜索
            </NButton>
          </NFormItem>

          <NFormItem>
            <NButton
              @click="resetQuery"
            >
              <template #icon>
                <SvgIcon icon="lucide:x" class="text-20px" />
              </template>
              重置
            </NButton>
          </NFormItem>
        </NForm>

        <NSpace class="pb-12px" justify="space-between">
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
            <NButton type="success">
              <template #icon>
                <SvgIcon icon="lucide:download" class="text-20px" />
              </template>
              导出数据
            </NButton>
          </NSpace>

          <NSpace align="center" :size="18">
            <NButton ghost size="small" type="primary" @click="handleQuery">
              <template #icon>
                <SvgIcon icon="lucide:refresh-cw" class="text-16px" :class="{ 'animate-spin': loading }" />
              </template>
              刷新表格
            </NButton>
            <ColumnSetting v-model:columns="columns">
              <template #trigger>
                <NButton size="small" type="primary" ghost>
                  <template #icon>
                    <SvgIcon icon="lucide:settings" class="text-16px" />
                  </template>
                  表格列设置
                </NButton>
              </template>
            </ColumnSetting>
          </NSpace>
        </NSpace>

        <NDataTable
          class="flex-1-hidden"
          remote striped flex-height
          :single-line="false"
          :bordered="false"
          :columns="columns"
          :data="users"
          :loading="loading"
          :row-key="(row) => row.id"
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
      @update:visible="(v: boolean) => modalVisible = v"
    />
  </div>
</template>
