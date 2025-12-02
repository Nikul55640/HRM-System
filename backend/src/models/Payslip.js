import mongoose from "mongoose";

const { Schema } = mongoose;

// ================= Earnings Schema =================
const earningsSchema = new Schema(
  {
    basic: { type: Number, required: true, min: 0 },
    hra: { type: Number, default: 0, min: 0 },
    allowances: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    bonus: { type: Number, default: 0, min: 0 },
    overtime: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// ================= Deductions Schema =================
const deductionsSchema = new Schema(
  {
    tax: { type: Number, default: 0, min: 0 },
    providentFund: { type: Number, default: 0, min: 0 },
    insurance: { type: Number, default: 0, min: 0 },
    loan: { type: Number, default: 0, min: 0 },
    other: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// ================= Payslip Schema =================
const payslipSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },

    earnings: { type: earningsSchema, required: true },
    deductions: { type: deductionsSchema, required: true },

    netPay: { type: Number, required: true },

    pdfUrl: { type: String, trim: true },

    generatedAt: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ================= Indexes =================
payslipSchema.index({ employeeId: 1, year: -1, month: -1 });
payslipSchema.index({ employeeId: 1, year: 1, month: 1 }, { unique: true });
payslipSchema.index({ status: 1 });
payslipSchema.index({ generatedAt: -1 });

// ================= Pre-Save Hook =================
payslipSchema.pre("save", function (next) {
  // Earnings total
  let earningsTotal =
    this.earnings.basic +
    this.earnings.hra +
    this.earnings.bonus +
    this.earnings.overtime;

  if (Array.isArray(this.earnings.allowances)) {
    earningsTotal += this.earnings.allowances.reduce(
      (sum, a) => sum + a.amount,
      0
    );
  }

  this.earnings.total = earningsTotal;

  // Deductions total
  let deductionsTotal =
    this.deductions.tax +
    this.deductions.providentFund +
    this.deductions.insurance +
    this.deductions.loan;

  if (Array.isArray(this.deductions.other)) {
    deductionsTotal += this.deductions.other.reduce(
      (sum, d) => sum + d.amount,
      0
    );
  }

  this.deductions.total = deductionsTotal;

  // Net Pay
  this.netPay = earningsTotal - deductionsTotal;

  next();
});

// ================= Virtuals =================
payslipSchema.virtual("monthName").get(function () {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[this.month - 1];
});

payslipSchema.virtual("period").get(function () {
  return `${this.monthName} ${this.year}`;
});

// ================= Methods =================
payslipSchema.methods.isPublished = function () {
  return this.status === "published";
};

// ================= Static Methods =================
payslipSchema.statics.findByEmployee = function (employeeId) {
  return this.find({ employeeId }).sort({ year: -1, month: -1 });
};

payslipSchema.statics.findByYear = function (employeeId, year) {
  return this.find({ employeeId, year }).sort({ month: -1 });
};

const Payslip = mongoose.model("Payslip", payslipSchema);
export default Payslip;
