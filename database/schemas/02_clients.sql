-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    industry VARCHAR(100) NOT NULL CHECK (industry IN (
        'technology', 'healthcare', 'finance', 'education', 
        'retail', 'manufacturing', 'consulting', 'real_estate',
        'legal', 'marketing', 'non_profit', 'other'
    )),
    company_size VARCHAR(50) NOT NULL CHECK (company_size IN (
        '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
    )),
    primary_goals TEXT[] NOT NULL,
    current_tools TEXT[],
    budget VARCHAR(50) NOT NULL CHECK (budget IN (
        'under_5k', '5k_10k', '10k_25k', '25k_50k', '50k_100k', '100k+'
    )),
    timeline VARCHAR(50) NOT NULL CHECK (timeline IN (
        'immediate', '1_month', '3_months', '6_months', '1_year'
    )),
    special_requirements TEXT,
    status VARCHAR(50) DEFAULT 'active' NOT NULL CHECK (status IN (
        'active', 'inactive', 'onboarding', 'suspended'
    )),
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client metrics
CREATE TABLE client_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
    total_meetings INTEGER DEFAULT 0,
    total_content_pieces INTEGER DEFAULT 0,
    active_workflows INTEGER DEFAULT 0,
    total_workflow_executions INTEGER DEFAULT 0,
    successful_workflow_executions INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ,
    last_meeting_at TIMESTAMPTZ,
    last_content_generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client team members
CREATE TABLE client_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'owner', 'admin', 'editor', 'viewer'
    )),
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'declined', 'revoked'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_industry ON clients(industry);
CREATE INDEX idx_clients_created_at ON clients(created_at);
CREATE INDEX idx_client_team_members_client_id ON client_team_members(client_id);
CREATE INDEX idx_client_team_members_user_id ON client_team_members(user_id);
CREATE INDEX idx_client_team_members_status ON client_team_members(status);

-- Row Level Security (RLS) policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_team_members ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create clients" ON clients
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (user_id = auth.uid());

-- Admins can see all clients
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

-- Client team members policies
CREATE POLICY "Users can view client team members" ON client_team_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM clients 
            WHERE id = client_team_members.client_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage team members for own clients" ON client_team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE id = client_team_members.client_id AND user_id = auth.uid()
        )
    );

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_metrics_updated_at BEFORE UPDATE ON client_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_team_members_updated_at BEFORE UPDATE ON client_team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();