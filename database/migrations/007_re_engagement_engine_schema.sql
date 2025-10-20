-- Re-engagement Engine Database Schema
-- This migration creates all tables for the Re-engagement Engine service

-- Email Sequences table
CREATE TABLE email_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Steps table
CREATE TABLE email_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID REFERENCES email_sequences(id) ON DELETE CASCADE NOT NULL,
    step_number INTEGER NOT NULL,
    delay_hours INTEGER NOT NULL CHECK (delay_hours >= 0),
    subject VARCHAR(255) NOT NULL,
    template TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    conditions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sequence_id, step_number)
);

-- Email Sequence Executions table
CREATE TABLE email_sequence_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID REFERENCES email_sequences(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'paused', 'cancelled')),
    current_step INTEGER DEFAULT 0,
    next_execution_at TIMESTAMPTZ,
    last_executed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Deliveries table
CREATE TABLE email_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES email_sequence_executions(id) ON DELETE CASCADE NOT NULL,
    step_id UUID REFERENCES email_steps(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Behavior Events table
CREATE TABLE user_behavior_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- User Behavior Profiles table
CREATE TABLE user_behavior_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    total_sessions INTEGER DEFAULT 0,
    average_session_duration DECIMAL(10,2) DEFAULT 0,
    preferred_channels TEXT[] DEFAULT '{}',
    behavior_patterns JSONB DEFAULT '[]',
    risk_factors JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, client_id)
);

-- Conversion Recovery Campaigns table
CREATE TABLE conversion_recovery_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_segment VARCHAR(100) NOT NULL,
    recovery_strategy VARCHAR(50) NOT NULL CHECK (recovery_strategy IN ('email_sequence', 'personalized_outreach', 'incentive_offer', 'feature_highlight')),
    is_active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    success_metrics JSONB DEFAULT '{
        "targetConversionRate": 0,
        "currentConversionRate": 0,
        "totalRecovered": 0,
        "totalAttempted": 0,
        "averageRecoveryTime": 0,
        "costPerRecovery": 0
    }',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversion Recovery Executions table
CREATE TABLE conversion_recovery_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES conversion_recovery_campaigns(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'failed')),
    strategy VARCHAR(50) NOT NULL,
    personalized_content TEXT,
    incentive_offer JSONB,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Tests table
CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('email_subject', 'email_content', 'recovery_strategy', 'timing')),
    variants JSONB NOT NULL,
    target_segment VARCHAR(100) NOT NULL,
    traffic_allocation INTEGER DEFAULT 100 CHECK (traffic_allocation >= 0 AND traffic_allocation <= 100),
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    results JSONB,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_email_sequences_user_id ON email_sequences(user_id);
CREATE INDEX idx_email_sequences_client_id ON email_sequences(client_id);
CREATE INDEX idx_email_sequences_trigger_event ON email_sequences(trigger_event);
CREATE INDEX idx_email_sequences_is_active ON email_sequences(is_active);

CREATE INDEX idx_email_steps_sequence_id ON email_steps(sequence_id);
CREATE INDEX idx_email_steps_step_number ON email_steps(step_number);
CREATE INDEX idx_email_steps_is_active ON email_steps(is_active);

CREATE INDEX idx_email_sequence_executions_sequence_id ON email_sequence_executions(sequence_id);
CREATE INDEX idx_email_sequence_executions_user_id ON email_sequence_executions(user_id);
CREATE INDEX idx_email_sequence_executions_client_id ON email_sequence_executions(client_id);
CREATE INDEX idx_email_sequence_executions_status ON email_sequence_executions(status);
CREATE INDEX idx_email_sequence_executions_next_execution_at ON email_sequence_executions(next_execution_at);

CREATE INDEX idx_email_deliveries_execution_id ON email_deliveries(execution_id);
CREATE INDEX idx_email_deliveries_step_id ON email_deliveries(step_id);
CREATE INDEX idx_email_deliveries_user_id ON email_deliveries(user_id);
CREATE INDEX idx_email_deliveries_status ON email_deliveries(status);
CREATE INDEX idx_email_deliveries_sent_at ON email_deliveries(sent_at);

CREATE INDEX idx_user_behavior_events_user_id ON user_behavior_events(user_id);
CREATE INDEX idx_user_behavior_events_client_id ON user_behavior_events(client_id);
CREATE INDEX idx_user_behavior_events_event_type ON user_behavior_events(event_type);
CREATE INDEX idx_user_behavior_events_timestamp ON user_behavior_events(timestamp);
CREATE INDEX idx_user_behavior_events_session_id ON user_behavior_events(session_id);

