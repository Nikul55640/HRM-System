import express from "express";
import systemPolicyController from "../../controllers/admin/systemPolicy.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { checkPermission } from "../../middleware/checkPermission.js";
import { MODULES } from "../../config/rolePermissions.js";

const router = express.Router();

/* ============================================================
   SYSTEM POLICY ROUTES — SUPERADMIN ONLY
   Manages attendance, leave, shift, security, and general policies
   ============================================================ */

/* -----------------------------------
   GET ALL POLICIES
   Permission: SuperAdmin only
----------------------------------- */
router.get(
    "/",
    authenticate,
    checkPermission(MODULES.SYSTEM.MANAGE_POLICIES),
    systemPolicyController.getAllPolicies
);

/* -----------------------------------
   GET POLICIES BY TYPE
   Permission: SuperAdmin only
----------------------------------- */
router.get(
    "/type/:type",
    authenticate,
    checkPermission(MODULES.SYSTEM.MANAGE_POLICIES),
    systemPolicyController.getPoliciesByType
);

/* -----------------------------------
   GET SPECIFIC POLICY BY KEY
   Permission: SuperAdmin only
----------------------------------- */
router.get(
    "/key/:key",
    authenticate,
    checkPermission(MODULES.SYSTEM.MANAGE_POLICIES),
    systemPolicyController.getPolicyByKey
);

/* -----------------------------------
   CREATE NEW POLICY
   Permission: SuperAdmin only
----------------------------------- */
router.post(
    "/",
    authenticate,
    checkPermission(MODULES.SYSTEM.MANAGE_POLICIES),
    systemPolicyController.createPolicy
);

/* -----------------------------------
   UPDATE POLICY
   Permission: SuperAdmin only
----------------------------------- */
router.put(
    "/key/:key",
    authenticate,
    checkPermission(MODULES.SYSTEM.MANAGE_POLICIES),
    systemPolicyController.updatePolicy
);

/* -----------------------------------
   RESET POLICY TO DEFAULT
   Permission: SuperAdmin only
----------------------------------- */
router.patch(
    "/key/:key/reset",
    authenticate,
    checkPermission(MODULES.SYSTEM.MANAGE_POLICIES),
    systemPolicyController.resetPolicyToDefault
);

/* -----------------------------------
   INITIALIZE DEFAULT POLICIES
   Permission: SuperAdmin only
----------------------------------- */
router.post(
    "/initialize-defaults",
    authenticate,
    checkPermission(MODULES.SYSTEM.MANAGE_POLICIES),
    systemPolicyController.initializeDefaultPolicies
);

/* -----------------------------------
   BULK UPDATE POLICIES
   Permission: SuperAdmin only
----------------------------------- */
router.patch(
    "/bulk-update",
    authenticate,
    checkPermission(MODULES.SYSTEM.MANAGE_POLICIES),
    systemPolicyController.bulkUpdatePolicies
);

/* -----------------------------------
   EXPORT POLICIES
   Permission: SuperAdmin only
----------------------------------- */
router.get(
    "/export",
    authenticate,
    checkPermission(MODULES.SYSTEM.MANAGE_POLICIES),
    systemPolicyController.exportPolicies
);

export default router;