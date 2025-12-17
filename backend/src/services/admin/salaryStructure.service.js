import { SalaryStructure, Employee } from '../../models/sequelize/index.js';
import logger from '../../utils/logger.js';

const createSalaryStructure = async (salaryData) => {
  try {
    const { employeeId, basicSalary, allowances = [], deductions = [] } = salaryData;

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      throw {
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found',
        statusCode: 404
      };
    }

    // Check if salary structure already exists
    const existingStructure = await SalaryStructure.findOne({
      where: { employeeId }
    });

    if (existingStructure) {
      throw {
        code: 'SALARY_STRUCTURE_EXISTS',
        message: 'Salary structure already exists for this employee',
        statusCode: 400
      };
    }

    const salaryStructure = await SalaryStructure.create({
      employeeId,
      basicSalary,
      allowances,
      deductions
    });

    return salaryStructure;
  } catch (error) {
    logger.error('Error creating salary structure:', error);
    throw error;
  }
};

const getSalaryStructures = async (options = {}) => {
  try {
    const { limit = 50, offset = 0, employeeId } = options;
    
    const whereClause = {};
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const { rows: structures, count: total } = await SalaryStructure.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      structures,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + structures.length < total
      }
    };
  } catch (error) {
    logger.error('Error getting salary structures:', error);
    throw error;
  }
};

const getSalaryStructureById = async (structureId) => {
  try {
    const structure = await SalaryStructure.findByPk(structureId, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!structure) {
      throw {
        code: 'SALARY_STRUCTURE_NOT_FOUND',
        message: 'Salary structure not found',
        statusCode: 404
      };
    }

    return structure;
  } catch (error) {
    logger.error('Error getting salary structure by ID:', error);
    throw error;
  }
};

const updateSalaryStructure = async (structureId, updateData) => {
  try {
    const structure = await SalaryStructure.findByPk(structureId);
    
    if (!structure) {
      throw {
        code: 'SALARY_STRUCTURE_NOT_FOUND',
        message: 'Salary structure not found',
        statusCode: 404
      };
    }

    await structure.update(updateData);
    return structure;
  } catch (error) {
    logger.error('Error updating salary structure:', error);
    throw error;
  }
};

const deleteSalaryStructure = async (structureId) => {
  try {
    const structure = await SalaryStructure.findByPk(structureId);
    
    if (!structure) {
      throw {
        code: 'SALARY_STRUCTURE_NOT_FOUND',
        message: 'Salary structure not found',
        statusCode: 404
      };
    }

    await structure.destroy();
    return { message: 'Salary structure deleted successfully' };
  } catch (error) {
    logger.error('Error deleting salary structure:', error);
    throw error;
  }
};

const getSalaryStructureByEmployee = async (employeeId) => {
  try {
    const structure = await SalaryStructure.findOne({
      where: { employeeId },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'firstName', 'lastName', 'email']
        }
      ]
    });

    return structure;
  } catch (error) {
    logger.error('Error getting salary structure by employee:', error);
    throw error;
  }
};

export default {
  createSalaryStructure,
  getSalaryStructures,
  getSalaryStructureById,
  updateSalaryStructure,
  deleteSalaryStructure,
  getSalaryStructureByEmployee
};