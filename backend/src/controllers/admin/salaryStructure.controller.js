import { SalaryStructure, AuditLog, Employee } from "../../models/sequelize/index.js";

export const createOrUpdateSalaryStructure = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const data = req.body;

    // Use Sequelize upsert (findOrCreate + update)
    const [structure, created] = await SalaryStructure.upsert({
      employeeId,
      ...data
    }, {
      returning: true
    });

    await AuditLog.create({
      action: "SALARY_STRUCTURE_SAVED",
      userId: req.user.id,
      employeeId,
      details: "Salary structure created/updated",
    });

    return res.json({ success: true, data: structure });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error saving salary structure",
      error: error.message,
    });
  }
};

export const getSalaryStructure = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const structure = await SalaryStructure.findOne({ 
      where: { employeeId } 
    });

    return res.json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching salary structure",
      error: error.message,
    });
  }
};

export const getAllSalaryStructures = async (req, res) => {
  try {
    const structures = await SalaryStructure.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['employeeId', 'firstName', 'lastName']
      }]
    });
    
    return res.json({
      success: true,
      count: structures.length,
      data: structures,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching salary structures",
      error: error.message,
    });
  }
};

export default {
  createOrUpdateSalaryStructure,
  getSalaryStructure,
  getAllSalaryStructures,
};
