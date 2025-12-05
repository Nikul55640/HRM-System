import PropTypes from "prop-types";
import { FileQuestion } from "lucide-react";

/**
 * Empty State Component
 * Displays a helpful message when there's no data to show
 *
 * @component
 * @example
 * <EmptyState
 *   title="No records found"
 *   description="Start by creating your first record"
 *   action={<Button>Create Record</Button>}
 * />
 */
export const EmptyState = ({
  icon: Icon = FileQuestion,
  title = "No data available",
  description,
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <Icon className="h-12 w-12 text-gray-400" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};

EmptyState.defaultProps = {
  icon: FileQuestion,
  title: "No data available",
  className: "",
};

export default EmptyState;
