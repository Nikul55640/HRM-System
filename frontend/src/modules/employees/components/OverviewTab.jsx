import { formatIndianCurrency, formatIndianDate } from '../../../utils/indianFormatters';

const OverviewTab = ({ employee }) => {
  // Unwrap nested employee object if it exists
  const emp = employee?.employee ?? employee ?? {};

  // Extract normalized sections
  const personal = emp?.personalInfo || {};
  const contact = emp?.contactInfo || {};
  const job = emp?.jobInfo || {};

  const formatDate = (date) => {
    return formatIndianDate(date);
  };

  const InfoSection = ({ title, children }) => (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {children}
      </div>
    </div>
  );

  const InfoItem = ({ label, value }) => (
    <div className="break-words">
      <dt className="text-xs sm:text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm sm:text-base text-gray-900 break-all">{value || 'N/A'}</dd>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {!emp || Object.keys(emp).length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 sm:px-4 py-3 rounded text-sm">
          <strong>Notice:</strong> Employee data is loading...
        </div>
      )}

      {/* Personal Information */}
      <InfoSection title="Personal Information">
        <InfoItem label="First Name" value={personal?.firstName} />
        <InfoItem label="Last Name" value={personal?.lastName} />
        <InfoItem label="Date of Birth" value={formatDate(personal?.dateOfBirth)} />
        <InfoItem label="Gender" value={personal?.gender} />
        <InfoItem label="Marital Status" value={personal?.maritalStatus} />
        <InfoItem label="Nationality" value={personal?.nationality} />
      </InfoSection>

      {/* Contact Information */}
      <InfoSection title="Contact Information">
        <InfoItem label="Email" value={contact?.email} />
        <InfoItem label="Phone Number" value={contact?.phone} />
        <InfoItem label="Alternate Phone" value={contact?.alternatePhone} />
      </InfoSection>

      {/* Address */}
      {contact?.address && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
            Current Address
          </h3>
          <div className="text-sm sm:text-base text-gray-900 break-words">
            {contact.address.street && (
              <div className="mb-1">{contact.address.street}</div>
            )}
            <div className="mb-1">
              {[
                contact.address.city,
                contact.address.state,
                contact.address.zipCode,
              ]
                .filter(Boolean)
                .join(', ')}
            </div>
            {contact.address.country && (
              <div>{contact.address.country}</div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      {emp?.emergencyContact && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
            Emergency Contact
          </h3>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem label="Name" value={emp.emergencyContact.name} />
              <InfoItem label="Relationship" value={emp.emergencyContact.relationship} />
              <InfoItem label="Phone" value={emp.emergencyContact.phone} />
              <InfoItem label="Email" value={emp.emergencyContact.email} />
            </div>
          </div>
        </div>
      )}

      {/* Job Information */}
      <InfoSection title="Job Information">
        <InfoItem label="Job Title" value={job?.designation} />
        <InfoItem 
          label="Department" 
          value={job?.departmentInfo?.name || job?.department} 
        />
        <InfoItem label="Employment Type" value={job?.employeeType} />
        <InfoItem label="Joining Date" value={formatDate(job?.joiningDate)} />
        <InfoItem label="Salary" value={job?.salary ? formatIndianCurrency(job.salary) : 'N/A'} />
        <InfoItem label="Work Location" value={job?.workLocation} />
      </InfoSection>
    </div>
  );
};

export default OverviewTab;
