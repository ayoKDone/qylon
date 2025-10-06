-- Initial database schema migration
-- This migration creates all the core tables for the Qylon platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'msp_admin', 'client_user');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE industry_type AS ENUM (
    'technology', 'healthcare', 'finance', 'education', 
    'retail', 'manufacturing', 'consulting', 'real_estate',
    'legal', 'marketing', 'non_profit', 'other'
);
CREATE TYPE company_size AS ENUM (
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
);
CREATE TYPE budget_range AS ENUM (
    'under_5k', '5k_10k', '10k_25k', '25k_50k', '50k_100k', '100k+'
);
CREATE TYPE timeline_type AS ENUM (
    'immediate', '1_month', '3_months', '6_months', '1_year'
);
CREATE TYPE meeting_platform AS ENUM (
    'zoom', 'teams', 'google_meet', 'webex', 'other'
);
CREATE TYPE meeting_status AS ENUM (
    'scheduled', 'recording', 'processing', 'completed', 'failed', 'cancelled'
);
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM (
    'pending', 'in_progress', 'completed', 'cancelled'
);

-- Create subscription_plans table first (referenced by users)
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    monthly_price DECIMAL(10,2) NOT NULL,
    setup_price DECIMAL(10,2) DEFAULT 0,
    max_meetings INTEGER,
    max_workflows INTEGER,
    max_storage_gb INTEGER,
    max_users INTEGER,
    features JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    industry industry_type NOT NULL,
    company_size company_size NOT NULL,
    phone_number VARCHAR(20),
    role user_role DEFAULT 'user' NOT NULL,
    subscription_plan_id UUID REFERENCES subscription_plans(id),
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    preferences JSONB DEFAULT '{}',
    status user_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    refresh_expires_at TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    notifications JSONB DEFAULT '{}',
    dashboard_layout JSONB DEFAULT '{}',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    industry industry_type NOT NULL,
    company_size company_size NOT NULL,
    primary_goals TEXT[] NOT NULL,
    current_tools TEXT[],
    budget budget_range NOT NULL,
    timeline timeline_type NOT NULL,
    special_requirements TEXT,
    status VARCHAR(50) DEFAULT 'active' NOT NULL CHECK (status IN (
        'active', 'inactive', 'onboarding', 'suspended'
    )),
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create client_metrics table
CREATE TABLE client_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
    total_meetings INTEGER DEFAULT 0,
    total_content_pieces INTEGER DEFAULT 0,
    active_workflows INTEGER DEFAULT 0,
    total_workflow_executions INTEGER DEFAULT 0,
    successful_workflow_executions INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ,
    last_meeting_at TIMESTAMPTZ,
    last_content_generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create client_team_members table
CREATE TABLE client_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'owner', 'admin', 'editor', 'viewer'
    )),
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'declined', 'revoked'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, user_id)
);

-- Create meetings table
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    platform meeting_platform NOT NULL,
    external_meeting_id VARCHAR(255) UNIQUE NOT NULL,
    meeting_url TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    status meeting_status DEFAULT 'scheduled' NOT NULL,
    raw_audio_url TEXT,
    audio_file_size BIGINT,
    transcription_id UUID,
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_duration_seconds INTEGER,
    error_message TEXT,
    error_code VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meeting_participants table
CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(100),
    is_host BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meeting_action_items table
CREATE TABLE meeting_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    assigned_to VARCHAR(255),
    assigned_to_email VARCHAR(255),
    due_date DATE,
    priority priority_level DEFAULT 'medium',
    status task_status DEFAULT 'pending',
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sdk_uploads table (for Recall.ai integration)
CREATE TABLE sdk_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recall_upload_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    meeting_id UUID REFERENCES meetings(id),
    status TEXT NOT NULL DEFAULT 'pending',
    upload_token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meeting_recordings table
CREATE TABLE meeting_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sdk_upload_id UUID REFERENCES sdk_uploads(id),
    recall_recording_id TEXT UNIQUE NOT NULL,
    meeting_id UUID REFERENCES meetings(id),
    status TEXT NOT NULL DEFAULT 'processing',
    download_url TEXT,
    transcript_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_plan ON users(subscription_plan_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_industry ON clients(industry);
CREATE INDEX idx_clients_created_at ON clients(created_at);
CREATE INDEX idx_client_team_members_client_id ON client_team_members(client_id);
CREATE INDEX idx_client_team_members_user_id ON client_team_members(user_id);
CREATE INDEX idx_client_team_members_status ON client_team_members(status);
CREATE INDEX idx_meetings_client_id ON meetings(client_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_start_time ON meetings(start_time DESC);
CREATE INDEX idx_meetings_platform ON meetings(platform);
CREATE INDEX idx_meetings_external_id ON meetings(external_meeting_id);
CREATE INDEX idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX idx_meeting_action_items_meeting_id ON meeting_action_items(meeting_id);
CREATE INDEX idx_meeting_action_items_status ON meeting_action_items(status);
CREATE INDEX idx_meeting_action_items_due_date ON meeting_action_items(due_date);
CREATE INDEX idx_sdk_uploads_user_id ON sdk_uploads(user_id);
CREATE INDEX idx_sdk_uploads_meeting_id ON sdk_uploads(meeting_id);
CREATE INDEX idx_sdk_uploads_status ON sdk_uploads(status);
CREATE INDEX idx_meeting_recordings_meeting_id ON meeting_recordings(meeting_id);
CREATE INDEX idx_meeting_recordings_status ON meeting_recordings(status);

-- Create function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_metrics_updated_at BEFORE UPDATE ON client_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_team_members_updated_at BEFORE UPDATE ON client_team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_action_items_updated_at BEFORE UPDATE ON meeting_action_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sdk_uploads_updated_at BEFORE UPDATE ON sdk_uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_recordings_updated_at BEFORE UPDATE ON meeting_recordings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();