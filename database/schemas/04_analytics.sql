-- Analytics & A/B Testing Backend Schema
-- Feature 2.6: Analytics & A/B Testing Backend (21 SP)

-- Onboarding funnel tracking
CREATE TABLE onboarding_funnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    funnel_name VARCHAR(100) NOT NULL,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_description TEXT,
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversion optimization experiments
CREATE TABLE conversion_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    experiment_type VARCHAR(50) NOT NULL CHECK (experiment_type IN (
        'onboarding', 'feature_adoption', 'retention', 'conversion'
    )),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft', 'active', 'paused', 'completed', 'cancelled'
    )),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    target_audience JSONB DEFAULT '{}',
    success_metrics JSONB NOT NULL,
    configuration JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B test variants
CREATE TABLE experiment_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES conversion_experiments(id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL,
    variant_description TEXT,
    traffic_percentage DECIMAL(5,2) NOT NULL CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100),
    configuration JSONB NOT NULL,
    is_control BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User experiment assignments
CREATE TABLE user_experiment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    experiment_id UUID REFERENCES conversion_experiments(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES experiment_variants(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    first_interaction_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    conversion_value DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, experiment_id)
);

-- Personalization triggers
CREATE TABLE personalization_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN (
        'user_behavior', 'time_based', 'event_based', 'segment_based'
    )),
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User segments for personalization
CREATE TABLE user_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    segment_criteria JSONB NOT NULL,
    user_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User segment memberships
CREATE TABLE user_segment_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES user_segments(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, segment_id)
);

-- Analytics events tracking
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversion tracking
CREATE TABLE conversion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    conversion_type VARCHAR(100) NOT NULL,
    conversion_value DECIMAL(10,2),
    experiment_id UUID REFERENCES conversion_experiments(id),
    variant_id UUID REFERENCES experiment_variants(id),
    funnel_step_id UUID REFERENCES onboarding_funnels(id),
    metadata JSONB DEFAULT '{}',
    converted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_onboarding_funnels_user_id ON onboarding_funnels(user_id);
CREATE INDEX idx_onboarding_funnels_client_id ON onboarding_funnels(client_id);
CREATE INDEX idx_onboarding_funnels_funnel_name ON onboarding_funnels(funnel_name);
CREATE INDEX idx_onboarding_funnels_step_number ON onboarding_funnels(step_number);
CREATE INDEX idx_onboarding_funnels_completed_at ON onboarding_funnels(completed_at);

CREATE INDEX idx_conversion_experiments_status ON conversion_experiments(status);
CREATE INDEX idx_conversion_experiments_type ON conversion_experiments(experiment_type);
CREATE INDEX idx_conversion_experiments_dates ON conversion_experiments(start_date, end_date);
CREATE INDEX idx_experiment_variants_experiment_id ON experiment_variants(experiment_id);
CREATE INDEX idx_experiment_variants_control ON experiment_variants(is_control);

CREATE INDEX idx_user_experiment_assignments_user_id ON user_experiment_assignments(user_id);
CREATE INDEX idx_user_experiment_assignments_experiment_id ON user_experiment_assignments(experiment_id);
CREATE INDEX idx_user_experiment_assignments_variant_id ON user_experiment_assignments(variant_id);
CREATE INDEX idx_user_experiment_assignments_converted_at ON user_experiment_assignments(converted_at);

CREATE INDEX idx_personalization_triggers_type ON personalization_triggers(trigger_type);
CREATE INDEX idx_personalization_triggers_active ON personalization_triggers(is_active);
CREATE INDEX idx_personalization_triggers_priority ON personalization_triggers(priority);

CREATE INDEX idx_user_segments_active ON user_segments(is_active);
CREATE INDEX idx_user_segment_memberships_user_id ON user_segment_memberships(user_id);
CREATE INDEX idx_user_segment_memberships_segment_id ON user_segment_memberships(segment_id);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_client_id ON analytics_events(client_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

CREATE INDEX idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX idx_conversion_events_client_id ON conversion_events(client_id);
CREATE INDEX idx_conversion_events_type ON conversion_events(conversion_type);
CREATE INDEX idx_conversion_events_experiment_id ON conversion_events(experiment_id);
CREATE INDEX idx_conversion_events_converted_at ON conversion_events(converted_at);

-- Row Level Security (RLS) policies
ALTER TABLE onboarding_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_segment_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- Onboarding funnels policies
CREATE POLICY "Users can view own onboarding funnels" ON onboarding_funnels
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create onboarding funnels" ON onboarding_funnels
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own onboarding funnels" ON onboarding_funnels
    FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all onboarding funnels
CREATE POLICY "Admins can view all onboarding funnels" ON onboarding_funnels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Conversion experiments policies
CREATE POLICY "Users can view experiments for own clients" ON conversion_experiments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create experiments" ON conversion_experiments
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own experiments" ON conversion_experiments
    FOR UPDATE USING (created_by = auth.uid());

-- Admins can view all experiments
CREATE POLICY "Admins can view all experiments" ON conversion_experiments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Experiment variants policies
CREATE POLICY "Users can view variants for accessible experiments" ON experiment_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversion_experiments ce
            WHERE ce.id = experiment_variants.experiment_id
            AND (
                ce.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM users
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Users can manage variants for own experiments" ON experiment_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM conversion_experiments
            WHERE id = experiment_variants.experiment_id AND created_by = auth.uid()
        )
    );

