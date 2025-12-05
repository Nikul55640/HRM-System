import PropTypes from "prop-types";
import { TrendingUp, TrendingDown } from "lucide-react";

const LeaveBalanceCard = ({
  title,
  available,
  total,
  used,
  color = "blue",
}) => {
  const percentage = total > 0 ? (available / total) * 100 : 0;

  const colorClasses = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-200",
      progress: "bg-blue-600",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      border: "border-green-200",
      progress: "bg-green-600",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      border: "border-purple-200",
      progress: "bg-purple-600",
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      border: "border-orange-200",
      progress: "bg-orange-600",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`bg-white rounded-lg border ${colors.border} p-6 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className={`${colors.bg} p-2 rounded-lg`}>
          {percentage >= 50 ? (
            <TrendingUp className={`h-5 w-5 ${colors.text}`} />
          ) : (
            <TrendingDown className={`h-5 w-5 ${colors.text}`} />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-4xl font-bold ${colors.text}`}>
              {available}
            </span>
            <span className="text-gray-600 text-sm">/ {total} days</span>
          </div>
          <p className="text-sm text-gray-600">Available</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${colors.progress} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-600">
            <span>Used: {used} days</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

LeaveBalanceCard.propTypes = {
  title: PropTypes.string.isRequired,
  available: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  used: PropTypes.number.isRequired,
  color: PropTypes.oneOf(["blue", "green", "purple", "orange"]),
};

export default LeaveBalanceCard;
