import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';

const router = express.Router();

// Get event types for calendar filters
router.get('/', authenticate, async (req, res) => {
  try {
    const eventTypes = [
      { 
        value: 'holiday', 
        label: 'Holidays', 
        color: 'bg-red-100 text-red-800',
        description: 'Company holidays and public holidays'
      },
      { 
        value: 'meeting', 
        label: 'Meetings', 
        color: 'bg-blue-100 text-blue-800',
        description: 'Team meetings and conferences'
      },
      { 
        value: 'training', 
        label: 'Training', 
        color: 'bg-green-100 text-green-800',
        description: 'Training sessions and workshops'
      },
      { 
        value: 'company_event', 
        label: 'Company Events', 
        color: 'bg-purple-100 text-purple-800',
        description: 'Company-wide events and celebrations'
      },
      { 
        value: 'birthday', 
        label: 'Birthdays', 
        color: 'bg-pink-100 text-pink-800',
        description: 'Employee birthdays'
      },
      { 
        value: 'anniversary', 
        label: 'Anniversaries', 
        color: 'bg-indigo-100 text-indigo-800',
        description: 'Work anniversaries'
      }
    ];

    res.json({
      success: true,
      data: eventTypes,
      message: 'Event types retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch event types'
      }
    });
  }
});

export default router;