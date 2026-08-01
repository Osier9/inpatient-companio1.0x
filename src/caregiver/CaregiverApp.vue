<script setup lang="ts">
import { computed, ref } from "vue";
import {
  AlertCircle,
  ArrowLeft,
  BedDouble,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Clock3,
  Home,
  ImagePlus,
  ListChecks,
  LockKeyhole,
  MessageSquareText,
  Plus,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
  X
} from "lucide-vue-next";
import {
  caregiverPatients
} from "./mockData";
import type {
  CaregiverConversation,
  CaregiverTab,
  CaregiverTask,
  CaregiverTaskStatus
} from "./types";
import { portalActions, portalState } from "../shared/portalSync";
import "./caregiver.css";

type TaskFilter = "ALL" | "PENDING_CONFIRM" | "PENDING_EXECUTE" | "COMPLETED" | "OVERDUE";
type DialogType = "record" | "decision" | "temporary" | "patient" | "notice" | "password" | null;

interface PreviewImage {
  name: string;
  size: number;
  url: string;
}

const activeTab = ref<CaregiverTab>("home");
const selectedPatientId = ref("p1");
const taskFilter = ref<TaskFilter>("ALL");
const tasks = computed(() => portalState.caregiverTasks);
const conversations = computed(() => portalState.caregiverConversations);
const caregiverSchedules = computed(() => portalState.caregiverSchedules);
const caregiverReviews = computed(() => portalState.caregiverReviews);
const selectedConversationId = ref<string | null>(null);
const replyText = ref("");
const scheduleMode = ref<"week" | "month">("week");
const selectedScheduleDate = ref("2026-07-26");
const dialog = ref<DialogType>(null);
const selectedTaskId = ref<string | null>(null);
const decisionMode = ref<"adjust" | "reject">("adjust");
const decisionReason = ref("");
const toast = ref("");

const recordStatus = ref<"COMPLETED" | "SKIPPED">("COMPLETED");
const recordTime = ref("2026-07-26T11:20");
const recordRemark = ref("");
const recordImages = ref<PreviewImage[]>([]);

const temporaryTask = ref({
  title: "",
  plannedTime: "14:30",
  method: "",
  note: ""
});

const passwordForm = ref({ current: "", next: "", confirm: "" });

const tabs: Array<{ key: CaregiverTab; label: string; icon: typeof Home }> = [
  { key: "home", label: "首页", icon: Home },
  { key: "tasks", label: "任务", icon: ListChecks },
  { key: "schedule", label: "排班", icon: CalendarDays },
  { key: "messages", label: "留言", icon: MessageSquareText },
  { key: "profile", label: "我的", icon: UserRound }
];

const taskFilters: Array<{ key: TaskFilter; label: string }> = [
  { key: "ALL", label: "全部" },
  { key: "PENDING_CONFIRM", label: "待确认" },
  { key: "PENDING_EXECUTE", label: "待执行" },
  { key: "COMPLETED", label: "已完成" },
  { key: "OVERDUE", label: "已超时" }
];

const weekDates = [
  { date: "2026-07-26", weekday: "日", day: "26" },
  { date: "2026-07-27", weekday: "一", day: "27" },
  { date: "2026-07-28", weekday: "二", day: "28" },
  { date: "2026-07-29", weekday: "三", day: "29" },
  { date: "2026-07-30", weekday: "四", day: "30" },
  { date: "2026-07-31", weekday: "五", day: "31" },
  { date: "2026-08-01", weekday: "六", day: "01" }
];

const selectedPatient = computed(
  () => caregiverPatients.find((item) => item.id === selectedPatientId.value) ?? caregiverPatients[0]
);

const selectedTask = computed(() => tasks.value.find((item) => item.id === selectedTaskId.value) ?? null);

const patientTasks = computed(() => tasks.value.filter((item) => item.patientId === selectedPatientId.value));

const filteredTasks = computed(() => {
  if (taskFilter.value === "ALL") return patientTasks.value;
  if (taskFilter.value === "COMPLETED") {
    return patientTasks.value.filter((item) => item.status === "COMPLETED" || item.status === "SKIPPED");
  }
  return patientTasks.value.filter((item) => item.status === taskFilter.value);
});

