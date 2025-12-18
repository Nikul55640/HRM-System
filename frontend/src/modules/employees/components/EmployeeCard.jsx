const EmployeeCard = ({ employee, onView, onEdit, onDelete, canManage }) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      'On Leave': 'bg-yellow-100 text-yellow-800',
      Terminated: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      {/* Profile Section */}
      <div className="flex items-start gap-4 mb-4">
        {employee.personalInfo?.profilePhoto ? (
          <img
            src={employee.personalInfo.profilePhoto}
            alt={`${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold">
            {getInitials(employee.personalInfo?.firstName, employee.personalInfo?.lastName)}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {employee.personalInfo?.firstName} {employee.personalInfo?.lastName}
          </h3>
          <p className="text-sm text-gray-600 truncate">{employee.jobInfo?.jobTitle}</p>
          <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
            {employee.status}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{employee.contactInfo?.email}</span>
        </div>
        
        {employee.contactInfo?.phoneNumber && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{employee.contactInfo.phoneNumber}</span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="truncate">{employee.jobInfo?.departmentInfo?.name || employee.jobInfo?.department?.name || 'N/A'}</span>
        </div>
        
        {employee.employeeId && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <span>ID: {employee.employeeId}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={() => onView(employee.id || employee._id)}
          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          View
        </button>
        
        {canManage && (
          <>
            <button
              onClick={() => onEdit(employee.id || employee._id)}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(employee)}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeCard;
