import mongoose from "mongoose";

const salaryStructureSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
    },

    basic: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    allowances: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    bonus: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 },

    // Deductions
    tax: { type: Number, default: 0 },
    providentFund: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    loan: { type: Number, default: 0 },
    otherDeductions: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SalaryStructure = mongoose.model(
  "SalaryStructure",
  salaryStructureSchema
);
export default SalaryStructure;
