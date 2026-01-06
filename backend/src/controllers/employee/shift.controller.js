import { EmployeeShift, Shift, Employee } from '../../models/index.js';
import { Op } from 'sequelize';

// Get employee's shift assignments
export const getMyShifts = async (req, res) => {
    try {
        console.log('🔄 [SHIFT CONTROLLER] Getting shifts for user:', req.user);
        
        const employeeId = req.user.employee?.id;
        
        if (!employeeId) {
            console.log('❌ [SHIFT CONTROLLER] No employee ID found for user:', req.user.id);
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EMPLOYEE_NOT_FOUND',
                    message: 'Employee profile not found for this user'
                }
            });
        }

        console.log('📋 [SHIFT CONTROLLER] Fetching shifts for employee ID:', employeeId);

        const shiftAssignments = await EmployeeShift.findAll({
            where: { employeeId },
            include: [
                {
                    model: Shift,
                    as: 'shift',
                    attributes: [
                        'id', 'shiftName', 'shiftCode', 'shiftStartTime', 'shiftEndTime',
                        'fullDayHours', 'halfDayHours', 'gracePeriodMinutes',
                        'maxBreakMinutes', 'overtimeEnabled', 'weeklyOffDays'
                    ]
                }
            ],
            order: [['effectiveDate', 'DESC']]
        });

        console.log('✅ [SHIFT CONTROLLER] Found shift assignments:', shiftAssignments.length);

        res.json({
            success: true,
            data: { shiftAssignments }
        });
    } catch (error) {
        console.error('❌ [SHIFT CONTROLLER] Error fetching shift assignments:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_SHIFTS_ERROR',
                message: 'Failed to fetch shift assignments'
            }
        });
    }
};

// Get current active shift
export const getCurrentShift = async (req, res) => {
    try {
        console.log('🔄 [SHIFT CONTROLLER] Getting current shift for user:', req.user);
        
        const employeeId = req.user.employee?.id;
        const today = new Date();

        if (!employeeId) {
            console.log('❌ [SHIFT CONTROLLER] No employee ID found for user:', req.user.id);
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EMPLOYEE_NOT_FOUND',
                    message: 'Employee profile not found for this user'
                }
            });
        }

        console.log('📋 [SHIFT CONTROLLER] Fetching current shift for employee ID:', employeeId);

        const currentShift = await EmployeeShift.findOne({
            where: {
                employeeId,
                effectiveDate: { [Op.lte]: today },
                [Op.or]: [
                    { endDate: null },
                    { endDate: { [Op.gte]: today } }
                ]
            },
            include: [
                {
                    model: Shift,
                    as: 'shift',
                    attributes: [
                        'id', 'shiftName', 'shiftCode', 'shiftStartTime', 'shiftEndTime',
                        'fullDayHours', 'halfDayHours', 'gracePeriodMinutes',
                        'lateThresholdMinutes', 'earlyDepartureThresholdMinutes',
                        'maxBreakMinutes', 'overtimeEnabled', 'overtimeThresholdMinutes',
                        'weeklyOffDays'
                    ]
                }
            ],
            order: [['effectiveDate', 'DESC']]
        });

        if (!currentShift) {
            console.log('❌ [SHIFT CONTROLLER] No active shift found for employee:', employeeId);
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NO_ACTIVE_SHIFT',
                    message: 'No active shift assignment found'
                }
            });
        }

        console.log('✅ [SHIFT CONTROLLER] Found current shift:', currentShift.id);

        res.json({
            success: true,
            data: { currentShift }
        });
    } catch (error) {
        console.error('❌ [SHIFT CONTROLLER] Error fetching current shift:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_CURRENT_SHIFT_ERROR',
                message: 'Failed to fetch current shift'
            }
        });
    }
};

// Get shift schedule (weekly/monthly view)
export const getShiftSchedule = async (req, res) => {
    try {
        const employeeId = req.user.employee?.id;
        const { startDate, endDate, view = 'weekly' } = req.query;

        let dateRange = {};
        if (startDate && endDate) {
            dateRange = {
                effectiveDate: { [Op.lte]: endDate },
                [Op.or]: [
                    { endDate: null },
                    { endDate: { [Op.gte]: startDate } }
                ]
            };
        } else {
            // Default to current week/month
            const today = new Date();
            const start = new Date(today);
            const end = new Date(today);

            if (view === 'weekly') {
                start.setDate(today.getDate() - today.getDay()); // Start of week
                end.setDate(start.getDate() + 6); // End of week
            } else {
                start.setDate(1); // Start of month
                end.setMonth(today.getMonth() + 1, 0); // End of month
            }

            dateRange = {
                effectiveDate: { [Op.lte]: end },
                [Op.or]: [
                    { endDate: null },
                    { endDate: { [Op.gte]: start } }
                ]
            };
        }

        const schedule = await EmployeeShift.findAll({
            where: {
                employeeId,
                ...dateRange
            },
            include: [
                {
                    model: Shift,
                    as: 'shift',
                    attributes: [
                        'id', 'shiftName', 'shiftCode', 'shiftStartTime', 'shiftEndTime',
                        'weeklyOffDays', 'fullDayHours'
                    ]
                }
            ],
            order: [['effectiveDate', 'ASC']]
        });

        res.json({
            success: true,
            data: {
                schedule,
                view,
                dateRange: { startDate, endDate }
            }
        });
    } catch (error) {
        console.error('Error fetching shift schedule:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_SCHEDULE_ERROR',
                message: 'Failed to fetch shift schedule'
            }
        });
    }
};

// Request shift change
export const requestShiftChange = async (req, res) => {
    try {
        const employeeId = req.user.employee?.id;
        const { requestedShiftId, effectiveDate, reason } = req.body;

        // Validation
        if (!requestedShiftId || !effectiveDate || !reason) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Requested shift, effective date, and reason are required'
                }
            });
        }

        // Check if requested shift exists
        const requestedShift = await Shift.findByPk(requestedShiftId);
        if (!requestedShift) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'SHIFT_NOT_FOUND',
                    message: 'Requested shift not found'
                }
            });
        }

        // For now, we'll create a simple shift change request
        // In a full implementation, you might have a separate ShiftChangeRequest model
        const changeRequest = {
            employeeId,
            currentShiftId: null, // Would get from current assignment
            requestedShiftId,
            effectiveDate,
            reason,
            status: 'pending',
            requestedAt: new Date(),
            requestedBy: req.user.id
        };

        // Here you would typically save to a ShiftChangeRequest table
        // For now, we'll just return the request data
        res.status(201).json({
            success: true,
            data: { changeRequest },
            message: 'Shift change request submitted successfully. HR will review your request.'
        });
    } catch (error) {
        console.error('Error submitting shift change request:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SHIFT_CHANGE_REQUEST_ERROR',
                message: 'Failed to submit shift change request'
            }
        });
    }
};