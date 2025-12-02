import mongoose from 'mongoose';

const { Schema } = mongoose;

// Document Schema
const documentSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
      maxlength: [255, 'File name cannot exceed 255 characters'],
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
      maxlength: [255, 'Original file name cannot exceed 255 characters'],
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      trim: true,
      uppercase: true,
      maxlength: [10, 'File type cannot exceed 10 characters'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
      max: [10485760, 'File size cannot exceed 10MB'], // 10MB in bytes
    },
    mimeType: {
      type: String,
      trim: true,
      maxlength: [100, 'MIME type cannot exceed 100 characters'],
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: {
        values: [
          'Resume',
          'Contract',
          'Certification',
          'Identification',
          'Performance Review',
          'Other',
        ],
        message: '{VALUE} is not a valid document type',
      },
    },
    // Storage
    storagePath: {
      type: String,
      required: [true, 'Storage path is required'],
      trim: true,
    },
    encryptionKey: {
      type: String,
      trim: true,
      select: false, // Don't include encryption key in queries by default
    },
    // Metadata
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    // Access Control
    isPublic: {
      type: Boolean,
      default: false,
    },
    accessibleBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.encryptionKey;
        delete ret.storagePath;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(doc, ret) {
        // Remove sensitive fields from object output
        delete ret.encryptionKey;
        delete ret.storagePath;
        return ret;
      },
    },
  },
);

// Pre-save hook for validation
documentSchema.pre('save', function (next) {
  // Validate file type against allowed types
  const allowedTypes = ['PDF', 'DOC', 'DOCX', 'JPG', 'JPEG', 'PNG'];
  if (!allowedTypes.includes(this.fileType.toUpperCase())) {
    return next(
      new Error(
        `File type ${this.fileType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      ),
    );
  }

  // Ensure file size is within limit (10MB)
  if (this.fileSize > 10485760) {
    return next(new Error('File size exceeds the maximum limit of 10MB'));
  }

  // Normalize file type to uppercase
  this.fileType = this.fileType.toUpperCase();

  next();
});

// Pre-save hook to set uploadedAt if not provided
documentSchema.pre('save', function (next) {
  if (!this.uploadedAt) {
    this.uploadedAt = new Date();
  }
  next();
});

// Virtual for file extension
documentSchema.virtual('fileExtension').get(function () {
  return this.fileType.toLowerCase();
});

// Virtual for file size in human-readable format
documentSchema.virtual('fileSizeFormatted').get(function () {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
});

// Virtual for document age (days since upload)
documentSchema.virtual('documentAge').get(function () {
  const now = new Date();
  const uploaded = new Date(this.uploadedAt);
  const diffTime = Math.abs(now - uploaded);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes for frequently queried fields
documentSchema.index({ employeeId: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ uploadedAt: -1 });
documentSchema.index({ isPublic: 1 });
documentSchema.index({ createdAt: -1 });

// Compound indexes for common queries
documentSchema.index({ employeeId: 1, documentType: 1 });
documentSchema.index({ employeeId: 1, uploadedAt: -1 });
documentSchema.index({ uploadedBy: 1, uploadedAt: -1 });
documentSchema.index({ employeeId: 1, isPublic: 1 });

// Instance method to check if user can access document
documentSchema.methods.canAccess = function (userId) {
  // Document is public
  if (this.isPublic) {
    return true;
  }

  // User is the uploader
  if (this.uploadedBy.toString() === userId.toString()) {
    return true;
  }

  // User is in the accessibleBy list
  if (this.accessibleBy && this.accessibleBy.length > 0) {
    return this.accessibleBy.some((id) => id.toString() === userId.toString());
  }

  return false;
};

// Instance method to grant access to a user
documentSchema.methods.grantAccess = function (userId) {
  if (!this.accessibleBy) {
    this.accessibleBy = [];
  }

  // Check if user already has access
  const hasAccess = this.accessibleBy.some((id) => id.toString() === userId.toString());

  if (!hasAccess) {
    this.accessibleBy.push(userId);
  }

  return this;
};

// Instance method to revoke access from a user
documentSchema.methods.revokeAccess = function (userId) {
  if (this.accessibleBy && this.accessibleBy.length > 0) {
    this.accessibleBy = this.accessibleBy.filter(
      (id) => id.toString() !== userId.toString(),
    );
  }

  return this;
};

// Instance method to get document summary
documentSchema.methods.getSummary = function () {
  return {
    id: this._id,
    fileName: this.fileName,
    originalName: this.originalName,
    fileType: this.fileType,
    fileSize: this.fileSize,
    fileSizeFormatted: this.fileSizeFormatted,
    documentType: this.documentType,
    uploadedAt: this.uploadedAt,
    uploadedBy: this.uploadedBy,
    isPublic: this.isPublic,
  };
};

// Instance method to check if document is recent (uploaded within last 30 days)
documentSchema.methods.isRecent = function () {
  return this.documentAge <= 30;
};

// Static method to find documents by employee
documentSchema.statics.findByEmployee = function (employeeId) {
  return this.find({ employeeId }).sort({ uploadedAt: -1 });
};

// Static method to find documents by type
documentSchema.statics.findByType = function (documentType) {
  return this.find({ documentType }).sort({ uploadedAt: -1 });
};

// Static method to find documents by employee and type
documentSchema.statics.findByEmployeeAndType = function (employeeId, documentType) {
  return this.find({ employeeId, documentType }).sort({ uploadedAt: -1 });
};

// Static method to find public documents
documentSchema.statics.findPublic = function () {
  return this.find({ isPublic: true }).sort({ uploadedAt: -1 });
};

// Static method to find documents uploaded by a user
documentSchema.statics.findByUploader = function (userId) {
  return this.find({ uploadedBy: userId }).sort({ uploadedAt: -1 });
};

// Static method to find documents accessible by a user
documentSchema.statics.findAccessibleByUser = function (userId) {
  return this.find({
    $or: [
      { isPublic: true },
      { uploadedBy: userId },
      { accessibleBy: userId },
    ],
  }).sort({ uploadedAt: -1 });
};

// Static method to get document statistics for an employee
documentSchema.statics.getEmployeeDocumentStats = async function (employeeId) {
  const stats = await this.aggregate([
    { $match: { employeeId: mongoose.Types.ObjectId(employeeId) } },
    {
      $group: {
        _id: '$documentType',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const totalDocuments = await this.countDocuments({ employeeId });
  const totalSize = stats.reduce((sum, stat) => sum + stat.totalSize, 0);

  return {
    totalDocuments,
    totalSize,
    byType: stats,
  };
};

// Static method to validate file type
documentSchema.statics.isValidFileType = function (fileType) {
  const allowedTypes = ['PDF', 'DOC', 'DOCX', 'JPG', 'JPEG', 'PNG'];
  return allowedTypes.includes(fileType.toUpperCase());
};

// Static method to validate file size
documentSchema.statics.isValidFileSize = function (fileSize) {
  return fileSize > 0 && fileSize <= 10485760; // 10MB in bytes
};

const Document = mongoose.model('Document', documentSchema);

export default Document;
