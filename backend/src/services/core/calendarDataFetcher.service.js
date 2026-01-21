/**
 * Calendar Data Fetcher Service
 * Centralized data fetching for calendar components
 * Eliminates duplication across calendar controllers
 */

import { CompanyEvent, Employee, LeaveRequest, Holiday } from '../../models/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';
import {
  normalizeCompanyEvent,
  normalizeHoliday,
  normalizeLeaveRequest,
  normalizeBirthday,
  normalizeAnniversary,
  isEventInDateRange
} from '../../utils/calendarEventNormalizer.js';

class CalendarDataFetcherService {
    /**
     * Build date range filter for events
     * @param {Date} startDate - Range start date
     * @param {Date} endDate - Range end date
     * @returns {Object} Sequelize where clause for date range
     */
    static buildDateRangeFilter(startDate, endDate) {
        return {
            [Op.or]: [
                // Event starts in range
                {
                    startDate: { [Op.between]: [startDate, endDate] }
                },
                // Event ends in range
                {
                    endDate: { [Op.between]: [startDate, endDate] }
                },
                // Event spans the entire range
                {
                    startDate: { [Op.lte]: startDate },
                    endDate: { [Op.gte]: endDate }
                }
            ]
        };
    }

    /**
     * Fetch holidays for date range
     * @param {Date} startDate - Range start date
     * @param {Date} endDate - Range end date
     * @returns {Promise<Array>} Normalized holiday events
     */
    static async fetchHolidays(startDate, endDate) {
        try {
            const holidays = await Holiday.findAll({
                where: {
                    [Op.or]: [
                        // One-time holidays
                        {
                            type: 'ONE_TIME',
                            date: { [Op.between]: [startDate, endDate] },
                            isActive: true
                        },
                        // Recurring holidays (check MM-DD format)
                        {
                            type: 'RECURRING',
                            isActive: true
                        }
                    ]
                },
                attributes: [
                    'id', 'name', 'date', 'type', 'recurringDate', 
                    'category', 'description', 'color', 'isPaid', 
                    'appliesEveryYear', 'isActive'
                ],
                order: [['date', 'ASC']]
            });

            // Filter recurring holidays for the date range
            const normalizedHolidays = [];
            holidays.forEach(holiday => {
                if (holiday.type === 'RECURRING') {
                    // Generate holiday for each year in the range
                    const startYear = startDate.getFullYear();
                    const endYear = endDate.getFullYear();
                    
                    for (let year = startYear; year <= endYear; year++) {
                        const [month, day] = holiday.recurringDate.split('-').map(Number);
                        const holidayDate = new Date(year, month - 1, day);
                        
                        if (holidayDate >= startDate && holidayDate <= endDate) {
                            const yearlyHoliday = {
                                ...holiday.toJSON(),
                                date: holidayDate
                            };
                            normalizedHolidays.push(normalizeHoliday(yearlyHoliday));
                        }
                    }
                } else {
                    normalizedHolidays.push(normalizeHoliday(holiday));
                }
            });

            return normalizedHolidays;

        } catch (error) {
            logger.error('Error fetching holidays:', error);
            throw error;
        }
    }

    /**
     * Fetch company events for date range
     * @param {Date} startDate - Range start date
     * @param {Date} endDate - Range end date
     * @param {Object} user - Current user for permission filtering
     * @param {number} departmentId - Optional department filter
     * @returns {Promise<Array>} Normalized company events
     */
    static async fetchCompanyEvents(startDate, endDate, user, departmentId = null) {
        try {
            const isHROrAdmin = ['SuperAdmin', 'HR', 'HR_Manager'].includes(user.role);
            
            const eventFilters = {
                ...this.buildDateRangeFilter(startDate, endDate),
                status: 'scheduled',
                eventType: { [Op.ne]: 'holiday' }
            };

            // Apply permission-based filtering
            if (!isHROrAdmin) {
                eventFilters[Op.and] = [
                    eventFilters[Op.and] || {},
                    {
                        [Op.or]: [
                            { isPublic: true },
                            { createdBy: user.id },
                            { organizer: user.id }
                        ]
                    }
                ];
            }

            // Apply department filter if provided
            if (departmentId) {
                eventFilters.departmentId = departmentId;
            }

            const companyEvents = await CompanyEvent.findAll({
                where: eventFilters,
                attributes: [
                    'id', 'title', 'description', 'startDate', 'endDate', 
                    'eventType', 'isAllDay', 'color', 'location', 'priority', 
                    'organizer', 'isPublic', 'status'
                ],
                order: [['startDate', 'ASC']]
            });

            return companyEvents.map(event => normalizeCompanyEvent(event));

        } catch (error) {
            logger.error('Error fetching company events:', error);
            throw error;
        }
    }

