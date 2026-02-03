import { Employee, User } from '../../models/index.js';
import { validateIFSC } from '../../validators/bankDetailsValidator.js';
import notificationService from '../../services/notificationService.js';
import { ROLES } from '../../config/roles.js';

/**
 * Helper function to mask account number
 */
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return '';
  const str = accountNumber.toString();
  if (str.length <= 4) return str;
  return 'X'.repeat(str.length - 4) + str.slice(-4);
};

/**
 * Get bank details for the authenticated employee
 * Returns masked account number for security
 */
const getBankDetails = async (req, res) => {
  try {
    const { employee, role } = req.user;

    console.log('🏦 [BANK DETAILS] Full req.user:', req.user);
    console.log('🏦 [BANK DETAILS] Employee data:', employee);
    console.log('🏦 [BANK DETAILS] User role:', role);

    // Special case for SuperAdmin who might not have an employee profile
    if (!employee) {
      const userSystemRole = role || req.user.systemRole || req.user.role;
      if (userSystemRole === ROLES.SUPER_ADMIN) {
        return res.status(200).json({
          success: true,
          message: 'SuperAdmin users do not have employee records or bank details',
          data: {
            accountHolderName: "",
            accountNumber: "",
            maskedAccountNumber: "",
            ifscCode: "",
            bankName: "",
            branchName: "",
            accountType: "savings",
            isVerified: false,
          }
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found. Please contact HR to create your employee profile.',
      });
    }

    // Find employee by userId instead of employee.id
    const employeeRecord = await Employee.findOne({
      where: { userId: req.user.id }
    });

    console.log('🏦 [BANK DETAILS] Employee found:', !!employeeRecord);
    console.log('🏦 [BANK DETAILS] Bank details exist:', !!employeeRecord?.bankDetails);
    console.log('🏦 [BANK DETAILS] Bank details content:', employeeRecord?.bankDetails);

    if (!employeeRecord) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found',
      });
    }

    // If no bank details exist, return empty structure instead of 404
    if (!employeeRecord.bankDetails || Object.keys(employeeRecord.bankDetails).length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No bank details found',
        data: {
          accountHolderName: "",
          accountNumber: "",
          maskedAccountNumber: "",
          ifscCode: "",
          bankName: "",
          branchName: "",
          accountType: "savings",
          isVerified: false,
        }
      });
    }

    // Return bank details with masked account number
    const bankDetails = {
      accountNumber: employeeRecord.bankDetails.accountNumber, // REAL
      maskedAccountNumber: maskAccountNumber(employeeRecord.bankDetails.accountNumber), // DISPLAY
      bankName: employeeRecord.bankDetails.bankName,
      ifscCode: employeeRecord.bankDetails.ifscCode,
      accountHolderName: employeeRecord.bankDetails.accountHolderName,
      accountType: employeeRecord.bankDetails.accountType,
      branchName: employeeRecord.bankDetails.branchName,
      isVerified: employeeRecord.bankDetails.isVerified || false,
      verifiedAt: employeeRecord.bankDetails.verifiedAt,
    };

    console.log('✅ [BANK DETAILS] Returning masked details');

    res.json({
      success: true,
      data: bankDetails,
    });
  } catch (error) {
    console.error('❌ [BANK DETAILS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank details',
      error: error.message,
    });
  }
};

/**
 * Update bank details for the authenticated employee
 * Requires HR approval before changes are reflected
 */
