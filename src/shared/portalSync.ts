import { computed, nextTick, reactive, toRaw, watch } from "vue";
import {
  careRequests as seedCareRequests,
  messages as seedMessages,
  records as seedRecords,
  reviews as seedReviews,
  schedules as seedSchedules
} from "../mockData";
import type { CareRecord, CareRequest, MessageThread, Review, ScheduleItem, StatCard } from "../types";
import {
  familyRecords as seedFamilyRecords,
  initialFamilyConversations,
  initialFamilyTasks,
  initialPastServices
} from "../family/mockData";
import type { FamilyConversation, FamilyRecord, FamilyTask, PastService } from "../family/types";
import {
  caregiverReviews as seedCaregiverReviews,
  caregiverSchedules as seedCaregiverSchedules,
  initialCaregiverTasks,
  initialConversations
} from "../caregiver/mockData";
import type { CaregiverConversation, CaregiverReview, CaregiverSchedule, CaregiverTask } from "../caregiver/types";

const STORAGE_KEY = "inpatient-companio.portal-state.v3";
const CHANNEL_NAME = "inpatient-companio.portal-sync";
const LAN_HOST = "192.168.5.45";
const LOCAL_BROWSER_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const API_HOST = LOCAL_BROWSER_HOSTS.has(window.location.hostname) ? LAN_HOST : window.location.hostname;
const SYNC_API_URL = `${window.location.protocol}//${API_HOST}:8080/api/common/prototype-sync/state`;

if (LOCAL_BROWSER_HOSTS.has(window.location.hostname)) {
  const port = window.location.port || "5173";
  window.location.replace(`${window.location.protocol}//${LAN_HOST}:${port}${window.location.pathname}${window.location.search}${window.location.hash}`);
}

interface PortalState {
  adminCareRequests: CareRequest[];
  adminSchedules: ScheduleItem[];
  adminRecords: CareRecord[];
  adminMessages: MessageThread[];
  adminReviews: Review[];
  familyTasks: FamilyTask[];
  familyRecords: FamilyRecord[];
  familyConversations: FamilyConversation[];
  familyPastServices: PastService[];
  caregiverTasks: CaregiverTask[];
  caregiverSchedules: CaregiverSchedule[];
  caregiverConversations: CaregiverConversation[];
  caregiverReviews: CaregiverReview[];
  revision: number;
}

interface LoadedPortalState {
  state: PortalState;
  hasLocalState: boolean;
}

type SyncedPortalState = Partial<PortalState> & { revision: number };

const SYNC_ARRAY_KEYS = [
  "adminCareRequests",
  "adminSchedules",
  "adminRecords",
  "adminMessages",
  "adminReviews",
  "familyTasks",
  "familyRecords",
  "familyConversations",
  "familyPastServices",
  "caregiverTasks",
  "caregiverSchedules",
  "caregiverConversations",
  "caregiverReviews"
] as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUsableSyncedState(value: unknown): value is SyncedPortalState {
  if (!isObject(value) || typeof value.revision !== "number") return false;
  return SYNC_ARRAY_KEYS.every((key) => Array.isArray(value[key]))
    && SYNC_ARRAY_KEYS.some((key) => (value[key] as unknown[]).length > 0);
}

function nextRevision() {
  return Math.max(Date.now(), portalState.revision + 1);
}

function createSeedState(): PortalState {
  return {
    adminCareRequests: clone(seedCareRequests),
    adminSchedules: clone(seedSchedules),
    adminRecords: clone(seedRecords),
    adminMessages: clone(seedMessages),
    adminReviews: clone(seedReviews),
    familyTasks: clone(initialFamilyTasks),
    familyRecords: clone(seedFamilyRecords),
    familyConversations: clone(initialFamilyConversations),
    familyPastServices: clone(initialPastServices),
    caregiverTasks: clone(initialCaregiverTasks),
    caregiverSchedules: clone(seedCaregiverSchedules),
    caregiverConversations: clone(initialConversations),
    caregiverReviews: clone(seedCaregiverReviews),
    revision: 0
  };
}

