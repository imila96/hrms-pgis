CREATE DATABASE IF NOT EXISTS hrms_dev
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'hrms_user'@'%'
  IDENTIFIED BY 'SuperSecret123!';

GRANT ALL PRIVILEGES
       ON hrms_dev.*        -- note the new db name
       TO 'hrms_user'@'%';        -- wildcard host covers localhost & 127.0.0.1

FLUSH PRIVILEGES;