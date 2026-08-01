import type {
  CareRecord,
  CareRequest,
  Caregiver,
  MessageThread,
  Patient,
  Review,
  ScheduleItem,
  StatCard,
  TaskTemplate
} from "./types";

export const stats: StatCard[] = [
  { label: "待审核申请", value: "8", tone: "amber" },
  { label: "今日排班", value: "32", tone: "blue" },
  { label: "服务中患者", value: "27", tone: "green" },
  { label: "在岗护工", value: "24", tone: "neutral" },
  { label: "超时任务", value: "3", tone: "red" }
];

export const careRequests: CareRequest[] = [
  {
    id: "SQ20260726001",
    patient: "李明",
    family: "李女士",
    caregiver: "王阿姨",
    dateRange: "07-26 至 07-30",
    shift: "白班",
    status: "待审核",
    note: "术后需要翻身提醒、饮食记录和陪检沟通"
  },
  {
    id: "SQ20260726002",
    patient: "周建国",
    family: "周女士",
    caregiver: "刘阿姨",
    dateRange: "07-27 至 07-29",
    shift: "全天",
    status: "冲突",
    note: "希望安排经验较丰富护工"
  },
  {
    id: "SQ20260725009",
    patient: "赵兰",
    family: "赵先生",
    caregiver: "陈师傅",
    dateRange: "07-28 至 07-31",
    shift: "夜班",
    status: "已确认",
    note: "夜间陪护，协助如厕"
  }
];

export const caregivers: Caregiver[] = [
  {
    id: "1",
    name: "王阿姨",
    employeeNo: "HG1007",
    phone: "13800001111",
    experience: "8 年",
    specialty: "术后陪护",
    rating: "4.9",
    serviceStatus: "可服务",
    accountStatus: "启用"
  },
  {
    id: "2",
    name: "陈师傅",
    employeeNo: "HG1021",
    phone: "13800002222",
    experience: "6 年",
    specialty: "夜间照护",
    rating: "4.8",
    serviceStatus: "服务中",
    accountStatus: "启用"
  },
  {
    id: "3",
    name: "刘阿姨",
    employeeNo: "HG1030",
    phone: "13800003333",
    experience: "10 年",
    specialty: "老人护理",
    rating: "5.0",
    serviceStatus: "休息中",
    accountStatus: "启用"
  }
];

export const patients: Patient[] = [
  {
    id: "1",
    name: "李明",
    location: "市一院 外科 8F-12床",
    familyCount: 2,
    currentCaregiver: "王阿姨",
    status: "服务中"
  },
  {
    id: "2",
    name: "赵兰",
    location: "中心医院 康复科 5F-06床",
    familyCount: 1,
    currentCaregiver: "陈师傅",
    status: "待开始"
  },
  {
    id: "3",
    name: "周建国",
    location: "市二院 骨科 3F-18床",
    familyCount: 1,
    currentCaregiver: "待确认",
    status: "未服务"
  }
];

export const schedules: ScheduleItem[] = [
  { id: "1", date: "2026-07-26", shift: "白班", patient: "李明", caregiver: "王阿姨", status: "进行中" },
  { id: "2", date: "2026-07-26", shift: "夜班", patient: "赵兰", caregiver: "陈师傅", status: "待开始" },
  { id: "3", date: "2026-07-27", shift: "全天", patient: "周建国", caregiver: "刘阿姨", status: "待开始" }
];

export const taskTemplates: TaskTemplate[] = [
  { id: "1", name: "早餐协助", type: "饮食", defaultTime: "08:00", method: "记录进食比例，可上传图片", enabled: true },
  { id: "2", name: "喝药提醒", type: "提醒", defaultTime: "09:30", method: "按护士台药品清单提醒，记录是否服用", enabled: true },
  { id: "3", name: "午休观察", type: "休息", defaultTime: "13:00", method: "观察休息状态，异常时留言", enabled: true }
];

export const records: CareRecord[] = [
  { id: "1", time: "08:05", patient: "李明", caregiver: "王阿姨", task: "早餐协助", status: "已完成", images: 2, remark: "实际进食约 70%" },
  { id: "2", time: "09:30", patient: "李明", caregiver: "王阿姨", task: "喝药提醒", status: "已超时", images: 0, remark: "超过计划时间 30 分钟未记录" },
  { id: "3", time: "11:00", patient: "赵兰", caregiver: "陈师傅", task: "测血压", status: "待执行", images: 0, remark: "家属新增任务" }
];

export const messages: MessageThread[] = [
  { id: "1", patient: "李明", lastSender: "李女士", content: "午饭吃了多少？", unread: 1, status: "待处理" },
  { id: "2", patient: "周建国", lastSender: "周女士", content: "测血压任务需要提前。", unread: 0, status: "已处理" }
];

export const reviews: Review[] = [
  { id: "1", caregiver: "王阿姨", patient: "李明", rating: "5.0", tags: "细心、准时", content: "记录很及时，沟通清楚。", processStatus: "正常" },
  { id: "2", caregiver: "陈师傅", patient: "赵兰", rating: "4.0", tags: "夜间负责", content: "希望图片记录再多一些。", processStatus: "需回访" }
];
