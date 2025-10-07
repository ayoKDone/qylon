-- Enhanced Recall.ai Integration Migration
-- This migration adds support for all Recall.ai features including separate audio/video, real-time transcription, and advanced bot tracking

-- Add new columns to meetings table for enhanced Recall.ai integration
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS recall_bot_id VARCHAR(255);
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS recall_recording_id VARCHAR(255);
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS recall_transcript_id VARCHAR(255);
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS bot_status VARCHAR(50) DEFAULT 'active' CHECK (bot_status IN (
    'active', 'inactive', 'error', 'deleted', 'fatal_error', 'waiting_room',
    'joining_call', 'in_call_not_recording', 'in_call_recording', 'call_ended', 'done'
));
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS bot_error_code VARCHAR(50);
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS bot_error_sub_code VARCHAR(50);
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS bot_error_message TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS troubleshooting_url TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS separate_audio_available BOOLEAN DEFAULT false;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS separate_video_available BOOLEAN DEFAULT false;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS realtime_transcription_enabled BOOLEAN DEFAULT false;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS transcription_provider VARCHAR(100);
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS diarization_enabled BOOLEAN DEFAULT false;

-- Create table for storing separate audio files per participant
CREATE TABLE IF NOT EXISTS meeting_separate_audios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    recording_id VARCHAR(255) NOT NULL,
    participant_id INTEGER NOT NULL,
    participant_name VARCHAR(255),
    participant_email VARCHAR(255),
    is_host BOOLEAN DEFAULT false,
    platform VARCHAR(50),
    audio_file_url TEXT,
    audio_format VARCHAR(20) DEFAULT 'raw',
    file_size BIGINT,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique audio per participant per recording
    UNIQUE(recording_id, participant_id)
);

-- Create table for storing separate video files per participant
CREATE TABLE IF NOT EXISTS meeting_separate_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    recording_id VARCHAR(255) NOT NULL,
    participant_id INTEGER NOT NULL,
    participant_name VARCHAR(255),
    participant_email VARCHAR(255),
    is_host BOOLEAN DEFAULT false,
    platform VARCHAR(50),
    video_type VARCHAR(20) CHECK (video_type IN ('webcam', 'screenshare')),
    video_file_url TEXT,
    video_format VARCHAR(20) DEFAULT 'mp4',
    file_size BIGINT,
    duration_seconds INTEGER,
    resolution VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique video per participant per recording
    UNIQUE(recording_id, participant_id, video_type)
);

-- Create table for storing real-time transcription data
CREATE TABLE IF NOT EXISTS meeting_realtime_transcriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    transcript_id VARCHAR(255) NOT NULL,
    participant_id INTEGER NOT NULL,
    participant_name VARCHAR(255),
    participant_email VARCHAR(255),
    is_host BOOLEAN DEFAULT false,
    words JSONB NOT NULL, -- Array of word objects with text, timestamps
    is_partial BOOLEAN DEFAULT false,
    confidence_score DECIMAL(3,2),
    language_code VARCHAR(10),
    provider VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Index for efficient querying
    INDEX idx_realtime_transcriptions_meeting_id (meeting_id),
    INDEX idx_realtime_transcriptions_transcript_id (transcript_id),
    INDEX idx_realtime_transcriptions_participant_id (participant_id),
    INDEX idx_realtime_transcriptions_created_at (created_at)
);

-- Create table for storing webhook events
CREATE TABLE IF NOT EXISTS recall_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    bot_id VARCHAR(255),
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    recording_id VARCHAR(255),
    transcript_id VARCHAR(255),
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processing_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Index for efficient querying
    INDEX idx_webhook_events_event_type (event_type),
    INDEX idx_webhook_events_bot_id (bot_id),
    INDEX idx_webhook_events_meeting_id (meeting_id),
    INDEX idx_webhook_events_processed (processed),
    INDEX idx_webhook_events_created_at (created_at)
);

-- Create table for storing transcription providers configuration
CREATE TABLE IF NOT EXISTS transcription_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL,
    provider_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique provider per client
    UNIQUE(client_id, provider_name)
);

-- Create table for storing action item integrations
CREATE TABLE IF NOT EXISTS action_item_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_item_id UUID REFERENCES meeting_action_items(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN (
        'crm', 'project_management', 'calendar', 'slack', 'email'
    )),
    external_id VARCHAR(255),
    external_url TEXT,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN (
        'pending', 'synced', 'failed', 'cancelled'
    )),
    sync_error TEXT,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetings_recall_bot_id ON meetings(recall_bot_id);
CREATE INDEX IF NOT EXISTS idx_meetings_recall_recording_id ON meetings(recall_recording_id);
CREATE INDEX IF NOT EXISTS idx_meetings_bot_status ON meetings(bot_status);
CREATE INDEX IF NOT EXISTS idx_meetings_transcription_provider ON meetings(transcription_provider);

CREATE INDEX IF NOT EXISTS idx_separate_audios_meeting_id ON meeting_separate_audios(meeting_id);
CREATE INDEX IF NOT EXISTS idx_separate_audios_recording_id ON meeting_separate_audios(recording_id);
CREATE INDEX IF NOT EXISTS idx_separate_audios_participant_id ON meeting_separate_audios(participant_id);

