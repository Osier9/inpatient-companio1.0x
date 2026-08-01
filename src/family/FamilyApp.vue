<script setup lang="ts">
import { computed, ref } from "vue";
import {
  AlertCircle,
  ArrowLeft,
  BedDouble,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  HeartHandshake,
  Home,
  Image as ImageIcon,
  ListChecks,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Star,
  UserCheck,
  UserRound,
  UsersRound,
  X
} from "lucide-vue-next";
import {
  familyCaregivers,
  familyPatients,
  familyServices
} from "./mockData";
import type {
  FamilyCaregiver,
  FamilyConversation,
  FamilyTab,
  FamilyTask,
  FamilyTaskStatus,
  PastService
} from "./types";
import { portalActions, portalState } from "../shared/portalSync";
import "./family.css";

type FamilyDialog =
  | "caregiver"
  | "application"
  | "customTask"
  | "message"
  | "notices"
  | "review"
  | "password"
  | "authorization"
  | "images"
  | null;

const activeTab = ref<FamilyTab>("home");
const selectedPatientId = ref("p1");
const selectedTaskDate = ref("2026-07-26");
const taskDateOptions = [
  { date: "2026-07-26", weekday: "今天", day: "26" },
  { date: "2026-07-27", weekday: "明天", day: "27" },
  { date: "2026-07-28", weekday: "周二", day: "28" }
];

const tasks = computed(() => portalState.familyTasks);
const records = computed(() => portalState.familyRecords);
const conversations = computed(() => portalState.familyConversations);
const pastServices = computed(() => portalState.familyPastServices);
const caregiverSearch = ref("");
const genderFilter = ref<"全部" | "男" | "女">("全部");
const availabilityFilter = ref<"全部" | "可申请">("可申请");
const recordStatusFilter = ref<"全部" | "已完成" | "已跳过">("全部");
const dialog = ref<FamilyDialog>(null);
const selectedCaregiverId = ref<string | null>(null);
const selectedRecordId = ref<string | null>(null);
const toast = ref("");
const replyText = ref("");
const applicationStatus = computed<null | "PENDING">(() => {
  const patient = familyPatients.find((item) => item.id === selectedPatientId.value);
  if (!patient) return null;
  return portalState.adminCareRequests.some((item) => item.patient === patient.name && item.status.includes("待")) ? "PENDING" : null;
});
const isAuthenticated = ref(true);
const requiresPasswordChange = ref(false);
const loginForm = ref({ phone: "13800006666", password: "Family2026" });

const applicationForm = ref({
  patientId: "p1",
  startDate: "2026-07-28",
  endDate: "2026-07-30",
  shift: "白班 08:00-20:00",
  note: "术后需要饮食记录、翻身提醒和陪检沟通。"
});

const customTaskForm = ref({
  title: "",
  plannedTime: "15:00",
  method: "",
  note: ""
});

const reviewForm = ref({
  serviceId: "",
  rating: 5,
  tags: [] as string[],
  content: ""
});
const reviewTags = ["细心负责", "准时", "沟通及时", "照护专业", "有耐心"];

const passwordForm = ref({ current: "", next: "", confirm: "" });

const tabs: Array<{ key: FamilyTab; label: string; icon: typeof Home }> = [
  { key: "home", label: "首页", icon: Home },
  { key: "caregivers", label: "护工", icon: UsersRound },
  { key: "tasks", label: "任务", icon: ListChecks },
  { key: "records", label: "记录", icon: ClipboardList },
  { key: "profile", label: "我的", icon: UserRound }
];

const currentPatient = computed(
  () => familyPatients.find((item) => item.id === selectedPatientId.value) ?? familyPatients[0]
);

const currentService = computed(() => familyServices.find((item) => item.patientId === selectedPatientId.value) ?? null);

const currentCaregiver = computed(() =>
  familyCaregivers.find((item) => item.id === currentService.value?.caregiverId) ?? null
);

const selectedCaregiver = computed(() =>
  familyCaregivers.find((item) => item.id === selectedCaregiverId.value) ?? null
);

const selectedRecord = computed(() => records.value.find((item) => item.id === selectedRecordId.value) ?? null);

