import mongoose from 'mongoose';

const { Schema } = mongoose;

// Config Schema
const configSchema = new Schema(
  {
    key: {
      type: String,
      required: [true, 'Config key is required'],
      trim: true,
      maxlength: [100, 'Config key cannot exceed 100 characters'],
    },
    value: {
      type: Schema.Types.Mixed,
      required: [true, 'Config value is required'],
    },
    category: {
      type: String,
      trim: true,
      enum: {
        values: ['system', 'employee', 'document', 'notification', 'security', 'other'],
        message: '{VALUE} is not a valid category',
      },
      default: 'other',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

// Indexes
// Note: key and category indexes are created via index: true in schema definition
configSchema.index({ key: 1 }, { unique: true });
configSchema.index({ updatedAt: -1 });

// Static method to get config by key
configSchema.statics.getByKey = async function (key) {
  return this.findOne({ key });
};

// Static method to get all configs by category
configSchema.statics.getByCategory = function (category) {
  return this.find({ category }).sort({ key: 1 });
};

// Static method to set or update config
configSchema.statics.setConfig = async function (key, value, userId, description = null) {
  const config = await this.findOne({ key });

  if (config) {
    // Update existing config
    config.value = value;
    config.updatedBy = userId;
    if (description) {
      config.description = description;
    }
    await config.save();
    return config;
  }

  // Create new config
  return this.create({
    key,
    value,
    updatedBy: userId,
    description,
  });
};

// Static method to delete config
configSchema.statics.deleteConfig = async function (key) {
  return this.findOneAndDelete({ key });
};

// Static method to get multiple configs by keys
configSchema.statics.getMultiple = async function (keys) {
  const configs = await this.find({ key: { $in: keys } });

  // Return as key-value map
  const configMap = {};
  configs.forEach((config) => {
    configMap[config.key] = config.value;
  });

  return configMap;
};

// Static method to initialize default configs
configSchema.statics.initializeDefaults = async function () {
  const defaults = [
    {
      key: 'custom_employee_fields',
      value: [],
      category: 'employee',
      description: 'Custom fields for employee profiles',
    },
    {
      key: 'custom_document_categories',
      value: ['Resume', 'Contract', 'Certification', 'Identification', 'Performance Review', 'Other'],
      category: 'document',
      description: 'Available document categories',
    },
    {
      key: 'employee_id_prefix',
      value: 'EMP',
      category: 'employee',
      description: 'Prefix for auto-generated employee IDs',
    },
    {
      key: 'password_expiry_days',
      value: 90,
      category: 'security',
      description: 'Number of days before password expires',
    },
    {
      key: 'max_login_attempts',
      value: 5,
      category: 'security',
      description: 'Maximum failed login attempts before account lockout',
    },
    {
      key: 'session_timeout_minutes',
      value: 60,
      category: 'security',
      description: 'Session timeout in minutes',
    },
  ];

  for (const defaultConfig of defaults) {
    const existing = await this.findOne({ key: defaultConfig.key });
    if (!existing) {
      await this.create(defaultConfig);
    }
  }
};

// Instance method to format config for display
configSchema.methods.formatForDisplay = function () {
  return {
    id: this._id,
    key: this.key,
    value: this.value,
    category: this.category,
    description: this.description,
    updatedBy: this.updatedBy,
    updatedAt: this.updatedAt,
  };
};

const Config = mongoose.model('Config', configSchema);

export default Config;