const updateBankDetails = async (req, res) => {
  try {
    const { employee, id: userId, role } = req.user;
    const {
      accountNumber,
      bankName,
      ifscCode,
      accountHolderName,
      accountType,
      branchName,
    } = req.body;

    // Special case for SuperAdmin who might not have an employee profile
    if (!employee) {
      const userSystemRole = role || req.user.systemRole || req.user.role;
      if (userSystemRole === ROLES.SUPER_ADMIN) {
        return res.status(400).json({
          success: false,
          message: 'SuperAdmin users do not have employee records. Bank details are not applicable.',
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found. Please contact HR to create your employee profile.',
      });
    }

    // Validate required fields
    if (!accountNumber || !bankName || !ifscCode || !accountHolderName) {
      return res.status(400).json({
        success: false,
        message: 'Account number, bank name, IFSC code, and account holder name are required',
      });
    }

    // Validate IFSC code format
    if (!validateIFSC(ifscCode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IFSC code format',
      });
    }

    // Find employee by userId
    const employeeRecord = await Employee.findOne({
      where: { userId: req.user.id }
    });

    if (!employeeRecord) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Update bank details
    const bankDetails = {
      accountNumber,
      bankName,
      ifscCode: ifscCode.toUpperCase(),
      accountHolderName,
      accountType: accountType || 'Savings',
      branchName,
      isVerified: false, // Reset to false on update
      verifiedAt: null,
      verifiedBy: null,
    };

    await employeeRecord.update({
      bankDetails,
      updatedBy: userId
    });

    // 🔔 Send notification to HR/Admin about new bank details submission
    try {
      const adminRoles = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
      await notificationService.sendToRoles(adminRoles, {
        title: 'New Bank Details Submitted 🏦',
        message: `${req.user.firstName} ${req.user.lastName} has submitted bank details for verification.`,
        type: 'info',
        category: 'bank',
        metadata: {
          employeeId: employeeRecord.id,
          employeeName: `${req.user.firstName} ${req.user.lastName}`,
          bankName: bankDetails.bankName,
          accountHolderName: bankDetails.accountHolderName,
          submittedBy: req.user.firstName + ' ' + req.user.lastName
        }
      });

      // Send confirmation to employee
      await notificationService.sendToUser(req.user.id, {
        title: 'Bank Details Submitted ✅',
        message: 'Your bank details have been submitted successfully and are pending HR verification.',
        type: 'success',
        category: 'bank',
        metadata: {
          bankName: bankDetails.bankName,
          accountHolderName: bankDetails.accountHolderName,
          status: 'pending_verification'
        }
      });
    } catch (notificationError) {
      console.error("Failed to send bank details submission notification:", notificationError);
      // Don't fail the main operation if notification fails
    }

    res.json({
      success: true,
      message: 'Bank details updated successfully. Pending HR verification.',
      data: {
        accountNumber: bankDetails.accountNumber, // REAL for editing
        maskedAccountNumber: maskAccountNumber(bankDetails.accountNumber), // DISPLAY
        bankName: bankDetails.bankName,
        ifscCode: bankDetails.ifscCode,
        accountHolderName: bankDetails.accountHolderName,
        accountType: bankDetails.accountType,
        branchName: bankDetails.branchName,
        isVerified: bankDetails.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating bank details',
      error: error.message,
    });
  }
};

/**
 * Request verification of bank details
 * Sends notification to HR for approval
 */
const requestVerification = async (req, res) => {
  try {
    const { employee } = req.user;

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found.',
      });
    }

    // Find employee by userId
    const employeeRecord = await Employee.findOne({
      where: { userId: req.user.id }
    });

    if (!employeeRecord || !employeeRecord.bankDetails || Object.keys(employeeRecord.bankDetails).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found. Please add bank details first.',
      });
    }

    if (employeeRecord.bankDetails.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Bank details are already verified',
      });
    }

    // Update verification status to pending (this would be handled by HR)
    res.json({
      success: true,
      message: 'Verification request submitted successfully. HR will review your bank details.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error requesting verification',
      error: error.message,
    });
  }
};

/**
 * Verify bank details (HR/Admin only)
 * Approves or rejects bank details verification
 */