const filteredCaregivers = computed(() => {
  const keyword = caregiverSearch.value.trim().toLowerCase();
  return familyCaregivers.filter((item) => {
    const matchesKeyword = !keyword || `${item.name}${item.specialty.join("")}`.toLowerCase().includes(keyword);
    const matchesGender = genderFilter.value === "全部" || item.gender === genderFilter.value;
    const matchesAvailability = availabilityFilter.value === "全部" || item.status === "可申请";
    return matchesKeyword && matchesGender && matchesAvailability;
  });
});

const currentTasks = computed(() =>
  tasks.value
    .filter((item) => item.patientId === selectedPatientId.value && item.date === selectedTaskDate.value)
    .sort((left, right) => left.plannedTime.localeCompare(right.plannedTime))
);

const todayTaskSummary = computed(() => {
  const patientTasks = tasks.value.filter(
    (item) => item.patientId === selectedPatientId.value && item.date === "2026-07-26"
  );
  return {
    completed: patientTasks.filter((item) => item.status === "COMPLETED" || item.status === "SKIPPED").length,
    pending: patientTasks.filter((item) => item.status === "PENDING_CONFIRM" || item.status === "PENDING_EXECUTE").length,
    overdue: patientTasks.filter((item) => item.status === "OVERDUE").length,
    total: patientTasks.length
  };
});

const filteredRecords = computed(() =>
  records.value.filter(
    (item) =>
      item.patientId === selectedPatientId.value &&
      (recordStatusFilter.value === "全部" || item.status === recordStatusFilter.value)
  )
);

const groupedRecords = computed(() => {
  const groups = new Map<string, typeof records.value>();
  for (const record of filteredRecords.value) {
    const list = groups.get(record.date) ?? [];
    list.push(record);
    groups.set(record.date, list);
  }
  return Array.from(groups.entries()).map(([date, records]) => ({ date, records }));
});

const currentConversation = computed(
  () => conversations.value.find((item) => item.patientId === selectedPatientId.value) ?? null
);

const unreadMessages = computed(() => conversations.value.reduce((total, item) => total + item.unread, 0));

const pendingReviewCount = computed(() => pastServices.value.filter((item) => !item.reviewed).length);

function showToast(message: string) {
  toast.value = message;
  window.setTimeout(() => {
    if (toast.value === message) toast.value = "";
  }, 2200);
}

