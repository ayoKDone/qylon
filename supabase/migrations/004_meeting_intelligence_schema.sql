-- Meeting Intelligence Service Schema Migration
-- This migration creates tables for SDK connections, audio processing, and transcription management

-- Create custom types for Meeting Intelligence
CREATE TYPE connection_status AS ENUM (
    'connecting', 'connected', 'disconnected', 'error', 'reconnecting'
);
CREATE TYPE processing_status AS ENUM (
    'pending', 'in_progress', 'completed', 'failed'
);
CREATE TYPE audio_format AS ENUM (
    'wav', 'mp3', 'flac', 'aac'
);
CREATE TYPE transcription_status AS ENUM (
    'pending', 'processing', 'completed', 'failed', 'optimizing'
);
CREATE TYPE optimization_status AS ENUM (
    'pending', 'in_progress', 'completed', 'failed'
);

-- Create sdk_connections table for Recall.ai Desktop SDK integration
CREATE TABLE sdk_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    connection_token VARCHAR(255) UNIQUE NOT NULL,
    status connection_status DEFAULT 'connecting' NOT NULL,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    audio_quality JSONB NOT NULL DEFAULT '{}',
    connection_metadata JSONB NOT NULL DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audio_capture_sessions table for tracking audio capture
CREATE TABLE audio_capture_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES sdk_connections(id) ON DELETE CASCADE NOT NULL,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    status connection_status DEFAULT 'connecting' NOT NULL,
    audio_config JSONB NOT NULL DEFAULT '{}',
    capture_stats JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    total_duration_ms BIGINT DEFAULT 0,
    total_chunks INTEGER DEFAULT 0,
    dropped_chunks INTEGER DEFAULT 0,
    average_latency_ms DECIMAL(10,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audio_chunks table for storing processed audio chunks
CREATE TABLE audio_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES audio_capture_sessions(id) ON DELETE CASCADE NOT NULL,
    chunk_sequence INTEGER NOT NULL,
    chunk_data BYTEA,
    chunk_size_bytes INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    start_time_ms BIGINT NOT NULL,
    end_time_ms BIGINT NOT NULL,
    quality_metrics JSONB DEFAULT '{}',
    processing_metadata JSONB DEFAULT '{}',
    is_overlap BOOLEAN DEFAULT false,
    overlap_duration_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audio_processing_jobs table for tracking audio processing
CREATE TABLE audio_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES audio_capture_sessions(id) ON DELETE CASCADE NOT NULL,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN (
        'noise_reduction', 'echo_cancellation', 'auto_gain_control',
        'compression', 'optimization', 'chunking'
    )),
    status processing_status DEFAULT 'pending' NOT NULL,
    config JSONB DEFAULT '{}',
    input_chunk_ids UUID[] DEFAULT '{}',
    output_chunk_ids UUID[] DEFAULT '{}',
    processing_stats JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transcriptions table for storing Whisper API transcriptions
CREATE TABLE transcriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES audio_capture_sessions(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES audio_chunks(id) ON DELETE CASCADE,
    transcription_id VARCHAR(255) UNIQUE NOT NULL,
    status transcription_status DEFAULT 'pending' NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    text TEXT NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    duration_ms INTEGER NOT NULL,
    segments JSONB DEFAULT '[]',
    speakers JSONB DEFAULT '[]',
    sentiment JSONB,
    processing_time_ms INTEGER,
    whisper_model VARCHAR(50) DEFAULT 'whisper-1',
    whisper_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transcription_segments table for detailed segment information
CREATE TABLE transcription_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcription_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE NOT NULL,
    segment_sequence INTEGER NOT NULL,
    start_time_ms INTEGER NOT NULL,
    end_time_ms INTEGER NOT NULL,
    text TEXT NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    speaker_id VARCHAR(50),
    words JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transcription_speakers table for speaker information
CREATE TABLE transcription_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcription_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE NOT NULL,
    speaker_id VARCHAR(50) NOT NULL,
    speaker_name VARCHAR(255),
    total_speaking_time_ms INTEGER NOT NULL DEFAULT 0,
    segment_count INTEGER NOT NULL DEFAULT 0,
    average_confidence DECIMAL(5,4) NOT NULL DEFAULT 0,
    speaking_rate DECIMAL(8,2), -- words per minute
    clarity_score DECIMAL(5,2),
    consistency_score DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transcription_optimizations table for optimization tracking
CREATE TABLE transcription_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_transcription_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE NOT NULL,
    optimized_transcription_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
    status optimization_status DEFAULT 'pending' NOT NULL,
    optimization_type VARCHAR(50) NOT NULL CHECK (optimization_type IN (
        'text_correction', 'confidence_boosting', 'speaker_optimization',
        'quality_enhancement', 'language_specific', 'context_aware'
    )),
    config JSONB DEFAULT '{}',
    improvements_applied TEXT[] DEFAULT '{}',
    optimization_score DECIMAL(5,2) DEFAULT 0,
    confidence_improvement DECIMAL(5,4) DEFAULT 0,
    quality_improvement DECIMAL(5,2) DEFAULT 0,
    processing_time_ms INTEGER,
    algorithm_version VARCHAR(20) DEFAULT '1.0.0',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meeting_intelligence_metrics table for tracking service performance
CREATE TABLE meeting_intelligence_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    total_connections INTEGER DEFAULT 0,
    active_connections INTEGER DEFAULT 0,
    total_audio_chunks INTEGER DEFAULT 0,
    total_transcriptions INTEGER DEFAULT 0,
    successful_transcriptions INTEGER DEFAULT 0,
    failed_transcriptions INTEGER DEFAULT 0,
    average_confidence DECIMAL(5,4) DEFAULT 0,
    average_processing_time_ms INTEGER DEFAULT 0,
    total_audio_duration_ms BIGINT DEFAULT 0,
    language_distribution JSONB DEFAULT '{}',
    quality_metrics JSONB DEFAULT '{}',
    error_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, date)
);

