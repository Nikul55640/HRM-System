import { Employee, User } from '../../models/index.js';
import logger from '../../utils/logger.js';

const getProfile = async (employeeId) => {
  try {
    const employee = await Employee.findByPk(employeeId, {
      include: [
        {
          model: Employee.associations.department?.target,
          as: 'department',
          attributes: ['name', 'code']
        },
        {
          model: Employee.associations.manager?.target,
          as: 'manager',
          attributes: ['employeeId', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!employee) {
      throw {
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee profile not found',
        statusCode: 404
      };
    }

    return employee;
  } catch (error) {
    logger.error('Error getting employee profile:', error);
    throw error;
  }
};

const updateProfile = async (employeeId, updateData) => {
  try {
    const employee = await Employee.findByPk(employeeId);
    
    if (!employee) {
      throw {
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee profile not found',
        statusCode: 404
      };
    }

    // Filter allowed fields for employee self-update
    const allowedFields = [
      'phoneNumber',
      'emergencyContact',
      'address',
      'profilePhoto'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    await employee.update(filteredData);
    return employee;
  } catch (error) {
    logger.error('Error updating employee profile:', error);
    throw error;
  }
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        statusCode: 404
      };
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw {
        code: 'INVALID_PASSWORD',
        message: 'Current password is incorrect',
        statusCode: 400
      };
    }

    // Update password
    await user.update({ password: newPassword });
    return { message: 'Password updated successfully' };
  } catch (error) {
    logger.error('Error updating password:', error);
    throw error;
  }
};

export default {
  getProfile,
  updateProfile,
  updatePassword
};