CREATE INDEX idx_user_behavior_profiles_user_id ON user_behavior_profiles(user_id);
CREATE INDEX idx_user_behavior_profiles_client_id ON user_behavior_profiles(client_id);
CREATE INDEX idx_user_behavior_profiles_engagement_score ON user_behavior_profiles(engagement_score);
CREATE INDEX idx_user_behavior_profiles_last_activity_at ON user_behavior_profiles(last_activity_at);

CREATE INDEX idx_conversion_recovery_campaigns_user_id ON conversion_recovery_campaigns(user_id);
CREATE INDEX idx_conversion_recovery_campaigns_client_id ON conversion_recovery_campaigns(client_id);
CREATE INDEX idx_conversion_recovery_campaigns_target_segment ON conversion_recovery_campaigns(target_segment);
CREATE INDEX idx_conversion_recovery_campaigns_recovery_strategy ON conversion_recovery_campaigns(recovery_strategy);
CREATE INDEX idx_conversion_recovery_campaigns_is_active ON conversion_recovery_campaigns(is_active);

CREATE INDEX idx_conversion_recovery_executions_campaign_id ON conversion_recovery_executions(campaign_id);
CREATE INDEX idx_conversion_recovery_executions_user_id ON conversion_recovery_executions(user_id);
CREATE INDEX idx_conversion_recovery_executions_client_id ON conversion_recovery_executions(client_id);
CREATE INDEX idx_conversion_recovery_executions_status ON conversion_recovery_executions(status);
CREATE INDEX idx_conversion_recovery_executions_start_date ON conversion_recovery_executions(start_date);

CREATE INDEX idx_ab_tests_user_id ON ab_tests(user_id);
CREATE INDEX idx_ab_tests_client_id ON ab_tests(client_id);
CREATE INDEX idx_ab_tests_test_type ON ab_tests(test_type);
CREATE INDEX idx_ab_tests_target_segment ON ab_tests(target_segment);
CREATE INDEX idx_ab_tests_is_active ON ab_tests(is_active);
CREATE INDEX idx_ab_tests_start_date ON ab_tests(start_date);

-- Enable Row Level Security (RLS)
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequence_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_recovery_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_recovery_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_sequences
CREATE POLICY "Users can view own email sequences" ON email_sequences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own email sequences" ON email_sequences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email sequences" ON email_sequences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email sequences" ON email_sequences
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for email_steps
CREATE POLICY "Users can view email steps for own sequences" ON email_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM email_sequences
            WHERE id = email_steps.sequence_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create email steps for own sequences" ON email_steps
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM email_sequences
            WHERE id = email_steps.sequence_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update email steps for own sequences" ON email_steps
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM email_sequences
            WHERE id = email_steps.sequence_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete email steps for own sequences" ON email_steps
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM email_sequences
            WHERE id = email_steps.sequence_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for email_sequence_executions
CREATE POLICY "Users can view own email sequence executions" ON email_sequence_executions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own email sequence executions" ON email_sequence_executions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email sequence executions" ON email_sequence_executions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for email_deliveries
CREATE POLICY "Users can view own email deliveries" ON email_deliveries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own email deliveries" ON email_deliveries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email deliveries" ON email_deliveries
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_behavior_events
CREATE POLICY "Users can view own behavior events" ON user_behavior_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own behavior events" ON user_behavior_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_behavior_profiles
CREATE POLICY "Users can view own behavior profiles" ON user_behavior_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own behavior profiles" ON user_behavior_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own behavior profiles" ON user_behavior_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for conversion_recovery_campaigns
CREATE POLICY "Users can view own recovery campaigns" ON conversion_recovery_campaigns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recovery campaigns" ON conversion_recovery_campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery campaigns" ON conversion_recovery_campaigns
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recovery campaigns" ON conversion_recovery_campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for conversion_recovery_executions
CREATE POLICY "Users can view own recovery executions" ON conversion_recovery_executions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recovery executions" ON conversion_recovery_executions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recovery executions" ON conversion_recovery_executions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for ab_tests
CREATE POLICY "Users can view own ab tests" ON ab_tests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ab tests" ON ab_tests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ab tests" ON ab_tests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ab tests" ON ab_tests
    FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_sequences_updated_at BEFORE UPDATE ON email_sequences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_steps_updated_at BEFORE UPDATE ON email_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_sequence_executions_updated_at BEFORE UPDATE ON email_sequence_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_deliveries_updated_at BEFORE UPDATE ON email_deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_behavior_profiles_updated_at BEFORE UPDATE ON user_behavior_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversion_recovery_campaigns_updated_at BEFORE UPDATE ON conversion_recovery_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversion_recovery_executions_updated_at BEFORE UPDATE ON conversion_recovery_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON ab_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
