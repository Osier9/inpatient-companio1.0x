<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Bell,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Home,
  LockKeyhole,
  MessageSquareText,
  NotepadText,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound
} from "lucide-vue-next";
import {
  caregivers,
  patients,
  taskTemplates
} from "./mockData";
import type { AdminSection } from "./types";
import CaregiverApp from "./caregiver/CaregiverApp.vue";
import FamilyApp from "./family/FamilyApp.vue";
import { adminStats, portalActions, portalState } from "./shared/portalSync";

type PortalRole = "admin" | "caregiver" | "family";
type ModalType = "approve" | "caregiver" | "patient" | "task" | "message" | "privacy";

function resolvePortalRole(): PortalRole {
  const firstPathSegment = window.location.pathname.replace(/^\/+/, "").split("/")[0];
  if (firstPathSegment === "caregiver" || firstPathSegment === "family") return firstPathSegment;

  const requestedRole = new URLSearchParams(window.location.search).get("role");
  if (requestedRole === "caregiver" || requestedRole === "family") return requestedRole;

  return "admin";
}

const role = resolvePortalRole();
const activeSection = ref<AdminSection>("dashboard");
const searchKeyword = ref("");
const toast = ref("");
const modal = ref<ModalType | null>(null);

const menu = [
  { key: "dashboard", label: "工作台", icon: Home },
  { key: "caregivers", label: "护工管理", icon: UserRound },
  { key: "patients", label: "患者管理", icon: UsersRound },
  { key: "requests", label: "陪护申请", icon: ClipboardCheck },
  { key: "schedules", label: "排班管理", icon: CalendarDays },
  { key: "taskTemplates", label: "任务模板", icon: NotepadText },
  { key: "records", label: "陪护记录", icon: FileText },
  { key: "messages", label: "留言管理", icon: MessageSquareText },
  { key: "reviews", label: "评价管理", icon: Star },
  { key: "settings", label: "系统设置", icon: Settings }
] as const;

const sectionMeta: Record<AdminSection, { title: string; desc: string }> = {
  dashboard: { title: "管理员工作台", desc: "集中处理申请、排班、超时任务、留言和近期评价。" },
  caregivers: { title: "护工管理", desc: "维护护工资料、工号账号、服务状态和评分摘要。" },
  patients: { title: "患者管理", desc: "维护患者资料和家属授权关系，建立数据权限边界。" },
  requests: { title: "陪护申请", desc: "审核家属提交的陪护申请，确认后生成服务单。" },
  schedules: { title: "排班管理", desc: "按日期、护工、患者和班次管理排班，保存前校验冲突。" },
  taskTemplates: { title: "任务模板", desc: "维护吃饭、喝药、休息等固定任务模板。" },
  records: { title: "陪护记录", desc: "按患者、护工、日期和任务状态查看执行记录。" },
  messages: { title: "留言管理", desc: "查看家属与护工留言，添加管理员内部备注。" },
  reviews: { title: "评价管理", desc: "查看服务评价，标记需回访或已处理。" },
  settings: { title: "系统设置", desc: "管理账号状态、初始密码、角色权限和安全规则。" }
};

const currentMeta = computed(() => sectionMeta[activeSection.value]);
const stats = adminStats;
const careRequests = computed(() => portalState.adminCareRequests);
const schedules = computed(() => portalState.adminSchedules);
const records = computed(() => portalState.adminRecords);
const messages = computed(() => portalState.adminMessages);
const reviews = computed(() => portalState.adminReviews);
const pendingRequests = computed(() => careRequests.value.filter((item) => statusTone(item.status) === "amber" || statusTone(item.status) === "red"));
const timeoutRecords = computed(() => records.value.filter((item) => statusTone(item.status) === "red"));

function statusTone(value: string) {
  if (value.includes("超") || value.includes("冲突") || value.includes("退") || value.includes("回访")) return "red";
  if (value.includes("待") || value.includes("休") || value.includes("需")) return "amber";
  if (value.includes("完成") || value.includes("确认") || value.includes("启用") || value.includes("服务中")) return "green";
  return "blue";
}

function showToast(message: string) {
  toast.value = message;
  window.setTimeout(() => {
    if (toast.value === message) toast.value = "";
  }, 1800);
}

