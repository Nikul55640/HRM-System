/**
 * Holiday Selection Template Routes
 * API endpoints for managing holiday selection templates
 */

import express from 'express';
import holidaySelectionTemplateController from '../../controllers/admin/holidaySelectionTemplate.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/requireRoles.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Apply role-based access control (SuperAdmin and HR only)
router.use(requireRoles(['SuperAdmin', 'HR']));

/**
 * @route GET /api/admin/holiday-templates
 * @desc Get all holiday selection templates
 * @access SuperAdmin, HR
 */
router.get('/', holidaySelectionTemplateController.getTemplates);

/**
 * @route GET /api/admin/holiday-templates/:id
 * @desc Get holiday selection template by ID
 * @access SuperAdmin, HR
 */
router.get('/:id', holidaySelectionTemplateController.getTemplateById);

/**
 * @route POST /api/admin/holiday-templates
 * @desc Create new holiday selection template
 * @access SuperAdmin, HR
 */
router.post('/', holidaySelectionTemplateController.createTemplate);

/**
 * @route PUT /api/admin/holiday-templates/:id
 * @desc Update holiday selection template
 * @access SuperAdmin, HR
 */
router.put('/:id', holidaySelectionTemplateController.updateTemplate);

/**
 * @route DELETE /api/admin/holiday-templates/:id
 * @desc Delete holiday selection template
 * @access SuperAdmin, HR
 */
router.delete('/:id', holidaySelectionTemplateController.deleteTemplate);

/**
 * @route GET /api/admin/holiday-templates/default/:country
 * @desc Get default template for country
 * @access SuperAdmin, HR
 */
router.get('/default/:country', holidaySelectionTemplateController.getDefaultTemplate);

/**
 * @route POST /api/admin/holiday-templates/:templateId/apply
 * @desc Apply template to filter holidays
 * @access SuperAdmin, HR
 */
router.post('/:templateId/apply', holidaySelectionTemplateController.applyTemplate);

/**
 * @route POST /api/admin/holiday-templates/:id/clone
 * @desc Clone holiday selection template
 * @access SuperAdmin, HR
 */
router.post('/:id/clone', holidaySelectionTemplateController.cloneTemplate);

/**
 * @route GET /api/admin/holiday-templates/:templateId/preview
 * @desc Preview holidays with template selection
 * @access SuperAdmin, HR
 */
router.get('/:templateId/preview', holidaySelectionTemplateController.previewWithTemplate);

export default router;