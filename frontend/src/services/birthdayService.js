import api from './api';
import { format, addDays, startOfYear, endOfYear, isAfter, isBefore, parseISO, isSameDay, differenceInDays, differenceInMonths } from 'date-fns';

const birthdayService = {
  /**
   * Get upcoming birthdays for the entire year (not just current month)
   * @param {number} limit - Maximum number of birthdays to return (default: 5)
   * @returns {Promise} API response with upcoming birthdays from entire year
   */
  getUpcomingYearlyBirthdays: async (limit = 5) => {
    try {
      console.log('🎂 [BIRTHDAY SERVICE] Fetching upcoming yearly birthdays...');

      const today = new Date();
      const currentYear = today.getFullYear();

      // Get all birthdays for the entire year using the yearly endpoint
      const response = await birthdayService.getYearlyBirthdays(currentYear);

      if (response.success && response.data) {
        const allBirthdays = response.data;
        
        // Filter birthdays that are upcoming (from today onwards)
        const upcomingBirthdays = allBirthdays.filter(birthday => {
          try {
            const birthdayDate = parseISO(birthday.date);
            // Include today and future birthdays
            return birthdayDate >= today || isSameDay(birthdayDate, today);
          } catch (error) {
            console.warn('Invalid birthday date format:', birthday.date);
            return false;
          }
        });

        // Sort by date (closest first)
        upcomingBirthdays.sort((a, b) => {
          const dateA = parseISO(a.date);
          const dateB = parseISO(b.date);
          return dateA - dateB;
        });

        // Limit the results and format for display
        const limitedBirthdays = upcomingBirthdays.slice(0, limit).map(birthday => 
          birthdayService.formatBirthdayForDisplay(birthday)
        );

        console.log('✅ [BIRTHDAY SERVICE] Found upcoming yearly birthdays:', limitedBirthdays.length);

        return {
          success: true,
          data: limitedBirthdays
        };
      } else {
        console.warn('No birthdays data in yearly API response');
        return {
          success: true,
          data: []
        };
      }
    } catch (error) {
      console.error('❌ [BIRTHDAY SERVICE] Failed to fetch yearly birthdays:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to load birthdays',
        data: []
      };
    }
  },

  /**
   * Get birthdays for the current month
   * @param {number} limit - Maximum number of birthdays to return (default: 5)
   * @returns {Promise} API response with current month birthdays
   */
  getCurrentMonthBirthdays: async (limit = 5) => {
    try {
      console.log('🎂 [BIRTHDAY SERVICE] Fetching current month birthdays...');

      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;

      // Get all birthdays for the current month
      const response = await api.get('/calendar/view/monthly', {
        params: {
          year: currentYear,
          month: currentMonth,
          includeAttendance: false
        }
      });

      if (response.data?.success && response.data?.data?.birthdays) {
        const allBirthdays = response.data.data.birthdays;
        
        // Sort by date (earliest in month first)
        allBirthdays.sort((a, b) => {
          const dateA = parseISO(a.date);
          const dateB = parseISO(b.date);
          return dateA - dateB;
        });

        // Limit the results and format for display
        const limitedBirthdays = allBirthdays.slice(0, limit).map(birthday => 
          birthdayService.formatBirthdayForDisplay(birthday)
        );

        console.log('✅ [BIRTHDAY SERVICE] Found current month birthdays:', limitedBirthdays.length);

        return {
          success: true,
          data: limitedBirthdays
        };
      } else {
        console.warn('No birthdays data in API response');
        return {
          success: true,
          data: []
        };
      }
    } catch (error) {
      console.error('❌ [BIRTHDAY SERVICE] Failed to fetch birthdays:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to load birthdays',
        data: []
      };
    }
  },

  /**
   * Get upcoming birthdays for the current year
   * @param {number} daysAhead - Number of days to look ahead (default: 30)
   * @returns {Promise} API response with upcoming birthdays
   */
  getUpcomingBirthdays: async (daysAhead = 30) => {
    try {
      console.log('🎂 [BIRTHDAY SERVICE] Fetching upcoming birthdays...');

      const currentYear = new Date().getFullYear();
      const today = new Date();
      const endDate = addDays(today, daysAhead);

      // Get all birthdays for the current year
      const response = await api.get('/calendar/view/monthly', {
        params: {
          year: currentYear,
          month: today.getMonth() + 1, // Current month
          includeAttendance: false
        }
      });

      if (response.data?.success && response.data?.data?.birthdays) {
        const allBirthdays = response.data.data.birthdays;
        
        // Filter birthdays that are upcoming (within the next daysAhead days)
        const upcomingBirthdays = allBirthdays.filter(birthday => {
          try {
            const birthdayDate = parseISO(birthday.date);
            return isAfter(birthdayDate, today) && isBefore(birthdayDate, endDate);
          } catch (error) {
            console.warn('Invalid birthday date format:', birthday.date);
            return false;
          }
        });

        // Sort by date (closest first) and format for display
        upcomingBirthdays.sort((a, b) => {
          const dateA = parseISO(a.date);
          const dateB = parseISO(b.date);
          return dateA - dateB;
        });

        const formattedBirthdays = upcomingBirthdays.map(birthday => 
          birthdayService.formatBirthdayForDisplay(birthday)
        );

        console.log('✅ [BIRTHDAY SERVICE] Found upcoming birthdays:', formattedBirthdays.length);

        return {
          success: true,
          data: formattedBirthdays
        };
      } else {
        console.warn('No birthdays data in API response');
        return {
          success: true,
          data: []
        };
      }
    } catch (error) {
      console.error('❌ [BIRTHDAY SERVICE] Failed to fetch birthdays:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to load birthdays',
        data: []
      };
    }
  },

  /**
   * Get all birthdays for a specific year
   * @param {number} year - Year to get birthdays for (default: current year)
   * @returns {Promise} API response with all birthdays for the year
   */
  getYearlyBirthdays: async (year = new Date().getFullYear()) => {
    try {
      console.log(`🎂 [BIRTHDAY SERVICE] Fetching birthdays for year ${year}...`);

      const startDate = startOfYear(new Date(year, 0, 1));
      const endDate = endOfYear(new Date(year, 11, 31));

      // Use the unified calendar events endpoint
      const response = await api.get('/calendar/view/events', {
        params: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd')
        }
      });

      if (response.data?.success && response.data?.data?.birthdays) {
        const birthdays = response.data.data.birthdays;
        
        // Sort by date
        birthdays.sort((a, b) => {
          const dateA = parseISO(a.date);
          const dateB = parseISO(b.date);
          return dateA - dateB;
        });

        console.log('✅ [BIRTHDAY SERVICE] Found yearly birthdays:', birthdays.length);

        return {
          success: true,
          data: birthdays
        };
      } else {
        return {
          success: true,
          data: []
        };
      }
    } catch (error) {
      console.error('❌ [BIRTHDAY SERVICE] Failed to fetch yearly birthdays:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to load birthdays',
        data: []
      };
    }
  },

  /**
   * Get birthdays for a specific month
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise} API response with birthdays for the month
   */
  getMonthlyBirthdays: async (year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
    try {
      console.log(`🎂 [BIRTHDAY SERVICE] Fetching birthdays for ${year}-${month}...`);

      const response = await api.get('/calendar/view/monthly', {
        params: {
          year,
          month,
          includeAttendance: false
        }
      });

      if (response.data?.success && response.data?.data?.birthdays) {
        const birthdays = response.data.data.birthdays;
        
        // Sort by date
        birthdays.sort((a, b) => {
          const dateA = parseISO(a.date);
          const dateB = parseISO(b.date);
          return dateA - dateB;
        });

        console.log('✅ [BIRTHDAY SERVICE] Found monthly birthdays:', birthdays.length);

        return {
          success: true,
          data: birthdays
        };
      } else {
        return {
          success: true,
          data: []
        };
      }
    } catch (error) {
      console.error('❌ [BIRTHDAY SERVICE] Failed to fetch monthly birthdays:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to load birthdays',
        data: []
      };
    }
  },

  /**
   * Get today's birthdays
   * @returns {Promise} API response with today's birthdays
   */
  getTodaysBirthdays: async () => {
    try {
      console.log('🎂 [BIRTHDAY SERVICE] Fetching today\'s birthdays...');

      const today = format(new Date(), 'yyyy-MM-dd');

      const response = await api.get('/calendar/view/daily', {
        params: {
          date: today
        }
      });

      if (response.data?.success && response.data?.data?.birthdays) {
        const birthdays = response.data.data.birthdays;

        console.log('✅ [BIRTHDAY SERVICE] Found today\'s birthdays:', birthdays.length);

        return {
          success: true,
          data: birthdays
        };
      } else {
        return {
          success: true,
          data: []
        };
      }
    } catch (error) {
      console.error('❌ [BIRTHDAY SERVICE] Failed to fetch today\'s birthdays:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to load birthdays',
        data: []
      };
    }
  },

  /**
   * Format birthday data for display
   * @param {Object} birthday - Birthday object from API
   * @returns {Object} Formatted birthday data
   */
  formatBirthdayForDisplay: (birthday) => {
    try {
      const birthdayDate = parseISO(birthday.date);
      const today = new Date();
      const daysUntil = differenceInDays(birthdayDate, today);

      // Create display text based on days until birthday
      let displayText = '';
      if (daysUntil === 0) {
        displayText = 'Today';
      } else if (daysUntil === 1) {
        displayText = 'Tomorrow';
      } else if (daysUntil > 1) {
        // If more than 30 days, show in months
        if (daysUntil > 30) {
          const monthsUntil = differenceInMonths(birthdayDate, today);
          const remainingDays = daysUntil - (monthsUntil * 30); // Approximate remaining days
          
          if (monthsUntil === 1) {
            displayText = remainingDays > 5 ? `1 month ${remainingDays} days` : '1 month';
          } else if (monthsUntil > 1) {
            displayText = remainingDays > 5 ? `${monthsUntil} months ${remainingDays} days` : `${monthsUntil} months`;
          } else {
            // If less than 1 month but more than 30 days, just show days
            displayText = `${daysUntil} days`;
          }
        } else {
          displayText = `${daysUntil} days`;
        }
      } else if (daysUntil === -1) {
        displayText = 'Yesterday';
      } else if (daysUntil < -1) {
        displayText = `${Math.abs(daysUntil)} days ago`;
      }

      return {
        ...birthday,
        formattedDate: format(birthdayDate, 'dd MMM'), // Format like "24 Jan"
        fullDate: format(birthdayDate, 'MMMM dd, yyyy'),
        daysUntil: daysUntil,
        isToday: daysUntil === 0,
        isTomorrow: daysUntil === 1,
        isThisWeek: daysUntil >= 0 && daysUntil <= 7,
        isPast: daysUntil < 0,
        displayText: displayText,
        // Combined format like "02 Feb - 4 days" or "01 Oct - 8 months"
        dateWithDays: `${format(birthdayDate, 'dd MMM')} - ${displayText}`
      };
    } catch (error) {
      console.warn('Error formatting birthday:', error);
      return birthday;
    }
  }
};

export default birthdayService;