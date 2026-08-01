export type FamilyTab = "home" | "caregivers" | "tasks" | "records" | "profile";

export type FamilyTaskStatus =
  | "PENDING_CONFIRM"
  | "PENDING_EXECUTE"
  | "COMPLETED"
  | "SKIPPED"
  | "OVERDUE"
  | "NEED_ADJUST"
  | "REJECTED";

export interface FamilyPatient {
  id: string;
  name: string;
  relation: string;
  gender: "男" | "女";
  age: number;
  hospital: string;
  department: string;
  bed: string;
  authorizationStatus: "已授权" | "待确认";
}

export interface FamilyCaregiver {
  id: string;
  name: string;
  gender: "男" | "女";
  experienceYears: number;
  specialty: string[];
  rating: number;
  serviceCount: number;
  status: "可申请" | "服务中" | "休息中";
  intro: string;
  recentReviews: string[];
}

export interface FamilyService {
  id: string;
  patientId: string;
  caregiverId: string;
  caregiverName: string;
  period: string;
  shift: string;
  location: string;
  status: "服务中" | "待开始" | "已结束";
  completedTasks: number;
  totalTasks: number;
}

export interface FamilyTask {
  id: string;
  patientId: string;
  date: string;
  title: string;
  plannedTime: string;
  method: string;
  source: "固定任务" | "家属自定义" | "护工临时";
  status: FamilyTaskStatus;
  caregiverReply?: string;
}

export interface FamilyRecord {
  id: string;
  patientId: string;
  date: string;
  plannedTime: string;
  actualTime: string;
  task: string;
  caregiver: string;
  status: "已完成" | "已跳过";
  remark: string;
  imageCount: number;
}

export interface FamilyMessage {
  id: string;
  sender: "family" | "caregiver";
  senderName: string;
  content: string;
  time: string;
}

export interface FamilyConversation {
  id: string;
  patientId: string;
  caregiverName: string;
  orderNo: string;
  unread: number;
  messages: FamilyMessage[];
}

export interface PastService {
  id: string;
  patient: string;
  caregiver: string;
  period: string;
  reviewed: boolean;
  rating?: number;
}