function switchTab(tab: FamilyTab) {
  activeTab.value = tab;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function taskStatusLabel(status: FamilyTaskStatus) {
  const labels: Record<FamilyTaskStatus, string> = {
    PENDING_CONFIRM: "待护工确认",
    PENDING_EXECUTE: "待执行",
    COMPLETED: "已完成",
    SKIPPED: "已跳过",
    OVERDUE: "已超时",
    NEED_ADJUST: "需调整",
    REJECTED: "已退回"
  };
  return labels[status];
}

function taskStatusTone(status: FamilyTaskStatus) {
  if (status === "COMPLETED") return "green";
  if (status === "OVERDUE" || status === "REJECTED") return "red";
  if (status === "PENDING_CONFIRM" || status === "NEED_ADJUST") return "amber";
  return "blue";
}

function openCaregiver(caregiver: FamilyCaregiver) {
  selectedCaregiverId.value = caregiver.id;
  dialog.value = "caregiver";
}

function openApplication(caregiver: FamilyCaregiver) {
  if (caregiver.status !== "可申请") {
    showToast(caregiver.status === "服务中" ? "该护工当前服务中，请选择其他护工" : "该护工当前不可申请");
    return;
  }
  selectedCaregiverId.value = caregiver.id;
  applicationForm.value.patientId = selectedPatientId.value;
  dialog.value = "application";
}

function submitApplication() {
  if (!selectedCaregiver.value) return;
  if (applicationForm.value.endDate < applicationForm.value.startDate) {
    showToast("结束日期不能早于开始日期");
    return;
  }
  if (!applicationForm.value.note.trim()) {
    showToast("请填写陪护需求说明");
    return;
  }
  portalActions.submitCareRequest({
    patientName: familyPatients.find((item) => item.id === applicationForm.value.patientId)?.name ?? currentPatient.value.name,
    familyName: "李女士",
    caregiverName: selectedCaregiver.value.name,
    startDate: applicationForm.value.startDate,
    endDate: applicationForm.value.endDate,
    shift: applicationForm.value.shift,
    note: applicationForm.value.note.trim()
  });
  dialog.value = null;
  showToast("陪护申请已提交，等待管理员审核");
}

function openCustomTask() {
  if (!currentService.value) {
    showToast("当前患者暂无服务中的陪护单");
    return;
  }
  customTaskForm.value = { title: "", plannedTime: "15:00", method: "", note: "" };
  dialog.value = "customTask";
}

function submitCustomTask() {
  if (!customTaskForm.value.title.trim() || !customTaskForm.value.method.trim()) {
    showToast("请填写任务名称和执行方式");
    return;
  }
  portalActions.addFamilyTask({
    patientId: selectedPatientId.value,
    date: selectedTaskDate.value,
    title: customTaskForm.value.title.trim(),
    plannedTime: customTaskForm.value.plannedTime,
    method: customTaskForm.value.method.trim(),
    note: customTaskForm.value.note.trim() || undefined
  });
  dialog.value = null;
  showToast("任务已提交，等待护工确认");
}

function openMessage() {
  const conversation = currentConversation.value;
  if (!conversation) {
    showToast("当前患者暂无可留言的服务单");
    return;
  }
  conversation.unread = 0;
  dialog.value = "message";
}

function sendMessage() {
  const conversation = currentConversation.value;
  const content = replyText.value.trim();
  if (!conversation || !content) return;
  portalActions.sendFamilyMessage(selectedPatientId.value, content);
  replyText.value = "";
  showToast("留言已发送");
}

function openImages(recordId: string) {
  selectedRecordId.value = recordId;
  dialog.value = "images";
}

function openReview(service: PastService) {
  if (service.reviewed) {
    showToast("该服务已经评价，不可重复提交");
    return;
  }
  reviewForm.value = { serviceId: service.id, rating: 5, tags: [], content: "" };
  dialog.value = "review";
}

function toggleReviewTag(tag: string) {
  const index = reviewForm.value.tags.indexOf(tag);
  if (index >= 0) reviewForm.value.tags.splice(index, 1);
  else reviewForm.value.tags.push(tag);
}

function submitReview() {
  const service = pastServices.value.find((item) => item.id === reviewForm.value.serviceId);
  if (!service) return;
  if (!reviewForm.value.content.trim()) {
    showToast("请填写评价内容");
    return;
  }
  portalActions.submitReview({
    serviceId: service.id,
    patient: service.patient,
    caregiver: service.caregiver,
    rating: reviewForm.value.rating,
    tags: reviewForm.value.tags,
    content: reviewForm.value.content.trim()
  });
  dialog.value = null;
  showToast("评价提交成功，感谢您的反馈");
}

function login() {
  if (!/^1\d{10}$/.test(loginForm.value.phone) || !loginForm.value.password) {
    showToast("请输入正确的手机号和密码");
    return;
  }
  isAuthenticated.value = true;
  requiresPasswordChange.value = true;
  dialog.value = "password";
}

function logout() {
  isAuthenticated.value = false;
  activeTab.value = "home";
  showToast("已退出登录");
}

function closeDialog() {
  if (dialog.value === "password" && requiresPasswordChange.value) {
    showToast("首次登录必须先修改初始密码");
    return;
  }
  dialog.value = null;
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
  requiresPasswordChange.value = false;
  dialog.value = null;
  showToast("密码修改成功");
}
</script>

<template>
  <div class="fa-app">
    <section v-if="!isAuthenticated" class="fa-login-view">
      <div class="fa-login-mark"><HeartHandshake :size="30" /></div>
      <div><p>患者家属端</p><h2>登录住院陪护系统</h2></div>
      <form class="fa-form fa-login-form" @submit.prevent="login">
        <label>手机号<input v-model="loginForm.phone" inputmode="tel" maxlength="11" autocomplete="username" /></label>
        <label>密码<input v-model="loginForm.password" type="password" autocomplete="current-password" /></label>
        <button class="fa-primary-button full" type="submit">登录</button>
      </form>
      <p class="fa-login-contact">账号由陪护机构管理员创建。如无法登录，请联系机构处理。</p>
    </section>

    <template v-else>
      <header class="fa-appbar">
        <div>
          <p class="fa-eyebrow">2026年7月26日 周日</p>
          <h2>李女士，上午好</h2>
        </div>
        <button class="fa-icon-button" type="button" title="站内通知" @click="dialog = 'notices'">
          <Bell :size="21" /><span class="fa-notice-dot">2</span>
        </button>
      </header>

      <main class="fa-content">
        <label class="fa-patient-selector">
          <span><UserCheck :size="18" />当前患者</span>
          <select v-model="selectedPatientId">
            <option v-for="patient in familyPatients" :key="patient.id" :value="patient.id">
              {{ patient.name }}（{{ patient.relation }}）
            </option>
          </select>
          <ChevronRight :size="18" />
        </label>

        <template v-if="activeTab === 'home'">
          <section v-if="currentService && currentCaregiver" class="fa-service-band">
            <div class="fa-service-top"><span><i></i>{{ currentService.status }}</span><small>{{ currentService.id }}</small></div>
            <div class="fa-service-main">
              <div class="fa-avatar">{{ currentCaregiver.name.slice(0, 1) }}</div>
              <div><p>当前护工</p><h3>{{ currentCaregiver.name }}</h3><span>{{ currentCaregiver.experienceYears }}年经验 · 评分 {{ currentCaregiver.rating }}</span></div>
              <button type="button" title="给护工留言" @click="openMessage"><MessageSquareText :size="20" /><i v-if="unreadMessages">{{ unreadMessages }}</i></button>
            </div>
            <div class="fa-service-info"><span><CalendarDays :size="16" />{{ currentService.period }}</span><span><Clock3 :size="16" />{{ currentService.shift }}</span><span><Building2 :size="16" />{{ currentService.location }}</span></div>
          </section>

          <section v-else class="fa-no-service">
            <HeartHandshake :size="34" />
            <div><h3>{{ currentPatient.name }}暂无进行中的陪护服务</h3><p>选择机构内可服务护工并提交陪护申请。</p></div>
            <button class="fa-primary-button" type="button" @click="switchTab('caregivers')">选择护工</button>
          </section>

          <section v-if="applicationStatus" class="fa-application-alert">
            <ClipboardCheck :size="20" /><div><strong>陪护申请审核中</strong><p>管理员确认后将生成服务单和排班，并通过站内通知告知您。</p></div><span>待审核</span>
          </section>

          <template v-if="currentService">
            <div class="fa-section-heading"><div><p>今日进度</p><h3>陪护任务</h3></div><button type="button" @click="switchTab('tasks')">查看计划<ChevronRight :size="16" /></button></div>
            <section class="fa-progress-panel">
              <div class="fa-progress-ring"><strong>{{ todayTaskSummary.completed }}/{{ todayTaskSummary.total }}</strong><span>已完成</span></div>
              <div class="fa-progress-details"><div><span>待处理</span><strong>{{ todayTaskSummary.pending }}</strong></div><div><span>已超时</span><strong class="danger">{{ todayTaskSummary.overdue }}</strong></div><div><span>最近更新</span><strong>08:05</strong></div></div>
            </section>

            <section class="fa-quick-actions">
              <button type="button" @click="openCustomTask"><Plus :size="21" /><span>添加任务</span></button>
              <button type="button" @click="switchTab('records')"><ClipboardList :size="21" /><span>陪护记录</span></button>
              <button type="button" @click="openMessage"><MessageSquareText :size="21" /><span>联系护工</span></button>
              <button type="button" @click="dialog = 'authorization'"><ShieldCheck :size="21" /><span>患者授权</span></button>
            </section>

            <div class="fa-section-heading compact"><div><p>最新动态</p><h3>早餐协助已完成</h3></div><span>08:05</span></div>
            <article class="fa-latest-record">
              <div class="fa-record-icon"><CheckCircle2 :size="21" /></div>
              <div><p>王秀兰提交了执行记录</p><strong>实际进食约 70%，精神状态正常。</strong><button type="button" @click="openImages('r1')"><ImageIcon :size="15" />查看 2 张图片</button></div>
            </article>

            <section class="fa-privacy-note"><ShieldCheck :size="19" /><p>患者信息、陪护记录和图片仅对已授权家属开放。</p></section>
          </template>
        </template>

        <template v-else-if="activeTab === 'caregivers'">
          <div class="fa-page-title"><div><p>机构护工</p><h2>选择陪护人员</h2></div><span>{{ filteredCaregivers.length }} 位可选</span></div>
          <label class="fa-search"><Search :size="17" /><input v-model="caregiverSearch" placeholder="搜索姓名或擅长" /></label>
          <div class="fa-filter-row">
            <div class="fa-segmented"><button v-for="gender in ['全部', '女', '男']" :key="gender" type="button" :class="{ active: genderFilter === gender }" @click="genderFilter = gender as typeof genderFilter">{{ gender }}</button></div>
            <select v-model="availabilityFilter" aria-label="服务状态"><option value="可申请">仅看可申请</option><option value="全部">全部状态</option></select>
          </div>
          <section v-if="filteredCaregivers.length" class="fa-caregiver-list">
            <article v-for="caregiver in filteredCaregivers" :key="caregiver.id" class="fa-caregiver-card">
              <div class="fa-caregiver-head"><div class="fa-avatar caregiver">{{ caregiver.name.slice(0, 1) }}</div><div><div><h3>{{ caregiver.name }}</h3><span>{{ caregiver.gender }} · {{ caregiver.experienceYears }}年经验</span></div><p><Star :size="14" />{{ caregiver.rating }} · 已服务 {{ caregiver.serviceCount }} 次</p></div><span class="fa-badge" :class="caregiver.status === '可申请' ? 'green' : caregiver.status === '服务中' ? 'amber' : 'gray'">{{ caregiver.status }}</span></div>
              <div class="fa-specialties"><span v-for="item in caregiver.specialty" :key="item">{{ item }}</span></div>
              <p class="fa-caregiver-intro">{{ caregiver.intro }}</p>
              <div class="fa-card-actions"><button class="fa-secondary-button" type="button" @click="openCaregiver(caregiver)">查看详情</button><button class="fa-primary-button" type="button" :disabled="caregiver.status !== '可申请'" @click="openApplication(caregiver)">申请陪护</button></div>
            </article>
          </section>
          <section v-else class="fa-empty-state"><UsersRound :size="34" /><h3>没有符合条件的护工</h3><p>调整筛选条件后重新查看。</p></section>
        </template>

        <template v-else-if="activeTab === 'tasks'">
          <div class="fa-page-title"><div><p>服务计划</p><h2>陪护任务</h2></div><button class="fa-action-button" type="button" :disabled="!currentService" @click="openCustomTask"><Plus :size="18" />添加任务</button></div>
          <div class="fa-date-strip">
            <button v-for="item in taskDateOptions" :key="item.date" type="button" :class="{ active: selectedTaskDate === item.date }" @click="selectedTaskDate = item.date"><span>{{ item.weekday }}</span><strong>{{ item.day }}</strong><small>7月</small></button>
          </div>
          <section v-if="currentTasks.length" class="fa-task-list">
            <article v-for="task in currentTasks" :key="task.id" class="fa-task-card" :class="{ overdue: task.status === 'OVERDUE' }">
              <div class="fa-task-time"><strong>{{ task.plannedTime }}</strong><span>{{ task.source }}</span></div>
              <div class="fa-task-main"><div><h3>{{ task.title }}</h3><span class="fa-badge" :class="taskStatusTone(task.status)">{{ taskStatusLabel(task.status) }}</span></div><p>{{ task.method }}</p><div v-if="task.caregiverReply" class="fa-task-reply"><MessageSquareText :size="15" />{{ task.caregiverReply }}</div></div>
            </article>
          </section>
          <section v-else class="fa-empty-state"><CheckCircle2 :size="34" /><h3>当日暂无任务安排</h3><p v-if="currentService">可添加患者需要的自定义照护任务。</p><p v-else>当前患者暂无服务中的陪护单。</p></section>
          <section class="fa-medical-note"><AlertCircle :size="18" /><p>任务仅用于陪护提醒和记录，涉及医疗操作时请以医护人员医嘱为准。</p></section>
        </template>

        <template v-else-if="activeTab === 'records'">
          <div class="fa-page-title"><div><p>执行动态</p><h2>陪护记录</h2></div><select v-model="recordStatusFilter" aria-label="记录状态"><option value="全部">全部状态</option><option value="已完成">已完成</option><option value="已跳过">已跳过</option></select></div>
          <section v-if="groupedRecords.length" class="fa-record-groups">
            <div v-for="group in groupedRecords" :key="group.date" class="fa-record-group">
              <div class="fa-record-date"><CalendarDays :size="17" /><strong>{{ group.date === '2026-07-26' ? '今天' : group.date }}</strong><span>{{ group.records.length }} 条记录</span></div>
              <article v-for="record in group.records" :key="record.id" class="fa-record-item">
                <div class="fa-timeline-mark"><i></i><span>{{ record.actualTime }}</span></div>
                <div class="fa-record-card"><div><h3>{{ record.task }}</h3><span class="fa-badge green">{{ record.status }}</span></div><p>计划 {{ record.plannedTime }} · 实际 {{ record.actualTime }} · {{ record.caregiver }}</p><strong>{{ record.remark }}</strong><button v-if="record.imageCount" type="button" @click="openImages(record.id)"><ImageIcon :size="16" />{{ record.imageCount }} 张记录图片<ChevronRight :size="15" /></button></div>
              </article>
            </div>
          </section>
          <section v-else class="fa-empty-state"><ClipboardList :size="34" /><h3>暂无陪护记录</h3><p>护工提交执行结果后会在这里展示。</p></section>
        </template>

        <template v-else>
          <section class="fa-profile-band"><div class="fa-avatar profile">李</div><div><h2>李女士</h2><p>138****6666 · 已绑定 {{ familyPatients.length }} 位患者</p><span>账号状态正常</span></div></section>
          <section class="fa-profile-summary"><button type="button" @click="applicationStatus && showToast('申请仍在审核中')"><strong>{{ applicationStatus ? 1 : 0 }}</strong><span>审核中申请</span></button><button type="button"><strong>{{ pastServices.length }}</strong><span>历史服务</span></button><button type="button" @click="pendingReviewCount && showToast('有待评价服务')"><strong>{{ pendingReviewCount }}</strong><span>待评价</span></button></section>
          <section class="fa-profile-menu">
            <button type="button" @click="openMessage"><MessageSquareText :size="20" /><span><strong>服务留言</strong><small>与当前护工沟通</small></span><i v-if="unreadMessages">{{ unreadMessages }}</i><ChevronRight :size="18" /></button>
            <button type="button" @click="dialog = 'authorization'"><ShieldCheck :size="20" /><span><strong>患者授权</strong><small>查看已授权患者</small></span><ChevronRight :size="18" /></button>
            <button type="button" @click="dialog = 'password'"><LockKeyhole :size="20" /><span><strong>账号安全</strong><small>修改登录密码</small></span><ChevronRight :size="18" /></button>
            <button type="button" @click="logout"><LogOut :size="20" /><span><strong>退出登录</strong><small>退出当前家属账号</small></span><ChevronRight :size="18" /></button>
          </section>
          <div class="fa-section-heading compact"><div><p>服务历史</p><h3>历史陪护</h3></div><span>{{ pastServices.length }} 条</span></div>
          <section class="fa-past-services">
            <article v-for="service in pastServices" :key="service.id"><div><span>服务单 {{ service.id }}</span><strong>{{ service.patient }} · {{ service.caregiver }}</strong><p>{{ service.period }}</p></div><button v-if="!service.reviewed" class="fa-primary-button" type="button" @click="openReview(service)">去评价</button><span v-else class="fa-reviewed"><Star :size="15" />{{ service.rating }}分</span></article>
          </section>
        </template>
      </main>

      <nav class="fa-bottom-nav" aria-label="家属端主导航">
        <button v-for="item in tabs" :key="item.key" type="button" :class="{ active: activeTab === item.key }" @click="switchTab(item.key)"><component :is="item.icon" :size="21" />{{ item.label }}</button>
      </nav>
    </template>

    <div v-if="dialog" class="fa-dialog-backdrop" @click.self="closeDialog">
      <section class="fa-dialog" :class="{ wide: ['caregiver', 'message', 'images'].includes(dialog) }">
        <header>
          <div><p v-if="dialog === 'application' && selectedCaregiver">申请 {{ selectedCaregiver.name }} 的陪护服务</p><h3>{{ dialog === 'caregiver' ? '护工详情' : dialog === 'application' ? '提交陪护申请' : dialog === 'customTask' ? '添加自定义任务' : dialog === 'message' ? `与${currentConversation?.caregiverName ?? '护工'}留言` : dialog === 'notices' ? '站内通知' : dialog === 'review' ? '评价陪护服务' : dialog === 'authorization' ? '患者授权' : dialog === 'images' ? '记录图片' : requiresPasswordChange ? '首次登录修改密码' : '修改登录密码' }}</h3></div>
          <button v-if="!(dialog === 'password' && requiresPasswordChange)" class="fa-icon-button subtle" type="button" title="关闭" @click="closeDialog"><X :size="20" /></button>
        </header>

        <div v-if="dialog === 'caregiver' && selectedCaregiver" class="fa-caregiver-detail">
          <div class="fa-detail-identity"><div class="fa-avatar large">{{ selectedCaregiver.name.slice(0, 1) }}</div><div><h4>{{ selectedCaregiver.name }}</h4><p>{{ selectedCaregiver.gender }} · {{ selectedCaregiver.experienceYears }}年经验 · 已服务{{ selectedCaregiver.serviceCount }}次</p><span><Star :size="15" />{{ selectedCaregiver.rating }}</span></div><span class="fa-badge" :class="selectedCaregiver.status === '可申请' ? 'green' : 'amber'">{{ selectedCaregiver.status }}</span></div>
          <div class="fa-detail-block"><h4>擅长护理</h4><div class="fa-specialties"><span v-for="item in selectedCaregiver.specialty" :key="item">{{ item }}</span></div></div>
          <div class="fa-detail-block"><h4>个人简介</h4><p>{{ selectedCaregiver.intro }}</p></div>
          <div class="fa-detail-block"><h4>近期评价</h4><p v-for="review in selectedCaregiver.recentReviews" :key="review" class="fa-review-quote">“{{ review }}”</p></div>
          <button class="fa-primary-button full" type="button" :disabled="selectedCaregiver.status !== '可申请'" @click="openApplication(selectedCaregiver)">{{ selectedCaregiver.status === '可申请' ? '申请该护工' : '当前不可申请' }}</button>
        </div>

        <form v-else-if="dialog === 'application' && selectedCaregiver" class="fa-form" @submit.prevent="submitApplication">
          <div class="fa-selected-caregiver"><div class="fa-avatar small">{{ selectedCaregiver.name.slice(0, 1) }}</div><div><strong>{{ selectedCaregiver.name }}</strong><span>{{ selectedCaregiver.experienceYears }}年经验 · {{ selectedCaregiver.specialty.join('、') }}</span></div><span><Star :size="14" />{{ selectedCaregiver.rating }}</span></div>
          <label>患者<select v-model="applicationForm.patientId"><option v-for="patient in familyPatients" :key="patient.id" :value="patient.id">{{ patient.name }} · {{ patient.hospital }} {{ patient.department }} {{ patient.bed }}</option></select></label>
          <div class="fa-form-columns"><label>开始日期<input v-model="applicationForm.startDate" type="date" required /></label><label>结束日期<input v-model="applicationForm.endDate" type="date" required /></label></div>
          <label>服务班次<select v-model="applicationForm.shift"><option>白班 08:00-20:00</option><option>夜班 20:00-08:00</option><option>全天 24小时</option></select></label>
          <label>陪护需求说明<textarea v-model="applicationForm.note" rows="4" maxlength="500" required></textarea></label>
          <div class="fa-dialog-actions"><button class="fa-secondary-button" type="button" @click="closeDialog">取消</button><button class="fa-primary-button" type="submit">提交申请</button></div>
        </form>

        <form v-else-if="dialog === 'customTask'" class="fa-form" @submit.prevent="submitCustomTask">
          <label>患者<input :value="`${currentPatient.name} · ${currentPatient.department} ${currentPatient.bed}`" disabled /></label>
          <label>任务名称<input v-model="customTaskForm.title" maxlength="50" placeholder="例如：测量并记录血压" required /></label>
          <label>计划执行时间<input v-model="customTaskForm.plannedTime" type="time" required /></label>
          <label>执行方式<textarea v-model="customTaskForm.method" rows="3" maxlength="300" placeholder="说明希望护工如何执行和记录" required></textarea></label>
          <label>补充备注<textarea v-model="customTaskForm.note" rows="2" maxlength="200" placeholder="选填"></textarea></label>
          <div class="fa-medical-note modal"><AlertCircle :size="18" /><p>请以医护人员医嘱为准。护工确认后任务才会生效。</p></div>
          <div class="fa-dialog-actions"><button class="fa-secondary-button" type="button" @click="closeDialog">取消</button><button class="fa-primary-button" type="submit">提交任务</button></div>
        </form>

        <template v-else-if="dialog === 'message' && currentConversation">
          <div class="fa-message-context"><span>{{ currentPatient.name }}</span><small>服务单 {{ currentConversation.orderNo }}</small></div>
          <section class="fa-chat-body"><div v-for="message in currentConversation.messages" :key="message.id" class="fa-message" :class="{ self: message.sender === 'family' }"><span>{{ message.senderName }} · {{ message.time }}</span><p>{{ message.content }}</p></div></section>
          <form class="fa-reply-box" @submit.prevent="sendMessage"><textarea v-model="replyText" rows="2" maxlength="500" placeholder="给护工留言"></textarea><button type="submit" title="发送留言" :disabled="!replyText.trim()"><Send :size="19" /></button></form>
        </template>

        <div v-else-if="dialog === 'notices'" class="fa-notice-list">
          <button type="button" @click="dialog = null; switchTab('records')"><span class="green"><CheckCircle2 :size="18" /></span><div><strong>早餐协助已完成</strong><p>王秀兰提交了执行记录和 2 张图片。</p><small>1 小时前</small></div><ChevronRight :size="18" /></button>
          <button type="button" @click="dialog = null; switchTab('tasks')"><span class="red"><AlertCircle :size="18" /></span><div><strong>喝药提醒任务已超时</strong><p>计划时间 09:30，暂未提交记录。</p><small>38 分钟前</small></div><ChevronRight :size="18" /></button>
        </div>

        <form v-else-if="dialog === 'review'" class="fa-form" @submit.prevent="submitReview">
          <div class="fa-rating-picker"><button v-for="star in 5" :key="star" type="button" title="设置评分" :class="{ active: star <= reviewForm.rating }" @click="reviewForm.rating = star"><Star :size="27" /></button><strong>{{ reviewForm.rating }}.0</strong></div>
          <div class="fa-tag-picker"><span>评价标签</span><div><button v-for="tag in reviewTags" :key="tag" type="button" :class="{ active: reviewForm.tags.includes(tag) }" @click="toggleReviewTag(tag)">{{ tag }}</button></div></div>
          <label>评价内容<textarea v-model="reviewForm.content" rows="4" maxlength="500" placeholder="说说本次陪护服务体验" required></textarea></label>
          <div class="fa-dialog-actions"><button class="fa-secondary-button" type="button" @click="closeDialog">取消</button><button class="fa-primary-button" type="submit">提交评价</button></div>
        </form>

        <div v-else-if="dialog === 'authorization'" class="fa-authorization-list">
          <article v-for="patient in familyPatients" :key="patient.id"><div class="fa-avatar small">{{ patient.name.slice(0, 1) }}</div><div><strong>{{ patient.name }}（{{ patient.relation }}）</strong><p>{{ patient.hospital }} {{ patient.department }} {{ patient.bed }}</p></div><span class="fa-badge green">{{ patient.authorizationStatus }}</span></article>
          <section class="fa-privacy-note"><ShieldCheck :size="18" /><p>如需新增、撤回或更正患者授权，请联系陪护机构管理员。</p></section>
        </div>

        <div v-else-if="dialog === 'images' && selectedRecord" class="fa-image-viewer">
          <div class="fa-image-grid"><div v-for="index in selectedRecord.imageCount" :key="index"><ImageIcon :size="34" /><span>记录图片 {{ index }}</span></div></div>
          <dl><div><dt>任务</dt><dd>{{ selectedRecord.task }}</dd></div><div><dt>提交护工</dt><dd>{{ selectedRecord.caregiver }}</dd></div><div><dt>执行时间</dt><dd>{{ selectedRecord.date }} {{ selectedRecord.actualTime }}</dd></div></dl>
          <p><ShieldCheck :size="16" />图片经当前患者授权校验后展示。</p>
        </div>

        <form v-else class="fa-form" @submit.prevent="submitPassword">
          <div v-if="requiresPasswordChange" class="fa-password-alert"><LockKeyhole :size="19" /><p>当前使用管理员设置的初始密码，修改后才能进入业务页面。</p></div>
          <label>当前密码<input v-model="passwordForm.current" type="password" autocomplete="current-password" required /></label>
          <label>新密码<input v-model="passwordForm.next" type="password" autocomplete="new-password" placeholder="至少 8 位" required /></label>
          <label>确认新密码<input v-model="passwordForm.confirm" type="password" autocomplete="new-password" required /></label>
          <div class="fa-dialog-actions"><button v-if="!requiresPasswordChange" class="fa-secondary-button" type="button" @click="closeDialog">取消</button><button class="fa-primary-button" type="submit">确认修改</button></div>
        </form>
      </section>
    </div>

    <div v-if="toast" class="fa-toast">{{ toast }}</div>
  </div>
</template>