const verifyBankDetails = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { isVerified, rejectionReason } = req.body;

    console.log('🔍 [BANK VERIFICATION] Starting verification:', {
      employeeId,
      isVerified,
      rejectionReason,
      userRole: req.user.role,
      userId: req.user.id
    });

    const employee = await Employee.findByPk(employeeId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role']
        }
      ]
    });

    console.log('🔍 [BANK VERIFICATION] Employee found:', !!employee);
    console.log('🔍 [BANK VERIFICATION] Bank details exist:', !!employee?.bankDetails);

    if (!employee || !employee.bankDetails || Object.keys(employee.bankDetails).length === 0) {
      console.log('❌ [BANK VERIFICATION] Employee or bank details not found');
      return res.status(404).json({
        success: false,
        message: 'Bank details not found',
      });
    }

    // Update verification status
    const updatedBankDetails = {
      ...employee.bankDetails,
      isVerified: isVerified,
      verifiedAt: isVerified ? new Date() : null,
      verifiedBy: isVerified ? req.user.id : null,
      rejectionReason: !isVerified ? rejectionReason : null,
    };

    console.log('🔄 [BANK VERIFICATION] Updating bank details:', {
      isVerified,
      verifiedAt: updatedBankDetails.verifiedAt,
      verifiedBy: updatedBankDetails.verifiedBy
    });

    await employee.update({
      bankDetails: updatedBankDetails,
      updatedBy: req.user.id
    });

    console.log('✅ [BANK VERIFICATION] Bank details updated successfully');

    // 🔔 Send notification to employee about verification result
    try {
      // Ensure we have the user relationship loaded
      if (!employee.user) {
        await employee.reload({
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email', 'role']
            }
          ]
        });
      }

      if (employee.user && employee.user.id) {
        console.log('📧 [BANK VERIFICATION] Sending notification to user:', employee.user.id);
        
        await notificationService.sendToUser(employee.user.id, {
          title: isVerified ? 'Bank Details Verified ✅' : 'Bank Details Rejected ❌',
          message: isVerified 
            ? 'Your bank details have been verified and approved by HR.' 
            : `Your bank details have been rejected. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`,
          type: isVerified ? 'success' : 'error',
          category: 'bank',
          metadata: {
            bankName: employee.bankDetails?.bankName,
            accountHolderName: employee.bankDetails?.accountHolderName,
            verifiedBy: req.user.firstName + ' ' + req.user.lastName,
            rejectionReason: rejectionReason,
            verifiedAt: updatedBankDetails.verifiedAt
          }
        });
        
        console.log('✅ [BANK VERIFICATION] Notification sent successfully');
      } else {
        console.log('⚠️  [BANK VERIFICATION] No user found for employee, skipping notification');
      }
    } catch (notificationError) {
      console.error("❌ [BANK VERIFICATION] Failed to send notification:", notificationError);
      // Don't fail the main operation if notification fails
    }

    console.log('📤 [BANK VERIFICATION] Sending response:', {
      success: true,
      message: `Bank details ${isVerified ? 'verified' : 'rejected'} successfully`,
      isVerified: updatedBankDetails.isVerified
    });

    res.json({
      success: true,
      message: `Bank details ${isVerified ? 'verified' : 'rejected'} successfully`,
      data: {
        isVerified: updatedBankDetails.isVerified,
        verifiedAt: updatedBankDetails.verifiedAt,
        rejectionReason: updatedBankDetails.rejectionReason,
      },
    });
  } catch (error) {
    console.error('❌ [BANK VERIFICATION] Error in verifyBankDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying bank details',
      error: error.message,
    });
  }
};

/**
 * Get all employees with pending bank verification (HR/Admin only)
 */
const getPendingVerifications = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: ['id', 'employeeId', 'firstName', 'lastName', 'bankDetails', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email']
        }
      ]
    });

    // Filter employees with bank details that are not verified
    const pendingList = employees
      .filter(emp => 
        emp.bankDetails && 
        Object.keys(emp.bankDetails).length > 0 && 
        emp.bankDetails.isVerified === false
      )
      .map((employee) => ({
        employeeId: employee.id,
        employeeCode: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        email: employee.user?.email,
        bankName: employee.bankDetails?.bankName,
        ifscCode: employee.bankDetails?.ifscCode,
        accountHolderName: employee.bankDetails?.accountHolderName,
        accountNumber: employee.bankDetails?.accountNumber, // Full account number for admin verification
        maskedAccountNumber: maskAccountNumber(employee.bankDetails?.accountNumber), // Masked version if needed
        updatedAt: employee.updatedAt,
      }));

    res.json({
      success: true,
      count: pendingList.length,
      data: pendingList,
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending verifications',
      error: error.message,
    });
  }
};

export default {
  getBankDetails,
  updateBankDetails,
  requestVerification,
  verifyBankDetails,
  getPendingVerifications,
};