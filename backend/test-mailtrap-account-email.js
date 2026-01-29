/**
 * Test Script: Check Mailtrap Account Email
 * 
 * This script tests different email addresses to find which one
 * is associated with the Mailtrap account.
 */

import dotenv from 'dotenv';
import { sendEmail, verifyEmailConfig } from './src/services/email/email.service.js';
import { AttendanceAbsent } from './src/emails/templates/AttendanceAbsent.js';
import { render } from '@react-email/render';

// Load environment variables
dotenv.config();

async function testMailtrapAccountEmail() {
  console.log('🔍 Testing Mailtrap Account Email Addresses');
  console.log('=' .repeat(60));

  // List of possible account emails to test
  const testEmails = [
    'n.com',
    'your-email@gmail.com', // Replace with actual account email
    'test@example.com',
    'admin@example.com'
  ];

  try {
    for (const email of testEmails) {
      console.log(`\n📧 Testing email: ${email}`);
      
      const absentTemplate = AttendanceAbsent({
        employeeName: 'Test Employee',
        date: new Date().toLocaleDateString(),
        reason: `Test email to check account email: ${email}`,
        actionUrl: `${process.env.FRONTEND_URL}/attendance/corrections`
      });
      
      const result = await sendEmail({
        to: email,
        subject: `[TEST] Account Email Check - ${email}`,
        html: render(absentTemplate),
        metadata: {
          category: 'test',
          type: 'account_check'
        }
      });
      
      if (result.success) {
        console.log(`✅ SUCCESS! ${email} is the account email`);
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`\n🎉 Found the correct account email: ${email}`);
        console.log('📬 Check this email inbox for the test message');
        break;
      } else {
        console.log(`❌ Failed: ${email}`);
        console.log(`   Error: ${result.error}`);
      }

      // Wait 2 seconds between attempts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🔍 Account email testing completed!');
    console.log('💡 The successful email address is your Mailtrap account email');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('💥 Account email test failed:', error);
    process.exit(1);
  }
}

// Verify configuration first
async function verifyConfig() {
  console.log('🔧 Verifying email configuration...');
  
  const config = await verifyEmailConfig();
  
  if (!config.valid) {
    console.error('❌ Email configuration invalid:', config.error);
    process.exit(1);
  }
  
  console.log('✅ Email configuration is valid');
  console.log(`   Provider: ${config.provider}`);
  console.log(`   From: ${config.fromEmail}`);
  
  return config;
}

// Main execution
async function main() {
  try {
    await verifyConfig();
    await testMailtrapAccountEmail();
  } catch (error) {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  }
}

// Run the test
main();