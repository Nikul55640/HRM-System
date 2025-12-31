import { Field, ErrorMessage } from 'formik';

const SystemAccessStep = ({ values, errors, touched, departments = [] }) => {
  const systemRoles = [
    { value: 'none', label: 'No System Access', description: 'Employee will not have access to the system' },
    { value: 'Employee', label: 'Employee', description: 'Basic employee access to self-service features' },
    { value: 'HR', label: 'HR Admin', description: 'HR administrative access with department restrictions' },
    { value: 'SuperAdmin', label: 'Super Admin', description: 'Full system access and administrative privileges' }
  ];

  const isHRRole = values.systemAccess?.systemRole === 'HR';

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">System Access & Role Assignment</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">System Access Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Configure whether this employee should have access to the HRM system and what level of permissions they should have.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* System Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            System Role <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {systemRoles.map((role) => (
              <div key={role.value} className="relative">
                <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Field
                    type="radio"
                    name="systemAccess.systemRole"
                    value={role.value}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{role.label}</span>
                      {role.value !== 'none' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          System Access
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
          <ErrorMessage name="systemAccess.systemRole" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Department Assignment for HR Role */}
        {isHRRole && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-3">HR Department Assignment</h3>
            <p className="text-sm text-yellow-700 mb-4">
              Select which departments this HR admin will have access to manage. They will only be able to view and manage employees within these departments.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Departments
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {departments.map((dept) => (
                  <label key={dept.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <Field
                      type="checkbox"
                      name="systemAccess.assignedDepartments"
                      value={dept.id.toString()}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{dept.name}</span>
                    {dept.code && (
                      <span className="ml-2 text-xs text-gray-500">({dept.code})</span>
                    )}
                  </label>
                ))}
              </div>
              <ErrorMessage name="systemAccess.assignedDepartments" component="div" className="text-red-500 text-sm mt-1" />
            </div>
          </div>
        )}

        {/* Access Summary */}
        {values.systemAccess?.systemRole && values.systemAccess.systemRole !== 'none' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">Access Summary</h3>
            <div className="text-sm text-green-700">
              <p className="mb-2">
                <strong>Role:</strong> {systemRoles.find(r => r.value === values.systemAccess.systemRole)?.label}
              </p>
              {isHRRole && values.systemAccess?.assignedDepartments?.length > 0 && (
                <p>
                  <strong>Department Access:</strong> {values.systemAccess.assignedDepartments.length} department(s) assigned
                </p>
              )}
              <p className="mt-2 text-xs">
                The employee will receive login credentials and system access based on the selected role.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemAccessStep;