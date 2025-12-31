import { Field, ErrorMessage } from 'formik';
import { useState, useEffect } from 'react';

const JobDetailsStep = ({ values, errors, touched, departments = [], managers = [], designations = [] }) => {
  const [filteredDesignations, setFilteredDesignations] = useState([]);

  // Filter designations when department changes
  useEffect(() => {
    if (values.jobInfo?.department && designations.length > 0) {
      const filtered = designations.filter(
        designation => designation.departmentId == values.jobInfo.department
      );
      setFilteredDesignations(filtered);
    } else {
      setFilteredDesignations([]);
    }
  }, [values.jobInfo?.department, designations]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Title */}
        <div>
          <label htmlFor="jobInfo.jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title <span className="text-red-500">*</span>
          </label>
          <Field
            type="text"
            id="jobInfo.jobTitle"
            name="jobInfo.jobTitle"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.jobInfo?.jobTitle && touched.jobInfo?.jobTitle
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="e.g., Software Engineer"
          />
          <ErrorMessage name="jobInfo.jobTitle" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Department */}
        <div>
          <label htmlFor="jobInfo.department" className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <Field
            as="select"
            id="jobInfo.department"
            name="jobInfo.department"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.jobInfo?.department && touched.jobInfo?.department
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          >
            <option value="">Select department</option>
            {departments && Array.isArray(departments) && departments.map((dept) => (
              <option key={dept.id || dept._id} value={dept.id || dept._id}>
                {dept.name}
              </option>
            ))}
          </Field>
          <ErrorMessage name="jobInfo.department" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Designation */}
        <div>
          <label htmlFor="jobInfo.designation" className="block text-sm font-medium text-gray-700 mb-1">
            Designation
          </label>
          <Field
            as="select"
            id="jobInfo.designation"
            name="jobInfo.designation"
            disabled={!values.jobInfo?.department}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.jobInfo?.designation && touched.jobInfo?.designation
                ? 'border-red-500'
                : 'border-gray-300'
            } ${!values.jobInfo?.department ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {!values.jobInfo?.department ? 'Select department first' : 'Select designation (optional)'}
            </option>
            {filteredDesignations.map((designation) => (
              <option key={designation.id} value={designation.id}>
                {designation.title} ({designation.level})
              </option>
            ))}
          </Field>
          <ErrorMessage name="jobInfo.designation" component="div" className="text-red-500 text-sm mt-1" />
          {values.jobInfo?.department && filteredDesignations.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">No designations available for this department</p>
          )}
        </div>

        {/* Manager */}
        <div>
          <label htmlFor="jobInfo.manager" className="block text-sm font-medium text-gray-700 mb-1">
            Manager
          </label>
          <Field
            as="select"
            id="jobInfo.manager"
            name="jobInfo.manager"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.jobInfo?.manager && touched.jobInfo?.manager
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          >
            <option value="">Select manager (optional)</option>
            {managers && Array.isArray(managers) && managers.map((manager) => (
              <option key={manager.id || manager._id} value={manager.id || manager._id}>
                {manager.firstName} {manager.lastName} - {manager.designation || 'No designation'}
              </option>
            ))}
          </Field>
          <ErrorMessage name="jobInfo.manager" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Hire Date */}
        <div>
          <label htmlFor="jobInfo.hireDate" className="block text-sm font-medium text-gray-700 mb-1">
            Hire Date <span className="text-red-500">*</span>
          </label>
          <Field
            type="date"
            id="jobInfo.hireDate"
            name="jobInfo.hireDate"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.jobInfo?.hireDate && touched.jobInfo?.hireDate
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
          <ErrorMessage name="jobInfo.hireDate" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Employment Type */}
        <div>
          <label htmlFor="jobInfo.employmentType" className="block text-sm font-medium text-gray-700 mb-1">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <Field
            as="select"
            id="jobInfo.employmentType"
            name="jobInfo.employmentType"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.jobInfo?.employmentType && touched.jobInfo?.employmentType
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          >
            <option value="">Select employment type</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </Field>
          <ErrorMessage name="jobInfo.employmentType" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Work Location */}
        <div>
          <label htmlFor="jobInfo.workLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Work Location
          </label>
          <Field
            type="text"
            id="jobInfo.workLocation"
            name="jobInfo.workLocation"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.jobInfo?.workLocation && touched.jobInfo?.workLocation
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="e.g., New York Office, Remote"
          />
          <ErrorMessage name="jobInfo.workLocation" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Work Schedule */}
        <div>
          <label htmlFor="jobInfo.workSchedule" className="block text-sm font-medium text-gray-700 mb-1">
            Work Schedule
          </label>
          <Field
            type="text"
            id="jobInfo.workSchedule"
            name="jobInfo.workSchedule"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.jobInfo?.workSchedule && touched.jobInfo?.workSchedule
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="e.g., Monday-Friday, 9AM-5PM"
          />
          <ErrorMessage name="jobInfo.workSchedule" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Probation End Date */}
        <div>
          <label htmlFor="jobInfo.probationEndDate" className="block text-sm font-medium text-gray-700 mb-1">
            Probation End Date
          </label>
          <Field
            type="date"
            id="jobInfo.probationEndDate"
            name="jobInfo.probationEndDate"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.jobInfo?.probationEndDate && touched.jobInfo?.probationEndDate
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
          <ErrorMessage name="jobInfo.probationEndDate" component="div" className="text-red-500 text-sm mt-1" />
        </div>
      </div>
    </div>
  );
};

export default JobDetailsStep;
