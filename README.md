# 住院陪护系统 (Inpatient Companion)

面向陪护机构的一站式住院陪护管理平台，帮助机构管理护工、患者、家属授权、陪护申请、排班、任务、陪护记录、留言和评价，建立"申请-确认-排班-执行-查看-评价"的可追溯闭环。

## 终端

| 终端 | 入口 | 用户 |
|------|------|------|
| 管理员后台 | `/admin` | 陪护机构管理员，管理全部业务数据 |
| 家属端 H5 | `/family` | 患者家属，选择护工、查看陪护记录、留言、评价 |
| 护工端 H5 | `/caregiver` | 护工，查看排班、执行任务、上传记录、回复留言 |

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.x | 组件化 UI 框架 |
| TypeScript | 5.9 | 类型约束与数据模型 |
| Vite | 7.x | 开发服务器与构建 |
| `@vitejs/plugin-vue` | 6.x | Vue SFC 编译 |
| `lucide-vue-next` | 0.x | 图标库 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Java | 17 | 运行环境 |
| Spring Boot | 3.4 | 应用框架 |
| Spring Security | — | 认证与授权 |
| JWT (jjwt) | 0.12 | 无状态 Token |
| MyBatis-Plus | 3.5 | ORM 数据访问 |
| MySQL | 8.x | 主数据库 |
| Flyway | — | 数据库版本迁移 |

## 项目结构

```
inpatient-companio1.0x/
├── backend/                   # Spring Boot 后端
│   ├── src/main/java/         # Java 源码
│   ├── src/main/resources/    # 配置与数据库迁移
│   └── pom.xml                # Maven 依赖
├── src/                       # Vue 3 前端
│   ├── App.vue                # 路由分发入口
│   ├── admin/                 # 管理员端
│   ├── family/                # 家属端 H5
│   ├── caregiver/             # 护工端 H5
│   └── shared/                # 三端共享状态同步
├── prototype/                 # 原型页面
├── docs/                      # 产品文档（PRD/需求/原型说明）
├── specs/                     # 技术规格（架构/数据库/接口设计等）
├── dev-docs/                  # 阶段开发文档（12个阶段）
├── index.html                 # 前端入口
├── package.json               # 前端依赖
├── vite.config.ts             # Vite 配置
└── tsconfig.json              # TypeScript 配置
```

## 快速开始

### 前置依赖

- Node.js ≥ 18
- Java 17
- Maven ≥ 3.8
- MySQL 8.x

### 1. 数据库

创建 MySQL 数据库：

```sql
CREATE DATABASE inpatient_companio
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

修改 `backend/src/main/resources/application.yml` 中的数据库连接信息（数据库地址、用户名、密码）。

启动后端后，Flyway 会自动执行数据库迁移脚本。

### 2. 启动后端

```bash
cd backend
./mvnw spring-boot:run
```

后端默认运行在 `http://192.168.5.45:8080`。

### 3. 启动前端

```bash
npm install
npm run dev
```

前端默认运行在 `http://192.168.5.45:5173`，访问：
- 管理员端：`/` 或 `/admin`
- 家属端：`/family`
- 护工端：`/caregiver`

## 业务闭环

```
创建账号 → 家属登录改密 → 选择护工提交申请
    → 管理员审核排班 → 护工执行任务记录
    → 家属查看记录/留言 → 服务完成评价
```

## 开发阶段

项目按 12 个阶段推进，详见 `dev-docs/`：

| 阶段 | 内容 | 
|------|------|
| 00 | 基础工程 |
| 01 | 账号与权限 |
| 02 | 患者与家属授权 |
| 03 | 护工管理 |
| 04 | 陪护申请 |
| 05 | 排班管理 |
| 06 | 陪护任务管理 |
| 07 | 执行记录与图片 |
| 08 | 留言管理 |
| 09 | 站内通知 |
| 10 | 评价管理 |
| 11 | 管理员工作台 |

## 版本

V1.0 MVP — 不含支付、退款、发票、实时聊天、外部通知等能力。

## 文档

- [PRD](docs/PRD.md)
- [需求规格说明书](docs/Requirements.md)
- [原型说明](docs/Prototype.md)
- [技术实现](docs/技术实现.md)
- [技术架构](specs/02-technical-architecture/技术架构.md)
- [数据库设计](specs/04-database-design/数据库设计.md)
- [接口设计](specs/05-api-design/接口设计.md)
