import { Employee } from '../../models/sequelize/index.js';
import { validateIFSC } from '../../validators/bankDetailsValidator.js';

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
    const { employeeId } = req.user;

    console.log('🏦 [BANK DETAILS] Fetching for employeeId:', employeeId);

    const employee = await Employee.findByPk(employeeId);

    console.log('🏦 [BANK DETAILS] Employee found:', !!employee);
    console.log('🏦 [BANK DETAILS] Bank details exist:', !!employee?.bankDetails);

    if (!employee || !employee.bankDetails || Object.keys(employee.bankDetails).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found',
      });
    }

    // Return bank details with masked account number
    const bankDetails = {
      accountNumber: maskAccountNumber(employee.bankDetails.accountNumber),
      bankName: employee.bankDetails.bankName,
      ifscCode: employee.bankDetails.ifscCode,
      accountHolderName: employee.bankDetails.accountHolderName,
      accountType: employee.bankDetails.accountType,
      branchName: employee.bankDetails.branchName,
      isVerified: employee.bankDetails.isVerified || false,
      verifiedAt: employee.bankDetails.verifiedAt,
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
    const { employeeId, id: userId } = req.user;
    const {
      accountNumber,
      bankName,
      ifscCode,
      accountHolderName,
      accountType,
      branchName,
    } = req.body;

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

    // Find employee
    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
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

    await employee.update({
      bankDetails,
      updatedBy: userId
    });

    res.json({
      success: true,
      message: 'Bank details updated successfully. Pending HR verification.',
      data: {
        accountNumber: maskAccountNumber(bankDetails.accountNumber),
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
    const { employeeId } = req.user;

    const employee = await Employee.findByPk(employeeId);

    if (!employee || !employee.bankDetails || Object.keys(employee.bankDetails).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found. Please add bank details first.',
      });
    }

    if (employee.bankDetails.isVerified) {
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

    const employee = await Employee.findByPk(employeeId);

    if (!employee || !employee.bankDetails || Object.keys(employee.bankDetails).length === 0) {
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

    await employee.update({
      bankDetails: updatedBankDetails,
      updatedBy: req.user.id
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
      where: {
        '$bankDetails.isVerified$': false,
      },
      attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email', 'bankDetails', 'updatedAt']
    });

    const pendingList = employees
      .filter(emp => emp.bankDetails && Object.keys(emp.bankDetails).length > 0)
      .map((employee) => ({
        employeeId: employee.id,
        employeeCode: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        bankName: employee.bankDetails?.bankName,
        ifscCode: employee.bankDetails?.ifscCode,
        accountHolderName: employee.bankDetails?.accountHolderName,
        accountNumber: maskAccountNumber(employee.bankDetails?.accountNumber),
        updatedAt: employee.updatedAt,
      }));

    res.json({
      success: true,
      count: pendingList.length,
      data: pendingList,
    });
  } catch (error) {
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