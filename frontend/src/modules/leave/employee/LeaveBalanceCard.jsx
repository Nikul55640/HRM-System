import PropTypes from 'prop-types';
import { Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const LeaveBalanceCard = ({ title, available, total, used, color = 'blue' }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      accent: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900',
      accent: 'text-green-600',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-900',
      accent: 'text-purple-600',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      text: 'text-orange-900',
      accent: 'text-orange-600',
    },
  };

  const classes = colorClasses[color] || colorClasses.blue;
  const usagePercentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <div className={`${classes.bg} ${classes.border} border rounded-lg p-6 transition-all hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className={`h-5 w-5 ${classes.icon}`} />
          <h3 className={`font-semibold ${classes.text}`}>{title}</h3>
        </div>
        <div className={`text-2xl font-bold ${classes.accent}`}>
          {available}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Usage</span>
          <span>{Math.round(usagePercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              usagePercentage > 80 ? 'bg-red-500' : 
              usagePercentage > 60 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">Total</span>
          </div>
          <div className="font-semibold text-gray-900">{total}</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">Used</span>
          </div>
          <div className="font-semibold text-gray-900">{used}</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className={`font-semibold ${classes.accent}`}>{available}</div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Status</span>
          <span className={`font-medium ${
            available === 0 ? 'text-red-600' :
            available <= 2 ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {available === 0 ? 'Exhausted' :
             available <= 2 ? 'Low Balance' :
             'Good'}
          </span>
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
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'orange']),
};

LeaveBalanceCard.defaultProps = {
  color: 'blue',
};

export default LeaveBalanceCard;