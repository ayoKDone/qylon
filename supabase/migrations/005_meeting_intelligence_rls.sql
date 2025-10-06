-- Row Level Security (RLS) policies for Meeting Intelligence Service tables
-- This migration creates RLS policies to ensure proper data access control

-- Enable RLS on all Meeting Intelligence tables
ALTER TABLE sdk_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_capture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_intelligence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_files ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SDK CONNECTIONS POLICIES
-- ============================================================================

-- Users can view their own SDK connections
CREATE POLICY "Users can view own SDK connections" ON sdk_connections
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = sdk_connections.client_id AND user_id = auth.uid()
        )
    );

-- Users can create SDK connections for their clients
CREATE POLICY "Users can create SDK connections" ON sdk_connections
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = sdk_connections.client_id AND user_id = auth.uid()
        )
    );

-- Users can update their own SDK connections
CREATE POLICY "Users can update own SDK connections" ON sdk_connections
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = sdk_connections.client_id AND user_id = auth.uid()
        )
    );

-- Users can delete their own SDK connections
CREATE POLICY "Users can delete own SDK connections" ON sdk_connections
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = sdk_connections.client_id AND user_id = auth.uid()
        )
    );

-- ============================================================================
-- AUDIO CAPTURE SESSIONS POLICIES
-- ============================================================================

-- Users can view audio capture sessions for their connections
CREATE POLICY "Users can view own audio capture sessions" ON audio_capture_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sdk_connections sc
            WHERE sc.id = audio_capture_sessions.connection_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can create audio capture sessions for their connections
CREATE POLICY "Users can create audio capture sessions" ON audio_capture_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sdk_connections sc
            WHERE sc.id = audio_capture_sessions.connection_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can update their own audio capture sessions
CREATE POLICY "Users can update own audio capture sessions" ON audio_capture_sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM sdk_connections sc
            WHERE sc.id = audio_capture_sessions.connection_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can delete their own audio capture sessions
CREATE POLICY "Users can delete own audio capture sessions" ON audio_capture_sessions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM sdk_connections sc
            WHERE sc.id = audio_capture_sessions.connection_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- ============================================================================
-- AUDIO CHUNKS POLICIES
-- ============================================================================

-- Users can view audio chunks for their sessions
CREATE POLICY "Users can view own audio chunks" ON audio_chunks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = audio_chunks.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can create audio chunks for their sessions
CREATE POLICY "Users can create audio chunks" ON audio_chunks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = audio_chunks.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can update their own audio chunks
CREATE POLICY "Users can update own audio chunks" ON audio_chunks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = audio_chunks.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can delete their own audio chunks
CREATE POLICY "Users can delete own audio chunks" ON audio_chunks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = audio_chunks.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- ============================================================================
-- AUDIO PROCESSING JOBS POLICIES
-- ============================================================================

-- Users can view audio processing jobs for their sessions
CREATE POLICY "Users can view own audio processing jobs" ON audio_processing_jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = audio_processing_jobs.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can create audio processing jobs for their sessions
CREATE POLICY "Users can create audio processing jobs" ON audio_processing_jobs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = audio_processing_jobs.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can update their own audio processing jobs
CREATE POLICY "Users can update own audio processing jobs" ON audio_processing_jobs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = audio_processing_jobs.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can delete their own audio processing jobs
CREATE POLICY "Users can delete own audio processing jobs" ON audio_processing_jobs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = audio_processing_jobs.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- ============================================================================
-- TRANSCRIPTIONS POLICIES
-- ============================================================================

-- Users can view transcriptions for their meetings
CREATE POLICY "Users can view own transcriptions" ON transcriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON c.id = m.client_id
            WHERE m.id = transcriptions.meeting_id
            AND c.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = transcriptions.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can create transcriptions for their meetings
CREATE POLICY "Users can create transcriptions" ON transcriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON c.id = m.client_id
            WHERE m.id = transcriptions.meeting_id
            AND c.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = transcriptions.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can update their own transcriptions
CREATE POLICY "Users can update own transcriptions" ON transcriptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON c.id = m.client_id
            WHERE m.id = transcriptions.meeting_id
            AND c.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = transcriptions.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- Users can delete their own transcriptions
CREATE POLICY "Users can delete own transcriptions" ON transcriptions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON c.id = m.client_id
            WHERE m.id = transcriptions.meeting_id
            AND c.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM audio_capture_sessions acs
            JOIN sdk_connections sc ON sc.id = acs.connection_id
            WHERE acs.id = transcriptions.session_id
            AND (sc.user_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM clients WHERE id = sc.client_id AND user_id = auth.uid()))
        )
    );