-- Create storage_buckets table for Supabase Storage management
CREATE TABLE storage_buckets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_name VARCHAR(255) UNIQUE NOT NULL,
    bucket_type VARCHAR(50) NOT NULL CHECK (bucket_type IN (
        'audio_recordings', 'transcriptions', 'meeting_assets', 'user_uploads'
    )),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    max_size_bytes BIGINT,
    current_size_bytes BIGINT DEFAULT 0,
    file_count INTEGER DEFAULT 0,
    access_policy JSONB DEFAULT '{}',
    retention_days INTEGER,
    compression_enabled BOOLEAN DEFAULT false,
    encryption_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage_files table for tracking stored files
CREATE TABLE storage_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_id UUID REFERENCES storage_buckets(id) ON DELETE CASCADE NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64),
    metadata JSONB DEFAULT '{}',
    uploaded_by UUID REFERENCES users(id),
    meeting_id UUID REFERENCES meetings(id),
    transcription_id UUID REFERENCES transcriptions(id),
    is_processed BOOLEAN DEFAULT false,
    processing_status processing_status DEFAULT 'pending',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bucket_id, file_path)
);

-- Create indexes for performance optimization
CREATE INDEX idx_sdk_connections_user_id ON sdk_connections(user_id);
CREATE INDEX idx_sdk_connections_client_id ON sdk_connections(client_id);
CREATE INDEX idx_sdk_connections_status ON sdk_connections(status);
CREATE INDEX idx_sdk_connections_token ON sdk_connections(connection_token);
CREATE INDEX idx_sdk_connections_expires_at ON sdk_connections(expires_at);
CREATE INDEX idx_sdk_connections_last_heartbeat ON sdk_connections(last_heartbeat);

CREATE INDEX idx_audio_capture_sessions_connection_id ON audio_capture_sessions(connection_id);
CREATE INDEX idx_audio_capture_sessions_meeting_id ON audio_capture_sessions(meeting_id);
CREATE INDEX idx_audio_capture_sessions_status ON audio_capture_sessions(status);
CREATE INDEX idx_audio_capture_sessions_started_at ON audio_capture_sessions(started_at);

CREATE INDEX idx_audio_chunks_session_id ON audio_chunks(session_id);
CREATE INDEX idx_audio_chunks_sequence ON audio_chunks(session_id, chunk_sequence);
CREATE INDEX idx_audio_chunks_start_time ON audio_chunks(start_time_ms);
CREATE INDEX idx_audio_chunks_created_at ON audio_chunks(created_at);

CREATE INDEX idx_audio_processing_jobs_session_id ON audio_processing_jobs(session_id);
CREATE INDEX idx_audio_processing_jobs_status ON audio_processing_jobs(status);
CREATE INDEX idx_audio_processing_jobs_type ON audio_processing_jobs(job_type);
CREATE INDEX idx_audio_processing_jobs_started_at ON audio_processing_jobs(started_at);

CREATE INDEX idx_transcriptions_meeting_id ON transcriptions(meeting_id);
CREATE INDEX idx_transcriptions_session_id ON transcriptions(session_id);
CREATE INDEX idx_transcriptions_chunk_id ON transcriptions(chunk_id);
CREATE INDEX idx_transcriptions_status ON transcriptions(status);
CREATE INDEX idx_transcriptions_language ON transcriptions(language);
CREATE INDEX idx_transcriptions_confidence ON transcriptions(confidence);
CREATE INDEX idx_transcriptions_created_at ON transcriptions(created_at);

