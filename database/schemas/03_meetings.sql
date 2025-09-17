-- Meetings table
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    platform VARCHAR(50) NOT NULL CHECK (platform IN (
        'zoom', 'teams', 'google_meet', 'webex', 'other'
    )),
    external_meeting_id VARCHAR(255) UNIQUE NOT NULL,
    meeting_url TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'scheduled' NOT NULL CHECK (status IN (
        'scheduled', 'recording', 'processing', 'completed', 'failed', 'cancelled'
    )),
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

-- Meeting participants
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

-- Meeting action items
CREATE TABLE meeting_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    assigned_to VARCHAR(255),
    assigned_to_email VARCHAR(255),
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN (
        'low', 'medium', 'high', 'urgent'
    )),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'cancelled'
    )),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SDK Uploads table (for Recall.ai integration)
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

-- Meeting recordings table
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

-- Indexes for performance
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

-- Row Level Security (RLS) policies
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdk_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;

-- Meetings policies
CREATE POLICY "Users can view meetings for own clients" ON meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE id = meetings.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create meetings for own clients" ON meetings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE id = meetings.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update meetings for own clients" ON meetings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE id = meetings.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete meetings for own clients" ON meetings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE id = meetings.client_id AND user_id = auth.uid()
        )
    );

-- Meeting participants policies
CREATE POLICY "Users can view participants for own client meetings" ON meeting_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = meeting_participants.meeting_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage participants for own client meetings" ON meeting_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = meeting_participants.meeting_id AND c.user_id = auth.uid()
        )
    );

-- Meeting action items policies
CREATE POLICY "Users can view action items for own client meetings" ON meeting_action_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = meeting_action_items.meeting_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage action items for own client meetings" ON meeting_action_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = meeting_action_items.meeting_id AND c.user_id = auth.uid()
        )
    );

-- SDK uploads policies
CREATE POLICY "Users can view own SDK uploads" ON sdk_uploads
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create SDK uploads" ON sdk_uploads
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own SDK uploads" ON sdk_uploads
    FOR UPDATE USING (user_id = auth.uid());

-- Meeting recordings policies
CREATE POLICY "Users can view recordings for own client meetings" ON meeting_recordings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON m.client_id = c.id
            WHERE m.id = meeting_recordings.meeting_id AND c.user_id = auth.uid()
        )
    );

-- Triggers for updated_at
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_action_items_updated_at BEFORE UPDATE ON meeting_action_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sdk_uploads_updated_at BEFORE UPDATE ON sdk_uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_recordings_updated_at BEFORE UPDATE ON meeting_recordings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();