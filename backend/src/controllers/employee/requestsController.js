import Request from '../../models/sequelize/Request.js';
import AuditLog from '../../models/sequelize/AuditLog.js';
import Employee from '../../models/sequelize/Employee.js';

/**
 * Create a new request
 * Supports reimbursement, advance, transfer, and shift change requests
 */
const createRequest = async (req, res) => {
  try {
    const { employeeId, _id: userId } = req.user;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found. Please contact HR to link your account.',
      });
    }

    const { requestType, ...requestData } = req.body;

    // Validate request type
    const validTypes = ['reimbursement', 'advance', 'transfer', 'shift_change'];
    if (!validTypes.includes(requestType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request type. Supported types: reimbursement, advance, transfer, shift_change',
      });
    }

    // Validate required fields based on request type
    const validationResult = validateRequestData(requestType, requestData);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
      });
    }

    // Get employee details for approval workflow
    const employee = await Employee.findById(employeeId)
      .populate('jobInfo.manager', '_id')
      .populate('jobInfo.department', '_id name');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found',
      });
    }

    // Create request
    const request = new Request({
      employeeId,
      requestType,
      status: 'pending',
      submittedAt: new Date(),
      ...requestData,
    });

    // Set up approval workflow based on request type
    request.approvalWorkflow = getApprovalWorkflow(requestType, employee);

    await request.save();

    // Log request creation
    await AuditLog.create({
      action: 'REQUEST_CREATED',
      userId,
      employeeId,
      resourceId: request._id,
      details: `Created ${requestType} request`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // TODO: Send notifications to approvers
    // This would typically integrate with a notification service

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: request.toSummary(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating request',
      error: error.message,
    });
  }
};

/**
 * Get all requests for authenticated employee
 */
 const getRequests = async (req, res) => {
  try {
    const { employeeId, _id: userId } = req.user;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found. Please contact HR to link your account.',
      });
    }

    const {
      status,
      requestType,
      page = 1,
      limit = 10,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { employeeId };

    if (status) query.status = status;
    if (requestType) query.requestType = requestType;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [requests, total] = await Promise.all([
      Request.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Request.countDocuments(query),
    ]);

    // Log access
    try {
      await AuditLog.logAction({
        action: 'VIEW',
        severity: 'info',
        entityType: 'Requests',
        entityId: employeeId,
        entityDisplayName: 'Employee Requests',
        userId,
        userRole: req.user.role,
        performedByName: req.user.fullName || req.user.email,
        performedByEmail: req.user.email,
        meta: {
          count: requests.length,
          status,
          requestType,
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    } catch (auditError) {
      console.error('❌ [REQUESTS] Audit log failed:', auditError);
    }

    res.json({
      success: true,
      data: requests,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: requests.length,
        totalRecords: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message,
    });
  }
};

/**
 * Get request by ID
 */
const getRequestById = async (req, res) => {
  try {
    const { employeeId, _id: userId } = req.user;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found. Please contact HR to link your account.',
      });
    }

    const { id } = req.params;

    const request = await Request.findOne({
      _id: id,
      employeeId,
    }).populate('approvalWorkflow.approver', 'personalInfo.firstName personalInfo.lastName role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Log access
    await AuditLog.create({
      action: 'REQUEST_VIEWED',
      userId,
      employeeId,
      resourceId: request._id,
      details: `Viewed ${request.requestType} request`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching request',
      error: error.message,
    });
  }
};

