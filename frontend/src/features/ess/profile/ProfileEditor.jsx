import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import employeeService from '../../../services/employeeService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import useAuth from '../../../hooks/useAuth';
const ProfileEditor = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getMyProfile();
      setEmployee(response.data);
    } catch (error) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    phoneNumber: Yup.string()
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format'),
    alternatePhone: Yup.string()
      .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format'),
    currentAddress: Yup.object({
      street: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      zipCode: Yup.string(),
      country: Yup.string(),
    }),
    emergencyContacts: Yup.array().of(
      Yup.object({
        name: Yup.string(),
        relationship: Yup.string(),
        phoneNumber: Yup.string()
          .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format'),
        email: Yup.string().email('Invalid email format'),
      })
    ),
  });

  const formik = useFormik({
    initialValues: {
      phoneNumber: '',
      alternatePhone: '',
      currentAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      emergencyContacts: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        await employeeService.selfUpdateEmployee(employee._id, {
          contactInfo: {
            phoneNumber: values.phoneNumber,
            alternatePhone: values.alternatePhone,
            currentAddress: values.currentAddress,
            emergencyContacts: values.emergencyContacts,
          },
        });
        toast.success('Profile updated successfully');
        await fetchEmployeeProfile();
      } catch (error) {
        toast.error(error.message || 'Failed to update profile');
      } finally {
        setSaving(false);
      }
    },
  });

  useEffect(() => {
    if (employee) {
      formik.setValues({
        phoneNumber: employee.contactInfo?.phoneNumber || '',
        alternatePhone: employee.contactInfo?.alternatePhone || '',
        currentAddress: employee.contactInfo?.currentAddress || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        emergencyContacts: employee.contactInfo?.emergencyContacts || [],
      });
    }
  }, [employee]);

  const addEmergencyContact = () => {
    formik.setFieldValue('emergencyContacts', [
      ...formik.values.emergencyContacts,
      { name: '', relationship: '', phoneNumber: '', email: '' },
    ]);
  };

  const removeEmergencyContact = (index) => {
    const contacts = [...formik.values.emergencyContacts];
    contacts.splice(index, 1);
    formik.setFieldValue('emergencyContacts', contacts);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">No employee profile found for your account.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white shadow rounded-lg">
        {/* Read-Only Information */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Personal Information (Read-Only)</h2>
          <p className="mt-1 text-sm text-gray-500">This information can only be updated by HR administrators</p>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 text-sm text-gray-900">
              {employee.personalInfo?.firstName} {employee.personalInfo?.lastName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
            <p className="mt-1 text-sm text-gray-900">{employee.employeeId}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{employee.contactInfo?.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <p className="mt-1 text-sm text-gray-900">{employee.jobInfo?.jobTitle}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <p className="mt-1 text-sm text-gray-900">{employee.jobInfo?.department?.name || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Employment Type</label>
            <p className="mt-1 text-sm text-gray-900">{employee.jobInfo?.employmentType}</p>
          </div>
        </div>

        {/* Editable Information */}
        <form onSubmit={formik.handleSubmit}>
          <div className="px-6 py-5 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Contact Information (Editable)</h2>
            <p className="mt-1 text-sm text-gray-500">You can update these fields</p>
          </div>

          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  formik.touched.phoneNumber && formik.errors.phoneNumber
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700">
                Alternate Phone
              </label>
              <input
                type="text"
                id="alternatePhone"
                name="alternatePhone"
                value={formik.values.alternatePhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  formik.touched.alternatePhone && formik.errors.alternatePhone
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {formik.touched.alternatePhone && formik.errors.alternatePhone && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.alternatePhone}</p>
              )}
            </div>
          </div>

          <div className="px-6 py-5 border-t border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-4">Current Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="currentAddress.street" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  type="text"
                  id="currentAddress.street"
                  name="currentAddress.street"
                  value={formik.values.currentAddress.street}
                  onChange={formik.handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="currentAddress.city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="currentAddress.city"
                  name="currentAddress.city"
                  value={formik.values.currentAddress.city}
                  onChange={formik.handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="currentAddress.state" className="block text-sm font-medium text-gray-700">
                  State/Province
                </label>
                <input
                  type="text"
                  id="currentAddress.state"
                  name="currentAddress.state"
                  value={formik.values.currentAddress.state}
                  onChange={formik.handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="currentAddress.zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  id="currentAddress.zipCode"
                  name="currentAddress.zipCode"
                  value={formik.values.currentAddress.zipCode}
                  onChange={formik.handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="currentAddress.country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  id="currentAddress.country"
                  name="currentAddress.country"
                  value={formik.values.currentAddress.country}
                  onChange={formik.handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-5 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium text-gray-900">Emergency Contacts</h3>
              <button
                type="button"
                onClick={addEmergencyContact}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Contact
              </button>
            </div>

            {formik.values.emergencyContacts.map((contact, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Contact {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeEmergencyContact(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name={`emergencyContacts.${index}.name`}
                      value={contact.name}
                      onChange={formik.handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Relationship</label>
                    <input
                      type="text"
                      name={`emergencyContacts.${index}.relationship`}
                      value={contact.relationship}
                      onChange={formik.handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name={`emergencyContacts.${index}.phoneNumber`}
                      value={contact.phoneNumber}
                      onChange={formik.handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name={`emergencyContacts.${index}.email`}
                      value={contact.email}
                      onChange={formik.handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            {formik.values.emergencyContacts.length === 0 && (
              <p className="text-sm text-gray-500 italic">No emergency contacts added yet</p>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => fetchEmployeeProfile()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formik.dirty}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditor;
