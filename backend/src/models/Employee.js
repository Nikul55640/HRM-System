import mongoose from "mongoose";
import EmployeeProfile from "./EmployeeProfile.js";

const { Schema } = mongoose;

const employeeSchema = new Schema(
  {
    employeeId: {
      type: String,
      trim: true,
      uppercase: true,
    },

    // -------------------------
    // PERSONAL INFORMATION
    // -------------------------
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      dateOfBirth: Date,
      gender: String,
      maritalStatus: String,
      nationality: String,
      profilePhoto: String,
    },

    // -------------------------
    // CONTACT INFORMATION
    // -------------------------
    contactInfo: {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      phoneNumber: String,
      alternatePhone: String,
      currentAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
    },

    // -------------------------
    // JOB INFORMATION
    // -------------------------
    jobInfo: {
      jobTitle: { type: String, required: true },
      department: {
        type: Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
      manager: {
        type: Schema.Types.ObjectId,
        ref: "Employee",
        default: null,
      },
      hireDate: { type: Date, required: true },
      employmentType: { type: String, required: true },
      workLocation: String,
    },

    // -------------------------
    // USER REFERENCE
    // -------------------------
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // -------------------------
    // STATUS WITH ENUM FIXED
    // -------------------------
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave", "Terminated"],
      default: "Active",
    },

    // -------------------------
    // CUSTOM FIELDS
    // -------------------------
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },

    // -------------------------
    // AUDIT FIELDS
    // -------------------------
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// -------------------------------------------------------------
// 🔧 STATUS NORMALIZATION (e.g., "active" → "Active")
// -------------------------------------------------------------
employeeSchema.pre("validate", function (next) {
  if (this.status) {
    this.status =
      this.status.charAt(0).toUpperCase() + this.status.slice(1).toLowerCase();
  }
  next();
});

// -------------------------------------------------------------
// 🔧 AUTO-GENERATE employeeId (EMP-YYYYMMDD-0001)
// -------------------------------------------------------------
employeeSchema.pre("save", async function (next) {
  if (!this.employeeId) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    const last = await this.constructor
      .findOne({ employeeId: new RegExp(`EMP-${date}-`) })
      .sort({ employeeId: -1 });

    let seq = 1;
    if (last) {
      seq = parseInt(last.employeeId.split("-")[2], 10) + 1;
    }

    this.employeeId = `EMP-${date}-${seq.toString().padStart(4, "0")}`;
  }

  next();
});

// -------------------------------------------------------------
// 🔧 AUTO-CREATE EMPLOYEE PROFILE ENTRY
// -------------------------------------------------------------
employeeSchema.post("save", async function (doc, next) {
  try {
    const exists = await EmployeeProfile.findOne({ employeeId: doc._id });

    if (!exists) {
      await EmployeeProfile.create({
        employeeId: doc._id,
        userId: doc.userId,
        personalInfo: {},
        bankDetails: {},
        documents: [],
        changeHistory: [],
      });
    }

    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Employee", employeeSchema);
