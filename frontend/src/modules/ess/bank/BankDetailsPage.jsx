import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores';
import { api } from '../../../core/api/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

const BankDetailsPage = () => {
  const { user } = useAuthStore();
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountType: 'savings'
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchBankDetails();
  }, [user?.employeeId]);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      if (!user?.employeeId) return;
      
      const response = await api.get(`/employees/${user.employeeId}/bank-details`);
      if (response.data?.data) {
        setBankDetails(response.data.data);
      }
    } catch (error) {
      console.log('No bank details found yet');
      // Initialize with empty state if none exist
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await api.put(
        `/employees/${user.employeeId}/bank-details`,
        bankDetails
      );

      if (response.data?.success) {
        toast.success('Bank details updated successfully');
        setBankDetails(response.data.data);
        setEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bank details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading bank details..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Bank Details</h1>
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

          {/* Form */}
          <div className="space-y-4">
            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name *
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={bankDetails.accountHolderName}
                onChange={handleInputChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded-md ${
                  editing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder="Enter account holder name"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <input
                type="text"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleInputChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded-md ${
                  editing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder="Enter account number"
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code *
              </label>
              <input
                type="text"
                name="ifscCode"
                value={bankDetails.ifscCode}
                onChange={handleInputChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded-md ${
                  editing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder="Enter IFSC code"
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={bankDetails.bankName}
                onChange={handleInputChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded-md ${
                  editing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder="Enter bank name"
              />
            </div>

            {/* Branch Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Name
              </label>
              <input
                type="text"
                name="branchName"
                value={bankDetails.branchName}
                onChange={handleInputChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded-md ${
                  editing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder="Enter branch name"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <select
                name="accountType"
                value={bankDetails.accountType}
                onChange={handleInputChange}
                disabled={!editing}
                className={`w-full px-3 py-2 border rounded-md ${
                  editing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="salary">Salary</option>
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
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Info Message */}
          {!editing && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                Click "Edit" to update your bank details. This information is used for salary processing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankDetailsPage;
