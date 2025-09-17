-- Seed data for subscription plans
INSERT INTO subscription_plans (id, name, description, monthly_price, setup_price, max_meetings, max_workflows, max_storage_gb, max_users, features, is_active) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Starter',
    'Perfect for individuals and small teams getting started with AI automation',
    29.00,
    0.00,
    50,
    5,
    10,
    1,
    '{
        "meeting_recording": true,
        "transcription": true,
        "action_item_extraction": true,
        "basic_content_generation": true,
        "email_support": true,
        "basic_analytics": true,
        "single_integration": true
    }',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Professional',
    'Ideal for growing teams that need advanced automation and multiple integrations',
    99.00,
    0.00,
    200,
    20,
    50,
    5,
    '{
        "meeting_recording": true,
        "transcription": true,
        "action_item_extraction": true,
        "advanced_content_generation": true,
        "priority_support": true,
        "advanced_analytics": true,
        "multiple_integrations": true,
        "workflow_automation": true,
        "brand_voice_profiles": true,
        "team_collaboration": true
    }',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Business',
    'Comprehensive solution for established businesses with complex automation needs',
    299.00,
    0.00,
    1000,
    100,
    200,
    25,
    '{
        "meeting_recording": true,
        "transcription": true,
        "action_item_extraction": true,
        "advanced_content_generation": true,
        "dedicated_support": true,
        "comprehensive_analytics": true,
        "unlimited_integrations": true,
        "advanced_workflow_automation": true,
        "unlimited_brand_voice_profiles": true,
        "team_collaboration": true,
        "custom_workflows": true,
        "api_access": true,
        "white_labeling": false
    }',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Enterprise',
    'Full-featured solution with custom integrations and dedicated support',
    999.00,
    5000.00,
    -1,
    -1,
    1000,
    -1,
    '{
        "meeting_recording": true,
        "transcription": true,
        "action_item_extraction": true,
        "advanced_content_generation": true,
        "dedicated_support": true,
        "comprehensive_analytics": true,
        "unlimited_integrations": true,
        "advanced_workflow_automation": true,
        "unlimited_brand_voice_profiles": true,
        "team_collaboration": true,
        "custom_workflows": true,
        "api_access": true,
        "white_labeling": true,
        "custom_integrations": true,
        "dedicated_infrastructure": true,
        "sla_guarantee": true,
        "custom_training": true
    }',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'Free Trial',
    '14-day free trial to explore Qylon features',
    0.00,
    0.00,
    10,
    2,
    1,
    1,
    '{
        "meeting_recording": true,
        "transcription": true,
        "action_item_extraction": true,
        "basic_content_generation": true,
        "email_support": true,
        "basic_analytics": true,
        "single_integration": true,
        "trial_limitations": true
    }',
    true
);

-- Update sequence to avoid conflicts
SELECT setval('subscription_plans_id_seq', 1000, false);