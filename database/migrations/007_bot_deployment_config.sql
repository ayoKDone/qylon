-- Bot Deployment Configuration Migration
-- This migration creates tables for automated bot deployment configuration

-- Create client_settings table for bot deployment configuration
CREATE TABLE IF NOT EXISTS client_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    bot_deployment_config JSONB DEFAULT '{
        "autoDeploy": true,
        "platforms": ["zoom", "teams", "google_meet", "webex"],
        "transcriptionProvider": "recallai_streaming",
        "language": "en",
        "cleanupAfterHours": 24
    }',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique settings per client
    UNIQUE(client_id)
);

-- Create bot_tracking table to track deployed bots
CREATE TABLE IF NOT EXISTS bot_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    recall_bot_id VARCHAR(255) NOT NULL,
    recall_bot_name VARCHAR(255) NOT NULL,
    recall_bot_token TEXT NOT NULL,
    meeting_url TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
        'active', 'inactive', 'error', 'deleted', 'fatal_error', 'waiting_room'
    )),
    deployed_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    last_status_change TIMESTAMPTZ,
    error_code VARCHAR(50),
    error_sub_code VARCHAR(50),
    error_message TEXT,
    troubleshooting_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique bot tracking per meeting
    UNIQUE(meeting_id, recall_bot_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_settings_client_id ON client_settings(client_id);
CREATE INDEX IF NOT EXISTS idx_bot_tracking_client_id ON bot_tracking(client_id);
CREATE INDEX IF NOT EXISTS idx_bot_tracking_team_id ON bot_tracking(team_id);
CREATE INDEX IF NOT EXISTS idx_bot_tracking_meeting_id ON bot_tracking(meeting_id);
CREATE INDEX IF NOT EXISTS idx_bot_tracking_recall_bot_id ON bot_tracking(recall_bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_tracking_status ON bot_tracking(status);
CREATE INDEX IF NOT EXISTS idx_bot_tracking_deployed_at ON bot_tracking(deployed_at);

-- Create RLS policies for client_settings
ALTER TABLE client_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own client settings" ON client_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = client_settings.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own client settings" ON client_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = client_settings.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own client settings" ON client_settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = client_settings.client_id AND user_id = auth.uid()
        )
    );

-- Create RLS policies for bot_tracking
ALTER TABLE bot_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bot tracking" ON bot_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = bot_tracking.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own bot tracking" ON bot_tracking
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = bot_tracking.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own bot tracking" ON bot_tracking
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = bot_tracking.client_id AND user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_client_settings_updated_at
    BEFORE UPDATE ON client_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bot_tracking_updated_at
    BEFORE UPDATE ON bot_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to cleanup old bot tracking records
CREATE OR REPLACE FUNCTION cleanup_old_bot_tracking()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM bot_tracking
    WHERE status = 'deleted'
    AND updated_at < NOW() - INTERVAL '7 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to cleanup old bot tracking records (if pg_cron is available)
-- SELECT cron.schedule('cleanup-old-bot-tracking', '0 2 * * *', 'SELECT cleanup_old_bot_tracking();');

-- Add comments for documentation
COMMENT ON TABLE client_settings IS 'Stores bot deployment configuration for each client';
COMMENT ON TABLE bot_tracking IS 'Tracks deployed Recall.ai bots for meetings';
COMMENT ON COLUMN client_settings.bot_deployment_config IS 'JSON configuration for automated bot deployment';
COMMENT ON COLUMN bot_tracking.recall_bot_id IS 'Recall.ai bot ID for tracking and management';
COMMENT ON COLUMN bot_tracking.recall_bot_token IS 'Recall.ai bot token for API access';
COMMENT ON COLUMN bot_tracking.metadata IS 'Additional bot metadata and configuration';
