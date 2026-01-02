import holidayService from '../../services/admin/holiday.service.js';
import logger from '../../utils/logger.js';

// Get all holidays
export const getHolidays = async (req, res) => {
  try {
    const result = await holidayService.getHolidays(req.query, req.query);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Error fetching holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays',
      error: error.message
    });
  }
};

// Get holiday by ID
export const getHolidayById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await holidayService.getHolidayById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error('Error fetching holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holiday',
      error: error.message
    });
  }
};

// Create new holiday
export const createHoliday = async (req, res) => {
  try {
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const result = await holidayService.createHoliday(req.body, req.user.id, metadata);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create holiday',
      error: error.message
    });
  }
};

// Update holiday
export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      date,
      type,
      isRecurring,
      recurrenceRule,
      applicableTo,
      departments,
      employees,
      isOptional,
      isPaid,
      isActive,
      color,
      location,
      workingHours,
      compensationRule
    } = req.body;

    const holiday = await Holiday.findByPk(id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    // Check if another holiday with same name and date exists
    const existingHoliday = await Holiday.findOne({
      where: {
        id: { [Op.ne]: id },
        name: name,
        date: date
      }
    });

    if (existingHoliday) {
      return res.status(400).json({
        success: false,
        message: 'Another holiday with this name and date already exists'
      });
    }

    await holiday.update({
      name,
      description,
      date,
      type,
      isRecurring,
      recurrenceRule,
      applicableTo,
      departments,
      employees,
      isOptional,
      isPaid,
      isActive,
      color,
      location,
      workingHours,
      compensationRule,
      updatedBy: req.user.id
    });

    const updatedHoliday = await Holiday.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Holiday updated successfully',
      data: updatedHoliday
    });
  } catch (error) {
    logger.error('Error updating holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update holiday',
      error: error.message
    });
  }
};

// Delete holiday
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findByPk(id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    await holiday.destroy();

    res.json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete holiday',
      error: error.message
    });
  }
};

// Toggle holiday status
export const toggleHolidayStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findByPk(id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    await holiday.update({
      isActive: !holiday.isActive,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: `Holiday ${holiday.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: holiday.isActive }
    });
  } catch (error) {
    logger.error('Error toggling holiday status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle holiday status',
      error: error.message
    });
  }
};

// Get holidays for calendar
export const getHolidaysForCalendar = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const whereClause = {
      isActive: true
    };

    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (type) {
      whereClause.type = type;
    }

    const holidays = await Holiday.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'date', 'type', 'color', 'isOptional', 'isPaid'],
      order: [['date', 'ASC']]
    });

    res.json({
      success: true,
      data: holidays
    });
  } catch (error) {
    logger.error('Error fetching holidays for calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holidays for calendar',
      error: error.message
    });
  }
};

// Get upcoming holidays
export const getUpcomingHolidays = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const today = new Date().toISOString().split('T')[0];

    const holidays = await Holiday.findAll({
      where: {
        date: { [Op.gte]: today },
        isActive: true
      },
      attributes: ['id', 'name', 'date', 'type', 'color'],
      limit: parseInt(limit),
      order: [['date', 'ASC']]
    });

    res.json({
      success: true,
      data: holidays
    });
  } catch (error) {
    logger.error('Error fetching upcoming holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming holidays',
      error: error.message
    });
  }
};

// Check if date is holiday
export const checkHoliday = async (req, res) => {
  try {
    const { date } = req.params;

    const holiday = await Holiday.findOne({
      where: {
        date: date,
        isActive: true
      },
      attributes: ['id', 'name', 'type', 'isOptional', 'isPaid', 'compensationRule']
    });

    res.json({
      success: true,
      data: {
        isHoliday: !!holiday,
        holiday: holiday || null
      }
    });
  } catch (error) {
    logger.error('Error checking holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check holiday',
      error: error.message
    });
  }
};