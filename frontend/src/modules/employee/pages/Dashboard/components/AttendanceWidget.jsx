import { Card, CardContent, CardHeader, CardTitle } from "../../../../../shared/ui/card";
import { Calendar } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Attendance Widget Component
 * Displays attendance statistics in a clean card format
 */
const AttendanceWidget = ({ attendanceStats, onClick }) => {
  return (
    <Card 
      className="bg-white shadow-sm rounded-xl border-0 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm sm:text-base">Attendance</span>
          </h3>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 space-y-1">
          <div className="text-xs sm:text-sm">Present: <span className="font-bold">{attendanceStats.present}</span></div>
          <div className="text-xs sm:text-sm">Absent: <span className="font-bold">{attendanceStats.absent}</span></div>
          <div className="text-xs sm:text-sm">Late: <span className="font-bold">{attendanceStats.late}</span></div>
          <div className="text-xs sm:text-sm">Total Day: <span className="font-bold">{attendanceStats.totalDay}</span></div>
        </div>
      </CardContent>
    </Card>
  );
};

AttendanceWidget.propTypes = {
  attendanceStats: PropTypes.shape({
    present: PropTypes.number,
    absent: PropTypes.number,
    late: PropTypes.number,
    totalDay: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default AttendanceWidget;