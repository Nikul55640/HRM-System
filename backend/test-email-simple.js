/**
 * Simple Email Test Script
 * Tests Resend email service without server dependencies
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Simple email template using React.createElement
const SimpleTestEmail = ({ employeeName, testType }) => 
  React.createElement('html', null,
    React.createElement('head', null,
      React.createElement('title', null, 'HRM Test Email')
    ),
    React.createElement('body', { style: { fontFamily: 'Arial, sans-serif', padding: '20px' } },
      React.createElement('div', { style: { maxWidth: '600px', margin: '0 auto' } },
        React.createElement('h1', { style: { color: '#2563eb' } }, 'HRM System Test Email'),
        React.createElement('p', null, `Hi ${employeeName},`),
        React.createElement('p', null, `This is a test email of type: ${testType}`),
        React.createElement('p', null, 'If you received this email, the Resend integration is working correctly!'),
        React.createElement('hr', { style: { margin: '20px 0' } }),
        React.createElement('p', { style: { fontSize: '12px', color: '#666' } },
          'This is an automated test message from HRM System.'
        )
      )
    )
  );

async function testEmailSending() {
  console.log('🚀 Starting Simple Email Test');
  console.log('📧 Note: Testing mode - sending to nikul@techysquad.com (account owner)');
  console.log('🎯 This simulates sending to np425771@gmail.com');
  console.log('=' .repeat(50));

  // Check environment variables
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment');
    return;
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    console.error('❌ RESEND_FROM_EMAIL not found in environment');
    return;
  }

  console.log('✅ Environment variables loaded');
  console.log(`   From: ${process.env.RESEND_FROM_EMAIL}`);
  console.log(`   API Key: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);

  try {
    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Test 1: Simple test email
    console.log('\n📧 Sending test email...');
    
    const template = SimpleTestEmail({
      employeeName: 'Test Employee',
      testType: 'Simple Integration Test'
    });

    const html = render(template);

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: 'nikul@techysquad.com', // Testing mode - can only send to account owner
      subject: 'HRM System - Email Integration Test (for np425771@gmail.com)',
      html,
      tags: [
        { name: 'category', value: 'test' },
        { name: 'type', value: 'integration_test' },
      ],
    });

    if (response.error) {
      console.error('❌ Email failed:', response.error);
    } else {
      console.log('✅ Email sent successfully!');
      console.log(`   Email ID: ${response.data?.id}`);
      console.log(`   To: nikul@techysquad.com (testing mode)`);
      console.log(`   Simulating: np425771@gmail.com`);
    }

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Email test completed!');
    console.log('📬 Check np425771@gmail.com inbox (and spam folder)');
    console.log('📊 Monitor delivery at: https://resend.com/emails');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('💥 Email test failed:', error.message);
  }
}

// Run the test
testEmailSending();