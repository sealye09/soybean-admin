<script setup lang="tsx">
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import type { RowKey } from 'naive-ui/es/data-table/src/interface';
import { onMounted, reactive, ref } from 'vue';

import { statusLabels } from '@/constants';
import type { DictTypeForm, DictTypePageVO, DictTypeQuery, Status } from '@/service';
import { deleteDictTypes, getDictTypeForm, getDictTypePage } from '@/service';

import ColumnSetting from './components/column-setting.vue';
import DictDetailModal from './components/dict-detail-modal.vue';
import type { ModalType } from './components/table-action-modal.vue';
import TableActionModal from './components/table-action-modal.vue';

defineOptions({
  name: 'DictType',
});

const loading = ref<boolean>(false);
const selectedIds = ref<number[]>([]);
const dictTypeList = ref<DictTypePageVO[]>();
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

const dictDetailState = reactive({
  typeCode: '',
  show: false,
  title: '',
});

const columns = ref<DataTableColumns<DictTypePageVO>>([
  {
    type: 'selection',
    align: 'center',
  },
  {
    key: 'index',
    title: '#',
    align: 'center',
    render: (_, index) => {
      return index + 1;
    },
  },
  {
    key: 'id',
    title: '字典类型id',
    align: 'center',
  },
  {
    key: 'name',
    title: '字典类型名称',
    align: 'center',
  },
  {
    key: 'code',
    title: '字典类型代码',
    align: 'center',
  },
  {
    key: 'remark',
    title: '描述',
    align: 'center',
  },
  {
    key: 'status',
    title: '状态',
    align: 'center',
    render: (row) => {
      const tagTypes: Record<Status, NaiveUI.ThemeColor> = {
        0: 'error',
        1: 'success',
      };
      if (row.status)
        return <NTag type={tagTypes[row.status]}>{statusLabels[row.status]}</NTag>;
      else
        return <NTag type={tagTypes[row.status]}>{statusLabels[row.status]}</NTag>;
    },
  },
  {
    key: 'actions',
    title: '操作',
    align: 'center',
    width: 300,
    render: (row) => {
      return (
        <NSpace justify="center">
          <NButton
            size="small"
            type="info"
            ghost
            onClick={() => {
              dictDetailState.title = `字典类型: ${row.name}`;
              dictDetailState.typeCode = row.code;
              dictDetailState.show = true;
            }}
          >
            查看字典
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
  const queryParams: DictTypeQuery = {
    pageNum: pagination.page || 1,
    pageSize: pagination.pageSize || 10,
    keywords: keywords.value,
  };
  const { data } = await getDictTypePage(queryParams);

  dictTypeList.value = data?.list;
  pagination.itemCount = data?.total || 0;
  console.log('🚀 ~ handleQuery ~ pagination:', pagination);
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

function handleDelete(id: number) {
  const deleteIds = [id].join(',');

  deleteDictTypes(deleteIds).then(() => {
    window.$message?.success('删除成功');
    resetQuery();
  });
}

/** 批量删除字典类型 */
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
      deleteDictTypes(deleteIds).then(() => {
        window.$message?.success('删除成功');
        resetQuery();
      });
    },
    onNegativeClick() {
    },
  });
}

function showAddModal() {
  modalType.value = 'add';
  modalVisible.value = true;
}

const editData = ref<DictTypeForm | null>(null);

function showEditModal(id: RowKey) {
  getDictTypeForm(id as number).then(({ data }) => {
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
  <div class="overflow-hidden">
    <n-card title="字典管理" :bordered="false" class="h-full rounded-8px shadow-sm">
      <div class="h-full flex flex-col">
        <n-form label-placement="left" inline>
          <n-form-item label="关键字">
            <n-input v-model:value="keywords" placeholder="请输入搜索关键字" />
          </n-form-item>

          <n-form-item>
            <NButton type="primary" @click="handleQuery">
              <template #icon>
                <icon-lucide:plus class="text-20px" />
              </template>
              搜索
            </NButton>
          </n-form-item>

          <n-form-item>
            <NButton
              @click="resetQuery"
            >
              <template #icon>
                <icon-lucide:x class="text-20px" />
              </template>
              重置
            </NButton>
          </n-form-item>
        </n-form>

        <NSpace class="pb-12px" justify="space-between">
          <NSpace>
            <NButton type="primary" @click="showAddModal">
              <template #icon>
                <icon-lucide:plus class="text-20px" />
              </template>
              新增
            </NButton>
            <NButton type="error" @click="handleDeleteMany">
              <template #icon>
                <icon-lucide:trash-2 class="text-20px" />
              </template>
              删除
            </NButton>
            <NButton type="success">
              <template #icon>
                <icon-lucide:download class="text-20px" />
              </template>
              导出数据
            </NButton>
          </NSpace>
          <NSpace align="center" :size="18">
            <NButton ghost size="small" type="primary" @click="handleQuery">
              <template #icon>
                <icon-lucide:refresh-cw class="text-16px" :class="{ 'animate-spin': loading }" />
              </template>
              刷新表格
            </NButton>
            <ColumnSetting v-model:columns="columns" />
          </NSpace>
        </NSpace>

        <NDataTable
          class="flex-1-hidden"
          flex-height
          remote
          striped
          :single-line="false"
          :columns="columns"
          :data="dictTypeList"
          :loading="loading"
          :row-key="row => row.id"
          :pagination="pagination"
          :paginate-single-page="false"
          @update:checked-row-keys="handleSelect"
        />
      </div>
    </n-card>

    <TableActionModal
      :visible="modalVisible"
      :type="modalType"
      :edit-data="editData"
      @refresh="handleQuery"
      @update:visible="(v) => modalVisible = v"
    />

    <DictDetailModal
      v-model:show="dictDetailState.show"
      :type-code="dictDetailState.typeCode"
      :title="dictDetailState.title"
    />
  </div>
</template>

<style scoped></style>