CREATE INDEX idx_transcription_segments_transcription_id ON transcription_segments(transcription_id);
CREATE INDEX idx_transcription_segments_sequence ON transcription_segments(transcription_id, segment_sequence);
CREATE INDEX idx_transcription_segments_speaker_id ON transcription_segments(speaker_id);
CREATE INDEX idx_transcription_segments_start_time ON transcription_segments(start_time_ms);

CREATE INDEX idx_transcription_speakers_transcription_id ON transcription_speakers(transcription_id);
CREATE INDEX idx_transcription_speakers_speaker_id ON transcription_speakers(speaker_id);

CREATE INDEX idx_transcription_optimizations_original_id ON transcription_optimizations(original_transcription_id);
CREATE INDEX idx_transcription_optimizations_optimized_id ON transcription_optimizations(optimized_transcription_id);
CREATE INDEX idx_transcription_optimizations_status ON transcription_optimizations(status);
CREATE INDEX idx_transcription_optimizations_type ON transcription_optimizations(optimization_type);

CREATE INDEX idx_meeting_intelligence_metrics_client_id ON meeting_intelligence_metrics(client_id);
CREATE INDEX idx_meeting_intelligence_metrics_date ON meeting_intelligence_metrics(date);
CREATE INDEX idx_meeting_intelligence_metrics_client_date ON meeting_intelligence_metrics(client_id, date);

CREATE INDEX idx_storage_buckets_type ON storage_buckets(bucket_type);
CREATE INDEX idx_storage_buckets_client_id ON storage_buckets(client_id);
CREATE INDEX idx_storage_buckets_name ON storage_buckets(bucket_name);

