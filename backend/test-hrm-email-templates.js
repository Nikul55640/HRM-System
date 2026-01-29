/**
 * HRM Email Templates Test Script
 * Tests all HRM email templates with Resend
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import { render } from '@react-email/render';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import HRM email templates
import { AttendanceAbsent } from './src/emails/templates/AttendanceAbsent.js';
import { CorrectionRequired