-- Row Level Security (RLS) Policies for Qylon Platform (Fixed)
-- This migration creates RLS policies only for tables that exist in the initial schema

-- Enable RLS on tables that exist in initial schema
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdk_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (user_id = auth.uid());

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Subscription plans policies (read-only for users)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
    FOR SELECT USING (is_active = true);

-- Clients table policies
CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clients" ON clients
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (user_id = auth.uid());

-- Client metrics policies
CREATE POLICY "Users can view own client metrics" ON client_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = client_metrics.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own client metrics" ON client_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = client_metrics.client_id AND user_id = auth.uid()
        )
    );

-- Client team members policies
CREATE POLICY "Users can view own client team members" ON client_team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = client_team_members.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own client team members" ON client_team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = client_team_members.client_id AND user_id = auth.uid()
        )
    );

-- Meetings table policies
CREATE POLICY "Users can view own meetings" ON meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = meetings.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own meetings" ON meetings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = meetings.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own meetings" ON meetings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = meetings.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own meetings" ON meetings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = meetings.client_id AND user_id = auth.uid()
        )
    );

-- Meeting participants policies
CREATE POLICY "Users can view own meeting participants" ON meeting_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN clients ON meetings.client_id = clients.id
            WHERE meetings.id = meeting_participants.meeting_id AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own meeting participants" ON meeting_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN clients ON meetings.client_id = clients.id
            WHERE meetings.id = meeting_participants.meeting_id AND clients.user_id = auth.uid()
        )
    );

-- Meeting action items policies
CREATE POLICY "Users can view own meeting action items" ON meeting_action_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN clients ON meetings.client_id = clients.id
            WHERE meetings.id = meeting_action_items.meeting_id AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own meeting action items" ON meeting_action_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN clients ON meetings.client_id = clients.id
            WHERE meetings.id = meeting_action_items.meeting_id AND clients.user_id = auth.uid()
        )
    );

-- SDK uploads policies
CREATE POLICY "Users can view own SDK uploads" ON sdk_uploads
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own SDK uploads" ON sdk_uploads
    FOR ALL USING (user_id = auth.uid());

-- Meeting recordings policies
CREATE POLICY "Users can view own meeting recordings" ON meeting_recordings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN clients ON meetings.client_id = clients.id
            WHERE meetings.id = meeting_recordings.meeting_id AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own meeting recordings" ON meeting_recordings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN clients ON meetings.client_id = clients.id
            WHERE meetings.id = meeting_recordings.meeting_id AND clients.user_id = auth.uid()
        )
    );
