import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import employeeDashboardService from '../../../../../services/employeeDashboardService';
import employeeCalendarService from '../../../../../services/employeeCalendarService';
import { usePermissions } from '../../../../../core/hooks';
import { MODULES } from '../../../../../core/utils/rolePermissions';
import useAuthStore from '../../../../../stores/useAuthStore';

/**
 * Dashboard Team Data Hook - Handles team-related data (birthdays, leave, WFH)
 * Extracted from EmployeeDashboard.jsx to separate concerns
 */
export const useDashboardTeam = () => {
  const [teamOnLeave, setTeamOnLeave] = useState([]);
  const [teamWFH, setTeamWFH] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [teamDataLoading, setTeamDataLoading] = useState(false);
  const [birthdaysLoading, setBirthdaysLoading] = useState(false);

  const { can } = usePermissions();

  const fetchTeamData = async (silent = false) => {
    if (!silent) setTeamDataLoading(true);
    
    try {
      console.log('🏢 [DASHBOARD] Fetching team data...');
      
      if (!can.do(MODULES.ATTENDANCE?.VIEW_COMPANY_STATUS)) {
        console.log('🔐 [DASHBOARD] No permission for company status - skipping team data');
        setTeamOnLeave([]);
        setTeamWFH([]);
        return;
      }
      
      const leaveResponse = await employeeDashboardService.getTodayLeaveData();
      
      if (leaveResponse.success) {
        console.log('✅ [DASHBOARD] Leave data loaded:', leaveResponse.data?.length || 0, 'employees');
        setTeamOnLeave(leaveResponse.data || []);
      } else {
        console.warn('❌ [DASHBOARD] Leave data failed:', leaveResponse.message);
        setTeamOnLeave([]);
      }

      const wfhResponse = await employeeDashboardService.getTodayWFHData();
      
      if (wfhResponse.success) {
        console.log('✅ [DASHBOARD] WFH data loaded:', wfhResponse.data?.length || 0, 'employees');
        setTeamWFH(wfhResponse.data || []);
      } else {
        console.warn('❌ [DASHBOARD] WFH data failed:', wfhResponse.message);
        setTeamWFH([]);
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Team data API error:', error);
      
      if (error.response?.status === 403) {
        console.error('🔐 [DASHBOARD] 403 Forbidden - User does not have permission to view company status');
      } else if (error.response?.status === 401) {
        console.error('🔐 [DASHBOARD] 401 Unauthorized - Authentication issue');
        const { logout } = useAuthStore.getState();
        logout();
        return;
      }
      
      setTeamOnLeave([]);
      setTeamWFH([]);
    } finally {
      if (!silent) setTeamDataLoading(false);
    }
  };

  const fetchUpcomingBirthdays = async (silent = false) => {
    if (!silent) setBirthdaysLoading(true);
    
    try {
      console.log('🎂 [DASHBOARD] Fetching upcoming birthdays (enhanced - next 6 months)...');
      
      const response = await employeeCalendarService.getUpcomingBirthdays(10);
      
      if (response.success) {
        const allBirthdays = response.data || [];
        
        console.log('🎂 [DASHBOARD] Raw birthdays from service:', allBirthdays.length);
        console.log('🎂 [DASHBOARD] Raw birthday data:', allBirthdays);
        
        allBirthdays.forEach((birthday, i) => {
          console.log(`🎂 [DASHBOARD] Raw birthday ${i + 1}:`, {
            employeeName: birthday.employeeName,
            date: birthday.date,
            title: birthday.title,
            rawData: birthday
          });
        });
        
        const today = new Date();
        const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const upcomingBirthdays = allBirthdays
          .map((birthday, index) => {
            console.log(`🎂 [DASHBOARD] Processing birthday ${index + 1}:`, birthday);
            
            let birthdayDate;
            const dateStr = birthday.date;
            
            if (!dateStr) {
              console.warn('🎂 [DASHBOARD] Birthday missing date:', birthday);
              return null;
            }
            
            try {
              if (dateStr.includes('T')) {
                birthdayDate = new Date(dateStr.split('T')[0] + 'T00:00:00');
              } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                const [year, month, day] = dateStr.split('-').map(Number);
                birthdayDate = new Date(year, month - 1, day);
              } else {
                console.warn('🎂 [DASHBOARD] Invalid date format:', dateStr);
                return null;
              }
              
              console.log(`🎂 [DASHBOARD] Parsed birthday date for ${birthday.employeeName}:`, birthdayDate);
              
              const thisYear = todayLocal.getFullYear();
              let birthdayThisYear = new Date(thisYear, birthdayDate.getMonth(), birthdayDate.getDate());
              
              let daysUntil = Math.ceil((birthdayThisYear - todayLocal) / (1000 * 60 * 60 * 24));
              
              if (daysUntil < 0) {
                birthdayThisYear.setFullYear(thisYear + 1);
                daysUntil = Math.ceil((birthdayThisYear - todayLocal) / (1000 * 60 * 60 * 24));
              }
              
              const isToday = birthdayThisYear.toDateString() === todayLocal.toDateString();
              
              console.log(`🎂 [DASHBOARD] Calculated for ${birthday.employeeName}: ${birthdayThisYear.toDateString()} (${daysUntil} days until)`);
              
              return {
                ...birthday,
                nextBirthdayDate: birthdayThisYear,
                daysUntil: daysUntil,
                isToday: isToday,
                department: birthday.department || birthday.departmentName || null
              };
              
            } catch (error) {
              console.error('🎂 [DASHBOARD] Error processing birthday date:', dateStr, error);
              return null;
            }
          })
          .filter(birthday => {
            if (birthday === null) {
              console.log('🎂 [DASHBOARD] Filtered out null birthday');
              return false;
            }
            
            const isWithinRange = birthday.daysUntil <= 180;
            if (!isWithinRange) {
              console.log(`🎂 [DASHBOARD] Filtered out birthday beyond 6 months: ${birthday.employeeName} (${birthday.daysUntil} days)`);
            }
            return isWithinRange;
          })
          .sort((a, b) => a.nextBirthdayDate - b.nextBirthdayDate)
          .slice(0, 10);
        
        console.log('✅ [DASHBOARD] Final processed birthdays:', upcomingBirthdays.length);
        upcomingBirthdays.forEach((b, i) => {
          console.log(`   ${i + 1}. ${b.employeeName}: ${b.nextBirthdayDate.toDateString()} (${b.daysUntil} days)`);
        });
        
        setUpcomingBirthdays(upcomingBirthdays);
      } else {
        console.warn('❌ [DASHBOARD] Enhanced birthdays API error:', response.message);
        setUpcomingBirthdays([]);
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Enhanced birthdays API error:', error);
      setUpcomingBirthdays([]);
    } finally {
      if (!silent) setBirthdaysLoading(false);
    }
  };

  useEffect(() => {
    const optionalPromises = [
      fetchTeamData(),
      fetchUpcomingBirthdays(),
    ];
    
    Promise.allSettled(optionalPromises).catch(optionalError => {
      console.warn('❌ [DASHBOARD] Optional data failed (non-critical):', optionalError);
    });
  }, []);

  return {
    teamOnLeave,
    teamWFH,
    upcomingBirthdays,
    teamDataLoading,
    birthdaysLoading,
    actions: {
      fetchTeamData,
      fetchUpcomingBirthdays
    }
  };
};