/**
 * Cancel a pending request
 */
 const cancelRequest = async (req, res) => {
  try {
    const { employeeId, _id: userId } = req.user;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found. Please contact HR to link your account.',
      });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const request = await Request.findOne({
      _id: id,
      employeeId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled',
      });
    }

    request.status = 'cancelled';
    request.cancellationReason = reason;
    request.cancelledAt = new Date();
    request.cancelledBy = userId;

    await request.save();

    // Log cancellation
    await AuditLog.create({
      action: 'REQUEST_CANCELLED',
      userId,
      employeeId,
      resourceId: request._id,
      details: `Cancelled ${request.requestType} request${reason ? `: ${reason}` : ''}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // TODO: Send notifications about cancellation
    // This would typically integrate with a notification service

    res.json({
      success: true,
      message: 'Request cancelled successfully',
      data: request.toSummary(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling request',
      error: error.message,
    });
  }
};

/**
 * Validate request data based on type
 */
const validateRequestData = (requestType, data) => {
  switch (requestType) {
    case 'reimbursement':
      if (!data.reimbursement) {
        return { isValid: false, message: 'Reimbursement data is required' };
      }
      const {
        expenseType, amount, description, expenseDate,
      } = data.reimbursement;
      if (!expenseType || !amount || !description || !expenseDate) {
        return {
          isValid: false,
          message: 'Expense type, amount, description, and expense date are required for reimbursement requests',
        };
      }
      if (amount <= 0) {
        return { isValid: false, message: 'Amount must be greater than 0' };
      }
      break;

    case 'advance':
      if (!data.advance) {
        return { isValid: false, message: 'Advance data is required' };
      }
      const { amount: advanceAmount, reason, repaymentMonths } = data.advance;
      if (!advanceAmount || !reason || !repaymentMonths) {
        return {
          isValid: false,
          message: 'Amount, reason, and repayment months are required for advance requests',
        };
      }
      if (advanceAmount <= 0) {
        return { isValid: false, message: 'Amount must be greater than 0' };
      }
      if (repaymentMonths <= 0 || repaymentMonths > 12) {
        return { isValid: false, message: 'Repayment months must be between 1 and 12' };
      }
      break;

    case 'transfer':
      if (!data.transfer) {
        return { isValid: false, message: 'Transfer data is required' };
      }
      const { requestedDepartment, requestedLocation, reason: transferReason } = data.transfer;
      if (!requestedDepartment || !requestedLocation || !transferReason) {
        return {
          isValid: false,
          message: 'Requested department, location, and reason are required for transfer requests',
        };
      }
      break;

    case 'shift_change':
      if (!data.shiftChange) {
        return { isValid: false, message: 'Shift change data is required' };
      }
      const { requestedShift, reason: shiftReason, effectiveDate } = data.shiftChange;
      if (!requestedShift || !shiftReason || !effectiveDate) {
        return {
          isValid: false,
          message: 'Requested shift, reason, and effective date are required for shift change requests',
        };
      }
      break;

    default:
      return { isValid: false, message: 'Invalid request type' };
  }

  return { isValid: true };
}

/**
 * Get approval workflow based on request type and employee
 */
 const getApprovalWorkflow = (requestType, employee) => {
  const workflow = [];

  // All requests go through manager first (if exists)
  if (employee.jobInfo.manager) {
    workflow.push({
      approver: employee.jobInfo.manager._id,
      role: 'manager',
      status: 'pending',
    });
  }

  // Add HR approval for certain request types
  if (['transfer', 'shift_change', 'advance'].includes(requestType)) {
    workflow.push({
      approver: null, // Will be assigned to HR role
      role: 'hr',
      status: 'pending',
    });
  }

  // Add finance approval for reimbursement and advance requests
  if (['reimbursement', 'advance'].includes(requestType)) {
    workflow.push({
      approver: null, // Will be assigned to finance role
      role: 'finance',
      status: 'pending',
    });
  }

  return workflow;
}

/**
 * Approve or reject a request (Manager/HR/Finance only)
 */
 const processRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comments } = req.body;
    const { _id: userId, role } = req.user;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"',
      });
    }

    const request = await Request.findById(id)
      .populate('employeeId', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not in pending status',
      });
    }

    // Find the current approval step for this user
    const currentStep = request.approvalWorkflow.find(
      (step) => step.status === 'pending'
      && (step.approver?.toString() === userId.toString() || step.role === role),
    );

    if (!currentStep) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to process this request at this stage',
      });
    }

    // Update the current step
    currentStep.status = action === 'approve' ? 'approved' : 'rejected';
    currentStep.approver = userId;
    currentStep.comments = comments;
    currentStep.actionDate = new Date();

    // If rejected, mark entire request as rejected
    if (action === 'reject') {
      request.status = 'rejected';
      request.rejectionReason = comments;
      request.finalApprover = userId;
      request.finalApprovalDate = new Date();
    } else {
      // Check if all steps are approved
      const allApproved = request.approvalWorkflow.every(
        (step) => step.status === 'approved',
      );

      if (allApproved) {
        request.status = 'approved';
        request.finalApprover = userId;
        request.finalApprovalDate = new Date();
      }
    }

    await request.save();

    // Log the action
    await AuditLog.create({
      action: `REQUEST_${action.toUpperCase()}D`,
      userId,
      resourceId: request._id,
      details: `${action}d ${request.requestType} request for ${request.employeeId.personalInfo.firstName} ${request.employeeId.personalInfo.lastName}${comments ? `: ${comments}` : ''}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // TODO: Send notifications about approval/rejection
    // This would typically integrate with a notification service

    res.json({
      success: true,
      message: `Request ${action}d successfully`,
      data: request.toSummary(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message,
    });
  }
};

/**
 * Get pending requests for approval (Manager/HR/Finance only)
 */
const getPendingApprovals = async (req, res) => {
  try {
    const { _id: userId, role } = req.user;
    const { page = 1, limit = 10 } = req.query;

    const query = {
      status: 'pending',
      $or: [
        { 'approvalWorkflow.approver': userId, 'approvalWorkflow.status': 'pending' },
        { 'approvalWorkflow.role': role, 'approvalWorkflow.status': 'pending' },
      ],
    };

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      Request.find(query)
        .populate('employeeId', 'employeeId personalInfo.firstName personalInfo.lastName contactInfo.email')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Request.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: requests.length,
        totalRecords: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending approvals',
      error: error.message,
    });
  }
};

export default {
  createRequest,
  getRequests,
  getPendingApprovals,
  processRequest,
  getRequestById,
  cancelRequest,
};