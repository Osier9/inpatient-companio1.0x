import type {
  CaregiverConversation,
  CaregiverPatient,
  CaregiverReview,
  CaregiverSchedule,
  CaregiverTask
} from "./types";

export const caregiverPatients: CaregiverPatient[] = [
  {
    id: "p1",
    name: "李明",
    gender: "男",
    age: 67,
    hospital: "市一院",
    department: "外科 8F",
    bed: "12床",
    orderNo: "FW20260726001",
    servicePeriod: "07月26日 - 07月30日",
    shift: "白班 08:00-20:00",
    condition: "腹部术后第 2 天",
    careNotes: ["每 2 小时协助翻身", "进食量需要记录", "下床活动须有家属或医护人员确认"]
  },
  {
    id: "p2",
    name: "赵兰",
    gender: "女",
    age: 73,
    hospital: "中心医院",
    department: "康复科 5F",
    bed: "06床",
    orderNo: "FW20260726008",
    servicePeriod: "07月26日 - 07月28日",
    shift: "夜班 20:00-08:00",
    condition: "髋关节术后康复",
    careNotes: ["夜间起身需搀扶", "保持床边通道无障碍", "异常情况及时联系护士台"]
  }
];

export const initialCaregiverTasks: CaregiverTask[] = [
  {
    id: "t1",
    patientId: "p1",
    patient: "李明",
    title: "早餐协助",
    plannedTime: "08:00",
    method: "协助进食并记录进食比例，可上传餐食照片。",
    source: "固定任务",
    status: "COMPLETED",
    actualTime: "08:05",
    recordRemark: "实际进食约 70%，精神状态正常。",
    imageCount: 2
  },
  {
    id: "t2",
    patientId: "p1",
    patient: "李明",
    title: "喝药提醒",
    plannedTime: "09:30",
    method: "按护士台药品清单提醒，记录是否服用。",
    source: "固定任务",
    status: "OVERDUE",
    familyNote: "如患者恶心请先联系护士。"
  },
  {
    id: "t3",
    patientId: "p1",
    patient: "李明",
    title: "测量并记录血压",
    plannedTime: "11:00",
    method: "使用病区血压计测量，记录高压、低压和心率。",
    source: "家属自定义",
    status: "PENDING_CONFIRM",
    familyNote: "医生查房后希望补充一次血压记录。"
  },
  {
    id: "t4",
    patientId: "p1",
    patient: "李明",
    title: "午餐协助",
    plannedTime: "12:00",
    method: "协助进食并记录进食比例。",
    source: "固定任务",
    status: "PENDING_EXECUTE"
  },
  {
    id: "t5",
    patientId: "p1",
    patient: "李明",
    title: "午休观察",
    plannedTime: "13:00",
    method: "观察患者休息状态，出现异常时及时留言。",
    source: "固定任务",
    status: "PENDING_EXECUTE"
  },
  {
    id: "t6",
    patientId: "p2",
    patient: "赵兰",
    title: "夜间如厕协助",
    plannedTime: "22:00",
    method: "起身时搀扶患者，完成后检查床栏。",
    source: "固定任务",
    status: "PENDING_EXECUTE"
  }
];

export const caregiverSchedules: CaregiverSchedule[] = [
  {
    id: "s1",
    date: "2026-07-26",
    weekday: "周日",
    patientId: "p1",
    patient: "李明",
    location: "市一院 外科 8F-12床",
    shift: "白班",
    timeRange: "08:00-20:00",
    status: "进行中"
  },
  {
    id: "s2",
    date: "2026-07-27",
    weekday: "周一",
    patientId: "p1",
    patient: "李明",
    location: "市一院 外科 8F-12床",
    shift: "白班",
    timeRange: "08:00-20:00",
    status: "待开始"
  },
  {
    id: "s3",
    date: "2026-07-28",
    weekday: "周二",
    patientId: "p2",
    patient: "赵兰",
    location: "中心医院 康复科 5F-06床",
    shift: "夜班",
    timeRange: "20:00-次日08:00",
    status: "待开始"
  },
  {
    id: "s4",
    date: "2026-07-30",
    weekday: "周四",
    patientId: "p1",
    patient: "李明",
    location: "市一院 外科 8F-12床",
    shift: "白班",
    timeRange: "08:00-20:00",
    status: "待开始"
  }
];

export const initialConversations: CaregiverConversation[] = [
  {
    id: "c1",
    patientId: "p1",
    patient: "李明",
    orderNo: "FW20260726001",
    familyName: "李女士",
    lastMessage: "午饭吃了多少？麻烦记录一下。",
    lastTime: "10:42",
    unread: 1,
    messages: [
      { id: "m1", sender: "family", senderName: "李女士", content: "王阿姨您好，今天我父亲精神怎么样？", time: "09:12" },
      { id: "m2", sender: "caregiver", senderName: "我", content: "早上状态正常，早餐吃了七成，已经提交记录。", time: "09:20" },
      { id: "m3", sender: "family", senderName: "李女士", content: "午饭吃了多少？麻烦记录一下。", time: "10:42" }
    ]
  },
  {
    id: "c2",
    patientId: "p2",
    patient: "赵兰",
    orderNo: "FW20260726008",
    familyName: "赵先生",
    lastMessage: "今晚辛苦您了，起夜时请多留意。",
    lastTime: "昨天",
    unread: 0,
    messages: [
      { id: "m4", sender: "family", senderName: "赵先生", content: "今晚辛苦您了，起夜时请多留意。", time: "昨天 18:30" },
      { id: "m5", sender: "caregiver", senderName: "我", content: "收到，我会按任务要求记录，有异常及时留言。", time: "昨天 18:36" }
    ]
  }
];

export const caregiverReviews: CaregiverReview[] = [
  { id: "r1", patient: "张桂芳", rating: 5, tags: ["细心", "准时"], content: "记录很及时，沟通也清楚。", date: "2026-07-22" },
  { id: "r2", patient: "王建军", rating: 5, tags: ["有耐心", "照护专业"], content: "老人行动慢，王阿姨一直很耐心。", date: "2026-07-18" },
  { id: "r3", patient: "陈秀英", rating: 4, tags: ["认真负责"], content: "整体很好，希望夜间记录可以再详细一些。", date: "2026-07-10" }
];

