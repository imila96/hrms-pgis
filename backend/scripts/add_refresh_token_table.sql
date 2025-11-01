-- Migration: Add Refresh Token Table for Remember Me Feature
-- Date: 2025-11-01

-- Create refresh_token table
CREATE TABLE IF NOT EXISTS refresh_token (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    remember_me BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT fk_refresh_token_user 
        FOREIGN KEY (user_id) 
        REFERENCES user_auth(user_id) 
        ON DELETE CASCADE,
        
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for cleanup query performance
CREATE INDEX idx_refresh_token_cleanup ON refresh_token(expires_at, revoked_at);
