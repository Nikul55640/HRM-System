import SalaryStructure from "../../models/SalaryStructure.js";
import AuditLog from "../../models/AuditLog.js";

export const createOrUpdateSalaryStructure = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const data = req.body;

    const structure = await SalaryStructure.findOneAndUpdate(
      { employeeId },
      data,
      { new: true, upsert: true }
    );

    await AuditLog.create({
      action: "SALARY_STRUCTURE_SAVED",
      user: req.user._id,
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

    const structure = await SalaryStructure.findOne({ employeeId });

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
    const structures = await SalaryStructure.find({}).populate(
      "employeeId",
      "employeeId personalInfo"
    );
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
