CREATE TABLE IF NOT EXISTS sys_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role VARCHAR(32) NOT NULL,
  name VARCHAR(64) NOT NULL,
  login_account VARCHAR(64) NOT NULL,
  phone VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  password_status VARCHAR(32) NOT NULL DEFAULT 'INITIAL',
  account_status VARCHAR(32) NOT NULL DEFAULT 'ENABLED',
  login_fail_count INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_sys_user_login_account (login_account, deleted),
  KEY idx_sys_user_role (role),
  KEY idx_sys_user_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sys_audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  role VARCHAR(32) NULL,
  action VARCHAR(64) NOT NULL,
  target_type VARCHAR(64) NULL,
  target_id BIGINT NULL,
  before_data JSON NULL,
  after_data JSON NULL,
  ip VARCHAR(64) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_sys_audit_user (user_id),
  KEY idx_sys_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL,
  gender VARCHAR(16) NOT NULL,
  age INT NOT NULL,
  hospital VARCHAR(128) NOT NULL,
  department VARCHAR(128) NOT NULL,
  bed_no VARCHAR(64) NOT NULL,
  care_notes VARCHAR(1000) NULL,
  patient_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_patient_status (patient_status),
  KEY idx_patient_location (hospital, department, bed_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_family_auth (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  patient_id BIGINT NOT NULL,
  family_user_id BIGINT NOT NULL,
  relationship VARCHAR(32) NOT NULL,
  auth_status VARCHAR(32) NOT NULL DEFAULT 'ENABLED',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_patient_family_auth (patient_id, family_user_id, deleted),
  KEY idx_family_auth_user (family_user_id),
  KEY idx_family_auth_status (auth_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS caregiver_profile (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  employee_no VARCHAR(64) NOT NULL,
  name VARCHAR(64) NOT NULL,
  phone VARCHAR(20) NULL,
  gender VARCHAR(16) NOT NULL,
  age INT NULL,
  experience_years INT NOT NULL DEFAULT 0,
  specialties VARCHAR(255) NULL,
  introduction VARCHAR(1000) NULL,
  avatar_file_id BIGINT NULL,
  rating_avg DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  service_count INT NOT NULL DEFAULT 0,
  service_status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_caregiver_user (user_id, deleted),
  UNIQUE KEY uk_caregiver_employee_no (employee_no, deleted),
  KEY idx_caregiver_status (service_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS care_request (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_no VARCHAR(64) NOT NULL,
  patient_id BIGINT NOT NULL,
  family_user_id BIGINT NOT NULL,
  target_caregiver_id BIGINT NOT NULL,
  expected_start_date DATE NOT NULL,
  expected_end_date DATE NOT NULL,
  shift_type VARCHAR(32) NOT NULL,
  demand_note VARCHAR(1000) NULL,
  request_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  audit_opinion VARCHAR(1000) NULL,
  audited_by BIGINT NULL,
  audited_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_care_request_no (request_no, deleted),
  KEY idx_care_request_patient (patient_id),
  KEY idx_care_request_family (family_user_id),
  KEY idx_care_request_status (request_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS care_service_order (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(64) NOT NULL,
  request_id BIGINT NULL,
  patient_id BIGINT NOT NULL,
  caregiver_id BIGINT NOT NULL,
  family_user_id BIGINT NOT NULL,
  service_start_date DATE NOT NULL,
  service_end_date DATE NOT NULL,
  service_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_service_order_no (order_no, deleted),
  KEY idx_service_order_patient (patient_id),
  KEY idx_service_order_caregiver (caregiver_id),
  KEY idx_service_order_family (family_user_id),
  KEY idx_service_order_status (service_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS care_schedule (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  service_order_id BIGINT NOT NULL,
  caregiver_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  schedule_date DATE NOT NULL,
  shift_type VARCHAR(32) NOT NULL,
  schedule_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  remark VARCHAR(500) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_schedule_caregiver_shift (caregiver_id, schedule_date, shift_type, deleted),
  KEY idx_schedule_patient (patient_id),
  KEY idx_schedule_order (service_order_id),
  KEY idx_schedule_date (schedule_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS care_task_template (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_name VARCHAR(128) NOT NULL,
  task_type VARCHAR(64) NOT NULL,
  default_time TIME NOT NULL,
  execute_method VARCHAR(1000) NOT NULL,
  enabled TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_task_template_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS care_task (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  service_order_id BIGINT NOT NULL,
  schedule_id BIGINT NULL,
  patient_id BIGINT NOT NULL,
  caregiver_id BIGINT NOT NULL,
  task_name VARCHAR(128) NOT NULL,
  planned_at DATETIME NOT NULL,
  execute_method VARCHAR(1000) NOT NULL,
  task_source VARCHAR(32) NOT NULL,
  task_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_EXECUTE',
  created_by_role VARCHAR(32) NOT NULL,
  confirm_reason VARCHAR(1000) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_care_task_order (service_order_id),
  KEY idx_care_task_patient (patient_id),
  KEY idx_care_task_caregiver (caregiver_id),
  KEY idx_care_task_status (task_status),
  KEY idx_care_task_planned_at (planned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS care_record (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  service_order_id BIGINT NOT NULL,
  schedule_id BIGINT NULL,
  patient_id BIGINT NOT NULL,
  caregiver_id BIGINT NOT NULL,
  execute_status VARCHAR(32) NOT NULL,
  actual_executed_at DATETIME NOT NULL,
  remark VARCHAR(1000) NULL,
  submitted_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_care_record_task (task_id),
  KEY idx_care_record_patient (patient_id),
  KEY idx_care_record_caregiver (caregiver_id),
  KEY idx_care_record_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS file_object (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  biz_type VARCHAR(64) NOT NULL,
  biz_id BIGINT NOT NULL,
  storage_key VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(64) NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploaded_by BIGINT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_file_biz (biz_type, biz_id),
  KEY idx_file_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS care_record_image (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  record_id BIGINT NOT NULL,
  file_object_id BIGINT NOT NULL,
  sort_no INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_record_image_record (record_id),
  KEY idx_record_image_file (file_object_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_message (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  service_order_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  sender_user_id BIGINT NOT NULL,
  sender_role VARCHAR(32) NOT NULL,
  content VARCHAR(1000) NOT NULL,
  sent_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_message_order (service_order_id),
  KEY idx_message_patient (patient_id),
  KEY idx_message_sender (sender_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_message_read (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  message_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  read_status VARCHAR(32) NOT NULL DEFAULT 'UNREAD',
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_message_read_user (message_id, user_id, deleted),
  KEY idx_message_read_user (user_id, read_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_message_note (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  service_order_id BIGINT NOT NULL,
  admin_user_id BIGINT NOT NULL,
  note VARCHAR(1000) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_admin_note_order (service_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  receiver_user_id BIGINT NOT NULL,
  title VARCHAR(128) NOT NULL,
  content VARCHAR(1000) NOT NULL,
  biz_type VARCHAR(64) NULL,
  biz_id BIGINT NULL,
  read_status VARCHAR(32) NOT NULL DEFAULT 'UNREAD',
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_notification_receiver (receiver_user_id, read_status),
  KEY idx_notification_biz (biz_type, biz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS care_review (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  service_order_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  caregiver_id BIGINT NOT NULL,
  family_user_id BIGINT NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  tags VARCHAR(255) NULL,
  content VARCHAR(1000) NULL,
  process_status VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
  processed_by BIGINT NULL,
  processed_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_review_order_family (service_order_id, family_user_id, deleted),
  KEY idx_review_caregiver (caregiver_id),
  KEY idx_review_process_status (process_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
