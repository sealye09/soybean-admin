/** 通知查询参数 */
export interface StudentPageQuery extends PageQuery {
  keywords?: string;

  deptId?: number;
}

/** 角色分页对象 */
export interface StudentPageVO {
  id: number;

  name: string;

  studentNo: string;

  gender: number;

  idCard: string;

  photo: string;

  mobile: string;

  nation: string;

  nativePlace: string;

  homeAddress: string;

  birthday: string;

  address: string;

  admissionTime: string;

  graduationTime: string;

  schoolingLength: string;

  // 专业、班级、学院
  deptId: number;
}

/** 角色分页 */
export type StudentPageResult = PageResult<StudentPageVO[]>;

/** 角色表单对象 */
export interface StudentForm {
  id?: number;

  name: string;

  studentNo: string;

  gender?: number;

  idCard: string;

  photo: string;

  mobile: string;

  nation: string;

  nativePlace: string;

  homeAddress: string;

  birthday: string;

  address: string;

  admissionTime: string;

  graduationTime: string;

  schoolingLength: string;

  // 专业、班级、学院
  deptId: number;
}
