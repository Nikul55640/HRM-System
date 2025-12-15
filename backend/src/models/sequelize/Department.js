import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  parentDepartment: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Departments',
      key: 'id',
    },
  },
  manager: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id',
    },
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
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
  tableName: 'departments',
  timestamps: true,
  indexes: [
    {
      fields: ['name'],
    },
    {
      fields: ['code'],
    },
    {
      fields: ['parentDepartment'],
    },
  ],
});

// Static methods
Department.isCodeUnique = async function(code, excludeId = null) {
  const where = { code };
  if (excludeId) {
    where.id = { [sequelize.Sequelize.Op.ne]: excludeId };
  }
  const existing = await this.findOne({ where });
  return !existing;
};

Department.searchDepartments = async function(searchTerm) {
  return await this.findAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { name: { [sequelize.Sequelize.Op.like]: `%${searchTerm}%` } },
        { code: { [sequelize.Sequelize.Op.like]: `%${searchTerm}%` } }
      ],
      isActive: true,
    },
    order: [['name', 'ASC']],
  });
};

export default Department;