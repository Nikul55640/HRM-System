import { Field, ErrorMessage } from 'formik';

const PersonalInfoStep = ({ values, errors, touched }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="personalInfo.firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <Field
            type="text"
            id="personalInfo.firstName"
            name="personalInfo.firstName"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.personalInfo?.firstName && touched.personalInfo?.firstName
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Enter first name"
          />
          <ErrorMessage name="personalInfo.firstName" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="personalInfo.lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <Field
            type="text"
            id="personalInfo.lastName"
            name="personalInfo.lastName"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.personalInfo?.lastName && touched.personalInfo?.lastName
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Enter last name"
          />
          <ErrorMessage name="personalInfo.lastName" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="personalInfo.dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <Field
            type="date"
            id="personalInfo.dateOfBirth"
            name="personalInfo.dateOfBirth"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.personalInfo?.dateOfBirth && touched.personalInfo?.dateOfBirth
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
          <ErrorMessage name="personalInfo.dateOfBirth" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="personalInfo.gender" className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <Field
            as="select"
            id="personalInfo.gender"
            name="personalInfo.gender"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.personalInfo?.gender && touched.personalInfo?.gender
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </Field>
          <ErrorMessage name="personalInfo.gender" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Marital Status */}
        <div>
          <label htmlFor="personalInfo.maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Marital Status
          </label>
          <Field
            as="select"
            id="personalInfo.maritalStatus"
            name="personalInfo.maritalStatus"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.personalInfo?.maritalStatus && touched.personalInfo?.maritalStatus
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          >
            <option value="">Select marital status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </Field>
          <ErrorMessage name="personalInfo.maritalStatus" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        {/* Nationality */}
        <div>
          <label htmlFor="personalInfo.nationality" className="block text-sm font-medium text-gray-700 mb-1">
            Nationality
          </label>
          <Field
            type="text"
            id="personalInfo.nationality"
            name="personalInfo.nationality"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.personalInfo?.nationality && touched.personalInfo?.nationality
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Enter nationality"
          />
          <ErrorMessage name="personalInfo.nationality" component="div" className="text-red-500 text-sm mt-1" />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