-- User experiment assignments policies
CREATE POLICY "Users can view own experiment assignments" ON user_experiment_assignments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create experiment assignments" ON user_experiment_assignments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update experiment assignments" ON user_experiment_assignments
    FOR UPDATE USING (true);

-- Personalization triggers policies
CREATE POLICY "Users can view triggers for own clients" ON personalization_triggers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create triggers" ON personalization_triggers
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own triggers" ON personalization_triggers
    FOR UPDATE USING (created_by = auth.uid());

-- User segments policies
CREATE POLICY "Users can view segments for own clients" ON user_segments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create segments" ON user_segments
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own segments" ON user_segments
    FOR UPDATE USING (created_by = auth.uid());

-- User segment memberships policies
CREATE POLICY "Users can view own segment memberships" ON user_segment_memberships
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage segment memberships" ON user_segment_memberships
    FOR ALL USING (true);

-- Analytics events policies
CREATE POLICY "Users can view own analytics events" ON analytics_events
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- Admins can view all analytics events
CREATE POLICY "Admins can view all analytics events" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Conversion events policies
CREATE POLICY "Users can view own conversion events" ON conversion_events
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create conversion events" ON conversion_events
    FOR INSERT WITH CHECK (true);

-- Admins can view all conversion events
CREATE POLICY "Admins can view all conversion events" ON conversion_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Triggers for updated_at
CREATE TRIGGER update_onboarding_funnels_updated_at BEFORE UPDATE ON onboarding_funnels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversion_experiments_updated_at BEFORE UPDATE ON conversion_experiments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiment_variants_updated_at BEFORE UPDATE ON experiment_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personalization_triggers_updated_at BEFORE UPDATE ON personalization_triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_segments_updated_at BEFORE UPDATE ON user_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for analytics calculations
CREATE OR REPLACE FUNCTION calculate_funnel_conversion_rate(
    funnel_name_param VARCHAR(100),
    start_step INTEGER,
    end_step INTEGER,
    start_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    funnel_name VARCHAR(100),
    start_step INTEGER,
    end_step INTEGER,
    users_started BIGINT,
    users_completed BIGINT,
    conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH funnel_data AS (
        SELECT
            of.funnel_name,
            of.user_id,
            MIN(CASE WHEN of.step_number = start_step THEN of.completed_at END) as started_at,
            MIN(CASE WHEN of.step_number = end_step THEN of.completed_at END) as completed_at
        FROM onboarding_funnels of
        WHERE of.funnel_name = funnel_name_param
        AND of.completed_at IS NOT NULL
        AND (start_date IS NULL OR of.completed_at >= start_date)
        AND (end_date IS NULL OR of.completed_at <= end_date)
        GROUP BY of.funnel_name, of.user_id
    )
    SELECT
        fd.funnel_name,
        start_step,
        end_step,
        COUNT(*) as users_started,
        COUNT(CASE WHEN fd.completed_at IS NOT NULL THEN 1 END) as users_completed,
        ROUND(
            (COUNT(CASE WHEN fd.completed_at IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)) * 100,
            2
        ) as conversion_rate
    FROM funnel_data fd
    WHERE fd.started_at IS NOT NULL
    GROUP BY fd.funnel_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get experiment results
CREATE OR REPLACE FUNCTION get_experiment_results(experiment_id_param UUID)
RETURNS TABLE (
    variant_name VARCHAR(100),
    users_assigned BIGINT,
    users_converted BIGINT,
    conversion_rate DECIMAL(5,2),
    avg_conversion_value DECIMAL(10,2),
    is_control BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ev.variant_name,
        COUNT(uea.id) as users_assigned,
        COUNT(CASE WHEN uea.converted_at IS NOT NULL THEN 1 END) as users_converted,
        ROUND(
            (COUNT(CASE WHEN uea.converted_at IS NOT NULL THEN 1 END)::DECIMAL / COUNT(uea.id)) * 100,
            2
        ) as conversion_rate,
        ROUND(AVG(uea.conversion_value), 2) as avg_conversion_value,
        ev.is_control
    FROM experiment_variants ev
    LEFT JOIN user_experiment_assignments uea ON ev.id = uea.variant_id
    WHERE ev.experiment_id = experiment_id_param
    GROUP BY ev.id, ev.variant_name, ev.is_control
    ORDER BY ev.is_control DESC, ev.variant_name;
END;
$$ LANGUAGE plpgsql;
