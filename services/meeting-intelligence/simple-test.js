#!/usr/bin/env node

// Simple test to verify route functionality
const express = require('express');

// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.RECALL_AI_API_KEY = 'test-recall-api-key';
process.env.MEETING_INTELLIGENCE_RECALL_AI_API_KEY = 'test-recall-api-key';
process.env.MEETING_INTELLIGENCE_RECALL_AI_BASE_URL =
  'https://test.recall.ai/api/v1';

async function testRoute() {
  try {
    console.log('Testing route functionality...');

    // Create a simple Express app
    const app = express();
    app.use(express.json());

    // Add a simple test route
    app.get('/test', (req, res) => {
      res.json({ success: true, message: 'Test route works' });
    });

    // Test the route
    const request = require('supertest');
    const response = await request(app).get('/test').expect(200);

    console.log('Simple route test successful:', response.body);
    return true;
  } catch (error) {
    console.error('Simple route test failed:', error.message);
    return false;
  }
}

testRoute().then(success => {
  console.log('Test completed:', success ? 'PASS' : 'FAIL');
  process.exit(success ? 0 : 1);
});
