<script lang="tsx" setup>
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import type { RowKey } from 'naive-ui/es/data-table/src/interface';
import type { TreeNodeProps, TreeOption } from 'naive-ui/es/tree/src/interface';
import { onMounted, reactive, ref } from 'vue';

import { getStatusLabel } from '@/constants';
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
      const status: Status = (row.status ?? 0) as Status;
      const tag = getStatusLabel(status);

      return <NTag type={tag.color}>{tag.label}</NTag>;
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
    fixed: 'right',
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
  <div class="h-full w-full flex flex-1-hidden flex-row items-start gap-16px <xl:flex-col">
    <NCard class="h-full min-w-fit w-1/4 shadow <xl:h-fit <xl:w-full" :bordered="false">
      <NInput v-model:value="treeKeyword" placeholder="搜索" />
      <NTree
        class="mt-16px"
        key-field="value"
        expand-on-click
        show-irrelevant-nodes
        accordion
        block-line
        :pattern="treeKeyword"
        :data="treeData"
        :node-props="nodeProps"
      />
    </NCard>

    <div class="h-full w-full flex flex-1-hidden flex-col gap-16px">
      <NCard :bordered="false" class="h-fit shadow">
        <KeywordsSearch
          v-model:keywords="queryParams.keywords"
          placeholder="请输入搜索关键字"
          label="关键字"
          @query="handleQuery"
          @reset="resetQuery"
        />
      </NCard>

      <NCard :bordered="false" class="h-full shadow">
        <div class="h-full flex flex-col gap-16px">
          <NSpace justify="space-between" class="w-full">
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
            remote striped flex-height
            scroll-x="960"
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
    </div>

    <TableActionModal
      :visible="modalVisible"
      :type="modalType"
      :edit-data="editData"
      @refresh="handleQuery"
      @update:visible="(v: boolean) => modalVisible = v"
    />
  </div>
</template>
