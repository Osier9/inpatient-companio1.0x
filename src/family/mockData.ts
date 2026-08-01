import type {
  FamilyCaregiver,
  FamilyConversation,
  FamilyPatient,
  FamilyRecord,
  FamilyService,
  FamilyTask,
  PastService
} from "./types";

export const familyPatients: FamilyPatient[] = [
  {
    id: "p1",
    name: "李明",
    relation: "父亲",
    gender: "男",
    age: 67,
    hospital: "市一院",
    department: "外科 8F",
    bed: "12床",
    authorizationStatus: "已授权"
  },
  {
    id: "p2",
    name: "刘淑芬",
    relation: "母亲",
    gender: "女",
    age: 64,
    hospital: "市二院",
    department: "内科 6F",
    bed: "03床",
    authorizationStatus: "已授权"
  }
];

export const familyCaregivers: FamilyCaregiver[] = [
  {
    id: "c1",
    name: "王秀兰",
    gender: "女",
    experienceYears: 8,
    specialty: ["术后陪护", "老人护理"],
    rating: 4.9,
    serviceCount: 126,
    status: "服务中",
    intro: "持有养老护理员证，熟悉外科术后陪护、饮食记录和行动辅助。",
    recentReviews: ["沟通及时，任务记录很清楚。", "照护细心，老人很信任她。"]
  },
  {
    id: "c2",
    name: "刘春梅",
    gender: "女",
    experienceYears: 10,
    specialty: ["老人护理", "康复陪护"],
    rating: 5,
    serviceCount: 184,
    status: "可申请",
    intro: "从事医院陪护十年，擅长老年患者日常照护与康复训练陪同。",
    recentReviews: ["非常有耐心，时间安排也很准。", "照护经验丰富，遇到问题会及时沟通。"]
  },
  {
    id: "c3",
    name: "陈建华",
    gender: "男",
    experienceYears: 6,
    specialty: ["夜间照护", "行动辅助"],
    rating: 4.8,
    serviceCount: 92,
    status: "可申请",
    intro: "擅长夜班照护、陪检和行动不便患者的起居协助。",
    recentReviews: ["夜间响应快，记录完整。", "搀扶很稳，做事认真。"]
  },
  {
    id: "c4",
    name: "张慧芳",
    gender: "女",
    experienceYears: 5,
    specialty: ["饮食照护", "术后陪护"],
    rating: 4.7,
    serviceCount: 68,
    status: "休息中",
    intro: "熟悉术后饮食协助、翻身提醒和陪同检查。",
    recentReviews: ["态度温和，饮食记录很细致。"]
  }
];

export const familyServices: FamilyService[] = [
  {
    id: "FW20260726001",
    patientId: "p1",
    caregiverId: "c1",
    caregiverName: "王秀兰",
    period: "07月26日 - 07月30日",
    shift: "白班 08:00-20:00",
    location: "市一院 外科 8F-12床",
    status: "服务中",
    completedTasks: 1,
    totalTasks: 5
  }
];

export const initialFamilyTasks: FamilyTask[] = [
  {
    id: "t1",
    patientId: "p1",
    date: "2026-07-26",
    title: "早餐协助",
    plannedTime: "08:00",
    method: "协助进食并记录进食比例，可上传餐食照片。",
    source: "固定任务",
    status: "COMPLETED"
  },
  {
    id: "t2",
    patientId: "p1",
    date: "2026-07-26",
    title: "喝药提醒",
    plannedTime: "09:30",
    method: "按护士台药品清单提醒，记录是否服用。",
    source: "固定任务",
    status: "OVERDUE"
  },
  {
    id: "t3",
    patientId: "p1",
    date: "2026-07-26",
    title: "测量并记录血压",
    plannedTime: "11:00",
    method: "使用病区血压计测量，记录高压、低压和心率。",
    source: "家属自定义",
    status: "PENDING_CONFIRM"
  },
  {
    id: "t4",
    patientId: "p1",
    date: "2026-07-26",
    title: "午餐协助",
    plannedTime: "12:00",
    method: "协助进食并记录进食比例。",
    source: "固定任务",
    status: "PENDING_EXECUTE"
  },
  {
    id: "t5",
    patientId: "p1",
    date: "2026-07-26",
    title: "午休观察",
    plannedTime: "13:00",
    method: "观察患者休息状态，异常时及时沟通。",
    source: "固定任务",
    status: "PENDING_EXECUTE"
  },
  {
    id: "t6",
    patientId: "p1",
    date: "2026-07-27",
    title: "早餐协助",
    plannedTime: "08:00",
    method: "协助进食并记录进食比例。",
    source: "固定任务",
    status: "PENDING_EXECUTE"
  }
];

export const familyRecords: FamilyRecord[] = [
  {
    id: "r1",
    patientId: "p1",
    date: "2026-07-26",
    plannedTime: "08:00",
    actualTime: "08:05",
    task: "早餐协助",
    caregiver: "王秀兰",
    status: "已完成",
    remark: "实际进食约 70%，精神状态正常。",
    imageCount: 2
  },
  {
    id: "r2",
    patientId: "p1",
    date: "2026-07-25",
    plannedTime: "18:00",
    actualTime: "18:08",
    task: "晚餐协助",
    caregiver: "王秀兰",
    status: "已完成",
    remark: "进食约一半，饭后在床边坐了 15 分钟。",
    imageCount: 1
  },
  {
    id: "r3",
    patientId: "p1",
    date: "2026-07-25",
    plannedTime: "15:30",
    actualTime: "15:35",
    task: "翻身协助",
    caregiver: "王秀兰",
    status: "已完成",
    remark: "已按计划协助翻身，皮肤状态无异常。",
    imageCount: 0
  }
];

export const initialFamilyConversations: FamilyConversation[] = [
  {
    id: "m1",
    patientId: "p1",
    caregiverName: "王秀兰",
    orderNo: "FW20260726001",
    unread: 1,
    messages: [
      { id: "msg1", sender: "family", senderName: "我", content: "王阿姨您好，今天我父亲精神怎么样？", time: "09:12" },
      { id: "msg2", sender: "caregiver", senderName: "王秀兰", content: "早上状态正常，早餐吃了七成，已经提交记录。", time: "09:20" },
      { id: "msg3", sender: "family", senderName: "我", content: "午饭吃了多少？麻烦记录一下。", time: "10:42" },
      { id: "msg4", sender: "caregiver", senderName: "王秀兰", content: "收到，午餐后我会及时补充记录。", time: "刚刚" }
    ]
  }
];

export const initialPastServices: PastService[] = [
  { id: "FW20260712006", patient: "李明", caregiver: "刘春梅", period: "07月12日 - 07月15日", reviewed: false },
  { id: "FW20260618003", patient: "刘淑芬", caregiver: "陈建华", period: "06月18日 - 06月20日", reviewed: true, rating: 5 }
];

