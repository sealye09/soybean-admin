/** 通知查询参数 */
export interface NotificationQuery extends PageQuery {
  keywords?: string;

  status?: number;
}

/** 角色分页对象 */
export interface NotificationPageVO {
  id?: number;

  title: string;

  content: string;

  status?: number;

  createTime?: string;

  updateTime?: string;
}

/** 角色分页 */
export type NotificationPageResult = PageResult<NotificationPageVO[]>;

/** 角色表单对象 */
export interface NotificationForm {

  id?: number;

  title: string;

  content: string;

  status?: number;
}
