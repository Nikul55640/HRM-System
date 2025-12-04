import EmployeeProfile from '../../models/EmployeeProfile.js';
import Employee from '../../models/Employee.js';
import { validateIFSC } from '../../validators/bankDetailsValidator.js';

/**
 * Get bank details for the authenticated employee
 * Returns masked account number for security
 */
const getBankDetails = async (req, res) => {
  try {
    const { employeeId } = req.user;

    const profile = await EmployeeProfile.findOne({ employeeId }).select('bankDetails');

    if (!profile || !profile.bankDetails) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found',
      });
    }

    // Return bank details with masked account number
    const bankDetails = {
      accountNumber: profile.getMaskedAccountNumber(),
      bankName: profile.bankDetails.bankName,
      ifscCode: profile.bankDetails.ifscCode,
      accountHolderName: profile.bankDetails.accountHolderName,
      accountType: profile.bankDetails.accountType,
      branchName: profile.bankDetails.branchName,
      verificationStatus: profile.bankDetails.verificationStatus,
      verifiedAt: profile.bankDetails.verifiedAt,
    };

    res.json({
      success: true,
      data: bankDetails,
    });
  } catch (error) {
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

    // Find or create employee profile
    let profile = await EmployeeProfile.findOne({ employeeId });

    if (!profile) {
      profile = new EmployeeProfile({
        employeeId,
        userId,
        createdBy: userId,
      });
    }

    // Store old bank details for change history
    const oldBankDetails = profile.bankDetails ? { ...profile.bankDetails.toObject() } : null;

    // Update bank details
    profile.bankDetails = {
      accountNumber,
      bankName,
      ifscCode: ifscCode.toUpperCase(),
      accountHolderName,
      accountType: accountType || 'Savings',
      branchName,
      verificationStatus: 'pending', // Reset to pending on update
      verifiedAt: null,
      verifiedBy: null,
    };

    // Log change for approval
    if (oldBankDetails) {
      profile.changeHistory.push({
        field: 'bankDetails',
        oldValue: oldBankDetails,
        newValue: profile.bankDetails,
        changedAt: new Date(),
        changedBy: userId,
        approvalStatus: 'pending',
      });
    }

    profile.updatedBy = userId;
    await profile.save();

    res.json({
      success: true,
      message: 'Bank details updated successfully. Pending HR verification.',
      data: {
        accountNumber: profile.getMaskedAccountNumber(),
        bankName: profile.bankDetails.bankName,
        ifscCode: profile.bankDetails.ifscCode,
        accountHolderName: profile.bankDetails.accountHolderName,
        accountType: profile.bankDetails.accountType,
        branchName: profile.bankDetails.branchName,
        verificationStatus: profile.bankDetails.verificationStatus,
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

    const profile = await EmployeeProfile.findOne({ employeeId });

    if (!profile || !profile.bankDetails) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found. Please add bank details first.',
      });
    }

    if (profile.bankDetails.verificationStatus === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Bank details are already verified',
      });
    }

    // Update verification status to pending
    profile.bankDetails.verificationStatus = 'pending';
    profile.updatedBy = req.user.id;
    await profile.save();

    // TODO: Send notification to HR for verification
    // This would typically integrate with a notification service

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
    const { profileId } = req.params;
    const { status, rejectionReason } = req.body;

    // Validate status
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "verified" or "rejected"',
      });
    }

    // If rejecting, reason is required
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting bank details',
      });
    }

    const profile = await EmployeeProfile.findById(profileId);

    if (!profile || !profile.bankDetails) {
      return res.status(404).json({
        success: false,
        message: 'Bank details not found',
      });
    }

    // Update verification status
    profile.bankDetails.verificationStatus = status;

    if (status === 'verified') {
      profile.bankDetails.verifiedAt = new Date();
      profile.bankDetails.verifiedBy = req.user.id;
      profile.bankDetails.rejectionReason = undefined;
    } else {
      profile.bankDetails.rejectionReason = rejectionReason;
      profile.bankDetails.verifiedAt = null;
      profile.bankDetails.verifiedBy = null;
    }

    profile.updatedBy = req.user.id;
    await profile.save();

    // TODO: Send notification to employee about verification status
    // This would typically integrate with a notification service

    res.json({
      success: true,
      message: `Bank details ${status} successfully`,
      data: {
        verificationStatus: profile.bankDetails.verificationStatus,
        verifiedAt: profile.bankDetails.verifiedAt,
        rejectionReason: profile.bankDetails.rejectionReason,
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
 * Get all profiles with pending bank verification (HR/Admin only)
 */
const getPendingVerifications = async (req, res) => {
  try {
    const profiles = await EmployeeProfile.find({
      'bankDetails.verificationStatus': 'pending',
    })
      .populate('employeeId', 'employeeId personalInfo.firstName personalInfo.lastName contactInfo.email')
      .select('bankDetails employeeId')
      .sort({ updatedAt: -1 });

    const pendingList = profiles.map((profile) => ({
      profileId: profile._id,
      employeeId: profile.employeeId?.employeeId,
      employeeName: profile.employeeId
        ? `${profile.employeeId.personalInfo.firstName} ${profile.employeeId.personalInfo.lastName}`
        : 'Unknown',
      email: profile.employeeId?.contactInfo?.email,
      bankName: profile.bankDetails?.bankName,
      ifscCode: profile.bankDetails?.ifscCode,
      accountHolderName: profile.bankDetails?.accountHolderName,
      accountNumber: profile.getMaskedAccountNumber(),
      updatedAt: profile.updatedAt,
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