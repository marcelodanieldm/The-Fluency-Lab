-- ============================================
-- THE FLUENCY LAB - DATABASE SCHEMA
-- PostgreSQL 14+ Compatible
-- Authentication & Authorization System
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ROLES TABLE
-- Define available roles in the system
-- ============================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 0, -- Hierarchy level (0=lowest, 100=highest)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles with hierarchy
INSERT INTO roles (name, description, level) VALUES
('free', 'Free tier user - Access to Diagnostic module only', 10),
('student', 'Student tier - Access to DailyCoach and ProgressTracker', 30),
('coach', 'AI Admin - Can inject new Scenarios into database', 50),
('superuser', 'Super Admin - Full access including Revenue Dashboard', 100);

-- ============================================
-- 2. PERMISSIONS TABLE
-- Granular permissions for resources
-- ============================================
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    resource VARCHAR(100) NOT NULL, -- e.g., 'diagnostic', 'daily_coach', 'scenarios'
    action VARCHAR(50) NOT NULL, -- e.g., 'read', 'write', 'delete', 'admin'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource, action)
);

-- Insert permissions for each module
INSERT INTO permissions (resource, action, description) VALUES
-- Diagnostic Module (Free tier)
('diagnostic', 'read', 'View diagnostic results'),
('diagnostic', 'write', 'Create diagnostic analysis'),

-- Daily Coach Module (Student tier)
('daily_coach', 'read', 'View daily coaching suggestions'),
('daily_coach', 'write', 'Request daily coaching'),

-- Progress Tracker Module (Student tier)
('progress_tracker', 'read', 'View progress metrics'),
('progress_tracker', 'write', 'Update progress data'),

-- Learning Path Module (Student tier)
('learning_path', 'read', 'View learning paths'),
('learning_path', 'write', 'Track learning progress'),

-- Flashcards Module (Student tier)
('flashcards', 'read', 'View flashcards'),
('flashcards', 'write', 'Generate flashcard decks'),

-- Error Analysis (Student tier)
('error_analysis', 'read', 'View error patterns'),
('error_analysis', 'write', 'Track errors'),

-- Scenarios Management (Coach tier)
('scenarios', 'read', 'View scenarios'),
('scenarios', 'write', 'Create new scenarios'),
('scenarios', 'delete', 'Delete scenarios'),
('scenarios', 'admin', 'Full scenario management'),

-- Revenue Dashboard (SuperUser only)
('revenue_dashboard', 'read', 'View revenue metrics'),
('retention_dashboard', 'read', 'View retention metrics'),
('user_management', 'admin', 'Manage users and permissions'),
('system_config', 'admin', 'Configure system settings');

-- ============================================
-- 3. ROLE_PERMISSIONS TABLE
-- Maps roles to permissions (Many-to-Many)
-- ============================================
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Create indexes for performance
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- Assign permissions to FREE role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'free'
AND p.resource IN ('diagnostic')
AND p.action IN ('read', 'write');

-- Assign permissions to STUDENT role (includes FREE + additional)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'student'
AND (
    (p.resource IN ('diagnostic') AND p.action IN ('read', 'write'))
    OR (p.resource IN ('daily_coach', 'progress_tracker', 'learning_path', 'flashcards', 'error_analysis') 
        AND p.action IN ('read', 'write'))
);

-- Assign permissions to COACH role (includes STUDENT + Scenarios)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'coach'
AND (
    (p.resource IN ('diagnostic') AND p.action IN ('read', 'write'))
    OR (p.resource IN ('daily_coach', 'progress_tracker', 'learning_path', 'flashcards', 'error_analysis') 
        AND p.action IN ('read', 'write'))
    OR (p.resource = 'scenarios' AND p.action IN ('read', 'write', 'delete', 'admin'))
);

-- Assign ALL permissions to SUPERUSER role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'superuser';

-- ============================================
-- 4. USERS TABLE
-- Core user information with authentication
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    
    -- Role assignment (default to 'free')
    role_id INTEGER NOT NULL DEFAULT 1 REFERENCES roles(id),
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    
    -- Password reset
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    
    -- Subscription management
    subscription_status VARCHAR(50) DEFAULT 'free', -- 'free', 'active', 'cancelled', 'expired'
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    
    -- Analytics
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP -- Soft delete
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_subscription ON users(subscription_status);

-- ============================================
-- 5. USER_SESSIONS TABLE
-- Track active sessions for JWT refresh tokens
-- ============================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    device_info JSONB, -- Browser, OS, IP address
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- Auto-delete expired sessions
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. AUDIT_LOGS TABLE
-- Track important security events
-- ============================================
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'permission_denied', 'role_change'
    resource VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit queries
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- 7. SCENARIOS TABLE
-- For Coach role to inject new scenarios
-- ============================================
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    category VARCHAR(100), -- 'technical', 'negotiation', 'presentation', etc.
    content JSONB NOT NULL, -- Flexible structure for scenario data
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scenarios_created_by ON scenarios(created_by);
CREATE INDEX idx_scenarios_category ON scenarios(category);
CREATE INDEX idx_scenarios_active ON scenarios(is_active);

