/**
 * Attendance Status Routes
 * 
 * Provides status options for attendance management UI components.
 * 
 * Attendance Logic Summary:
 * - Working Day: Clock-in/out required. No clock-in = Leave (not absent)
 * - Holiday/Festival: No clock-in/out required. System skips finalization
 * - Leave Day: Approved leave = No clock-in required, marked as Leave
 * 
 * Status Types:
 * - present: Full attendance with proper clock-in/out
 * - half_day: Partial attendance (less than full day hours)
 * - leave: No clock-in OR missing clock-out OR approved leave
 * - incomplete: Pending finalization (temporary status)
 * - holiday: System-detected holiday (auto-status)
 * - pending_correction: Correction request submitted
 */

import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';

const router = express.Router();

// Get attendance status options
router.get('/', authenticate, async (req, res) => {
  try {
    // ✅ UPDATED: Correct status values with proper colors
    const statusOptions = [
      { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800' },
      { value: 'leave', label: 'On Leave', color: 'bg-blue-100 text-blue-800' }, // ✅ FIXED
      { value: 'half_day', label: 'Half Day', color: 'bg-purple-100 text-purple-800' },
      { value: 'incomplete', label: 'Incomplete', color: 'bg-orange-100 text-orange-800' }, // ✅ ADDED
      { value: 'holiday', label: 'Holiday', color: 'bg-purple-100 text-purple-800' },
      { value: 'pending_correction', label: 'Pending Correction', color: 'bg-gray-100 text-gray-800' } // ✅ ADDED
    ];

    res.json({
      success: true,
      data: statusOptions,
      message: 'Attendance status options retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching attendance status options:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch attendance status options'
      }
    });
  }
});

// Get filter options for attendance management
router.get('/filters', authenticate, async (req, res) => {
  try {
    // ✅ UPDATED: Correct status values aligned with attendance finalization logic
    const filterOptions = [
      { value: 'all', label: 'All Status' },
      { value: 'present', label: 'Present' },
      { value: 'leave', label: 'On Leave' }, // ✅ FIXED: Use 'leave' instead of 'on_leave'
      { value: 'half_day', label: 'Half Day' },
      { value: 'incomplete', label: 'Incomplete' }, // ✅ ADDED: Missing clock-out status
      { value: 'holiday', label: 'Holiday' },
      { value: 'pending_correction', label: 'Pending Correction' }, // ✅ ADDED: Correction status
    ];

    res.json({
      success: true,
      data: filterOptions,
      message: 'Attendance filter options retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching attendance filter options:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch attendance filter options'
      }
    });
  }
});

export default router;