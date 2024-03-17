<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import { onMounted, ref } from 'vue';

import SvgIcon from '@/components/custom/svg-icon.vue';
import { getStatusLabel, menuTypes } from '@/constants';
import type { MenuForm, MenuQuery, MenuVO, Status } from '@/service';
import { deleteMenu, getMenuForm, listMenus } from '@/service';

import type { ModalType } from './components/table-action-modal.vue';
import TableActionModal from './components/table-action-modal.vue';

// eslint-disable-next-line vue/no-reserved-component-names
defineOptions({ name: 'Menu' });

const loading = ref<boolean>(false);
const dictTypeList = ref<MenuVO[]>();
const keywords = ref<string>('');

const modalVisible = ref<boolean>(false);
const modalType = ref<ModalType>('add');
const editData = ref<MenuForm>();

const columns = ref<DataTableColumns<MenuVO>>([
  {
    key: 'index',
    title: '#',
    align: 'center',
    width: 120,
    render: (_, index) => {
      return index + 1;
    },
  },
  {
    key: 'id',
    title: '菜单id',
    align: 'center',
    width: 80,
  },
  {
    key: 'name',
    title: '菜单名称',
    align: 'center',
  },
  {
    key: 'type',
    title: '类型',
    align: 'center',
    render: (row) => {
      const typeTag = menuTypes.find(item => item.value === row.type);

      return <NTag type={typeTag?.color}>{typeTag?.label}</NTag>;
    },
  },
  {
    key: 'path',
    title: '路径',
    align: 'center',
  },
  {
    key: 'component',
    title: '渲染组件',
    align: 'center',
  },
  {
    key: 'perm',
    title: '权限值',
    align: 'center',
  },
  {
    key: 'sort',
    title: '排序',
    align: 'center',
    width: 80,
  },
  {
    key: 'visible',
    title: '状态',
    align: 'center',
    minWidth: 80,
    render: (row) => {
      const status: Status = row.visible as Status;
      const tag = getStatusLabel(status);

      return <NTag type={tag.color}>{tag.value ? '显示' : '隐藏'}</NTag>;
    },
  },
  {
    key: 'icon',
    title: '图标',
    align: 'center',
    width: 60,
    render: row => <NButton class="hover:cursor-default" text type="primary" renderIcon={() => <SvgIcon icon={row.icon} />} />,
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
            onClick={() => showAddModal(row.id)}
          >
            新增
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
  const queryParams: MenuQuery = {
    keywords: keywords.value,
  };
  const { data, error } = await listMenus(queryParams);
  if (!data) {
    window.$message?.error(error?.msg ?? '查询失败');
    return;
  }

  dictTypeList.value = data;
  loading.value = false;
}

/**
 * 重置查询
 */
function resetQuery() {
  keywords.value = '';
  handleQuery();
}

function handleDelete(id?: number) {
  if (!id) {
    window.$message?.error('id 不能为空');
    return;
  }
  deleteMenu(id).then(({ error }) => {
    if (error) {
      window.$message?.error(error.msg);
      return;
    }
    window.$message?.success('删除成功');
    resetQuery();
  });
}

function showAddModal(parentId?: number) {
  modalType.value = 'add';
  if (parentId)
    editData.value = { parentId } as MenuForm;
  modalVisible.value = true;
}

function showEditModal(id?: number) {
  if (!id) {
    window.$message?.error('id 不能为空');
    return;
  }

  getMenuForm(id).then(({ data, error }) => {
    if (!data) {
      window.$message?.error(error?.msg ?? '获取数据失败');
      return;
    }
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
        placeholder="请输入搜索菜单名称"
        label="菜单名称"
        @query="handleQuery"
        @reset="resetQuery"
      />
    </NCard>

    <NCard :bordered="false" class="h-full shadow">
      <div class="h-full flex flex-col gap-12px">
        <NSpace justify="space-between">
          <NSpace>
            <NButton type="primary" @click="() => showAddModal()">
              <template #icon>
                <SvgIcon icon="lucide:plus" class="text-20px" />
              </template>
              新增菜单
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
          remote flex-height single-column
          single-line
          :scroll-x="1000"
          :columns="columns"
          :data="dictTypeList"
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
