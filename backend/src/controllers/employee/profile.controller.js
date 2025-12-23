import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import { encryptFile } from "../../utils/encryption.js";
import { decryptFile } from "../../utils/encryption.js";
import { Employee, EmployeeProfile, Department } from "../../models/sequelize/index.js";

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
    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    // Return the raw employee data for proper extraction
    res.json({
      success: true,
      data: employee.toJSON(), // Ensure we get plain object
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

    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Update personalInfo fields if provided
    if (updateData.personalInfo) {
      const currentPersonalInfo = employee.personalInfo || {};
      employee.personalInfo = {
        ...currentPersonalInfo,
        ...updateData.personalInfo,
      };
    }

    // Update emergencyContact if provided
    if (updateData.emergencyContact) {
      const currentEmergencyContact = employee.emergencyContact || {};
      employee.emergencyContact = {
        ...currentEmergencyContact,
        ...updateData.emergencyContact,
      };
    }

    // Update metadata
    employee.updatedBy = req.user.id || req.user._id;
    
    await employee.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
}; 

// Get my profile (alias for getProfile)
export const getMyProfile = async (req, res) => {
  return getProfile(req, res);
};

// Get change history
export const getChangeHistory = async (req, res) => {
  try {
    const { employeeId } = req.user;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    // For now, return empty array as we don't have change history implemented
    // This can be enhanced later to track profile changes
    res.json({
      success: true,
      data: [],
      message: "Change history not implemented yet"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching change history",
      error: error.message
    });
  }
};

// Get documents
export const getDocuments = async (req, res) => {
  try {
    const { employeeId } = req.user;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    const documents = await Document.findAll({
      where: { employeeId },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
      error: error.message,
    });
  }
};

// Upload document
export const uploadDocument = [
  upload.single("file"),
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { type, category } = req.body;
      const { file } = req;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
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

      const document = await Document.create({
        employeeId,
        fileName: file.filename,
        originalName: file.originalname,
        fileType: file.originalname.split(".").pop().toUpperCase(),
        fileSize: file.size,
        mimeType: file.mimetype,
        documentType: type || "Other",
        storagePath: encryptedPath,
        encryptionKey,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
      });

      // Update employee with document reference
      const employee = await Employee.findByPk(employeeId);
      if (employee) {
        const currentDocs = employee.documentsList || [];
        currentDocs.push({
          id: document.id,
          type,
          fileName: file.originalname,
          fileUrl: encryptedPath,
          uploadedAt: new Date(),
          status: "pending",
        });
        employee.documentsList = currentDocs;
        await employee.save();
      }

      res.json({
        success: true,
        message: "Document uploaded successfully",
        data: document,
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({
        success: false,
        message: "Error uploading document",
        error: error.message,
      });
    }
  },
];

// Download document
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.user;

    const document = await Document.findOne({
      where: { 
        id,
        employeeId 
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    let filePath = document.storagePath;

    // Decrypt if encrypted
    if (document.encryptionKey) {
      const decryptedPath = `${filePath}.decrypted`;
      try {
        await decryptFile(filePath, decryptedPath, document.encryptionKey);
        filePath = decryptedPath;
      } catch (decryptError) {
        return res.status(500).json({
          success: false,
          message: "Error decrypting document",
          error: decryptError.message,
        });
      }
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server"
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up decrypted file if it was created
    if (document.encryptionKey) {
      fileStream.on('end', () => {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error cleaning up decrypted file:', err);
        });
      });
    }

  } catch (error) {
    console.error('Document download error:', error);
    res.status(500).json({
      success: false,
      message: "Error downloading document",
      error: error.message,
    });
  }
};

export default {
  getProfile,
  getMyProfile,
  updateProfile,
  getChangeHistory,
  getDocuments,
  uploadDocument,
  downloadDocument,
};
