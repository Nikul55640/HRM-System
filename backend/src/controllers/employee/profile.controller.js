import { Employee, User } from '../../models/sequelize/index.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../../utils/logger.js';

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profile-photos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: async (req, file, cb) => {
    try {
      // Get employee data from user ID
      const employee = await Employee.findOne({
        where: { userId: req.user.id },
        attributes: ['id']
      });
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const employeeId = employee ? employee.id : 'unknown';
      cb(null, `profile-${employeeId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    } catch (error) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

// Get employee profile
export const getProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: [
        'id', 'employeeId', 'firstName', 'lastName', 'gender', 
        'dateOfBirth', 'maritalStatus', 'about', 'phone', 
        'country', 'address', 'profilePicture', 'profilePhoto', 'nationality', 'bloodGroup'
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'isActive'],
          required: true
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    logger.error('Error fetching employee profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

// Update employee profile
export const updateProfile = async (req, res) => {
  try {
    const { personalInfo, contactInfo } = req.body;

    const employee = await Employee.findOne({
      where: { userId: req.user.id },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    // Prepare update data
    const updateData = {};
    
    if (personalInfo) {
      if (personalInfo.firstName) updateData.firstName = personalInfo.firstName;
      if (personalInfo.lastName) updateData.lastName = personalInfo.lastName;
      if (personalInfo.gender) updateData.gender = personalInfo.gender;
      if (personalInfo.dateOfBirth) updateData.dateOfBirth = personalInfo.dateOfBirth;
      if (personalInfo.maritalStatus) updateData.maritalStatus = personalInfo.maritalStatus;
      if (personalInfo.nationality) updateData.nationality = personalInfo.nationality;
      if (personalInfo.bloodGroup) updateData.bloodGroup = personalInfo.bloodGroup;
      if (personalInfo.about !== undefined) updateData.about = personalInfo.about;
    }

    if (contactInfo) {
      if (contactInfo.phone) updateData.phone = contactInfo.phone;
      if (contactInfo.country) updateData.country = contactInfo.country;
      if (contactInfo.address !== undefined) {
        // Store address as object - Sequelize JSON type handles serialization
        updateData.address = contactInfo.address;
      }
    }

    updateData.updatedBy = req.user.id;

    // Update employee record
    await employee.update(updateData);

    // Fetch updated employee data
    const updatedEmployee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: [
        'id', 'employeeId', 'firstName', 'lastName', 'gender', 
        'dateOfBirth', 'maritalStatus', 'about', 'phone', 
        'country', 'address', 'profilePicture', 'nationality', 'bloodGroup'
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'isActive'],
          required: true
        }
      ]
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    logger.error('Error updating employee profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const employee = await Employee.findOne({
      where: { userId: req.user.id },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    // Delete old profile photo if exists and it's a file path (not base64)
    if (employee.profilePicture && !employee.profilePicture.startsWith('data:')) {
      const oldPhotoPath = path.join(process.cwd(), employee.profilePicture);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update employee with new photo path
    const photoPath = req.file.path.replace(/\\/g, '/'); // Normalize path separators
    await employee.update({
      profilePicture: photoPath,
      updatedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profilePhoto: `/${photoPath}`, // Return web-accessible path
      },
    });
  } catch (error) {
    logger.error('Error uploading profile photo:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: error.message,
    });
  }
};

// Get profile photo file
export const getProfilePhoto = async (req, res) => {
  try {
    const { filename } = req.params;
    const photoPath = path.join(process.cwd(), 'uploads', 'profile-photos', filename);
    
    // Check if file exists
    if (!fs.existsSync(photoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Profile photo not found',
      });
    }
    
    // Send the file
    res.sendFile(photoPath);
  } catch (error) {
    logger.error('Error serving profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve profile photo',
      error: error.message,
    });
  }
};

// Delete profile photo
export const deleteProfilePhoto = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    // Delete photo file if exists and it's a file path (not base64)
    if (employee.profilePicture && !employee.profilePicture.startsWith('data:')) {
      const photoPath = path.join(process.cwd(), employee.profilePicture);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Update employee record
    await employee.update({
      profilePicture: null,
      updatedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Profile photo deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile photo',
      error: error.message,
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    // Get user record
    const user = await User.scope('withPassword').findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    // Update password (let the model hook handle hashing)
    await user.update({
      password: newPassword,
      updatedBy: userId,
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};