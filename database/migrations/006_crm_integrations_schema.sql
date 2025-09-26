-- CRM Integrations Schema Migration
-- This migration creates tables for CRM integrations and data synchronization

-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'crm_salesforce', 'crm_hubspot', 'crm_pipedrive', 'crm_custom',
        'communication_slack', 'communication_discord', 'communication_teams',
        'email_mailchimp', 'email_sendgrid', 'email_constant_contact'
    )),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'error', 'pending', 'syncing')),
    credentials JSONB NOT NULL,
    settings JSONB DEFAULT '{}',
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_frequency INTEGER DEFAULT 3600, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique integration per user/client/type
    UNIQUE(user_id, client_id, type)
);

-- Create CRM contacts table
CREATE TABLE IF NOT EXISTS crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    title VARCHAR(255),
    source VARCHAR(50) NOT NULL,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique contact per integration
    UNIQUE(integration_id, external_id)
);

-- Create CRM opportunities table
CREATE TABLE IF NOT EXISTS crm_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2),
    stage VARCHAR(100),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    close_date DATE,
    source VARCHAR(50) NOT NULL,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique opportunity per integration
    UNIQUE(integration_id, external_id)
);

-- Create communication messages table
CREATE TABLE IF NOT EXISTS communication_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL,
    channel VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    sender VARCHAR(255) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique message per integration
    UNIQUE(integration_id, external_id)
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    platform VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique template name per user/client
    UNIQUE(user_id, client_id, name)
);

-- Create sync logs table
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    channel VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique preference per user/client/platform/channel
    UNIQUE(user_id, client_id, platform, channel)
);

-- Create notification queue table
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    channel VARCHAR(255),
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_client_id ON integrations(client_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_integration_id ON crm_contacts(integration_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_external_id ON crm_contacts(external_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_last_synced ON crm_contacts(last_synced_at);

CREATE INDEX IF NOT EXISTS idx_crm_opportunities_integration_id ON crm_opportunities(integration_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_contact_id ON crm_opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_external_id ON crm_opportunities(external_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_stage ON crm_opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_close_date ON crm_opportunities(close_date);

CREATE INDEX IF NOT EXISTS idx_communication_messages_integration_id ON communication_messages(integration_id);
CREATE INDEX IF NOT EXISTS idx_communication_messages_platform ON communication_messages(platform);
CREATE INDEX IF NOT EXISTS idx_communication_messages_channel ON communication_messages(channel);
CREATE INDEX IF NOT EXISTS idx_communication_messages_created_at ON communication_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_client_id ON email_templates(client_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_platform ON email_templates(platform);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_sync_logs_integration_id ON sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON sync_logs(started_at);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_client_id ON notification_preferences(client_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_platform ON notification_preferences(platform);

CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_client_id ON notification_queue(client_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_priority ON notification_queue(priority);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_at ON notification_queue(scheduled_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON crm_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_opportunities_updated_at BEFORE UPDATE ON crm_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_messages_updated_at BEFORE UPDATE ON communication_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_queue_updated_at BEFORE UPDATE ON notification_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
