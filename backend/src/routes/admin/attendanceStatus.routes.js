import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';

const router = express.Router();

// Get attendance status options
router.get('/', authenticate, async (req, res) => {
  try {
    const statusOptions = [
      { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800' },
      { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800' },
      { value: 'late', label: 'Late', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'half_day', label: 'Half Day', color: 'bg-orange-100 text-orange-800' },
      { value: 'on_leave', label: 'On Leave', color: 'bg-blue-100 text-blue-800' },
      { value: 'holiday', label: 'Holiday', color: 'bg-purple-100 text-purple-800' }
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
    const filterOptions = [
      { value: 'all', label: 'All Status' },
      { value: 'present', label: 'Present' },
      { value: 'absent', label: 'Absent' },
      { value: 'late', label: 'Late' },
      { value: 'half_day', label: 'Half Day' },
      { value: 'on_leave', label: 'On Leave' },
      { value: 'holiday', label: 'Holiday' }
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