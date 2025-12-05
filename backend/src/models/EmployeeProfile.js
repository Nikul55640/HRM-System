import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption.js";

const { Schema } = mongoose;

/* ----------------------------------------------
   BANK DETAILS (Encrypted)
---------------------------------------------- */
const bankDetailsSchema = new Schema(
  {
    accountNumber: {
      type: String,
      set: (v) => (v ? encrypt(v) : v),
      get: (v) => (v ? decrypt(v) : v),
    },
    bankName: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    accountType: { type: String, trim: true },
    branchName: { type: String, trim: true },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedAt: { type: Date },
  },
  {
    _id: false,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

/* ----------------------------------------------
   PERSONAL INFO
---------------------------------------------- */
/* ----------------------------------------------
   PERSONAL INFO (UPDATED)
---------------------------------------------- */
const personalInfoSchema = new Schema(
  {
    email: { type: String, trim: true, lowercase: true },

    phone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },

    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },

    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: { type: String, trim: true },
    }
  },
  { _id: false }
);

/* ----------------------------------------------
   EMPLOYEE PROFILE (FULL MODEL)
---------------------------------------------- */
const employeeProfileSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    personalInfo: personalInfoSchema,

    bankDetails: bankDetailsSchema,

    documents: [
      {
        name: String,
        category: String,
        fileUrl: String,
        uploadedAt: Date,
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    changeHistory: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        changedAt: { type: Date, default: Date.now },
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

/* ----------------------------------------------
   INDEXES (For speed + uniqueness)
---------------------------------------------- */
employeeProfileSchema.index({ employeeId: 1 }, { unique: true });
employeeProfileSchema.index({ userId: 1 }, { unique: true });

/* ----------------------------------------------
   EXPORT
---------------------------------------------- */
export default mongoose.model("EmployeeProfile", employeeProfileSchema);
