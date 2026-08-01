export type AdminSection =
  | "dashboard"
  | "caregivers"
  | "patients"
  | "requests"
  | "schedules"
  | "taskTemplates"
  | "records"
  | "messages"
  | "reviews"
  | "settings";

export interface StatCard {
  label: string;
  value: string;
  tone: "blue" | "green" | "amber" | "red" | "neutral";
}

export interface CareRequest {
  id: string;
  patient: string;
  family: string;
  caregiver: string;
  dateRange: string;
  shift: string;
  status: "待审核" | "已确认" | "已驳回" | "冲突";
  note: string;
}

export interface Caregiver {
  id: string;
  name: string;
  employeeNo: string;
  phone: string;
  experience: string;
  specialty: string;
  rating: string;
  serviceStatus: "可服务" | "服务中" | "休息中";
  accountStatus: "启用" | "停用";
}

export interface Patient {
  id: string;
  name: string;
  location: string;
  familyCount: number;
  currentCaregiver: string;
  status: "服务中" | "待开始" | "未服务";
}

export interface ScheduleItem {
  id: string;
  date: string;
  shift: string;
  patient: string;
  caregiver: string;
  status: "待开始" | "进行中" | "已完成";
}

export interface TaskTemplate {
  id: string;
  name: string;
  type: string;
  defaultTime: string;
  method: string;
  enabled: boolean;
}

export interface CareRecord {
  id: string;
  time: string;
  patient: string;
  caregiver: string;
  task: string;
  status: "已完成" | "已跳过" | "已超时" | "待执行";
  images: number;
  remark: string;
}

export interface MessageThread {
  id: string;
  patient: string;
  lastSender: string;
  content: string;
  unread: number;
  status: "待处理" | "已处理";
}

export interface Review {
  id: string;
  caregiver: string;
  patient: string;
  rating: string;
  tags: string;
  content: string;
  processStatus: "正常" | "需回访" | "已处理";
}
