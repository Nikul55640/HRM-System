import { Card, CardContent, CardHeader, CardTitle } from "../../../../../shared/ui/card";
import { EmptyState } from "../../../../../shared/components";
import { Palmtree, Home, User } from "lucide-react";
import { usePermissions } from "../../../../../core/hooks";
import { MODULES } from "../../../../../core/utils/rolePermissions";
import PropTypes from "prop-types";

/**
 * Team Status Widget Component
 * Displays team leave and WFH status
 */
const TeamStatusWidget = ({ teamOnLeave, teamWFH, type = "leave" }) => {
  const { can } = usePermissions();
  
  const isLeaveWidget = type === "leave";
  const data = isLeaveWidget ? teamOnLeave : teamWFH;
  const Icon = isLeaveWidget ? Palmtree : Home;
  const title = isLeaveWidget ? "On Leave Today" : "Work From Home";
  const iconColor = isLeaveWidget ? "text-green-600" : "text-blue-600";
  const emptyTitle = isLeaveWidget ? "No one on leave" : "No WFH today";
  const emptyDescription = isLeaveWidget ? "Everyone is working today" : "All employees are in office";

  if (!can.do(MODULES.ATTENDANCE?.VIEW_COMPANY_STATUS)) {
    return (
      <Card className="bg-white rounded-xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Icon className={`w-4 h-4 ${iconColor}`} />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <EmptyState
            icon={Icon}
            title="Restricted Access"
            description="No permission to view company status"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {data.length > 0 ? (
          data.slice(0, 5).map((emp, i) => (
            <div
              key={emp.id || i}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <div className={`p-2 rounded-full ${isLeaveWidget ? 'bg-green-100' : 'bg-blue-100'}`}>
                {isLeaveWidget ? (
                  <Palmtree className="w-3 h-3 text-green-600" />
                ) : (
                  <User className="w-3 h-3 text-blue-600" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 leading-tight">
                  {emp.employeeName}
                </p>
                <p className="text-xs text-gray-500">
                  {isLeaveWidget ? `${emp.leaveType} Leave` : (emp.department || 'Remote')}
                </p>
              </div>

              <span className={`text-xs font-medium whitespace-nowrap ${
                isLeaveWidget ? 'text-gray-600' : 'text-blue-600'
              }`}>
                {isLeaveWidget ? (emp.duration || 'Full Day') : 'WFH'}
              </span>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Icon}
            title={emptyTitle}
            description={emptyDescription}
          />
        )}
      </CardContent>
    </Card>
  );
};

TeamStatusWidget.propTypes = {
  teamOnLeave: PropTypes.array,
  teamWFH: PropTypes.array,
  type: PropTypes.oneOf(['leave', 'wfh']),
};

TeamStatusWidget.defaultProps = {
  teamOnLeave: [],
  teamWFH: [],
  type: 'leave',
};

export default TeamStatusWidget;