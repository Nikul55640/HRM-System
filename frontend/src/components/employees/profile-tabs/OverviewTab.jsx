const OverviewTab = ({ employee }) => {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const InfoSection = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  const InfoItem = ({ label, value }) => (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || 'N/A'}</dd>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <InfoSection title="Personal Information">
        <InfoItem label="First Name" value={employee.personalInfo?.firstName} />
        <InfoItem label="Last Name" value={employee.personalInfo?.lastName} />
        <InfoItem label="Date of Birth" value={formatDate(employee.personalInfo?.dateOfBirth)} />
        <InfoItem label="Gender" value={employee.personalInfo?.gender} />
        <InfoItem label="Marital Status" value={employee.personalInfo?.maritalStatus} />
        <InfoItem label="Nationality" value={employee.personalInfo?.nationality} />
      </InfoSection>

      {/* Contact Information */}
      <InfoSection title="Contact Information">
        <InfoItem label="Work Email" value={employee.contactInfo?.email} />
        <InfoItem label="Personal Email" value={employee.contactInfo?.personalEmail} />
        <InfoItem label="Phone Number" value={employee.contactInfo?.phoneNumber} />
        <InfoItem label="Alternate Phone" value={employee.contactInfo?.alternatePhone} />
      </InfoSection>

      {/* Address */}
      {employee.contactInfo?.currentAddress && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Current Address
          </h3>
          <div className="text-sm text-gray-900">
            {employee.contactInfo.currentAddress.street && (
              <div>{employee.contactInfo.currentAddress.street}</div>
            )}
            <div>
              {[
                employee.contactInfo.currentAddress.city,
                employee.contactInfo.currentAddress.state,
                employee.contactInfo.currentAddress.zipCode,
              ]
                .filter(Boolean)
                .join(', ')}
            </div>
            {employee.contactInfo.currentAddress.country && (
              <div>{employee.contactInfo.currentAddress.country}</div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      {employee.contactInfo?.emergencyContacts && employee.contactInfo.emergencyContacts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Emergency Contacts
          </h3>
          <div className="space-y-4">
            {employee.contactInfo.emergencyContacts.map((contact, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoItem label="Name" value={contact.name} />
                  <InfoItem label="Relationship" value={contact.relationship} />
                  <InfoItem label="Phone" value={contact.phoneNumber} />
                  <InfoItem label="Email" value={contact.email} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Information */}
      <InfoSection title="Job Information">
        <InfoItem label="Job Title" value={employee.jobInfo?.jobTitle} />
        <InfoItem 
          label="Department" 
          value={employee.jobInfo?.department?.name || employee.jobInfo?.department} 
        />
        <InfoItem 
          label="Manager" 
          value={
            employee.jobInfo?.manager?.personalInfo
              ? `${employee.jobInfo.manager.personalInfo.firstName} ${employee.jobInfo.manager.personalInfo.lastName}`
              : 'N/A'
          } 
        />
        <InfoItem label="Hire Date" value={formatDate(employee.jobInfo?.hireDate)} />
        <InfoItem label="Employment Type" value={employee.jobInfo?.employmentType} />
        <InfoItem label="Work Location" value={employee.jobInfo?.workLocation} />
        <InfoItem label="Work Schedule" value={employee.jobInfo?.workSchedule} />
        <InfoItem label="Probation End Date" value={formatDate(employee.jobInfo?.probationEndDate)} />
      </InfoSection>
    </div>
  );
};

export default OverviewTab;
