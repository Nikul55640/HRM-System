import PropTypes from 'prop-types';

/**
 * ScopeIndicator component that displays a visual indicator for scoped access
 * Used to inform HR Managers that they are viewing filtered data based on their assigned departments
 */
const ScopeIndicator = ({ departmentCount, message, className = '' }) => {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 ${className}`}>
      <svg 
        className="w-5 h-5 text-blue-600 flex-shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span className="text-sm text-blue-800">
        {message || `You are viewing data from your assigned department${departmentCount > 1 ? 's' : ''} only.`}
      </span>
    </div>
  );
};

ScopeIndicator.propTypes = {
  departmentCount: PropTypes.number,
  message: PropTypes.string,
  className: PropTypes.string,
};

export default ScopeIndicator;
