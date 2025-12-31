import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';

const router = express.Router();

// Get work location options
router.get('/', authenticate, async (req, res) => {
  try {
    const workLocations = [
      {
        value: 'office',
        label: 'Office',
        description: 'Working from company office',
        icon: 'Building2',
        isActive: true
      },
      {
        value: 'wfh',
        label: 'Work From Home',
        description: 'Working remotely from home',
        icon: 'Home',
        isActive: true
      },
      {
        value: 'client_site',
        label: 'Client Site',
        description: 'Working at client location',
        icon: 'Users',
        isActive: true,
        requiresDetails: true
      }
    ];

    res.json({
      success: true,
      data: workLocations,
      message: 'Work locations retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching work locations:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch work locations'
      }
    });
  }
});

export default router;