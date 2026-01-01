import express from 'express';
import {
  getEmergencyContacts,
  getEmergencyContact,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  setPrimaryEmergencyContact,
} from '../../controllers/employee/emergencyContacts.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateEmergencyContact } from '../../validators/emergencyContactValidator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Emergency contacts CRUD routes
router.get('/', getEmergencyContacts);
router.get('/:id', getEmergencyContact);
router.post('/', validateEmergencyContact, createEmergencyContact);
router.put('/:id', validateEmergencyContact, updateEmergencyContact);
router.delete('/:id', deleteEmergencyContact);

// Set primary contact
router.patch('/:id/set-primary', setPrimaryEmergencyContact);

export default router;