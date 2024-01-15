export interface OptionType {
  /** 值 */
  value: string | number;
  /** 文本 */
  label: string;
  /** 子列表  */
  children?: OptionType[];
}

/** 状态(1:启用;0:禁用) */
export type Status = 1 | 0;