const taskSummary = computed(() => ({
  pending: patientTasks.value.filter((item) => item.status === "PENDING_CONFIRM" || item.status === "PENDING_EXECUTE").length,
  completed: patientTasks.value.filter((item) => item.status === "COMPLETED" || item.status === "SKIPPED").length,
  overdue: patientTasks.value.filter((item) => item.status === "OVERDUE").length
}));

const homeTasks = computed(() =>
  patientTasks.value
    .filter((item) => ["PENDING_CONFIRM", "PENDING_EXECUTE", "OVERDUE"].includes(item.status))
    .slice(0, 3)
);

const unreadMessages = computed(() => conversations.value.reduce((total, item) => total + item.unread, 0));

const selectedConversation = computed(
  () => conversations.value.find((item) => item.id === selectedConversationId.value) ?? null
);

const selectedDaySchedules = computed(() =>
  caregiverSchedules.value.filter((item) => item.date === selectedScheduleDate.value)
);

const reviewAverage = computed(() => {
  const total = caregiverReviews.value.reduce((sum, item) => sum + item.rating, 0);
  return (total / caregiverReviews.value.length).toFixed(1);
});

function showToast(message: string) {
  toast.value = message;
  window.setTimeout(() => {
    if (toast.value === message) toast.value = "";
  }, 2200);
}

function switchTab(tab: CaregiverTab) {
  activeTab.value = tab;
  selectedConversationId.value = null;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function taskStatusLabel(status: CaregiverTaskStatus) {
  const labels: Record<CaregiverTaskStatus, string> = {
    PENDING_CONFIRM: "待确认",
    PENDING_EXECUTE: "待执行",
    COMPLETED: "已完成",
    SKIPPED: "已跳过",
    OVERDUE: "已超时",
    NEED_ADJUST: "待家属调整",
    REJECTED: "已退回"
  };
  return labels[status];
}

function taskStatusTone(status: CaregiverTaskStatus) {
  if (status === "COMPLETED") return "green";
  if (status === "OVERDUE" || status === "REJECTED") return "red";
  if (status === "PENDING_CONFIRM" || status === "NEED_ADJUST") return "amber";
  return "blue";
}

function filterCount(filter: TaskFilter) {
  if (filter === "ALL") return patientTasks.value.length;
  if (filter === "COMPLETED") {
    return patientTasks.value.filter((item) => item.status === "COMPLETED" || item.status === "SKIPPED").length;
  }
  return patientTasks.value.filter((item) => item.status === filter).length;
}

function confirmTask(task: CaregiverTask) {
  portalActions.syncTaskStatus(task.id, "PENDING_EXECUTE");
  showToast(`已确认“${task.title}”，任务进入待执行`);
}

function openDecision(task: CaregiverTask, mode: "adjust" | "reject") {
  selectedTaskId.value = task.id;
  decisionMode.value = mode;
  decisionReason.value = "";
  dialog.value = "decision";
}

function submitDecision() {
  if (!selectedTask.value || !decisionReason.value.trim()) {
    showToast("请填写原因后再提交");
    return;
  }

  portalActions.syncTaskStatus(
    selectedTask.value.id,
    decisionMode.value === "adjust" ? "NEED_ADJUST" : "REJECTED",
    decisionReason.value.trim()
  );
  dialog.value = null;
  showToast(decisionMode.value === "adjust" ? "调整建议已发送给家属" : "任务已退回并通知家属");
}

function openRecord(task: CaregiverTask) {
  selectedTaskId.value = task.id;
  recordStatus.value = "COMPLETED";
  recordTime.value = "2026-07-26T11:20";
  recordRemark.value = "";
  clearRecordImages();
  dialog.value = "record";
}

function handleImageSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);

  for (const file of files) {
    if (recordImages.value.length >= 3) {
      showToast("最多上传 3 张图片");
      break;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showToast(`${file.name} 不是 JPG 或 PNG 图片`);
      continue;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast(`${file.name} 超过 10 MB`);
      continue;
    }
    recordImages.value.push({ name: file.name, size: file.size, url: URL.createObjectURL(file) });
  }

  input.value = "";
}

function removeRecordImage(index: number) {
  const image = recordImages.value[index];
  if (image) URL.revokeObjectURL(image.url);
  recordImages.value.splice(index, 1);
}

function clearRecordImages() {
  recordImages.value.forEach((image) => URL.revokeObjectURL(image.url));
  recordImages.value = [];
}