function normalizeState(partial: Partial<PortalState>): PortalState {
  const seed = createSeedState();
  return {
    ...seed,
    ...partial,
    adminCareRequests: partial.adminCareRequests ?? seed.adminCareRequests,
    adminSchedules: partial.adminSchedules ?? seed.adminSchedules,
    adminRecords: partial.adminRecords ?? seed.adminRecords,
    adminMessages: partial.adminMessages ?? seed.adminMessages,
    adminReviews: partial.adminReviews ?? seed.adminReviews,
    familyTasks: partial.familyTasks ?? seed.familyTasks,
    familyRecords: partial.familyRecords ?? seed.familyRecords,
    familyConversations: partial.familyConversations ?? seed.familyConversations,
    familyPastServices: partial.familyPastServices ?? seed.familyPastServices,
    caregiverTasks: partial.caregiverTasks ?? seed.caregiverTasks,
    caregiverSchedules: partial.caregiverSchedules ?? seed.caregiverSchedules,
    caregiverConversations: partial.caregiverConversations ?? seed.caregiverConversations,
    caregiverReviews: partial.caregiverReviews ?? seed.caregiverReviews,
    revision: partial.revision ?? seed.revision
  };
}

function loadState(): LoadedPortalState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: createSeedState(), hasLocalState: false };
    return { state: normalizeState(JSON.parse(raw) as Partial<PortalState>), hasLocalState: true };
  } catch {
    return { state: createSeedState(), hasLocalState: false };
  }
}

const loadedPortalState = loadState();

export const portalState = reactive<PortalState>(loadedPortalState.state);

let applyingRemoteState = false;
let hasLoadedServerState = false;
let hasLocalState = loadedPortalState.hasLocalState;
let localDirtySinceLoad = false;
let updatingRevision = false;
let serverPushTimer: number | undefined;
const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL_NAME);

function persistState() {
  const snapshot = JSON.stringify(toRaw(portalState));
  window.localStorage.setItem(STORAGE_KEY, snapshot);
  hasLocalState = true;
  channel?.postMessage(snapshot);
  scheduleServerPush();
}

function applyState(nextState: Partial<PortalState>) {
  applyingRemoteState = true;
  const normalizedState = normalizeState(nextState);
  Object.assign(portalState, normalizedState);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedState));
  hasLocalState = true;
  localDirtySinceLoad = false;
  window.setTimeout(() => {
    applyingRemoteState = false;
  });
}

watch(
  portalState,
  () => {
    if (applyingRemoteState || updatingRevision) return;
    localDirtySinceLoad = true;
    updatingRevision = true;
    portalState.revision = nextRevision();
    persistState();
    nextTick(() => {
      updatingRevision = false;
    });
  },
  { deep: true }
);

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  try {
    const incoming = JSON.parse(event.newValue) as unknown;
    if (isUsableSyncedState(incoming)) applyState(incoming);
  } catch {
    // Ignore malformed local sync payloads.
  }
});

channel?.addEventListener("message", (event) => {
  if (typeof event.data !== "string") return;
  try {
    const incoming = JSON.parse(event.data) as unknown;
    if (!isUsableSyncedState(incoming) || incoming.revision <= portalState.revision) return;
    applyState(incoming);
  } catch {
    // Ignore malformed broadcast payloads.
  }
});

function scheduleServerPush() {
  window.clearTimeout(serverPushTimer);
  serverPushTimer = window.setTimeout(pushStateToServer, 250);
}

async function pushStateToServer() {
  try {
    await fetch(SYNC_API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toRaw(portalState))
    });
  } catch {
    // The prototype keeps working offline; LAN sync resumes when the backend is reachable.
  }
}

async function pullStateFromServer() {
  try {
    const response = await fetch(SYNC_API_URL);
    const payload = await response.json() as { data?: unknown };
    const serverState = payload.data;
    if (!isUsableSyncedState(serverState)) {
      scheduleServerPush();
      return;
    }

    const normalizedServerState = normalizeState(serverState);
    if ((!hasLoadedServerState && !localDirtySinceLoad) || normalizedServerState.revision > portalState.revision) {
      applyState(normalizedServerState);
      hasLoadedServerState = true;
      return;
    }

    hasLoadedServerState = true;
    if (hasLocalState && normalizedServerState.revision < portalState.revision) {
      scheduleServerPush();
    }
  } catch {
    // Ignore transient LAN/backend availability issues in the frontend prototype.
  }
}

void pullStateFromServer();
window.setInterval(pullStateFromServer, 2000);

export const adminStats = computed<StatCard[]>(() => [
  { label: "待审核申请", value: String(pendingRequestCount()), tone: "amber" },
  { label: "今日排班", value: String(portalState.adminSchedules.filter((item) => item.date === "2026-07-26").length), tone: "blue" },
  { label: "服务中患者", value: "27", tone: "green" },
  { label: "在岗护工", value: "24", tone: "neutral" },
  { label: "超时任务", value: String(portalState.adminRecords.filter((item) => item.status.includes("超")).length), tone: "red" }
]);

