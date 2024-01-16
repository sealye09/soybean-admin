import type { Status } from '@/service';

export type StatusTag = {
  value: Status;
  label: string;
  color: NaiveUI.ThemeColor;
};

/**
 * 状态
 * 0: 禁用
 * 1: 启用
 */
export const statusLabels: StatusTag[] = [
  {
    value: 0,
    label: '禁用',
    color: 'error',
  },
  {
    value: 1,
    label: '启用',
    color: 'success',
  },
];

export function getStatusLabel(status: Status): StatusTag {
  return statusLabels.find(item => item.value === status) || statusLabels[0];
}

/**
 * 角色的数据权限
 */
export const dataScopes = [
  {
    value: 0,
    label: '全部数据',
  },
  {
    value: 1,
    label: '部门及子部门数据',
  },
  {
    value: 2,
    label: '本部门数据',
  },
  {
    value: 3,
    label: '本人数据',
  },
];
