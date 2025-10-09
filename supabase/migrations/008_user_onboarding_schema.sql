-- User onboarding schema migration
-- This migration creates the user_onboarding table for tracking onboarding progress

-- Create user_onboarding table
CREATE TABLE user_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    current_step VARCHAR(50) DEFAULT 'welcome',
    completed_steps TEXT[] DEFAULT '{}',
    total_steps INTEGER DEFAULT 5,
    is_complete BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add onboarding_completed column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX idx_user_onboarding_is_complete ON user_onboarding(is_complete);
CREATE INDEX idx_users_onboarding_completed ON users(onboarding_completed);

-- Create trigger for updated_at
CREATE TRIGGER update_user_onboarding_updated_at BEFORE UPDATE ON user_onboarding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