-- ============================================
-- 8. USER_PROGRESS TABLE
-- Track user progress for ProgressTracker
-- ============================================
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module VARCHAR(100) NOT NULL, -- 'diagnostic', 'daily_coach', etc.
    
    -- Progress metrics
    total_sessions INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_score DECIMAL(5,2),
    improvement_rate DECIMAL(5,2),
    
    -- Engagement data
    last_activity_date DATE,
    metrics_data JSONB, -- Flexible structure for module-specific metrics
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, module)
);

CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_module ON user_progress(module);
CREATE INDEX idx_progress_last_activity ON user_progress(last_activity_date);

-- ============================================
-- 9. REVENUE_METRICS TABLE
-- For SuperUser dashboard
-- ============================================
CREATE TABLE revenue_metrics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    
    -- Revenue data
    daily_revenue DECIMAL(10,2) DEFAULT 0,
    new_subscriptions INTEGER DEFAULT 0,
    cancelled_subscriptions INTEGER DEFAULT 0,
    active_subscribers INTEGER DEFAULT 0,
    
    -- Retention metrics
    churn_rate DECIMAL(5,2),
    retention_rate DECIMAL(5,2),
    
    -- User metrics
    total_users INTEGER DEFAULT 0,
    active_users_daily INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    
    -- Engagement
    average_session_duration DECIMAL(10,2),
    total_sessions INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_revenue_date ON revenue_metrics(date);

-- ============================================
-- 10. TRIGGERS FOR UPDATED_AT
-- Auto-update timestamp on record changes
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON user_progress
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. HELPER FUNCTIONS
-- Utility functions for permission checks
-- ============================================

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_resource VARCHAR,
    p_action VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM users u
        JOIN role_permissions rp ON rp.role_id = u.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE u.id = p_user_id
        AND u.is_active = true
        AND p.resource = p_resource
        AND p.action = p_action
    );
END;
$$ LANGUAGE plpgsql;

-- Get all user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
    resource VARCHAR,
    action VARCHAR,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.resource, p.action, p.description
    FROM users u
    JOIN role_permissions rp ON rp.role_id = u.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE u.id = p_user_id
    AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Check if user has minimum role level
CREATE OR REPLACE FUNCTION user_has_role_level(
    p_user_id UUID,
    p_minimum_level INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.id = p_user_id
        AND u.is_active = true
        AND r.level >= p_minimum_level
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. SAMPLE DATA (For Testing)
-- ============================================

-- Create sample users for each role
INSERT INTO users (email, username, password_hash, first_name, last_name, role_id, is_email_verified)
VALUES
-- Free user (role_id = 1)
('free@fluencylab.com', 'free_user', '$2b$10$sample_hash_replace_in_production', 'Free', 'User', 1, true),

-- Student user (role_id = 2)
('student@fluencylab.com', 'student_user', '$2b$10$sample_hash_replace_in_production', 'Student', 'User', 2, true),

-- Coach user (role_id = 3)
('coach@fluencylab.com', 'coach_admin', '$2b$10$sample_hash_replace_in_production', 'Coach', 'Admin', 3, true),

-- SuperUser (role_id = 4)
('superuser@fluencylab.com', 'super_admin', '$2b$10$sample_hash_replace_in_production', 'Super', 'Admin', 4, true);

-- ============================================
-- 13. VIEWS FOR REPORTING
-- ============================================

-- Active subscriptions summary
CREATE VIEW active_subscriptions AS
SELECT 
    r.name as role_name,
    COUNT(*) as user_count,
    COUNT(CASE WHEN u.subscription_status = 'active' THEN 1 END) as active_subscriptions
FROM users u
JOIN roles r ON r.id = u.role_id
WHERE u.is_active = true
AND u.deleted_at IS NULL
GROUP BY r.name;

-- User permissions view (for easy querying)
CREATE VIEW user_permissions_view AS
SELECT 
    u.id as user_id,
    u.email,
    u.username,
    r.name as role_name,
    r.level as role_level,
    p.resource,
    p.action,
    p.description as permission_description
FROM users u
JOIN roles r ON r.id = u.role_id
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE u.is_active = true;

-- Daily active users view
CREATE VIEW daily_active_users AS
SELECT 
    DATE(last_login_at) as activity_date,
    COUNT(DISTINCT id) as active_users,
    r.name as role_name
FROM users u
JOIN roles r ON r.id = u.role_id
WHERE last_login_at IS NOT NULL
GROUP BY DATE(last_login_at), r.name;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Grant permissions to application user (optional)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fluencylab_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fluencylab_app;

COMMENT ON TABLE users IS 'Core user accounts with authentication and role assignment';
COMMENT ON TABLE roles IS 'System roles with hierarchical levels';
COMMENT ON TABLE permissions IS 'Granular permissions for resources and actions';
COMMENT ON TABLE role_permissions IS 'Maps roles to permissions (RBAC)';
COMMENT ON TABLE user_sessions IS 'Active JWT refresh tokens for session management';
COMMENT ON TABLE audit_logs IS 'Security audit trail for important events';
COMMENT ON TABLE scenarios IS 'Coach-managed training scenarios';
COMMENT ON TABLE user_progress IS 'Student progress tracking for ProgressTracker';
COMMENT ON TABLE revenue_metrics IS 'SuperUser dashboard metrics';