function submitRecord() {
  if (!selectedTask.value) return;
  if (recordStatus.value === "SKIPPED" && !recordRemark.value.trim()) {
    showToast("跳过任务时必须填写原因");
    return;
  }

  selectedTask.value.actualTime = recordTime.value.split("T")[1] ?? recordTime.value;
  selectedTask.value.recordRemark = recordRemark.value.trim() || "任务已按计划完成。";
  selectedTask.value.imageCount = recordImages.value.length;
  portalActions.submitCaregiverRecord(selectedTask.value, {
    status: recordStatus.value,
    actualTime: selectedTask.value.actualTime,
    remark: selectedTask.value.recordRemark,
    imageCount: recordImages.value.length
  });
  dialog.value = null;
  showToast(recordStatus.value === "COMPLETED" ? "执行记录已提交，家属端已同步" : "任务已标记为跳过");
}

function openTemporaryTask() {
  temporaryTask.value = { title: "", plannedTime: "14:30", method: "", note: "" };
  dialog.value = "temporary";
}

function addTemporaryTask() {
  if (!temporaryTask.value.title.trim() || !temporaryTask.value.method.trim()) {
    showToast("请填写任务名称和执行方式");
    return;
  }

  portalActions.addCaregiverTempTask({
    patientId: selectedPatient.value.id,
    patient: selectedPatient.value.name,
    title: temporaryTask.value.title.trim(),
    plannedTime: temporaryTask.value.plannedTime,
    method: temporaryTask.value.method.trim(),
    note: temporaryTask.value.note.trim() || undefined
  });
  taskFilter.value = "PENDING_EXECUTE";
  dialog.value = null;
  showToast("临时任务已创建，并同步给家属");
}

function openConversation(conversation: CaregiverConversation) {
  conversation.unread = 0;
  selectedConversationId.value = conversation.id;
}

function sendReply() {
  const conversation = selectedConversation.value;
  const content = replyText.value.trim();
  if (!conversation || !content) return;

  portalActions.sendCaregiverMessage(conversation.patientId, content);
  replyText.value = "";
  showToast("回复已发送");
}

function hasSchedule(date: string) {
  return caregiverSchedules.value.some((item) => item.date === date);
}

function selectMonthDay(day: number) {
  selectedScheduleDate.value = `2026-07-${String(day).padStart(2, "0")}`;
}

function submitPassword() {
  if (!passwordForm.value.current || passwordForm.value.next.length < 8) {
    showToast("新密码至少需要 8 位");
    return;
  }
  if (passwordForm.value.next !== passwordForm.value.confirm) {
    showToast("两次输入的新密码不一致");
    return;
  }
  passwordForm.value = { current: "", next: "", confirm: "" };
  dialog.value = null;
  showToast("密码修改成功，请在下次登录时使用新密码");
}
</script>

