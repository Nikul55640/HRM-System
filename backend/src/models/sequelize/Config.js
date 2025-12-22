import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Config = sequelize.define('Config', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  tableName: 'configs',
  timestamps: true,
  indexes: [
    {
      fields: ['key'],
      unique: true,
    },
    {
      fields: ['category'],
    },
    {
      fields: ['isActive'],
    },
  ],
});

// Static methods
Config.getByKey = async function(key) {
  const config = await this.findOne({
    where: { key, isActive: true },
  });
  return config ? config.value : null;
};

Config.setByKey = async function(key, value, userId = null) {
  const [config, created] = await this.findOrCreate({
    where: { key },
    defaults: {
      key,
      value,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  if (!created) {
    config.value = value;
    config.updatedBy = userId;
    await config.save();
  }

  return config;
};

Config.setConfig = async function(key, value, userId = null, description = null) {
  const [config, created] = await this.findOrCreate({
    where: { key },
    defaults: {
      key,
      value,
      description,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  if (!created) {
    config.value = value;
    config.description = description || config.description;
    config.updatedBy = userId;
    await config.save();
  }

  return config;
};

Config.deleteConfig = async function(key) {
  const config = await this.findOne({
    where: { key },
  });

  if (config) {
    await config.destroy();
  }

  return config;
};

Config.getByCategory = async function(category) {
  return await this.findAll({
    where: { category, isActive: true },
    order: [['key', 'ASC']],
  });
};

Config.getMultiple = async function(keys) {
  const configs = await this.findAll({
    where: { 
      key: keys,
      isActive: true 
    },
  });

  const result = {};
  configs.forEach(config => {
    result[config.key] = config.value;
  });

  return result;
};

Config.initializeDefaults = async function() {
  const defaults = [
    {
      key: 'custom_employee_fields',
      value: [],
      description: 'Custom employee profile fields',
      category: 'employee',
      isSystem: true,
    },
    {
      key: 'custom_document_categories',
      value: ['Resume', 'Contract', 'Certification', 'Identification', 'Performance Review', 'Other'],
      description: 'Document category definitions',
      category: 'document',
      isSystem: true,
    },
    {
      key: 'employee_id_prefix',
      value: 'EMP',
      description: 'Prefix for auto-generated employee IDs',
      category: 'employee',
      isSystem: true,
    },
  ];

  for (const defaultConfig of defaults) {
    await this.findOrCreate({
      where: { key: defaultConfig.key },
      defaults: defaultConfig,
    });
  }
};

export default Config;