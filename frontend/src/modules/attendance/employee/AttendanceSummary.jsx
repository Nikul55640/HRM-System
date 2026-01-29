import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Clock,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Gift,
  CalendarDays,
  Briefcase
} from 'lucide-react';
import smartCalendarService from '../../../services/smartCalendarService';

/* -------------------------------------------------------
   Reusable Metric Card (UI building block)
------------------------------------------------------- */
const MetricCard = ({ icon: Icon, label, value, subLabel, color, bg }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-sm transition">
    <div className={`mx-auto mb-2 w-9 h-9 flex items-center justify-center rounded-full ${bg}`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="text-xs font-medium text-gray-500">{label}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    {subLabel && (
      <div className="text-xs text-gray-400 mt-1 truncate">{subLabel}</div>
    )}
  </div>
);

MetricCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  subLabel: PropTypes.string,
  color: PropTypes.string.isRequired,
  bg: PropTypes.string.isRequired
};

/* -------------------------------------------------------
   Main Component
------------------------------------------------------- */
const AttendanceSummary = ({ summary, period }) => {
  const [calendarSummary, setCalendarSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------
     Fetch Smart Calendar Summary (Month-level)
  --------------------------------------------------- */
  useEffect(() => {
    const fetchCalendarSummary = async () => {
      try {
        setLoading(true);

        const now = new Date();
        const year = period?.year || now.getFullYear();
        const month = period?.month || now.getMonth() + 1;

        const response = await smartCalendarService.getSmartMonthlyCalendar({
          year,
          month
        });

        if (response?.success) {
          setCalendarSummary(response.data);
        }
      } catch (error) {
        console.error('AttendanceSummary: Calendar fetch failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarSummary();
  }, [period]);

  /* ---------------------------------------------------
     Safe defaults + merged attendance summary
  --------------------------------------------------- */
  const data = {
    presentDays: Number(summary?.presentDays) || 0,
    leaveDays: Number(summary?.leaveDays) || 0,
    absentDays: Number(summary?.absentDays) || 0,
    holidayDays: Number(summary?.holidayDays) || 0,
    lateDays: Number(summary?.lateDays) || 0,
    halfDays: Number(summary?.halfDays) || 0,
    totalWorkedMinutes: Number(summary?.totalWorkedMinutes) || 0,
    totalDays: Number(summary?.totalDays) || 0
  };

  /* ---------------------------------------------------
     Calendar Metrics (Smart Calendar → fallback safe)
  --------------------------------------------------- */
  const calendarMetrics = calendarSummary?.summary
    ? {
        totalDays: calendarSummary.summary.totalDays,
        workingDays: calendarSummary.summary.workingDays,
        weekends: calendarSummary.summary.weekends,
        holidays: calendarSummary.summary.holidays,
        leaves: calendarSummary.summary.leaves || 0,
        activeWorkingRule:
          calendarSummary.activeWorkingRule?.ruleName || 'Default'
      }
    : {
        totalDays: data.totalDays || 0,
        workingDays: Math.max(
          0,
          (data.totalDays || 0) - data.holidayDays
        ),
        weekends: 0,
        holidays: data.holidayDays,
        leaves: data.leaveDays,
        activeWorkingRule: 'Calculated'
      };

  /* ---------------------------------------------------
     UI
  --------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Attendance Summary
          </h2>
          {period && (
            <p className="text-sm text-gray-500 mt-1">
              Period: {period}
            </p>
          )}
        </div>
      </div>

      {/* Smart Calendar Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard
          icon={CalendarDays}
          label="Total Days"
          value={calendarMetrics.totalDays}
          subLabel="In month"
          color="text-gray-700"
          bg="bg-gray-100"
        />

        <MetricCard
          icon={Briefcase}
          label="Working Days"
          value={calendarMetrics.workingDays}
          subLabel={calendarMetrics.activeWorkingRule}
          color="text-blue-600"
          bg="bg-blue-50"
        />

        <MetricCard
          icon={Calendar}
          label="Weekends"
          value={calendarMetrics.weekends}
          subLabel="Non-working"
          color="text-indigo-600"
          bg="bg-indigo-50"
        />

        <MetricCard
          icon={Gift}
          label="Holidays"
          value={calendarMetrics.holidays}
          subLabel="Public"
          color="text-purple-600"
          bg="bg-purple-50"
        />

        <MetricCard
          icon={AlertCircle}
          label="Leaves"
          value={calendarMetrics.leaves}
          subLabel="Approved"
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      {/* Attendance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={Calendar}
          label="Present"
          value={data.presentDays}
          subLabel={`Out of ${calendarMetrics.workingDays}`}
          color="text-green-600"
          bg="bg-green-50"
        />

        <MetricCard
          icon={AlertTriangle}
          label="Late"
          value={data.lateDays}
          color="text-yellow-600"
          bg="bg-yellow-50"
        />

        <MetricCard
          icon={Clock}
          label="Half Days"
          value={data.halfDays}
          color="text-orange-600"
          bg="bg-orange-50"
        />

        <MetricCard
          icon={AlertCircle}
          label="Absent"
          value={data.absentDays}
          color="text-red-600"
          bg="bg-red-50"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            Loading calendar data…
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------
   PropTypes & Defaults
------------------------------------------------------- */
AttendanceSummary.propTypes = {
  summary: PropTypes.shape({
    presentDays: PropTypes.number,
    leaveDays: PropTypes.number,
    absentDays: PropTypes.number,
    holidayDays: PropTypes.number,
    lateDays: PropTypes.number,
    halfDays: PropTypes.number,
    totalWorkedMinutes: PropTypes.number,
    totalDays: PropTypes.number
  }),
  period: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

AttendanceSummary.defaultProps = {
  summary: null,
  period: null
};

export default AttendanceSummary;
