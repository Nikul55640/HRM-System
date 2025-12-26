import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * Wrapper for consistent API responses
 */
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
    });
};

// Get all payslips for employee
router.get('/payslips', authenticate, async (req, res) => {
    try {
        // For now, return empty array as payslips system is not implemented
        const payslips = [];

        return sendResponse(res, true, "Payslips retrieved successfully", {
            payslips,
            pagination: {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
            }
        });
    } catch (error) {
        logger.error("Get Payslips Error", error);
        return sendResponse(res, false, "Internal server error", null, 500);
    }
});

// Get specific payslip
router.get('/payslips/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // For now, return null as payslips system is not implemented
        return sendResponse(res, false, "Payslip not found", null, 404);
    } catch (error) {
        logger.error("Get Payslip Error", error);
        return sendResponse(res, false, "Internal server error", null, 500);
    }
});

// Download payslip
router.get('/payslips/:id/download', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // For now, return error as payslips system is not implemented
        return sendResponse(res, false, "Payslip download not available", null, 404);
    } catch (error) {
        logger.error("Download Payslip Error", error);
        return sendResponse(res, false, "Internal server error", null, 500);
    }
});

export default router;