import { DataTypes } from 'sequelize';

const Holiday = (sequelize) => {
  const HolidayModel = sequelize.define('Holiday', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    type: {
      type: DataTypes.ENUM('public', 'optional', 'national', 'religious', 'company'),
      allowNull: false,
      defaultValue: 'public',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    recurrencePattern: {
      type: DataTypes.ENUM('yearly', 'monthly', 'weekly'),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(7), // Hex color code
      allowNull: true,
      defaultValue: '#dc2626', // Red color for holidays
      validate: {
        is: /^#[0-9A-F]{6}$/i, // Hex color validation
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    tableName: 'holidays',
    timestamps: true,
    indexes: [
      {
        fields: ['date'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['isActive'],
      },
    ],
  });

  // Instance methods
  HolidayModel.prototype.toJSON = function() {
    const values = { ...this.get() };
    return values;
  };

  // Static methods
  HolidayModel.getHolidaysInRange = async function(startDate, endDate, filters = {}) {
    const whereClause = {
      date: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate],
      },
      isActive: true,
      ...filters,
    };

    return await this.findAll({
      where: whereClause,
      order: [['date', 'ASC']],
    });
  };

  HolidayModel.getUpcomingHolidays = async function(limit = 5) {
    const today = new Date();
    
    return await this.findAll({
      where: {
        date: {
          [sequelize.Sequelize.Op.gte]: today,
        },
        isActive: true,
      },
      order: [['date', 'ASC']],
      limit,
    });
  };

  HolidayModel.isHoliday = async function(date) {
    const holiday = await this.findOne({
      where: {
        date: date,
        isActive: true,
      },
    });
    
    return holiday !== null;
  };

  return HolidayModel;
};

export default Holiday;