function setSection(section: AdminSection) {
  activeSection.value = section;
  searchKeyword.value = "";
}

function confirmModal(message: string) {
  if (modal.value === "approve") {
    const approved = portalActions.approveNextPendingRequest();
    if (!approved) {
      showToast("当前没有待审核申请");
      modal.value = null;
      return;
    }
  }
  modal.value = null;
  showToast(message);
}
</script>

<template>
  <CaregiverApp v-if="role === 'caregiver'" />
  <FamilyApp v-else-if="role === 'family'" />

  <div v-else class="shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">陪</div>
        <div>
          <h1>住院陪护系统</h1>
          <p>陪护机构管理后台</p>
        </div>
      </div>

      <div class="top-actions">
        <button class="icon-btn" type="button" title="站内通知" @click="showToast('当前有 6 条未读站内通知')">
          <Bell :size="18" />
        </button>
        <button class="icon-btn" type="button" title="隐私权限" @click="modal = 'privacy'">
          <ShieldCheck :size="18" />
        </button>
      </div>
    </header>

    <main class="admin-layout">
      <aside class="sidebar">
        <button
          v-for="item in menu"
          :key="item.key"
          class="menu-item"
          :class="{ active: activeSection === item.key }"
          type="button"
          @click="setSection(item.key)"
        >
          <component :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </button>
      </aside>

      <section class="workspace">
        <div class="page-head">
          <div>
            <h2>{{ currentMeta.title }}</h2>
            <p>{{ currentMeta.desc }}</p>
          </div>
          <div class="toolbar">
            <label class="search">
              <Search :size="16" />
              <input v-model="searchKeyword" placeholder="搜索患者/护工/申请编号" />
            </label>
            <button class="btn ghost" type="button" @click="showToast('数据已刷新')">
              <RefreshCw :size="16" />
              刷新
            </button>
            <button class="btn primary" type="button" @click="modal = 'approve'">快速审核</button>
          </div>
        </div>

        <section v-if="activeSection === 'dashboard'" class="section-grid">
          <div class="stats">
            <article v-for="item in stats" :key="item.label" class="stat-card" :class="item.tone">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>

          <div class="panel span-2">
            <div class="panel-head">
              <h3>待审核申请</h3>
              <span class="badge amber">{{ pendingRequests.length }} 项</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>患者</th>
                  <th>家属</th>
                  <th>目标护工</th>
                  <th>日期</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in pendingRequests" :key="item.id">
                  <td>{{ item.patient }}</td>
                  <td>{{ item.family }}</td>
                  <td>{{ item.caregiver }}</td>
                  <td>{{ item.dateRange }}</td>
                  <td><span class="badge" :class="statusTone(item.status)">{{ item.status }}</span></td>
                  <td><button class="link-btn" type="button" @click="modal = 'approve'">审核</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="panel">
            <div class="panel-head">
              <h3>异常提醒</h3>
              <span class="badge red">{{ timeoutRecords.length }} 项</span>
            </div>
            <div class="timeline">
              <div v-for="item in timeoutRecords" :key="item.id" class="timeline-item">
                <span>{{ item.time }}</span>
                <div>
                  <strong>{{ item.task }}</strong>
                  <p>{{ item.patient }} · {{ item.caregiver }} · {{ item.remark }}</p>
                </div>
              </div>
              <div class="timeline-item">
                <span>11:00</span>
                <div>
                  <strong>测血压待确认</strong>
                  <p>家属新增任务，等待护工确认。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-if="activeSection === 'caregivers'" class="panel">
          <div class="panel-head">
            <h3>护工列表</h3>
            <button class="btn primary" type="button" @click="modal = 'caregiver'">新增护工</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>工号</th>
                <th>手机号</th>
                <th>经验</th>
                <th>擅长</th>
                <th>评分</th>
                <th>服务状态</th>
                <th>账号</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in caregivers" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.employeeNo }}</td>
                <td>{{ item.phone }}</td>
                <td>{{ item.experience }}</td>
                <td>{{ item.specialty }}</td>
                <td>{{ item.rating }}</td>
                <td><span class="badge" :class="statusTone(item.serviceStatus)">{{ item.serviceStatus }}</span></td>
                <td><span class="badge" :class="statusTone(item.accountStatus)">{{ item.accountStatus }}</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section v-if="activeSection === 'patients'" class="panel">
          <div class="panel-head">
            <h3>患者与家属授权</h3>
            <button class="btn primary" type="button" @click="modal = 'patient'">新增患者</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>患者</th>
                <th>医院/床号</th>
                <th>授权家属数</th>
                <th>当前护工</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in patients" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.location }}</td>
                <td>{{ item.familyCount }}</td>
                <td>{{ item.currentCaregiver }}</td>
                <td><span class="badge" :class="statusTone(item.status)">{{ item.status }}</span></td>
                <td><button class="link-btn" type="button" @click="showToast('已打开家属授权弹窗')">绑定家属</button></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section v-if="activeSection === 'requests'" class="panel">
          <div class="panel-head">
            <h3>陪护申请审核</h3>
            <span class="badge amber">确认后生成服务单</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>申请编号</th>
                <th>患者</th>
                <th>家属</th>
                <th>护工</th>
                <th>日期</th>
                <th>班次</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in careRequests" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.patient }}</td>
                <td>{{ item.family }}</td>
                <td>{{ item.caregiver }}</td>
                <td>{{ item.dateRange }}</td>
                <td>{{ item.shift }}</td>
                <td><span class="badge" :class="statusTone(item.status)">{{ item.status }}</span></td>
                <td><button class="link-btn" type="button" @click="modal = 'approve'">处理</button></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section v-if="activeSection === 'schedules'" class="section-grid">
          <div class="panel span-2">
            <div class="panel-head">
              <h3>排班列表</h3>
              <button class="btn primary" type="button" @click="showToast('排班保存成功，已通知家属和护工')">新增排班</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>班次</th>
                  <th>患者</th>
                  <th>护工</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in schedules" :key="item.id">
                  <td>{{ item.date }}</td>
                  <td>{{ item.shift }}</td>
                  <td>{{ item.patient }}</td>
                  <td>{{ item.caregiver }}</td>
                  <td><span class="badge" :class="statusTone(item.status)">{{ item.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="panel">
            <div class="panel-head">
              <h3>冲突校验</h3>
              <span class="badge red">规则</span>
            </div>
            <p class="muted">同一护工同一日期同一班次不可重复排班。保存前后端都需要校验，数据库唯一约束兜底。</p>
          </div>
        </section>

        <section v-if="activeSection === 'taskTemplates'" class="panel">
          <div class="panel-head">
            <h3>固定任务模板</h3>
            <button class="btn primary" type="button" @click="modal = 'task'">新增模板</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>任务名称</th>
                <th>类型</th>
                <th>默认时间</th>
                <th>执行要求</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in taskTemplates" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.defaultTime }}</td>
                <td>{{ item.method }}</td>
                <td><span class="badge green">{{ item.enabled ? "启用" : "停用" }}</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section v-if="activeSection === 'records'" class="panel">
          <div class="panel-head">
            <h3>陪护记录</h3>
            <span class="badge blue">图片需鉴权访问</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>患者</th>
                <th>护工</th>
                <th>任务</th>
                <th>状态</th>
                <th>图片</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in records" :key="item.id">
                <td>{{ item.time }}</td>
                <td>{{ item.patient }}</td>
                <td>{{ item.caregiver }}</td>
                <td>{{ item.task }}</td>
                <td><span class="badge" :class="statusTone(item.status)">{{ item.status }}</span></td>
                <td>{{ item.images }} 张</td>
                <td>{{ item.remark }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section v-if="activeSection === 'messages'" class="panel">
          <div class="panel-head">
            <h3>留言会话</h3>
            <span class="badge amber">管理员备注仅后台可见</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>患者</th>
                <th>最后发送人</th>
                <th>内容</th>
                <th>未读</th>
                <th>处理状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in messages" :key="item.id">
                <td>{{ item.patient }}</td>
                <td>{{ item.lastSender }}</td>
                <td>{{ item.content }}</td>
                <td>{{ item.unread }}</td>
                <td><span class="badge" :class="statusTone(item.status)">{{ item.status }}</span></td>
                <td><button class="link-btn" type="button" @click="modal = 'message'">备注</button></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section v-if="activeSection === 'reviews'" class="panel">
          <div class="panel-head">
            <h3>评价管理</h3>
            <span class="badge blue">护工端评价脱敏</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>护工</th>
                <th>患者</th>
                <th>评分</th>
                <th>标签</th>
                <th>评价</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reviews" :key="item.id">
                <td>{{ item.caregiver }}</td>
                <td>{{ item.patient }}</td>
                <td>{{ item.rating }}</td>
                <td>{{ item.tags }}</td>
                <td>{{ item.content }}</td>
                <td><span class="badge" :class="statusTone(item.processStatus)">{{ item.processStatus }}</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section v-if="activeSection === 'settings'" class="section-grid">
          <div class="panel">
            <div class="panel-head">
              <h3>账号安全</h3>
              <LockKeyhole :size="18" />
            </div>
            <ul class="rule-list">
              <li>家属使用手机号和密码登录。</li>
              <li>护工使用工号和密码登录。</li>
              <li>初始密码首次登录必须修改。</li>
              <li>连续 5 次登录失败锁定 15 分钟。</li>
            </ul>
          </div>
          <div class="panel">
            <div class="panel-head">
              <h3>权限边界</h3>
              <ShieldCheck :size="18" />
            </div>
            <ul class="rule-list">
              <li>家属只能查看授权患者。</li>
              <li>护工只能查看本人排班患者。</li>
              <li>图片访问必须经过业务鉴权。</li>
              <li>管理员关键操作写入审计日志。</li>
            </ul>
          </div>
        </section>
      </section>
    </main>

    <div v-if="modal" class="modal-backdrop" @click.self="modal = null">
      <section class="modal">
        <div class="panel-head">
          <h3>
            {{
              modal === "approve"
                ? "审核陪护申请"
                : modal === "caregiver"
                  ? "新增护工"
                  : modal === "patient"
                    ? "新增患者"
                    : modal === "task"
                      ? "新增任务模板"
                      : modal === "message"
                        ? "添加内部备注"
                        : "隐私与权限"
            }}
          </h3>
          <button class="icon-btn" type="button" title="关闭" @click="modal = null">关</button>
        </div>

        <form class="form" @submit.prevent="confirmModal('操作成功，状态已同步更新')">
          <template v-if="modal === 'approve'">
            <label>最终护工<select><option>王阿姨 HG1007</option><option>刘阿姨 HG1030</option></select></label>
            <label>服务日期<input value="2026-07-26 至 2026-07-30" /></label>
            <label>班次<select><option>白班 08:00-20:00</option><option>夜班 20:00-08:00</option><option>全天</option></select></label>
            <label>审核备注<textarea rows="3">确认排班后将生成服务单和站内通知。</textarea></label>
          </template>

          <template v-else-if="modal === 'caregiver'">
            <label>姓名<input value="张阿姨" /></label>
            <label>工号<input value="HG1042" /></label>
            <label>手机号<input value="13800004444" /></label>
            <label>擅长<input value="老人护理、术后陪护" /></label>
            <label>初始密码<input value="Care2026" /></label>
          </template>

          <template v-else-if="modal === 'patient'">
            <label>患者姓名<input value="孙建平" /></label>
            <label>医院/科室/床号<input value="市一院 外科 6F-08床" /></label>
            <label>护理注意事项<textarea rows="3">术后注意翻身，饮食清淡。</textarea></label>
          </template>

          <template v-else-if="modal === 'task'">
            <label>任务名称<input value="喝药提醒" /></label>
            <label>默认时间<input value="09:30" /></label>
            <label>执行要求<textarea rows="3">按护士台药品清单提醒，并记录是否服用。</textarea></label>
          </template>

          <template v-else-if="modal === 'message'">
            <label>内部备注<textarea rows="4">已电话回访家属，问题已同步护工。</textarea></label>
          </template>

          <template v-else>
            <p class="muted">患者信息、陪护记录、图片和留言均按敏感个人信息处理。家属仅可查看授权患者，护工仅可查看本人排班患者。</p>
          </template>

          <div class="modal-actions">
            <button class="btn primary" type="submit">确认</button>
            <button class="btn ghost" type="button" @click="modal = null">取消</button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>
