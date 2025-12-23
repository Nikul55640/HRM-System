import { useState } from 'react';
import { toast } from 'react-toastify';

const ProfileSettingsForm = ({ profile, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: profile?.personalInfo?.firstName || '',
    lastName: profile?.personalInfo?.lastName || '',
    email: profile?.personalInfo?.email || '',
    phone: profile?.personalInfo?.phoneNumber || '',
    dateOfBirth: profile?.personalInfo?.dateOfBirth || '',
    gender: profile?.personalInfo?.gender || '',
    bloodGroup: profile?.personalInfo?.bloodGroup || '',
    maritalStatus: profile?.personalInfo?.maritalStatus || ''
  });

  const [editing, setEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          maritalStatus: formData.maritalStatus
        }
      };
      
      await onSubmit(updatedData);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        <button
          onClick={() => setEditing(!editing)}
          className={`px-4 py-2 rounded-md text-white ${
            editing 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            disabled={!editing}
            className={`w-full px-3 py-2 border rounded-md ${
              editing
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'border-gray-200 bg-gray-50'
            }`}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={!editing}
            className={`w-full px-3 py-2 border rounded-md ${
              editing
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'border-gray-200 bg-gray-50'
            }`}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!editing}
            className={`w-full px-3 py-2 border rounded-md ${
              editing
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'border-gray-200 bg-gray-50'
            }`}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={!editing}
            className={`w-full px-3 py-2 border rounded-md ${
              editing
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'border-gray-200 bg-gray-50'
            }`}
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
            onChange={handleInputChange}
            disabled={!editing}
            className={`w-full px-3 py-2 border rounded-md ${
              editing
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'border-gray-200 bg-gray-50'
            }`}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            disabled={!editing}
            className={`w-full px-3 py-2 border rounded-md ${
              editing
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Blood Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blood Group
          </label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleInputChange}
            disabled={!editing}
            className={`w-full px-3 py-2 border rounded-md ${
              editing
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <option value="">Select Blood Group</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marital Status
          </label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleInputChange}
            disabled={!editing}
            className={`w-full px-3 py-2 border rounded-md ${
              editing
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      {editing && (
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileSettingsForm;
