import { Field, ErrorMessage, FieldArray } from 'formik';

const ContactInfoStep = ({ values, errors, touched }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
      
      {/* Email Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contactInfo.email" className="block text-sm font-medium text-gray-700 mb-1">
            Work Email <span className="text-red-500">*</span>
          </label>
          <Field
            type="email"
            id="contactInfo.email"
            name="contactInfo.email"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.contactInfo?.email && touched.contactInfo?.email
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="employee@company.com"
          />
          <ErrorMessage name="contactInfo.email" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        <div>
          <label htmlFor="contactInfo.personalEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Personal Email
          </label>
          <Field
            type="email"
            id="contactInfo.personalEmail"
            name="contactInfo.personalEmail"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.contactInfo?.personalEmail && touched.contactInfo?.personalEmail
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="personal@email.com"
          />
          <ErrorMessage name="contactInfo.personalEmail" component="div" className="text-red-500 text-sm mt-1" />
        </div>
      </div>

      {/* Phone Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contactInfo.phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <Field
            type="tel"
            id="contactInfo.phoneNumber"
            name="contactInfo.phoneNumber"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.contactInfo?.phoneNumber && touched.contactInfo?.phoneNumber
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="+1 (555) 123-4567"
          />
          <ErrorMessage name="contactInfo.phoneNumber" component="div" className="text-red-500 text-sm mt-1" />
        </div>

        <div>
          <label htmlFor="contactInfo.alternatePhone" className="block text-sm font-medium text-gray-700 mb-1">
            Alternate Phone
          </label>
          <Field
            type="tel"
            id="contactInfo.alternatePhone"
            name="contactInfo.alternatePhone"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.contactInfo?.alternatePhone && touched.contactInfo?.alternatePhone
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="+1 (555) 987-6543"
          />
          <ErrorMessage name="contactInfo.alternatePhone" component="div" className="text-red-500 text-sm mt-1" />
        </div>
      </div>

      {/* Address Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Current Address</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="contactInfo.currentAddress.street" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <Field
              type="text"
              id="contactInfo.currentAddress.street"
              name="contactInfo.currentAddress.street"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactInfo.currentAddress.city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <Field
                type="text"
                id="contactInfo.currentAddress.city"
                name="contactInfo.currentAddress.city"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New York"
              />
            </div>

            <div>
              <label htmlFor="contactInfo.currentAddress.state" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province
              </label>
              <Field
                type="text"
                id="contactInfo.currentAddress.state"
                name="contactInfo.currentAddress.state"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="NY"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactInfo.currentAddress.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP/Postal Code
              </label>
              <Field
                type="text"
                id="contactInfo.currentAddress.zipCode"
                name="contactInfo.currentAddress.zipCode"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10001"
              />
            </div>

            <div>
              <label htmlFor="contactInfo.currentAddress.country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <Field
                type="text"
                id="contactInfo.currentAddress.country"
                name="contactInfo.currentAddress.country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="United States"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Emergency Contacts</h3>
        <FieldArray name="contactInfo.emergencyContacts">
          {({ push, remove }) => (
            <div className="space-y-4">
              {values.contactInfo.emergencyContacts.map((contact, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <Field
                        type="text"
                        name={`contactInfo.emergencyContacts.${index}.name`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                      <Field
                        type="text"
                        name={`contactInfo.emergencyContacts.${index}.relationship`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Spouse, Parent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <Field
                        type="tel"
                        name={`contactInfo.emergencyContacts.${index}.phoneNumber`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Field
                        type="email"
                        name={`contactInfo.emergencyContacts.${index}.email`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="contact@email.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => push({ name: '', relationship: '', phoneNumber: '', email: '' })}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                + Add Emergency Contact
              </button>
            </div>
          )}
        </FieldArray>
      </div>
    </div>
  );
};

export default ContactInfoStep;
