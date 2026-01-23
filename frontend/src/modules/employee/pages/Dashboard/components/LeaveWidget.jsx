import { Card, CardContent, CardHeader, CardTitle } from "../../../../../shared/ui/card";
import { Palmtree } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Leave Balance Widget Component
 * Displays leave balance information in a clean card format
 */
const LeaveWidget = ({ leaveBalanceData, onClick }) => {
  return (
    <Card 
      className="bg-white shadow-sm rounded-xl border-0 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-green-600" />
            <span className="text-sm sm:text-base">Leave Balance</span>
          </h3>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 space-y-1">
          <div className="text-xs sm:text-sm">Casual: <span className="font-bold">{leaveBalanceData.casual}</span></div>
          <div className="text-xs sm:text-sm">Sick: <span className="font-bold">{leaveBalanceData.sick}</span></div>
        </div>
      </CardContent>
    </Card>
  );
};

LeaveWidget.propTypes = {
  leaveBalanceData: PropTypes.shape({
    casual: PropTypes.number,
    sick: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default LeaveWidget;