CREATE INDEX IF NOT EXISTS idx_separate_videos_meeting_id ON meeting_separate_videos(meeting_id);
CREATE INDEX IF NOT EXISTS idx_separate_videos_recording_id ON meeting_separate_videos(recording_id);
CREATE INDEX IF NOT EXISTS idx_separate_videos_participant_id ON meeting_separate_videos(participant_id);

CREATE INDEX IF NOT EXISTS idx_transcription_providers_client_id ON transcription_providers(client_id);
CREATE INDEX IF NOT EXISTS idx_transcription_providers_provider_name ON transcription_providers(provider_name);

CREATE INDEX IF NOT EXISTS idx_action_item_integrations_action_item_id ON action_item_integrations(action_item_id);
CREATE INDEX IF NOT EXISTS idx_action_item_integrations_integration_type ON action_item_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_action_item_integrations_sync_status ON action_item_integrations(sync_status);

-- Enable RLS for new tables
ALTER TABLE meeting_separate_audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_separate_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_realtime_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recall_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_item_integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for meeting_separate_audios
CREATE POLICY "Users can view separate audios for own client meetings" ON meeting_separate_audios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = meeting_separate_audios.meeting_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage separate audios for own client meetings" ON meeting_separate_audios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = meeting_separate_audios.meeting_id AND c.user_id = auth.uid()
        )
    );

-- RLS policies for meeting_separate_videos
CREATE POLICY "Users can view separate videos for own client meetings" ON meeting_separate_videos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = meeting_separate_videos.meeting_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage separate videos for own client meetings" ON meeting_separate_videos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = meeting_separate_videos.meeting_id AND c.user_id = auth.uid()
        )
    );

-- RLS policies for meeting_realtime_transcriptions
CREATE POLICY "Users can view realtime transcriptions for own client meetings" ON meeting_realtime_transcriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = meeting_realtime_transcriptions.meeting_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage realtime transcriptions for own client meetings" ON meeting_realtime_transcriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = meeting_realtime_transcriptions.meeting_id AND c.user_id = auth.uid()
        )
    );

-- RLS policies for recall_webhook_events
CREATE POLICY "Users can view webhook events for own client meetings" ON recall_webhook_events
    FOR SELECT USING (
        meeting_id IS NULL OR EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = recall_webhook_events.meeting_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Service can manage webhook events" ON recall_webhook_events
    FOR ALL USING (true); -- Allow service-level access

-- RLS policies for transcription_providers
CREATE POLICY "Users can view transcription providers for own clients" ON transcription_providers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = transcription_providers.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage transcription providers for own clients" ON transcription_providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = transcription_providers.client_id AND user_id = auth.uid()
        )
    );

-- RLS policies for action_item_integrations
CREATE POLICY "Users can view action item integrations for own client meetings" ON action_item_integrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meeting_action_items mai
            JOIN meetings m ON mai.meeting_id = m.id
            JOIN clients c ON m.client_id = c.id
            WHERE mai.id = action_item_integrations.action_item_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage action item integrations for own client meetings" ON action_item_integrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meeting_action_items mai
            JOIN meetings m ON mai.meeting_id = m.id
            JOIN clients c ON m.client_id = c.id
            WHERE mai.id = action_item_integrations.action_item_id AND c.user_id = auth.uid()
        )
    );

-- Create triggers for updated_at
CREATE TRIGGER update_meeting_separate_audios_updated_at
    BEFORE UPDATE ON meeting_separate_audios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_separate_videos_updated_at
    BEFORE UPDATE ON meeting_separate_videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcription_providers_updated_at
    BEFORE UPDATE ON transcription_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_item_integrations_updated_at
    BEFORE UPDATE ON action_item_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE meeting_separate_audios IS 'Stores separate audio files per participant from Recall.ai';
COMMENT ON TABLE meeting_separate_videos IS 'Stores separate video files per participant from Recall.ai';
COMMENT ON TABLE meeting_realtime_transcriptions IS 'Stores real-time transcription data from Recall.ai';
COMMENT ON TABLE recall_webhook_events IS 'Stores webhook events from Recall.ai for processing';
COMMENT ON TABLE transcription_providers IS 'Stores transcription provider configurations per client';
COMMENT ON TABLE action_item_integrations IS 'Tracks integration of action items with external systems';

COMMENT ON COLUMN meetings.recall_bot_id IS 'Recall.ai bot ID for this meeting';
COMMENT ON COLUMN meetings.recall_recording_id IS 'Recall.ai recording ID for this meeting';
COMMENT ON COLUMN meetings.recall_transcript_id IS 'Recall.ai transcript ID for this meeting';
COMMENT ON COLUMN meetings.bot_status IS 'Current status of the Recall.ai bot';
COMMENT ON COLUMN meetings.separate_audio_available IS 'Whether separate audio per participant is available';
COMMENT ON COLUMN meetings.separate_video_available IS 'Whether separate video per participant is available';
COMMENT ON COLUMN meetings.realtime_transcription_enabled IS 'Whether real-time transcription is enabled';
COMMENT ON COLUMN meetings.diarization_enabled IS 'Whether diarization (speaker identification) is enabled';
