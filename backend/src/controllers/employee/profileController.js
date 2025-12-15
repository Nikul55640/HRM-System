import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import { encryptFile } from "../../utils/encryption.js";
import { decryptFile } from "../../utils/encryption.js";
import { Employee, EmployeeProfile, Document, Department } from "../../models/sequelize/index.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/documents/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Get employee profile
const getProfile = async (req, res) => {
  try {
    const { employeeId } = req.user;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message:
          "Employee profile not found. Please contact HR to link your account.",
      });
    }

    // Get the full employee record
    const employee = await Employee.findByPk(employeeId, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['name', 'code'],
          required: false,
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};




export const updateProfile = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const updateData = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    const profile = await EmployeeProfile.findOne({ 
      where: { employeeId } 
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    if (!profile.personalInfo) profile.personalInfo = {};

    // Allowed fields updating inside personalInfo
    profile.personalInfo.email = updateData.email || profile.personalInfo.email;
    profile.personalInfo.phone = updateData.phone || profile.personalInfo.phone;
    profile.personalInfo.alternatePhone =
      updateData.alternatePhone || profile.personalInfo.alternatePhone;

    if (updateData.address) {
      profile.personalInfo.address = {
        ...profile.personalInfo.address,
        ...updateData.address,
      };
    }

    if (updateData.emergencyContact) {
      profile.personalInfo.emergencyContact = {
        ...profile.personalInfo.emergencyContact,
        ...updateData.emergencyContact,
      };
    }

    profile.updatedBy = req.user._id;
    await profile.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
}; 

// Get change history
 const getChangeHistory = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const profile = await EmployeeProfile.findOne({ employeeId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile.changeHistory || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload document
 const uploadDocument = [
  upload.single("file"),
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { type } = req.body;
      const { file } = req;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Encrypt sensitive documents
      const sensitiveTypes = ["id_proof", "bank_proof", "address_proof"];
      let encryptedPath = file.path;
      let encryptionKey = null;

      if (sensitiveTypes.includes(type)) {
        // Generate unique encryption key for this document
        encryptionKey = crypto.randomBytes(32).toString("hex");
        encryptedPath = `${file.path}.encrypted`;

        try {
          await encryptFile(file.path, encryptedPath, encryptionKey);
          // Delete original unencrypted file

          await fs.promises.unlink(file.path);
        } catch (encryptError) {
          return res.status(500).json({
            success: false,
            message: "Error encrypting document",
            error: encryptError.message,
          });
        }
      }

      const document = new Document({
        employeeId,
        fileName: file.filename,
        originalName: file.originalname,
        fileType: file.originalname.split(".").pop().toUpperCase(),
        fileSize: file.size,
        mimeType: file.mimetype,
        documentType: type || "Other",
        storagePath: encryptedPath,
        encryptionKey,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      });

      await document.save();

      // Update profile with document reference
      const profile = await EmployeeProfile.findOne({ employeeId });
      if (profile) {
        profile.documents.push({
          type,
          fileName: file.originalname,
          fileUrl: encryptedPath,
          uploadedAt: new Date(),
          status: "pending",
        });
        await profile.save();
      }

      res.json({
        success: true,
        message: "Document uploaded successfully",
        data: document.getSummary(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error uploading document",
        error: error.message,
      });
    }
  },
];

// Get documents
const getDocuments = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const documents = await Document.find({ employeeId });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download document
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.user;

    const document = await Document.findOne({ _id: id, employeeId }).select(
      "+encryptionKey"
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if document is encrypted
    if (document.encryptionKey) {
      // Create temporary decrypted file
      const tempPath = `${document.storagePath}.temp`;

      try {
        await decryptFile(
          document.storagePath,
          tempPath,
          document.encryptionKey
        );

        // Send decrypted file
        res.download(tempPath, document.originalName, async (err) => {
          // Clean up temp file after download
          try {
            await fs.unlink(tempPath);
          } catch (cleanupError) {
            console.error("Error cleaning up temp file:", cleanupError);
          }

          if (err) {
            console.error("Error downloading file:", err);
          }
        });
      } catch (decryptError) {
        return res.status(500).json({
          success: false,
          message: "Error decrypting document",
          error: decryptError.message,
        });
      }
    } else {
      // Send unencrypted file directly
      res.download(document.storagePath, document.originalName);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error downloading document",
      error: error.message,
    });
  }
};

// Approve or reject profile change (HR/Admin only)
const approveChange = async (req, res) => {
  try {
    const { changeId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"',
      });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const profile = await EmployeeProfile.findOne({
      "changeHistory._id": changeId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Change record not found",
      });
    }

    const change = profile.changeHistory.id(changeId);
    if (!change) {
      return res.status(404).json({
        success: false,
        message: "Change record not found",
      });
    }

    change.approvalStatus = status;
    change.approvedBy = req.user._id;
    change.approvedAt = new Date();

    if (status === "rejected") {
      change.rejectionReason = rejectionReason;
    }

    profile.updatedBy = req.user._id;
    await profile.save();

    res.json({
      success: true,
      message: `Change ${status} successfully`,
      data: change,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing approval",
      error: error.message,
    });
  }
};

// Get pending changes for approval (HR/Admin only)
 const getPendingChanges = async (req, res) => {
  try {
    const profiles = await EmployeeProfile.find({
      "changeHistory.approvalStatus": "pending",
    })
      .populate(
        "employeeId",
        "employeeId personalInfo.firstName personalInfo.lastName"
      )
      .select("changeHistory employeeId")
      .sort({ updatedAt: -1 });

    const pendingChanges = [];
    profiles.forEach((profile) => {
      const pending = profile.changeHistory.filter(
        (change) => change.approvalStatus === "pending"
      );
      pending.forEach((change) => {
        pendingChanges.push({
          changeId: change._id,
          profileId: profile._id,
          employeeId: profile.employeeId?.employeeId,
          employeeName: profile.employeeId
            ? `${profile.employeeId.personalInfo.firstName} ${profile.employeeId.personalInfo.lastName}`
            : "Unknown",
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
          changedAt: change.changedAt,
          changedBy: change.changedBy,
        });
      });
    });

    res.json({
      success: true,
      count: pendingChanges.length,
      data: pendingChanges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending changes",
      error: error.message,
    });
  }
};

// Get current employee profile (for /employees/me endpoint)
 const getMyProfile = async (req, res) => {
  try {
    const { employeeId } = req.user;

    // If user doesn't have an employee record, return user info
    if (!employeeId) {
      return res.json({
        success: true,
        data: {
          _id: req.user._id,
          email: req.user.email,
          role: req.user.role,
          isEmployee: false,
        },
      });
    }

    const employee = await Employee.findById(employeeId)
      .populate("jobInfo.department", "name")
      .populate(
        "jobInfo.manager",
        "personalInfo.firstName personalInfo.lastName employeeId"
      );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employee profile",
      error: error.message,
    });
  }
};

export default {
  getProfile,
  updateProfile,
  getChangeHistory,
  uploadDocument,
  getDocuments,
  downloadDocument,
  approveChange,
  getPendingChanges,
  getMyProfile,
};
