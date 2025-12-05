import PropTypes from "prop-types";

/**
 * Skeleton Loader Component
 * Displays loading placeholder animations
 *
 * @component
 * @example
 * // List skeleton
 * <SkeletonLoader type="list" items={5} />
 *
 * // Card skeleton
 * <SkeletonLoader type="card" />
 *
 * // Table skeleton
 * <SkeletonLoader type="table" rows={10} columns={5} />
 */
export const SkeletonLoader = ({
  type = "list",
  items = 3,
  rows = 5,
  columns = 4,
  className = "",
}) => {
  const baseClass = "animate-pulse bg-gray-200 rounded";

  // Skeleton for list items
  if (type === "list") {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(items)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className={`${baseClass} h-12 w-12 rounded-full`} />
            <div className="flex-1 space-y-2">
              <div className={`${baseClass} h-4 w-3/4`} />
              <div className={`${baseClass} h-3 w-1/2`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Skeleton for cards
  if (type === "card") {
    return (
      <div className={`${baseClass} h-64 w-full ${className}`}>
        <div className="p-4 space-y-4">
          <div className={`${baseClass} h-6 w-2/3`} />
          <div className={`${baseClass} h-4 w-full`} />
          <div className={`${baseClass} h-4 w-5/6`} />
          <div className={`${baseClass} h-4 w-full`} />
        </div>
      </div>
    );
  }

  // Skeleton for table
  if (type === "table") {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Header */}
        <div className="flex space-x-2">
          {[...Array(columns)].map((_, i) => (
            <div key={`header-${i}`} className={`${baseClass} h-10 flex-1`} />
          ))}
        </div>

        {/* Rows */}
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-2">
            {[...Array(columns)].map((_, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${baseClass} h-12 flex-1`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Skeleton for text
  if (type === "text") {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(items)].map((_, i) => (
          <div key={i} className={`${baseClass} h-4 w-full`} />
        ))}
      </div>
    );
  }

  // Default: single line
  return <div className={`${baseClass} h-8 w-full ${className}`} />;
};

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf(["list", "card", "table", "text", "single"]),
  items: PropTypes.number,
  rows: PropTypes.number,
  columns: PropTypes.number,
  className: PropTypes.string,
};

SkeletonLoader.defaultProps = {
  type: "list",
  items: 3,
  rows: 5,
  columns: 4,
  className: "",
};

export default SkeletonLoader;
