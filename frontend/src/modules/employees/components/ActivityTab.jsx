import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { LoadingSpinner } from "../../../shared/components";

const ActivityTab = ({ employeeId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [employeeId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // Fetch audit logs for this employee
      const response = await api.get(`/audit-logs/employee/${employeeId}`);
      setActivities(response.data.logs || []);
    } catch (error) {
      // If endpoint doesn't exist yet, show empty state
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "CREATE":
        return (
          <div className="bg-green-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        );
      case "UPDATE":
        return (
          <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
        );
      case "DELETE":
        return (
          <div className="bg-red-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        );
      case "VIEW":
        return (
          <div className="bg-gray-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
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
          </div>
        );
    }
  };

  const getActionText = (activity) => {
    const action = activity.action.toLowerCase();
    const entityType = activity.entityType;

    let text = `${action}d ${entityType.toLowerCase()}`;

    if (activity.changes && activity.changes.length > 0) {
      const fields = activity.changes.map((c) => c.field).join(", ");
      text += ` (${fields})`;
    }

    return text;
  };

  const formatDate = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return activityDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <svg
          className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No activity</h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          No activity has been recorded for this employee yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-6 sm:-mb-8">
        {activities.map((activity, index) => (
          <li key={activity._id}>
            <div className="relative pb-6 sm:pb-8">
              {index !== activities.length - 1 && (
                <span
                  className="absolute top-8 sm:top-10 left-4 sm:left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-2 sm:space-x-3">
                <div>{getActionIcon(activity.action)}</div>
                <div className="flex min-w-0 flex-1 justify-between space-x-2 sm:space-x-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-900 break-words">
                      <span className="font-medium">
                        {activity.userId?.email || "System"}
                      </span>{" "}
                      {getActionText(activity)}
                    </p>
                    {activity.changes && activity.changes.length > 0 && (
                      <div className="mt-2 text-xs sm:text-sm text-gray-500">
                        {activity.changes.map((change, idx) => (
                          <div key={idx} className="mt-1 break-words">
                            <span className="font-medium">{change.field}:</span>{" "}
                            <span className="line-through">
                              {change.oldValue || "empty"}
                            </span>
                            {" → "}
                            <span className="text-green-600">
                              {change.newValue || "empty"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-xs sm:text-sm text-gray-500 flex-shrink-0">
                    <time dateTime={activity.timestamp}>
                      {formatDate(activity.timestamp)}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityTab;