function pendingRequestCount() {
  return portalState.adminCareRequests.filter((item) => item.status.includes("待") || item.status.includes("冲突")).length;
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function todayText() {
  return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function findFamilyConversation(patientId: string) {
  return portalState.familyConversations.find((item) => item.patientId === patientId) ?? portalState.familyConversations[0];
}

function findCaregiverConversation(patientId: string) {
  return portalState.caregiverConversations.find((item) => item.patientId === patientId) ?? portalState.caregiverConversations[0];
}

function patientName(patientId: string) {
  return portalState.caregiverTasks.find((item) => item.patientId === patientId)?.patient
    ?? portalState.adminSchedules.find((item) => item.patient === patientId)?.patient
    ?? "李明";
}

export const portalActions = {
  submitCareRequest(payload: {
    patientName: string;
    familyName: string;
    caregiverName: string;
    startDate: string;
    endDate: string;
    shift: string;
    note: string;
  }) {
    const request = {
      id: `SQ${Date.now()}`,
      patient: payload.patientName,
      family: payload.familyName,
      caregiver: payload.caregiverName,
      dateRange: `${payload.startDate} 至 ${payload.endDate}`,
      shift: payload.shift,
      status: "待审核",
      note: payload.note
    } as CareRequest;
    portalState.adminCareRequests.unshift(request);
    portalState.adminMessages.unshift({
      id: nextId("message"),
      patient: payload.patientName,
      lastSender: payload.familyName,
      content: `提交陪护申请：${payload.note}`,
      unread: 1,
      status: "待处理"
    } as MessageThread);
  },

  approveNextPendingRequest() {
    const request = portalState.adminCareRequests.find((item) => item.status.includes("待") || item.status.includes("冲突"));
    if (!request) return false;

    request.status = "已确认" as CareRequest["status"];
    const schedule = {
      id: nextId("schedule"),
      date: "2026-07-26",
      shift: request.shift,
      patient: request.patient,
      caregiver: request.caregiver,
      status: "待开始"
    } as ScheduleItem;
    portalState.adminSchedules.unshift(schedule);
    portalState.caregiverSchedules.unshift({
      id: schedule.id,
      date: schedule.date,
      weekday: "周日",
      patientId: "p1",
      patient: request.patient,
      location: "市一院 外科 8F-12床",
      shift: request.shift,
      timeRange: request.shift.includes("夜") ? "20:00-次日08:00" : "08:00-20:00",
      status: "待开始"
    } as CaregiverSchedule);
    portalState.adminMessages.unshift({
      id: nextId("message"),
      patient: request.patient,
      lastSender: "系统",
      content: `陪护申请 ${request.id} 已审核通过，已同步排班。`,
      unread: 0,
      status: "已处理"
    } as MessageThread);
    return true;
  },

  addFamilyTask(payload: { patientId: string; date: string; title: string; plannedTime: string; method: string; note?: string }) {
    const taskId = nextId("family-task");
    const familyTask = {
      id: taskId,
      patientId: payload.patientId,
      date: payload.date,
      title: payload.title,
      plannedTime: payload.plannedTime,
      method: payload.method,
      source: "家属自定义",
      status: "PENDING_CONFIRM",
      caregiverReply: payload.note
    } as FamilyTask;
    const caregiverTask = {
      id: taskId,
      patientId: payload.patientId,
      patient: patientName(payload.patientId),
      title: payload.title,
      plannedTime: payload.plannedTime,
      method: payload.method,
      source: "家属自定义",
      status: "PENDING_CONFIRM",
      familyNote: payload.note
    } as CaregiverTask;
    portalState.familyTasks.push(familyTask);
    portalState.caregiverTasks.push(caregiverTask);
  },

  addCaregiverTempTask(payload: { patientId: string; patient: string; title: string; plannedTime: string; method: string; note?: string }) {
    const taskId = nextId("caregiver-task");
    portalState.caregiverTasks.push({
      id: taskId,
      patientId: payload.patientId,
      patient: payload.patient,
      title: payload.title,
      plannedTime: payload.plannedTime,
      method: payload.method,
      source: "护工临时",
      status: "PENDING_EXECUTE",
      familyNote: payload.note
    } as CaregiverTask);
    portalState.familyTasks.push({
      id: taskId,
      patientId: payload.patientId,
      date: "2026-07-26",
      title: payload.title,
      plannedTime: payload.plannedTime,
      method: payload.method,
      source: "护工临时",
      status: "PENDING_EXECUTE",
      caregiverReply: payload.note
    } as FamilyTask);
  },

  syncTaskStatus(taskId: string, status: CaregiverTask["status"], reason?: string) {
    const caregiverTask = portalState.caregiverTasks.find((item) => item.id === taskId);
    const familyTask = portalState.familyTasks.find((item) => item.id === taskId);
    if (caregiverTask) {
      caregiverTask.status = status;
      caregiverTask.actionReason = reason;
    }
    if (familyTask) {
      familyTask.status = status as FamilyTask["status"];
      familyTask.caregiverReply = reason;
    }
  },

  submitCaregiverRecord(task: CaregiverTask, payload: { status: "COMPLETED" | "SKIPPED"; actualTime: string; remark: string; imageCount: number }) {
    portalActions.syncTaskStatus(task.id, payload.status, payload.remark);
    const recordId = nextId("record");
    portalState.familyRecords.unshift({
      id: recordId,
      patientId: task.patientId,
      date: "2026-07-26",
      plannedTime: task.plannedTime,
      actualTime: payload.actualTime,
      task: task.title,
      caregiver: "王秀兰",
      status: payload.status === "COMPLETED" ? "已完成" : "已跳过",
      remark: payload.remark,
      imageCount: payload.imageCount
    } as FamilyRecord);
    portalState.adminRecords.unshift({
      id: recordId,
      time: payload.actualTime,
      patient: task.patient,
      caregiver: "王秀兰",
      task: task.title,
      status: payload.status === "COMPLETED" ? "已完成" : "已跳过",
      images: payload.imageCount,
      remark: payload.remark
    } as CareRecord);
  },

  sendFamilyMessage(patientId: string, content: string) {
    const time = todayText();
    const familyConversation = findFamilyConversation(patientId);
    const caregiverConversation = findCaregiverConversation(patientId);
    familyConversation.messages.push({ id: nextId("fm"), sender: "family", senderName: "我", content, time });
    caregiverConversation.messages.push({ id: nextId("cm"), sender: "family", senderName: caregiverConversation.familyName, content, time });
    caregiverConversation.lastMessage = content;
    caregiverConversation.lastTime = time;
    caregiverConversation.unread += 1;
    portalState.adminMessages.unshift({
      id: nextId("message"),
      patient: caregiverConversation.patient,
      lastSender: caregiverConversation.familyName,
      content,
      unread: 1,
      status: "待处理"
    } as MessageThread);
  },

  sendCaregiverMessage(patientId: string, content: string) {
    const time = todayText();
    const familyConversation = findFamilyConversation(patientId);
    const caregiverConversation = findCaregiverConversation(patientId);
    familyConversation.messages.push({ id: nextId("fm"), sender: "caregiver", senderName: familyConversation.caregiverName, content, time });
    familyConversation.unread += 1;
    caregiverConversation.messages.push({ id: nextId("cm"), sender: "caregiver", senderName: "我", content, time });
    caregiverConversation.lastMessage = content;
    caregiverConversation.lastTime = time;
    portalState.adminMessages.unshift({
      id: nextId("message"),
      patient: caregiverConversation.patient,
      lastSender: "护工",
      content,
      unread: 0,
      status: "已处理"
    } as MessageThread);
  },

  submitReview(payload: { serviceId: string; patient: string; caregiver: string; rating: number; tags: string[]; content: string }) {
    portalState.adminReviews.unshift({
      id: nextId("review"),
      caregiver: payload.caregiver,
      patient: payload.patient,
      rating: payload.rating.toFixed(1),
      tags: payload.tags.join("、"),
      content: payload.content,
      processStatus: payload.rating < 5 ? "需回访" : "正常"
    } as Review);
    portalState.caregiverReviews.unshift({
      id: nextId("cg-review"),
      patient: payload.patient,
      rating: payload.rating,
      tags: payload.tags,
      content: payload.content,
      date: "2026-07-26"
    });
    const service = portalState.familyPastServices.find((item) => item.id === payload.serviceId);
    if (service) {
      service.reviewed = true;
      service.rating = payload.rating;
    }
  },

  reset() {
    const resetState = createSeedState();
    resetState.revision = nextRevision();
    applyState(resetState);
    persistState();
  }
};