-- ============================================================================
-- TRANSCRIPTION SEGMENTS POLICIES
-- ============================================================================

-- Users can view transcription segments for their transcriptions
CREATE POLICY "Users can view own transcription segments" ON transcription_segments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_segments.transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can create transcription segments for their transcriptions
CREATE POLICY "Users can create transcription segments" ON transcription_segments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_segments.transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can update their own transcription segments
CREATE POLICY "Users can update own transcription segments" ON transcription_segments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_segments.transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can delete their own transcription segments
CREATE POLICY "Users can delete own transcription segments" ON transcription_segments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_segments.transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- ============================================================================
-- TRANSCRIPTION SPEAKERS POLICIES
-- ============================================================================

-- Users can view transcription speakers for their transcriptions
CREATE POLICY "Users can view own transcription speakers" ON transcription_speakers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_speakers.transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can create transcription speakers for their transcriptions
CREATE POLICY "Users can create transcription speakers" ON transcription_speakers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_speakers.transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can update their own transcription speakers
CREATE POLICY "Users can update own transcription speakers" ON transcription_speakers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_speakers.transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can delete their own transcription speakers
CREATE POLICY "Users can delete own transcription speakers" ON transcription_speakers
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_speakers.transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- ============================================================================
-- TRANSCRIPTION OPTIMIZATIONS POLICIES
-- ============================================================================

-- Users can view transcription optimizations for their transcriptions
CREATE POLICY "Users can view own transcription optimizations" ON transcription_optimizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_optimizations.original_transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can create transcription optimizations for their transcriptions
CREATE POLICY "Users can create transcription optimizations" ON transcription_optimizations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_optimizations.original_transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can update their own transcription optimizations
CREATE POLICY "Users can update own transcription optimizations" ON transcription_optimizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_optimizations.original_transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can delete their own transcription optimizations
CREATE POLICY "Users can delete own transcription optimizations" ON transcription_optimizations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM transcriptions t
            JOIN meetings m ON m.id = t.meeting_id
            JOIN clients c ON c.id = m.client_id
            WHERE t.id = transcription_optimizations.original_transcription_id
            AND c.user_id = auth.uid()
        )
    );

-- ============================================================================
-- MEETING INTELLIGENCE METRICS POLICIES
-- ============================================================================

-- Users can view metrics for their clients
CREATE POLICY "Users can view own meeting intelligence metrics" ON meeting_intelligence_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = meeting_intelligence_metrics.client_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can create metrics for their clients
CREATE POLICY "Users can create meeting intelligence metrics" ON meeting_intelligence_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = meeting_intelligence_metrics.client_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can update metrics for their clients
CREATE POLICY "Users can update own meeting intelligence metrics" ON meeting_intelligence_metrics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = meeting_intelligence_metrics.client_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can delete metrics for their clients
CREATE POLICY "Users can delete own meeting intelligence metrics" ON meeting_intelligence_metrics
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = meeting_intelligence_metrics.client_id
            AND c.user_id = auth.uid()
        )
    );

-- ============================================================================
-- STORAGE BUCKETS POLICIES
-- ============================================================================

-- Users can view storage buckets for their clients
CREATE POLICY "Users can view own storage buckets" ON storage_buckets
    FOR SELECT USING (
        client_id IS NULL OR
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = storage_buckets.client_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can create storage buckets for their clients
CREATE POLICY "Users can create storage buckets" ON storage_buckets
    FOR INSERT WITH CHECK (
        client_id IS NULL OR
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = storage_buckets.client_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can update storage buckets for their clients
CREATE POLICY "Users can update own storage buckets" ON storage_buckets
    FOR UPDATE USING (
        client_id IS NULL OR
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = storage_buckets.client_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can delete storage buckets for their clients
CREATE POLICY "Users can delete own storage buckets" ON storage_buckets
    FOR DELETE USING (
        client_id IS NULL OR
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = storage_buckets.client_id
            AND c.user_id = auth.uid()
        )
    );

-- ============================================================================
-- STORAGE FILES POLICIES
-- ============================================================================

-- Users can view storage files for their buckets
CREATE POLICY "Users can view own storage files" ON storage_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM storage_buckets sb
            WHERE sb.id = storage_files.bucket_id
            AND (sb.client_id IS NULL OR
                 EXISTS (SELECT 1 FROM clients c WHERE c.id = sb.client_id AND c.user_id = auth.uid()))
        ) OR
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meetings m
            JOIN clients c ON c.id = m.client_id
            WHERE m.id = storage_files.meeting_id
            AND c.user_id = auth.uid()
        )
    );

