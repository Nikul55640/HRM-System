import SalaryStructure from "../../models/SalaryStructure.js";
import Payslip from "../../models/Payslip.js";
import AuditLog from "../../models/AuditLog.js";

export const generatePayslip = async (req, res) => {
  try {
    const { employeeId, month, year, overtimeHours } = req.body;

    const structure = await SalaryStructure.findOne({ employeeId });

    if (!structure) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found for this employee",
      });
    }

    const overtimeAmount = (overtimeHours || 0) * (structure.overtimeRate || 0);

    const payslip = await Payslip.create({
      employeeId,
      month,
      year,
      earnings: {
        basic: structure.basic,
        hra: structure.hra,
        allowances: structure.allowances,
        bonus: structure.bonus,
        overtime: overtimeAmount,
        total: 0,
      },
      deductions: {
        tax: structure.tax,
        providentFund: structure.providentFund,
        insurance: structure.insurance,
        loan: structure.loan,
        other: structure.otherDeductions,
        total: 0,
      },
      generatedBy: req.user._id,
      status: "draft",
    });

    await AuditLog.create({
      action: "PAYSLIP_GENERATED",
      user: req.user._id,
      employeeId,
      details: `Payslip generated for ${month}/${year}`,
    });

    return res.json({ success: true, data: payslip });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error generating payslip",
      error: error.message,
    });
  }
};
export const generatePayslipsForAll = async (req, res) => {
  try {
    const { month, year } = req.body;

    const structures = await SalaryStructure.find({ isActive: true });

    let results = [];

    for (const s of structures) {
      const payslip = await Payslip.create({
        employeeId: s.employeeId,
        month,
        year,
        earnings: {
          basic: s.basic,
          hra: s.hra,
          allowances: s.allowances,
          bonus: s.bonus,
          overtime: 0,
        },
        deductions: {
          tax: s.tax,
          providentFund: s.providentFund,
          insurance: s.insurance,
          loan: s.loan,
          other: s.otherDeductions,
        },
        generatedBy: req.user._id,
      });

      results.push(payslip);
    }

    return res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error generating batch payslips",
      error: error.message,
    });
  }
};
export const publishPayslip = async (req, res) => {
  try {
    const { id } = req.params;

    const payslip = await Payslip.findByIdAndUpdate(
      id,
      { status: "published" },
      { new: true }
    );

    return res.json({ success: true, data: payslip });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error publishing payslip",
      error: error.message,
    });
  }
};
