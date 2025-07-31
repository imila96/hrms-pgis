DROP DATABASE IF EXISTS hrms_dev;
CREATE DATABASE hrms_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hrms_dev;

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

-- ------------------------------------------------------------
-- 1.  AUTH & RBAC
-- ------------------------------------------------------------
CREATE TABLE user_auth (
  user_id              INT          NOT NULL AUTO_INCREMENT,
  email                VARCHAR(150) NOT NULL COLLATE utf8mb4_unicode_ci,
  password             VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
  active               TINYINT(1)   NOT NULL DEFAULT 1,
  verified             TINYINT(1)   NOT NULL DEFAULT 0,
  password_changed_at  DATETIME,
  PRIMARY KEY (user_id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO user_auth
VALUES (2,'admin@corp.com','$2a$10$6ZBGj1XUvEiwCbfC4uSyreYbYaSQrxRwsh/EpWD2qucAhdci4iJzO',1,1,NULL),
       (14,'alice1@corp.com','$2a$10$nBLDZh1FkAfdJGmYuMWkAuaN85HGQ8E8bk5qI7JMuwidBIemN7mp6',1,1,NULL);

CREATE TABLE role (
  role_id INT          NOT NULL AUTO_INCREMENT,
  code    VARCHAR(30)  NOT NULL COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (role_id),
  UNIQUE KEY code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO role VALUES
(3,'ADMIN'), (4,'DIRECTOR'), (1,'EMPLOYEE'), (2,'HR');

CREATE TABLE user_role (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  KEY role_id (role_id),
  CONSTRAINT user_role_ibfk_1 FOREIGN KEY (user_id) REFERENCES user_auth (user_id),
  CONSTRAINT user_role_ibfk_2 FOREIGN KEY (role_id) REFERENCES role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO user_role VALUES
(14,1), (2,3);

-- ------------------------------------------------------------
-- 2.  CORE HR
-- ------------------------------------------------------------
CREATE TABLE employee (
  employee_id INT          NOT NULL,                          -- same id as user
  name        VARCHAR(100) NOT NULL COLLATE utf8mb4_unicode_ci,
  contact     VARCHAR(50)          COLLATE utf8mb4_unicode_ci,
  job_title   VARCHAR(100)         COLLATE utf8mb4_unicode_ci,
  hire_date   DATE,
  address     VARCHAR(255)         COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (employee_id),
  CONSTRAINT fk_emp_user FOREIGN KEY (employee_id) REFERENCES user_auth (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO employee
VALUES (14,'Alice Fernando','+94-77-123-4567','Lecturer','2025-07-23',NULL);

-- ------------------------------------------------------------
-- 3.  POLICY & ANNOUNCEMENT
-- ------------------------------------------------------------
CREATE TABLE policy (
  policy_id      INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(200) NOT NULL COLLATE utf8mb4_unicode_ci,
  description    TEXT         NOT NULL COLLATE utf8mb4_unicode_ci,
  effective_date DATE         NOT NULL,
  status         ENUM('PENDING','APPROVED','REJECTED') NOT NULL,
  created_by     INT  NOT NULL,
  decided_by     INT,
  decided_at     DATETIME,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY fk_policy_created_by (created_by),
  KEY fk_policy_decided_by (decided_by),
  CONSTRAINT fk_policy_created_by FOREIGN KEY (created_by) REFERENCES user_auth (user_id),
  CONSTRAINT fk_policy_decided_by FOREIGN KEY (decided_by) REFERENCES user_auth (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*  — No seed rows yet — */

CREATE TABLE announcement (
  announcement_id INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200) NOT NULL COLLATE utf8mb4_unicode_ci,
  description     TEXT         NOT NULL COLLATE utf8mb4_unicode_ci,
  status          ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL,
  current_version INT NOT NULL DEFAULT 1,
  created_by      INT NOT NULL,
  created_date    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_by    INT,
  published_date  DATETIME,
  KEY fk_ann_created_by   (created_by),
  KEY fk_ann_published_by (published_by),
  CONSTRAINT fk_ann_created_by   FOREIGN KEY (created_by)   REFERENCES user_auth (user_id),
  CONSTRAINT fk_ann_published_by FOREIGN KEY (published_by) REFERENCES user_auth (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE announcement_version (
  version_id      INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  announcement_id INT          NOT NULL,
  title           VARCHAR(200) NOT NULL COLLATE utf8mb4_unicode_ci,
  description     TEXT         NOT NULL COLLATE utf8mb4_unicode_ci,
  edited_by       INT          NOT NULL,
  edited_date     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY fk_ver_ann    (announcement_id),
  KEY fk_ver_editor (edited_by),
  CONSTRAINT fk_ver_ann    FOREIGN KEY (announcement_id) REFERENCES announcement (announcement_id),
  CONSTRAINT fk_ver_editor FOREIGN KEY (edited_by)      REFERENCES user_auth    (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4.  ATTENDANCE
-- ------------------------------------------------------------
CREATE TABLE attendance_event (
  event_id     INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_id  INT NOT NULL,
  event_type   ENUM('CHECK_IN','CHECK_OUT','BREAK_OUT','BREAK_IN','MANUAL') NOT NULL,
  evt_ts       DATETIME NOT NULL,
  evt_date     DATE     NOT NULL,
  KEY fk_att_emp (employee_id),
  CONSTRAINT fk_att_emp FOREIGN KEY (employee_id) REFERENCES employee (employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO attendance_event
VALUES (1,14,'CHECK_IN','2025-07-24 12:04:51','2025-07-24'),
       (2,14,'BREAK_OUT','2025-07-24 12:07:04','2025-07-24'),
       (3,14,'BREAK_IN' ,'2025-07-24 12:07:39','2025-07-24'),
       (4,14,'CHECK_OUT','2025-07-24 12:08:08','2025-07-24');

-- ------------------------------------------------------------
-- 5.  LEAVE
-- ------------------------------------------------------------
CREATE TABLE leave_application (
  leave_id        INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT NOT NULL,
  leave_type      ENUM('ANNUAL','SICK','CASUAL') NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  status          ENUM('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL,
  reason          TEXT COLLATE utf8mb4_unicode_ci,
  medical_doc_url VARCHAR(255) COLLATE utf8mb4_unicode_ci,
  requested_at    DATETIME NOT NULL,
  decided_at      DATETIME,
  decided_by      INT,
  KEY fk_leave_emp (employee_id),
  CONSTRAINT fk_leave_emp FOREIGN KEY (employee_id) REFERENCES employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO leave_application
VALUES (1,14,'ANNUAL','2025-08-12','2025-08-14','APPROVED','Family trip',NULL,'2025-07-25 15:10:38','2025-07-25 15:28:49',2),
       (2,14,'CASUAL','2025-08-12','2025-08-14','APPROVED','Family trip',NULL,'2025-07-25 15:30:09','2025-07-25 15:30:36',2),
       (3,14,'CASUAL','2025-08-12','2025-08-14','APPROVED','Family trip',NULL,'2025-07-31 11:26:35','2025-07-31 11:32:19',2);

CREATE TABLE leave_balance (
  balance_id  INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type  ENUM('ANNUAL','SICK','CASUAL') NOT NULL,
  year        INT NOT NULL,
  entitled    INT NOT NULL,
  taken       INT NOT NULL,
  UNIQUE KEY uk_balance (employee_id, leave_type, year),
  CONSTRAINT fk_bal_emp FOREIGN KEY (employee_id) REFERENCES employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO leave_balance
VALUES (3,14,'ANNUAL',2025,14,3),
       (4,14,'SICK'  ,2025,14,0),
       (5,14,'CASUAL',2025,7 ,6);

-- ------------------------------------------------------------
-- 6.  PAYROLL
-- ------------------------------------------------------------
CREATE TABLE salary_slip (
  slip_id      INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_id  INT NOT NULL,
  period_year  INT NOT NULL,
  period_month INT NOT NULL,
  basic_pay    DECIMAL(12,2) NOT NULL,
  allowances   DECIMAL(12,2) NOT NULL,
  deductions   DECIMAL(12,2) NOT NULL,
  net_pay      DECIMAL(12,2) NOT NULL,
  pdf_url      VARCHAR(255) COLLATE utf8mb4_unicode_ci,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_slip (employee_id, period_year, period_month),
  CONSTRAINT fk_slip_emp FOREIGN KEY (employee_id) REFERENCES employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO salary_slip
VALUES (1,14,2025,7,125000.00,15000.00,9000.00,131000.00,NULL,'2025-07-24 16:15:46'),
       (2,14,2025,6,125000.00,15000.00,8800.00,131200.00,NULL,'2025-07-24 16:15:46');

-- ------------------------------------------------------------
-- 7.  FLYWAY (meta-data table)
-- ------------------------------------------------------------
CREATE TABLE flyway_schema_history (
  installed_rank INT          NOT NULL,
  version        VARCHAR(50)  COLLATE utf8mb4_unicode_ci,
  description    VARCHAR(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  type           VARCHAR(20)  COLLATE utf8mb4_unicode_ci NOT NULL,
  script         VARCHAR(1000)COLLATE utf8mb4_unicode_ci NOT NULL,
  checksum       INT,
  installed_by   VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  installed_on   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  execution_time INT NOT NULL,
  success        TINYINT(1) NOT NULL,
  PRIMARY KEY (installed_rank),
  KEY flyway_schema_history_s_idx (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*  — no rows — */

-- ------------------------------------------------------------
-- Done
-- ------------------------------------------------------------
SET foreign_key_checks = 1;