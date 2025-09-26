-- CRM Integrations Row Level Security (RLS) Policies
-- This migration creates RLS policies for CRM integrations and related tables

-- Enable RLS on all tables
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Integrations table policies
CREATE POLICY "Users can view own integrations" ON integrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = integrations.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own integrations" ON integrations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = integrations.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own integrations" ON integrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = integrations.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own integrations" ON integrations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = integrations.client_id AND user_id = auth.uid()
        )
    );

-- CRM contacts table policies
CREATE POLICY "Users can view own CRM contacts" ON crm_contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = crm_contacts.integration_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own CRM contacts" ON crm_contacts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = crm_contacts.integration_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own CRM contacts" ON crm_contacts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = crm_contacts.integration_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own CRM contacts" ON crm_contacts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = crm_contacts.integration_id
            AND clients.user_id = auth.uid()
        )
    );

-- CRM opportunities table policies
CREATE POLICY "Users can view own CRM opportunities" ON crm_opportunities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = crm_opportunities.integration_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own CRM opportunities" ON crm_opportunities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = crm_opportunities.integration_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own CRM opportunities" ON crm_opportunities
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = crm_opportunities.integration_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own CRM opportunities" ON crm_opportunities
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = crm_opportunities.integration_id
            AND clients.user_id = auth.uid()
        )
    );

-- Communication messages table policies
CREATE POLICY "Users can view own communication messages" ON communication_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = communication_messages.integration_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own communication messages" ON communication_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = communication_messages.integration_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own communication messages" ON communication_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = communication_messages.integration_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own communication messages" ON communication_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = communication_messages.integration_id
            AND clients.user_id = auth.uid()
        )
    );

-- Email templates table policies
CREATE POLICY "Users can view own email templates" ON email_templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = email_templates.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own email templates" ON email_templates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = email_templates.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own email templates" ON email_templates
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = email_templates.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own email templates" ON email_templates
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = email_templates.client_id AND user_id = auth.uid()
        )
    );

-- Sync logs table policies
CREATE POLICY "Users can view own sync logs" ON sync_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = sync_logs.integration_id
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own sync logs" ON sync_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM integrations
            JOIN clients ON clients.id = integrations.client_id
            WHERE integrations.id = sync_logs.integration_id
            AND clients.user_id = auth.uid()
        )
    );

-- Notification preferences table policies
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = notification_preferences.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own notification preferences" ON notification_preferences
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = notification_preferences.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own notification preferences" ON notification_preferences
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = notification_preferences.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own notification preferences" ON notification_preferences
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = notification_preferences.client_id AND user_id = auth.uid()
        )
    );

-- Notification queue table policies
CREATE POLICY "Users can view own notification queue" ON notification_queue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = notification_queue.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own notification queue" ON notification_queue
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = notification_queue.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own notification queue" ON notification_queue
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = notification_queue.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own notification queue" ON notification_queue
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE id = notification_queue.client_id AND user_id = auth.uid()
        )
    );

-- Service role policies for system operations
CREATE POLICY "Service role can manage all integrations" ON integrations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all CRM contacts" ON crm_contacts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all CRM opportunities" ON crm_opportunities
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all communication messages" ON communication_messages
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all email templates" ON email_templates
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all sync logs" ON sync_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all notification preferences" ON notification_preferences
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all notification queue" ON notification_queue
    FOR ALL USING (auth.role() = 'service_role');
