-- Row Level Security (RLS) Policies for Qylon Platform
-- This migration creates comprehensive RLS policies for all tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions" ON user_sessions
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "System can create sessions" ON user_sessions
    FOR INSERT WITH CHECK (true);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (user_id = auth.uid());

-- Subscription plans policies (read-only for users)
CREATE POLICY "All authenticated users can view subscription plans" ON subscription_plans
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admins can manage subscription plans" ON subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Clients table policies
CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create clients" ON clients
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all clients" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Client metrics policies
CREATE POLICY "Users can view own client metrics" ON client_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = client_metrics.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "System can update client metrics" ON client_metrics
    FOR UPDATE USING (true);

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
CREATE POLICY "Users can view own client meetings" ON meetings
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

CREATE POLICY "Users can update own client meetings" ON meetings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = meetings.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own client meetings" ON meetings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = meetings.client_id AND user_id = auth.uid()
        )
    );

-- Meeting transcriptions policies
CREATE POLICY "Users can view own client meeting transcriptions" ON meeting_transcriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN clients ON meetings.client_id = clients.id
            WHERE meetings.id = meeting_transcriptions.meeting_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "System can create meeting transcriptions" ON meeting_transcriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own client meeting transcriptions" ON meeting_transcriptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN clients ON meetings.client_id = clients.id
            WHERE meetings.id = meeting_transcriptions.meeting_id
            AND clients.user_id = auth.uid()
        )
    );

-- Action items policies
CREATE POLICY "Users can view own client action items" ON action_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN clients ON meetings.client_id = clients.id
            WHERE meetings.id = action_items.meeting_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "System can create action items" ON action_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own client action items" ON action_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM meetings
            JOIN clients ON meetings.client_id = clients.id
            WHERE meetings.id = action_items.meeting_id
            AND clients.user_id = auth.uid()
        )
    );

-- Content pieces policies
CREATE POLICY "Users can view own client content" ON content_pieces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = content_pieces.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create content for own clients" ON content_pieces
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = content_pieces.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own client content" ON content_pieces
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = content_pieces.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own client content" ON content_pieces
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = content_pieces.client_id AND user_id = auth.uid()
        )
    );

-- Workflows policies
CREATE POLICY "Users can view own client workflows" ON workflows
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = workflows.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create workflows for own clients" ON workflows
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = workflows.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own client workflows" ON workflows
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = workflows.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own client workflows" ON workflows
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = workflows.client_id AND user_id = auth.uid()
        )
    );

-- Workflow executions policies
CREATE POLICY "Users can view own client workflow executions" ON workflow_executions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workflows
            JOIN clients ON workflows.client_id = clients.id
            WHERE workflows.id = workflow_executions.workflow_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "System can create workflow executions" ON workflow_executions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update workflow executions" ON workflow_executions
    FOR UPDATE USING (true);

-- Integrations policies
CREATE POLICY "Users can view own client integrations" ON integrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = integrations.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create integrations for own clients" ON integrations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = integrations.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own client integrations" ON integrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = integrations.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own client integrations" ON integrations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = integrations.client_id AND user_id = auth.uid()
        )
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- Create helper functions for RLS
CREATE OR REPLACE FUNCTION get_table_policies(table_name text)
RETURNS TABLE (
    schemaname text,
    tablename text,
    policyname text,
    permissive text,
    roles text[],
    cmd text,
    qual text,
    with_check text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.schemaname,
        p.tablename,
        p.policyname,
        p.permissive,
        p.roles,
        p.cmd,
        p.qual,
        p.with_check
    FROM pg_policies p
    WHERE p.tablename = table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate RLS policy
CREATE OR REPLACE FUNCTION validate_rls_policy(
    table_name text,
    policy_name text,
    operation text
)
RETURNS boolean AS $$
DECLARE
    policy_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = table_name
        AND policyname = policy_name
        AND cmd = operation
    ) INTO policy_exists;

    RETURN policy_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
