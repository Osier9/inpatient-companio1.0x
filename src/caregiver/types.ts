export type CaregiverTab = "home" | "tasks" | "schedule" | "messages" | "profile";

export type CaregiverTaskStatus =
  | "PENDING_CONFIRM"
  | "PENDING_EXECUTE"
  | "COMPLETED"
  | "SKIPPED"
  | "OVERDUE"
  | "NEED_ADJUST"
  | "REJECTED";

export interface CaregiverPatient {
  id: string;
  name: string;
  gender: "男" | "女";
  age: number;
  hospital: string;
  department: string;
  bed: string;
  orderNo: string;
  servicePeriod: string;
  shift: string;
  condition: string;
  careNotes: string[];
}

export interface CaregiverTask {
  id: string;
  patientId: string;
  patient: string;
  title: string;
  plannedTime: string;
  method: string;
  source: "固定任务" | "家属自定义" | "护工临时";
  status: CaregiverTaskStatus;
  familyNote?: string;
  actualTime?: string;
  recordRemark?: string;
  imageCount?: number;
  actionReason?: string;
}

export interface CaregiverSchedule {
  id: string;
  date: string;
  weekday: string;
  patientId: string;
  patient: string;
  location: string;
  shift: string;
  timeRange: string;
  status: "进行中" | "待开始" | "已完成" | "休息";
}

export interface ConversationMessage {
  id: string;
  sender: "family" | "caregiver";
  senderName: string;
  content: string;
  time: string;
}

export interface CaregiverConversation {
  id: string;
  patientId: string;
  patient: string;
  orderNo: string;
  familyName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ConversationMessage[];
}

export interface CaregiverReview {
  id: string;
  patient: string;
  rating: number;
  tags: string[];
  content: string;
  date: string;
}

