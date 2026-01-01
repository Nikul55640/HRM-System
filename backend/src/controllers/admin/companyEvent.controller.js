import { CompanyEvent, User } from '../../models/index.js';
import { auditLogger } from '../../utils/auditLogger.js';
import { Op } from 'sequelize';

// Get all company events
export const getAllEvents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, startDate, endDate, type } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};

        // Search filter
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } }
            ];
        }

        // Date range filter
        if (startDate && endDate) {
            whereClause.startDate = {
                [Op.between]: [startDate, endDate]
            };
        } else if (startDate) {
            whereClause.startDate = { [Op.gte]: startDate };
        } else if (endDate) {
            whereClause.startDate = { [Op.lte]: endDate };
        }

        // Type filter
        if (type) {
            whereClause.type = type;
        }

        const { count, rows: events } = await CompanyEvent.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'email']
                },
                {
                    model: User,
                    as: 'organizerUser',
                    attributes: ['id', 'email']
                }
            ],
            order: [['startDate', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                events,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching company events:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_EVENTS_ERROR',
                message: 'Failed to fetch company events'
            }
        });
    }
};

// Get upcoming events (next 30 days)
export const getUpcomingEvents = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const events = await CompanyEvent.findAll({
            where: {
                startDate: {
                    [Op.between]: [today, thirtyDaysFromNow]
                }
            },
            include: [
                {
                    model: User,
                    as: 'organizerUser',
                    attributes: ['id', 'email']
                }
            ],
            order: [['startDate', 'ASC']],
            limit: 10
        });

        res.json({
            success: true,
            data: { events }
        });
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_UPCOMING_EVENTS_ERROR',
                message: 'Failed to fetch upcoming events'
            }
        });
    }
};

// Get event by ID
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await CompanyEvent.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'email']
                },
                {
                    model: User,
                    as: 'organizerUser',
                    attributes: ['id', 'email']
                }
            ]
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: 'Company event not found'
                }
            });
        }

        res.json({
            success: true,
            data: { event }
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_EVENT_ERROR',
                message: 'Failed to fetch company event'
            }
        });
    }
};

// Create new event
export const createEvent = async (req, res) => {
    try {
        const {
            name,
            description,
            date,
            startTime,
            endTime,
            location,
            type,
            organizer,
            isAllDay,
            reminderMinutes,
            isRecurring,
            recurrencePattern
        } = req.body;

        // Validation
        if (!name || !date) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Event name and date are required'
                }
            });
        }

        const event = await CompanyEvent.create({
            name,
            description,
            date,
            startTime,
            endTime,
            location,
            type: type || 'meeting',
            organizer,
            isAllDay: isAllDay || false,
            reminderMinutes: reminderMinutes || 15,
            isRecurring: isRecurring || false,
            recurrencePattern: recurrencePattern || null,
            createdBy: req.user.id
        });

        // Log audit
        await auditLogger.log({
            userId: req.user.id,
            action: 'event_create',
            module: 'calendar',
            targetType: 'CompanyEvent',
            targetId: event.id,
            newValues: event.toJSON(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            data: { event },
            message: 'Company event created successfully'
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CREATE_EVENT_ERROR',
                message: 'Failed to create company event'
            }
        });
    }
};

// Update event
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const event = await CompanyEvent.findByPk(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: 'Company event not found'
                }
            });
        }

        const oldValues = event.toJSON();

        await event.update({
            ...updateData,
            updatedBy: req.user.id
        });

        // Log audit
        await auditLogger.log({
            userId: req.user.id,
            action: 'event_update',
            module: 'calendar',
            targetType: 'CompanyEvent',
            targetId: event.id,
            oldValues,
            newValues: event.toJSON(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            data: { event },
            message: 'Company event updated successfully'
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'UPDATE_EVENT_ERROR',
                message: 'Failed to update company event'
            }
        });
    }
};

// Delete event
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await CompanyEvent.findByPk(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: 'Company event not found'
                }
            });
        }

        const oldValues = event.toJSON();
        await event.destroy();

        // Log audit
        await auditLogger.log({
            userId: req.user.id,
            action: 'event_delete',
            module: 'calendar',
            targetType: 'CompanyEvent',
            targetId: id,
            oldValues,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Company event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'DELETE_EVENT_ERROR',
                message: 'Failed to delete company event'
            }
        });
    }
};