    /**
     * Fetch leave requests for date range
     * @param {Date} startDate - Range start date
     * @param {Date} endDate - Range end date
     * @param {Object} user - Current user for permission filtering
     * @param {number} employeeId - Optional employee filter
     * @returns {Promise<Array>} Normalized leave events
     */
    static async fetchLeaveRequests(startDate, endDate, user, employeeId = null) {
        try {
            const isHROrAdmin = ['SuperAdmin', 'HR', 'HR_Manager'].includes(user.role);
            const isManager = user.role === 'Manager';

            const leaveFilters = {
                ...this.buildDateRangeFilter(startDate, endDate),
                status: 'approved'
            };

            // Apply role-based filtering
            if (!isHROrAdmin) {
                if (isManager) {
                    // Managers can see their team's leaves
                    const teamEmployees = await Employee.findAll({
                        where: { reportingManager: user.id },
                        attributes: ['id']
                    });
                    const teamIds = teamEmployees.map(emp => emp.id);
                    teamIds.push(user.employee?.id);
                    leaveFilters.employeeId = { [Op.in]: teamIds };
                } else {
                    // Regular employees see only their own leaves
                    leaveFilters.employeeId = user.employee?.id;
                }
            }

            // Apply specific employee filter if provided
            if (employeeId) {
                leaveFilters.employeeId = employeeId;
            }

            const leaves = await LeaveRequest.findAll({
                where: leaveFilters,
                include: [{
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'employeeId', 'firstName', 'lastName', 'department']
                }],
                order: [['startDate', 'ASC']]
            });

            return leaves.map(leave => normalizeLeaveRequest(leave));

        } catch (error) {
            logger.error('Error fetching leave requests:', error);
            throw error;
        }
    }

    /**
     * Fetch and generate birthday events for date range
     * @param {Date} startDate - Range start date
     * @param {Date} endDate - Range end date
     * @param {number} departmentId - Optional department filter
     * @returns {Promise<Array>} Normalized birthday events
     */
    static async fetchBirthdayEvents(startDate, endDate, departmentId = null) {
        try {
            const employeeFilters = { 
                status: 'Active',
                dateOfBirth: { [Op.ne]: null }
            };

            if (departmentId) {
                employeeFilters.department = departmentId;
            }

            const employees = await Employee.findAll({
                where: employeeFilters,
                attributes: ['id', 'employeeId', 'firstName', 'lastName', 'dateOfBirth', 'department']
            });

            const birthdayEvents = [];
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();

            employees.forEach(employee => {
                if (employee.dateOfBirth) {
                    // Generate birthday events for each year in the range
                    for (let year = startYear; year <= endYear; year++) {
                        const birthdayEvent = normalizeBirthday(employee, year);
                        if (isEventInDateRange(birthdayEvent, startDate, endDate)) {
                            birthdayEvents.push(birthdayEvent);
                        }
                    }
                }
            });

            return birthdayEvents;

        } catch (error) {
            logger.error('Error fetching birthday events:', error);
            throw error;
        }
    }

    /**
     * Fetch and generate anniversary events for date range
     * @param {Date} startDate - Range start date
     * @param {Date} endDate - Range end date
     * @param {number} departmentId - Optional department filter
     * @returns {Promise<Array>} Normalized anniversary events
     */
    static async fetchAnniversaryEvents(startDate, endDate, departmentId = null) {
        try {
            const employeeFilters = { 
                status: 'Active',
                joiningDate: { [Op.ne]: null }
            };

            if (departmentId) {
                employeeFilters.department = departmentId;
            }

            const employees = await Employee.findAll({
                where: employeeFilters,
                attributes: ['id', 'employeeId', 'firstName', 'lastName', 'joiningDate', 'department']
            });

            const anniversaryEvents = [];
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();

            employees.forEach(employee => {
                if (employee.joiningDate) {
                    const joinYear = new Date(employee.joiningDate).getFullYear();
                    
                    // Generate anniversary events for each year in the range
                    for (let year = startYear; year <= endYear; year++) {
                        // Only generate if employee has been with company for at least 1 year
                        if (year > joinYear) {
                            const anniversaryEvent = normalizeAnniversary(employee, year);
                            if (isEventInDateRange(anniversaryEvent, startDate, endDate)) {
                                anniversaryEvents.push(anniversaryEvent);
                            }
                        }
                    }
                }
            });

            return anniversaryEvents;

        } catch (error) {
            logger.error('Error fetching anniversary events:', error);
            throw error;
        }
    }

    /**
     * Fetch all calendar data for a date range
     * @param {Date} startDate - Range start date
     * @param {Date} endDate - Range end date
     * @param {Object} user - Current user
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} All calendar data
     */
    static async fetchAllCalendarData(startDate, endDate, user, options = {}) {
        try {
            const { departmentId, employeeId, includeEvents = true, includeLeaves = true, 
                    includeBirthdays = true, includeAnniversaries = true, includeHolidays = true } = options;

            const results = await Promise.allSettled([
                includeHolidays ? this.fetchHolidays(startDate, endDate) : Promise.resolve([]),
                includeEvents ? this.fetchCompanyEvents(startDate, endDate, user, departmentId) : Promise.resolve([]),
                includeLeaves ? this.fetchLeaveRequests(startDate, endDate, user, employeeId) : Promise.resolve([]),
                includeBirthdays ? this.fetchBirthdayEvents(startDate, endDate, departmentId) : Promise.resolve([]),
                includeAnniversaries ? this.fetchAnniversaryEvents(startDate, endDate, departmentId) : Promise.resolve([])
            ]);

            // Extract successful results and log any failures
            const [holidays, events, leaves, birthdays, anniversaries] = results.map((result, index) => {
                if (result.status === 'rejected') {
                    const types = ['holidays', 'events', 'leaves', 'birthdays', 'anniversaries'];
                    logger.error(`Failed to fetch ${types[index]}:`, result.reason);
                    return [];
                }
                return result.value;
            });

            return {
                holidays,
                events,
                leaves,
                birthdays,
                anniversaries,
                summary: {
                    totalHolidays: holidays.length,
                    totalEvents: events.length,
                    totalLeaves: leaves.length,
                    totalBirthdays: birthdays.length,
                    totalAnniversaries: anniversaries.length
                }
            };

        } catch (error) {
            logger.error('Error fetching all calendar data:', error);
            throw error;
        }
    }
}

export default CalendarDataFetcherService;