CREATE INDEX idx_storage_files_bucket_id ON storage_files(bucket_id);
CREATE INDEX idx_storage_files_meeting_id ON storage_files(meeting_id);
CREATE INDEX idx_storage_files_transcription_id ON storage_files(transcription_id);
CREATE INDEX idx_storage_files_uploaded_by ON storage_files(uploaded_by);
CREATE INDEX idx_storage_files_created_at ON storage_files(created_at);
CREATE INDEX idx_storage_files_expires_at ON storage_files(expires_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_sdk_connections_updated_at BEFORE UPDATE ON sdk_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_capture_sessions_updated_at BEFORE UPDATE ON audio_capture_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_processing_jobs_updated_at BEFORE UPDATE ON audio_processing_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcriptions_updated_at BEFORE UPDATE ON transcriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcription_speakers_updated_at BEFORE UPDATE ON transcription_speakers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcription_optimizations_updated_at BEFORE UPDATE ON transcription_optimizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_intelligence_metrics_updated_at BEFORE UPDATE ON meeting_intelligence_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_buckets_updated_at BEFORE UPDATE ON storage_buckets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_files_updated_at BEFORE UPDATE ON storage_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired connections
CREATE OR REPLACE FUNCTION cleanup_expired_connections()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sdk_connections
    WHERE expires_at < NOW() AND status IN ('disconnected', 'error');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to update meeting intelligence metrics
CREATE OR REPLACE FUNCTION update_meeting_intelligence_metrics(
    p_client_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO meeting_intelligence_metrics (
        client_id,
        date,
        total_connections,
        active_connections,
        total_audio_chunks,
        total_transcriptions,
        successful_transcriptions,
        failed_transcriptions,
        average_confidence,
        average_processing_time_ms,
        total_audio_duration_ms,
        language_distribution,
        quality_metrics,
        error_metrics
    )
    SELECT
        p_client_id,
        p_date,
        COUNT(DISTINCT sc.id) as total_connections,
        COUNT(DISTINCT CASE WHEN sc.status = 'connected' THEN sc.id END) as active_connections,
        COUNT(ac.id) as total_audio_chunks,
        COUNT(t.id) as total_transcriptions,
        COUNT(CASE WHEN t.status = 'completed' THEN t.id END) as successful_transcriptions,
        COUNT(CASE WHEN t.status = 'failed' THEN t.id END) as failed_transcriptions,
        COALESCE(AVG(t.confidence), 0) as average_confidence,
        COALESCE(AVG(t.processing_time_ms), 0) as average_processing_time_ms,
        COALESCE(SUM(t.duration_ms), 0) as total_audio_duration_ms,
        COALESCE(
            jsonb_object_agg(t.language, lang_count.count) FILTER (WHERE t.language IS NOT NULL),
            '{}'::jsonb
        ) as language_distribution,
        jsonb_build_object(
            'average_quality_score', COALESCE(AVG(acs.quality_score), 0),
            'average_latency_ms', COALESCE(AVG(acs.average_latency_ms), 0),
            'total_dropped_chunks', COALESCE(SUM(acs.dropped_chunks), 0)
        ) as quality_metrics,
        jsonb_build_object(
            'total_errors', COALESCE(SUM(acs.error_count), 0),
            'connection_errors', COUNT(CASE WHEN sc.status = 'error' THEN sc.id END),
            'processing_errors', COUNT(CASE WHEN apj.status = 'failed' THEN apj.id END)
        ) as error_metrics
    FROM sdk_connections sc
    LEFT JOIN audio_capture_sessions acs ON sc.id = acs.connection_id
    LEFT JOIN audio_chunks ac ON acs.id = ac.session_id
    LEFT JOIN transcriptions t ON acs.id = t.session_id
    LEFT JOIN audio_processing_jobs apj ON acs.id = apj.session_id
    LEFT JOIN (
        SELECT language, COUNT(*) as count
        FROM transcriptions
        WHERE DATE(created_at) = p_date
        GROUP BY language
    ) lang_count ON t.language = lang_count.language
    WHERE sc.client_id = p_client_id
        AND DATE(sc.created_at) = p_date
    GROUP BY p_client_id, p_date
    ON CONFLICT (client_id, date) DO UPDATE SET
        total_connections = EXCLUDED.total_connections,
        active_connections = EXCLUDED.active_connections,
        total_audio_chunks = EXCLUDED.total_audio_chunks,
        total_transcriptions = EXCLUDED.total_transcriptions,
        successful_transcriptions = EXCLUDED.successful_transcriptions,
        failed_transcriptions = EXCLUDED.failed_transcriptions,
        average_confidence = EXCLUDED.average_confidence,
        average_processing_time_ms = EXCLUDED.average_processing_time_ms,
        total_audio_duration_ms = EXCLUDED.total_audio_duration_ms,
        language_distribution = EXCLUDED.language_distribution,
        quality_metrics = EXCLUDED.quality_metrics,
        error_metrics = EXCLUDED.error_metrics,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to get connection health status
CREATE OR REPLACE FUNCTION get_connection_health(p_connection_id UUID)
RETURNS TABLE (
    connection_id UUID,
    is_connected BOOLEAN,
    audio_capture_active BOOLEAN,
    last_audio_chunk TIMESTAMPTZ,
    dropped_chunks INTEGER,
    total_chunks INTEGER,
    average_latency_ms DECIMAL(10,2),
    error_count INTEGER,
    last_error TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc.id as connection_id,
        (sc.status = 'connected') as is_connected,
        (acs.status = 'connected') as audio_capture_active,
        ac.created_at as last_audio_chunk,
        COALESCE(acs.dropped_chunks, 0) as dropped_chunks,
        COALESCE(acs.total_chunks, 0) as total_chunks,
        COALESCE(acs.average_latency_ms, 0) as average_latency_ms,
        COALESCE(acs.error_count, 0) as error_count,
        acs.last_error
    FROM sdk_connections sc
    LEFT JOIN audio_capture_sessions acs ON sc.id = acs.connection_id
    LEFT JOIN audio_chunks ac ON acs.id = ac.session_id
    WHERE sc.id = p_connection_id
    ORDER BY ac.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to clean up expired connections (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-connections', '0 */6 * * *', 'SELECT cleanup_expired_connections();');

-- Create scheduled job to update metrics (requires pg_cron extension)
-- SELECT cron.schedule('update-meeting-intelligence-metrics', '0 1 * * *', 'SELECT update_meeting_intelligence_metrics(client_id, CURRENT_DATE) FROM clients WHERE status = ''active'';');

-- Add comments for documentation
COMMENT ON TABLE sdk_connections IS 'Stores SDK connection information for Recall.ai Desktop SDK integration';
COMMENT ON TABLE audio_capture_sessions IS 'Tracks audio capture sessions and their statistics';
COMMENT ON TABLE audio_chunks IS 'Stores processed audio chunks with metadata';
COMMENT ON TABLE audio_processing_jobs IS 'Tracks audio processing jobs and their status';
COMMENT ON TABLE transcriptions IS 'Stores Whisper API transcription results';
COMMENT ON TABLE transcription_segments IS 'Detailed segment information for transcriptions';
COMMENT ON TABLE transcription_speakers IS 'Speaker information and statistics';
COMMENT ON TABLE transcription_optimizations IS 'Tracks transcription optimization processes';
COMMENT ON TABLE meeting_intelligence_metrics IS 'Daily metrics for meeting intelligence service performance';
COMMENT ON TABLE storage_buckets IS 'Supabase Storage bucket configuration and metadata';
COMMENT ON TABLE storage_files IS 'Tracks files stored in Supabase Storage buckets';