-- Users can create storage files for their buckets
CREATE POLICY "Users can create storage files" ON storage_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM storage_buckets sb
            WHERE sb.id = storage_files.bucket_id
            AND (sb.client_id IS NULL OR
                 EXISTS (SELECT 1 FROM clients c WHERE c.id = sb.client_id AND c.user_id = auth.uid()))
        ) OR
        uploaded_by = auth.uid()
    );

-- Users can update storage files for their buckets
CREATE POLICY "Users can update own storage files" ON storage_files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM storage_buckets sb
            WHERE sb.id = storage_files.bucket_id
            AND (sb.client_id IS NULL OR
                 EXISTS (SELECT 1 FROM clients c WHERE c.id = sb.client_id AND c.user_id = auth.uid()))
        ) OR
        uploaded_by = auth.uid()
    );

-- Users can delete storage files for their buckets
CREATE POLICY "Users can delete own storage files" ON storage_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM storage_buckets sb
            WHERE sb.id = storage_files.bucket_id
            AND (sb.client_id IS NULL OR
                 EXISTS (SELECT 1 FROM clients c WHERE c.id = sb.client_id AND c.user_id = auth.uid()))
        ) OR
        uploaded_by = auth.uid()
    );

-- ============================================================================
-- SERVICE ROLE POLICIES (for backend services)
-- ============================================================================

-- Service role can perform all operations on all tables
-- These policies allow the backend services to bypass RLS when using service role

-- SDK Connections - Service role access
CREATE POLICY "Service role can manage SDK connections" ON sdk_connections
    FOR ALL USING (auth.role() = 'service_role');

-- Audio Capture Sessions - Service role access
CREATE POLICY "Service role can manage audio capture sessions" ON audio_capture_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Audio Chunks - Service role access
CREATE POLICY "Service role can manage audio chunks" ON audio_chunks
    FOR ALL USING (auth.role() = 'service_role');

-- Audio Processing Jobs - Service role access
CREATE POLICY "Service role can manage audio processing jobs" ON audio_processing_jobs
    FOR ALL USING (auth.role() = 'service_role');

-- Transcriptions - Service role access
CREATE POLICY "Service role can manage transcriptions" ON transcriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Transcription Segments - Service role access
CREATE POLICY "Service role can manage transcription segments" ON transcription_segments
    FOR ALL USING (auth.role() = 'service_role');

-- Transcription Speakers - Service role access
CREATE POLICY "Service role can manage transcription speakers" ON transcription_speakers
    FOR ALL USING (auth.role() = 'service_role');

-- Transcription Optimizations - Service role access
CREATE POLICY "Service role can manage transcription optimizations" ON transcription_optimizations
    FOR ALL USING (auth.role() = 'service_role');

-- Meeting Intelligence Metrics - Service role access
CREATE POLICY "Service role can manage meeting intelligence metrics" ON meeting_intelligence_metrics
    FOR ALL USING (auth.role() = 'service_role');

-- Storage Buckets - Service role access
CREATE POLICY "Service role can manage storage buckets" ON storage_buckets
    FOR ALL USING (auth.role() = 'service_role');

-- Storage Files - Service role access
CREATE POLICY "Service role can manage storage files" ON storage_files
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Users can view own SDK connections" ON sdk_connections IS
'Allows users to view SDK connections they own or for their clients';

COMMENT ON POLICY "Users can create SDK connections" ON sdk_connections IS
'Allows users to create SDK connections for their clients';

COMMENT ON POLICY "Users can update own SDK connections" ON sdk_connections IS
'Allows users to update SDK connections they own or for their clients';

COMMENT ON POLICY "Users can delete own SDK connections" ON sdk_connections IS
'Allows users to delete SDK connections they own or for their clients';

COMMENT ON POLICY "Service role can manage SDK connections" ON sdk_connections IS
'Allows backend services to manage SDK connections using service role';

-- Add similar comments for other policies as needed...

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON sdk_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON audio_capture_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON audio_chunks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON audio_processing_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transcriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transcription_segments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transcription_speakers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transcription_optimizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON meeting_intelligence_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage_buckets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage_files TO authenticated;

-- Grant permissions to service role
GRANT ALL ON sdk_connections TO service_role;
GRANT ALL ON audio_capture_sessions TO service_role;
GRANT ALL ON audio_chunks TO service_role;
GRANT ALL ON audio_processing_jobs TO service_role;
GRANT ALL ON transcriptions TO service_role;
GRANT ALL ON transcription_segments TO service_role;
GRANT ALL ON transcription_speakers TO service_role;
GRANT ALL ON transcription_optimizations TO service_role;
GRANT ALL ON meeting_intelligence_metrics TO service_role;
GRANT ALL ON storage_buckets TO service_role;
GRANT ALL ON storage_files TO service_role;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
