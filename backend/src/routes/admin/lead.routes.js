import express from 'express';
import leadController from '../../controllers/admin/lead.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';

const router = express.Router();

/* ============================================================
   LEAD ROUTES — HR & SUPERADMIN
   Simplified lead management with JSON-based notes
   ============================================================ */

/* -----------------------------------
   GET ALL LEADS
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
    '/',
    authenticate,
    checkAnyPermission([
        MODULES.LEAD.VIEW_ALL,
        MODULES.LEAD.VIEW_TEAM,
    ]),
    leadController.getLeads
);

/* -----------------------------------
   GET LEAD ANALYTICS
   Permission: HR & SuperAdmin
----------------------------------- */
router.get(
    '/analytics',
    authenticate,
    checkAnyPermission([
        MODULES.LEAD.VIEW_ALL,
        MODULES.LEAD.MANAGE,
    ]),
    leadController.getLeadAnalytics
);

/* -----------------------------------
   GET MY ASSIGNED LEADS
   Permission: All authenticated users
----------------------------------- */
router.get(
    '/my-leads',
    authenticate,
    leadController.getMyLeads
);

/* -----------------------------------
   GET LEAD BY ID
   Permission: HR, SuperAdmin, or assigned employee
----------------------------------- */
router.get(
    '/:id',
    authenticate,
    checkAnyPermission([
        MODULES.LEAD.VIEW_ALL,
        MODULES.LEAD.VIEW_TEAM,
        MODULES.LEAD.VIEW_OWN,
    ]),
    leadController.getLeadById
);

/* -----------------------------------
   CREATE NEW LEAD
   Permission: HR & SuperAdmin
----------------------------------- */
router.post(
    '/',
    authenticate,
    checkPermission(MODULES.LEAD.CREATE),
    leadController.createLead
);

/* -----------------------------------
   UPDATE LEAD
   Permission: HR, SuperAdmin, or assigned employee
----------------------------------- */
router.put(
    '/:id',
    authenticate,
    checkAnyPermission([
        MODULES.LEAD.UPDATE_ANY,
        MODULES.LEAD.UPDATE_OWN,
    ]),
    leadController.updateLead
);

/* -----------------------------------
   ASSIGN LEAD TO EMPLOYEE
   Permission: HR & SuperAdmin
----------------------------------- */
router.patch(
    '/:id/assign',
    authenticate,
    checkPermission(MODULES.LEAD.ASSIGN),
    leadController.assignLead
);

/* -----------------------------------
   UPDATE LEAD STATUS
   Permission: HR, SuperAdmin, or assigned employee
----------------------------------- */
router.patch(
    '/:id/status',
    authenticate,
    checkAnyPermission([
        MODULES.LEAD.UPDATE_ANY,
        MODULES.LEAD.UPDATE_OWN,
    ]),
    leadController.updateLeadStatus
);

/* -----------------------------------
   ADD FOLLOW-UP NOTE
   Permission: HR, SuperAdmin, or assigned employee
----------------------------------- */
router.post(
    '/:id/notes',
    authenticate,
    checkAnyPermission([
        MODULES.LEAD.UPDATE_ANY,
        MODULES.LEAD.UPDATE_OWN,
    ]),
    leadController.addFollowUpNote
);

export default router;