<template>
  <div class="cg-app">
    <header class="cg-appbar">
      <div>
        <p class="cg-eyebrow">2026年7月26日 周日</p>
        <h2>王阿姨，上午好</h2>
      </div>
      <button class="cg-icon-button" type="button" title="站内通知" @click="dialog = 'notice'">
        <Bell :size="21" />
        <span class="cg-notice-dot">3</span>
      </button>
    </header>

    <main class="cg-content">
      <template v-if="activeTab === 'home'">
        <section class="cg-shift-band">
          <div class="cg-shift-main">
            <span class="cg-live"><i></i>当前班次进行中</span>
            <strong>白班 08:00-20:00</strong>
            <p>已服务 3 小时 20 分钟</p>
          </div>
          <div class="cg-shift-progress" aria-label="班次进度"><span></span></div>
          <div class="cg-shift-foot">
            <span>08:00 上岗</span>
            <span>20:00 结束</span>
          </div>
        </section>

        <div class="cg-section-heading">
          <div>
            <p>今日陪护</p>
            <h3>{{ caregiverPatients.length }} 位患者</h3>
          </div>
          <div class="cg-patient-switch" aria-label="切换患者">
            <button
              v-for="patient in caregiverPatients"
              :key="patient.id"
              type="button"
              :class="{ active: selectedPatientId === patient.id }"
              @click="selectedPatientId = patient.id"
            >
              {{ patient.name }}
            </button>
          </div>
        </div>

        <article class="cg-patient-card">
          <div class="cg-patient-head">
            <div class="cg-avatar">{{ selectedPatient.name.slice(0, 1) }}</div>
            <div class="cg-patient-title">
              <div><h3>{{ selectedPatient.name }}</h3><span>{{ selectedPatient.gender }} · {{ selectedPatient.age }}岁</span></div>
              <p>{{ selectedPatient.condition }}</p>
            </div>
            <button class="cg-icon-button subtle" type="button" title="患者详情" @click="dialog = 'patient'">
              <ChevronRight :size="20" />
            </button>
          </div>
          <div class="cg-location-row">
            <Building2 :size="17" />
            <span>{{ selectedPatient.hospital }} · {{ selectedPatient.department }}</span>
            <strong><BedDouble :size="16" />{{ selectedPatient.bed }}</strong>
          </div>
          <div class="cg-task-metrics">
            <button type="button" @click="taskFilter = 'PENDING_EXECUTE'; switchTab('tasks')">
              <strong>{{ taskSummary.pending }}</strong><span>待处理</span>
            </button>
            <button type="button" @click="taskFilter = 'COMPLETED'; switchTab('tasks')">
              <strong>{{ taskSummary.completed }}</strong><span>已完成</span>
            </button>
            <button type="button" @click="taskFilter = 'OVERDUE'; switchTab('tasks')">
              <strong class="danger">{{ taskSummary.overdue }}</strong><span>已超时</span>
            </button>
          </div>
        </article>

        <div class="cg-section-heading compact">
          <div><p>任务动态</p><h3>接下来需要处理</h3></div>
          <button class="cg-text-button" type="button" @click="switchTab('tasks')">查看全部<ChevronRight :size="16" /></button>
        </div>

        <section class="cg-home-task-list">
          <article v-for="task in homeTasks" :key="task.id" class="cg-task-row" :class="{ overdue: task.status === 'OVERDUE' }">
            <div class="cg-task-time"><strong>{{ task.plannedTime }}</strong><span>{{ task.source }}</span></div>
            <div class="cg-task-row-main">
              <div><h4>{{ task.title }}</h4><span class="cg-badge" :class="taskStatusTone(task.status)">{{ taskStatusLabel(task.status) }}</span></div>
              <p>{{ task.method }}</p>
            </div>
            <button
              v-if="task.status === 'PENDING_CONFIRM'"
              class="cg-small-button primary"
              type="button"
              @click="confirmTask(task)"
            >确认</button>
            <button v-else class="cg-icon-button subtle" type="button" title="处理任务" @click="openRecord(task)">
              <ChevronRight :size="19" />
            </button>
          </article>
        </section>

        <section class="cg-safety-note">
          <ShieldCheck :size="21" />
          <div><strong>照护注意事项</strong><p>{{ selectedPatient.careNotes[0] }}；{{ selectedPatient.careNotes[1] }}。</p></div>
          <button type="button" title="查看全部注意事项" @click="dialog = 'patient'"><ChevronRight :size="18" /></button>
        </section>
      </template>

      <template v-else-if="activeTab === 'tasks'">
        <div class="cg-page-title">
          <div><p>今日工作</p><h2>任务清单</h2></div>
          <button class="cg-action-button" type="button" @click="openTemporaryTask"><Plus :size="18" />临时任务</button>
        </div>

        <label class="cg-patient-select">
          <CircleUserRound :size="19" />
          <select v-model="selectedPatientId">
            <option v-for="patient in caregiverPatients" :key="patient.id" :value="patient.id">
              {{ patient.name }} · {{ patient.department }} {{ patient.bed }}
            </option>
          </select>
          <ChevronRight :size="18" />
        </label>

        <div class="cg-filter-tabs">
          <button
            v-for="filter in taskFilters"
            :key="filter.key"
            type="button"
            :class="{ active: taskFilter === filter.key }"
            @click="taskFilter = filter.key"
          >
            {{ filter.label }}<span>{{ filterCount(filter.key) }}</span>
          </button>
        </div>

        <section v-if="filteredTasks.length" class="cg-task-cards">
          <article v-for="task in filteredTasks" :key="task.id" class="cg-task-card" :class="{ overdue: task.status === 'OVERDUE' }">
            <div class="cg-task-card-head">
              <div class="cg-time-block"><Clock3 :size="17" /><strong>{{ task.plannedTime }}</strong></div>
              <span class="cg-source" :class="{ custom: task.source === '家属自定义' }">{{ task.source }}</span>
              <span class="cg-badge" :class="taskStatusTone(task.status)">{{ taskStatusLabel(task.status) }}</span>
            </div>
            <h3>{{ task.title }}</h3>
            <p>{{ task.method }}</p>
            <div v-if="task.familyNote" class="cg-family-note">
              <MessageSquareText :size="16" />
              <span>家属备注：{{ task.familyNote }}</span>
            </div>
            <div v-if="task.recordRemark" class="cg-record-summary">
              <CheckCircle2 :size="17" />
              <div><strong>{{ task.actualTime }} 已记录</strong><p>{{ task.recordRemark }}<span v-if="task.imageCount"> · {{ task.imageCount }} 张图片</span></p></div>
            </div>
            <div v-if="task.actionReason" class="cg-record-summary warning">
              <AlertCircle :size="17" />
              <div><strong>{{ taskStatusLabel(task.status) }}</strong><p>{{ task.actionReason }}</p></div>
            </div>
            <div v-if="task.status === 'PENDING_CONFIRM'" class="cg-card-actions three">
              <button class="cg-secondary-button" type="button" @click="openDecision(task, 'reject')">退回</button>
              <button class="cg-secondary-button" type="button" @click="openDecision(task, 'adjust')">建议调整</button>
              <button class="cg-primary-button" type="button" @click="confirmTask(task)"><Check :size="17" />确认</button>
            </div>
            <div v-else-if="task.status === 'PENDING_EXECUTE' || task.status === 'OVERDUE'" class="cg-card-actions">
              <button class="cg-primary-button full" type="button" @click="openRecord(task)">
                <ClipboardList :size="18" />填写执行记录
              </button>
            </div>
          </article>
        </section>

        <section v-else class="cg-empty-state">
          <CheckCircle2 :size="34" />
          <h3>当前没有{{ taskFilters.find((item) => item.key === taskFilter)?.label }}任务</h3>
          <p>切换其他状态查看任务记录。</p>
        </section>
      </template>

      <template v-else-if="activeTab === 'schedule'">
        <div class="cg-page-title">
          <div><p>个人安排</p><h2>我的排班</h2></div>
          <div class="cg-segmented">
            <button type="button" :class="{ active: scheduleMode === 'week' }" @click="scheduleMode = 'week'">周</button>
            <button type="button" :class="{ active: scheduleMode === 'month' }" @click="scheduleMode = 'month'">月</button>
          </div>
        </div>

        <div class="cg-month-title"><button type="button" title="上一个月"><ChevronLeft :size="19" /></button><strong>2026年7月</strong><button type="button" title="下一个月"><ChevronRight :size="19" /></button></div>

        <div v-if="scheduleMode === 'week'" class="cg-week-strip">
          <button
            v-for="item in weekDates"
            :key="item.date"
            type="button"
            :class="{ active: selectedScheduleDate === item.date, scheduled: hasSchedule(item.date) }"
            @click="selectedScheduleDate = item.date"
          >
            <span>周{{ item.weekday }}</span><strong>{{ item.day }}</strong><i></i>
          </button>
        </div>

        <div v-else class="cg-calendar">
          <span v-for="weekday in ['日', '一', '二', '三', '四', '五', '六']" :key="weekday" class="cg-calendar-week">{{ weekday }}</span>
          <span v-for="blank in 3" :key="`blank-${blank}`" class="cg-calendar-blank"></span>
          <button
            v-for="day in 31"
            :key="day"
            type="button"
            :class="{
              active: selectedScheduleDate === `2026-07-${String(day).padStart(2, '0')}`,
              scheduled: hasSchedule(`2026-07-${String(day).padStart(2, '0')}`)
            }"
            @click="selectMonthDay(day)"
          >{{ day }}<i></i></button>
        </div>

        <div class="cg-section-heading compact schedule-heading">
          <div><p>{{ selectedScheduleDate }}</p><h3>当日安排</h3></div>
          <span>{{ selectedDaySchedules.length }} 个班次</span>
        </div>

        <section v-if="selectedDaySchedules.length" class="cg-schedule-list">
          <article v-for="item in selectedDaySchedules" :key="item.id" class="cg-schedule-card">
            <div class="cg-schedule-status"><span class="cg-badge" :class="item.status === '进行中' ? 'green' : 'blue'">{{ item.status }}</span></div>
            <div class="cg-schedule-time"><strong>{{ item.shift }}</strong><span>{{ item.timeRange }}</span></div>
            <div class="cg-schedule-patient"><div class="cg-avatar small">{{ item.patient.slice(0, 1) }}</div><div><strong>{{ item.patient }}</strong><span>{{ item.location }}</span></div></div>
            <button type="button" @click="selectedPatientId = item.patientId; switchTab('home')">查看患者<ChevronRight :size="16" /></button>
          </article>
        </section>
        <section v-else class="cg-empty-state small">
          <CalendarDays :size="32" /><h3>当日无排班</h3><p>如排班有误，请联系管理员调整。</p>
        </section>
      </template>

      <template v-else-if="activeTab === 'messages'">
        <template v-if="!selectedConversation">
          <div class="cg-page-title"><div><p>服务沟通</p><h2>家属留言</h2></div><span class="cg-unread-summary">{{ unreadMessages }} 条未读</span></div>
          <section class="cg-conversation-list">
            <button v-for="conversation in conversations" :key="conversation.id" type="button" @click="openConversation(conversation)">
              <div class="cg-avatar message">{{ conversation.patient.slice(0, 1) }}</div>
              <div class="cg-conversation-main">
                <div><strong>{{ conversation.patient }}的家属</strong><span>{{ conversation.lastTime }}</span></div>
                <p>{{ conversation.lastMessage }}</p>
                <small>服务单 {{ conversation.orderNo }}</small>
              </div>
              <span v-if="conversation.unread" class="cg-unread">{{ conversation.unread }}</span>
            </button>
          </section>
        </template>

        <template v-else>
          <header class="cg-chat-head">
            <button class="cg-icon-button subtle" type="button" title="返回留言列表" @click="selectedConversationId = null"><ArrowLeft :size="20" /></button>
            <div><h2>{{ selectedConversation.patient }}的家属</h2><p>{{ selectedConversation.orderNo }} · {{ selectedConversation.familyName }}</p></div>
          </header>
          <section class="cg-chat-body">
            <div
              v-for="message in selectedConversation.messages"
              :key="message.id"
              class="cg-message"
              :class="{ self: message.sender === 'caregiver' }"
            >
              <span>{{ message.senderName }} · {{ message.time }}</span>
              <p>{{ message.content }}</p>
            </div>
          </section>
          <form class="cg-reply-box" @submit.prevent="sendReply">
            <textarea v-model="replyText" rows="2" maxlength="500" placeholder="回复家属留言"></textarea>
            <button type="submit" title="发送回复" :disabled="!replyText.trim()"><Send :size="19" /></button>
          </form>
        </template>
      </template>

      <template v-else>
        <section class="cg-profile-band">
          <div class="cg-avatar profile">王</div>
          <div><h2>王秀兰</h2><p>工号 HG1007 · 已服务 8 年</p><span>账号状态正常</span></div>
        </section>

        <section class="cg-profile-stats">
          <div><strong>{{ reviewAverage }}</strong><span>综合评分</span></div>
          <div><strong>126</strong><span>完成服务</span></div>
          <div><strong>98%</strong><span>准时率</span></div>
        </section>

        <section class="cg-profile-menu">
          <button type="button" @click="switchTab('schedule')"><CalendarDays :size="20" /><span><strong>我的排班</strong><small>查看本周与本月服务安排</small></span><ChevronRight :size="18" /></button>
          <button type="button" @click="dialog = 'password'"><LockKeyhole :size="20" /><span><strong>账号安全</strong><small>修改登录密码</small></span><ChevronRight :size="18" /></button>
          <button type="button" @click="showToast('隐私规则已更新至 2026-07-01')"><ShieldCheck :size="20" /><span><strong>隐私与权限</strong><small>仅可查看本人排班患者</small></span><ChevronRight :size="18" /></button>
        </section>

        <div class="cg-section-heading compact review-heading">
          <div><p>服务反馈</p><h3>我的评价</h3></div><span>{{ caregiverReviews.length }} 条</span>
        </div>
        <section class="cg-review-list">
          <article v-for="review in caregiverReviews" :key="review.id">
            <div class="cg-review-head"><strong>{{ review.patient }}家属</strong><span>{{ review.date }}</span></div>
            <div class="cg-stars"><Star v-for="star in 5" :key="star" :size="16" :class="{ empty: star > review.rating }" /></div>
            <div class="cg-review-tags"><span v-for="tag in review.tags" :key="tag">{{ tag }}</span></div>
            <p>{{ review.content }}</p>
          </article>
        </section>
      </template>
    </main>

    <nav class="cg-bottom-nav" aria-label="护工端主导航">
      <button v-for="item in tabs" :key="item.key" type="button" :class="{ active: activeTab === item.key }" @click="switchTab(item.key)">
        <span><component :is="item.icon" :size="21" /><i v-if="item.key === 'messages' && unreadMessages">{{ unreadMessages }}</i></span>
        {{ item.label }}
      </button>
    </nav>

    <div v-if="dialog" class="cg-dialog-backdrop" @click.self="dialog = null">
      <section class="cg-dialog" :class="{ wide: dialog === 'record' || dialog === 'patient' }">
        <header>
          <div>
            <p v-if="selectedTask && ['record', 'decision'].includes(dialog)">{{ selectedTask.patient }} · {{ selectedTask.plannedTime }}</p>
            <h3>
              {{
                dialog === 'record' ? '填写执行记录' :
                dialog === 'decision' ? (decisionMode === 'adjust' ? '建议调整任务' : '退回自定义任务') :
                dialog === 'temporary' ? '新增临时任务' :
                dialog === 'patient' ? '患者照护信息' :
                dialog === 'notice' ? '站内通知' : '修改登录密码'
              }}
            </h3>
          </div>
          <button class="cg-icon-button subtle" type="button" title="关闭" @click="dialog = null"><X :size="20" /></button>
        </header>

        <form v-if="dialog === 'record'" class="cg-form" @submit.prevent="submitRecord">
          <div class="cg-task-context"><ClipboardList :size="19" /><div><strong>{{ selectedTask?.title }}</strong><p>{{ selectedTask?.method }}</p></div></div>
          <fieldset class="cg-radio-group"><legend>执行状态</legend><label :class="{ active: recordStatus === 'COMPLETED' }"><input v-model="recordStatus" type="radio" value="COMPLETED" /><CheckCircle2 :size="18" />已完成</label><label :class="{ active: recordStatus === 'SKIPPED' }"><input v-model="recordStatus" type="radio" value="SKIPPED" /><AlertCircle :size="18" />已跳过</label></fieldset>
          <label>实际执行时间<input v-model="recordTime" type="datetime-local" required /></label>
          <label>{{ recordStatus === 'SKIPPED' ? '跳过原因' : '执行备注' }}<textarea v-model="recordRemark" rows="3" :placeholder="recordStatus === 'SKIPPED' ? '请填写无法执行的原因' : '记录患者情况或执行结果'"></textarea></label>
          <div class="cg-upload-field">
            <div><strong>记录图片</strong><span>JPG/PNG，单张不超过 10 MB，最多 3 张</span></div>
            <div class="cg-image-grid">
              <div v-for="(image, index) in recordImages" :key="image.url" class="cg-image-preview"><img :src="image.url" :alt="image.name" /><button type="button" title="删除图片" @click="removeRecordImage(index)"><Trash2 :size="15" /></button></div>
              <label v-if="recordImages.length < 3" class="cg-upload-button"><ImagePlus :size="24" /><span>添加图片</span><input type="file" accept="image/jpeg,image/png" multiple @change="handleImageSelect" /></label>
            </div>
          </div>
          <div class="cg-dialog-actions"><button class="cg-secondary-button" type="button" @click="dialog = null">取消</button><button class="cg-primary-button" type="submit">提交记录</button></div>
        </form>

        <form v-else-if="dialog === 'decision'" class="cg-form" @submit.prevent="submitDecision">
          <div class="cg-task-context"><AlertCircle :size="19" /><div><strong>{{ selectedTask?.title }}</strong><p>{{ selectedTask?.familyNote }}</p></div></div>
          <label>{{ decisionMode === 'adjust' ? '调整建议' : '退回原因' }}<textarea v-model="decisionReason" rows="4" required :placeholder="decisionMode === 'adjust' ? '说明建议执行时间或方式' : '说明任务不可执行的原因'"></textarea></label>
          <div class="cg-dialog-actions"><button class="cg-secondary-button" type="button" @click="dialog = null">取消</button><button class="cg-primary-button" type="submit">提交并通知家属</button></div>
        </form>

        <form v-else-if="dialog === 'temporary'" class="cg-form" @submit.prevent="addTemporaryTask">
          <label>患者<input :value="`${selectedPatient.name} · ${selectedPatient.department} ${selectedPatient.bed}`" disabled /></label>
          <label>任务名称<input v-model="temporaryTask.title" maxlength="50" placeholder="例如：陪同检查" required /></label>
          <label>计划时间<input v-model="temporaryTask.plannedTime" type="time" required /></label>
          <label>执行方式<textarea v-model="temporaryTask.method" rows="3" maxlength="300" placeholder="填写具体执行内容" required></textarea></label>
          <label>补充备注<textarea v-model="temporaryTask.note" rows="2" maxlength="200" placeholder="选填"></textarea></label>
          <div class="cg-dialog-actions"><button class="cg-secondary-button" type="button" @click="dialog = null">取消</button><button class="cg-primary-button" type="submit">创建任务</button></div>
        </form>

        <div v-else-if="dialog === 'patient'" class="cg-patient-detail">
          <div class="cg-detail-identity"><div class="cg-avatar">{{ selectedPatient.name.slice(0, 1) }}</div><div><h4>{{ selectedPatient.name }} · {{ selectedPatient.gender }} · {{ selectedPatient.age }}岁</h4><p>{{ selectedPatient.condition }}</p></div></div>
          <dl><div><dt>所在病区</dt><dd>{{ selectedPatient.hospital }} {{ selectedPatient.department }} {{ selectedPatient.bed }}</dd></div><div><dt>服务班次</dt><dd>{{ selectedPatient.shift }}</dd></div><div><dt>服务周期</dt><dd>{{ selectedPatient.servicePeriod }}</dd></div><div><dt>服务单号</dt><dd>{{ selectedPatient.orderNo }}</dd></div></dl>
          <div class="cg-care-note-list"><h4>照护注意事项</h4><p v-for="(note, index) in selectedPatient.careNotes" :key="note"><span>{{ index + 1 }}</span>{{ note }}</p></div>
          <div class="cg-medical-warning"><AlertCircle :size="18" /><p>涉及用药、检查和医疗操作时，请以医护人员医嘱为准。</p></div>
        </div>

        <div v-else-if="dialog === 'notice'" class="cg-notice-list">
          <button type="button" @click="taskFilter = 'PENDING_CONFIRM'; dialog = null; switchTab('tasks')"><span class="amber"><ClipboardList :size="18" /></span><div><strong>新的自定义任务待确认</strong><p>李明 · 测量并记录血压</p><small>10 分钟前</small></div><ChevronRight :size="18" /></button>
          <button type="button" @click="dialog = null; switchTab('messages')"><span class="blue"><MessageSquareText :size="18" /></span><div><strong>家属发来新留言</strong><p>午饭吃了多少？麻烦记录一下。</p><small>38 分钟前</small></div><ChevronRight :size="18" /></button>
          <button type="button" @click="dialog = null; switchTab('schedule')"><span class="green"><CalendarDays :size="18" /></span><div><strong>排班已更新</strong><p>7月28日新增赵兰夜班陪护</p><small>昨天 16:20</small></div><ChevronRight :size="18" /></button>
        </div>

        <form v-else class="cg-form" @submit.prevent="submitPassword">
          <label>当前密码<input v-model="passwordForm.current" type="password" autocomplete="current-password" required /></label>
          <label>新密码<input v-model="passwordForm.next" type="password" autocomplete="new-password" placeholder="至少 8 位" required /></label>
          <label>确认新密码<input v-model="passwordForm.confirm" type="password" autocomplete="new-password" required /></label>
          <div class="cg-password-rule"><LockKeyhole :size="17" /><span>首次登录必须修改初始密码，新密码不能与初始密码相同。</span></div>
          <div class="cg-dialog-actions"><button class="cg-secondary-button" type="button" @click="dialog = null">取消</button><button class="cg-primary-button" type="submit">确认修改</button></div>
        </form>
      </section>
    </div>

    <div v-if="toast" class="cg-toast">{{ toast }}</div>
  </div>
</template>
