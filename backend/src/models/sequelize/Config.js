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

Config.getByCategory = async function(category) {
  return await this.findAll({
    where: { category, isActive: true },
    order: [['key', 'ASC']],
  });
};

export default Config;