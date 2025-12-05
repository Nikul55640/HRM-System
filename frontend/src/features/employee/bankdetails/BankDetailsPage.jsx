import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { LoadingSpinner, EmptyState } from "../../../components/common";
import { CreditCard, Check, AlertCircle, Lock, Building2 } from "lucide-react";
import employeeSelfService from "../../../services/employeeSelfService";

const BankDetailsPage = () => {
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    branch: "",
  });

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchBankDetails();
      hasFetched.current = true;
    }
  }, []);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const response = await employeeSelfService.bankDetails.get();
      setBankDetails(response.data);
      if (response.data) {
        setFormData({
          bankName: response.data.bankName || "",
          accountNumber: response.data.accountNumber || "",
          accountHolderName: response.data.accountHolderName || "",
          ifscCode: response.data.ifscCode || "",
          branch: response.data.branch || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch bank details:", error);
      toast.error(error.message || "Failed to load bank details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await employeeSelfService.bankDetails.update(formData);
      toast.success("Bank details updated successfully");
      setEditing(false);
      fetchBankDetails();
    } catch (error) {
      toast.error(error.message || "Failed to update bank details");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRequestVerification = async () => {
    try {
      await employeeSelfService.bankDetails.requestVerification();
      toast.success("Verification request sent successfully");
      fetchBankDetails();
    } catch (error) {
      toast.error(error.message || "Failed to request verification");
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading bank details..." />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bank Details</h1>
        <p className="text-gray-600 mt-1">
          Manage your salary payment information
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Important Information</p>
            <p>
              Your bank details are used for salary payments. Please ensure all
              information is accurate.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Bank Name
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              disabled={!editing}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter bank name"
            />
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name
            </label>
            <input
              type="text"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              disabled={!editing}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter account holder name"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Account Number
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              disabled={!editing}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter account number"
              maxLength="18"
            />
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IFSC Code
            </label>
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              disabled={!editing}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
              placeholder="Enter IFSC code"
              maxLength="11"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch Name
            </label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter branch name"
            />
          </div>

          {/* Verification Status */}
          {bankDetails && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {bankDetails.isVerified ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">
                        Pending Verification
                      </span>
                    </>
                  )}
                </div>

                {!bankDetails.isVerified && !editing && (
                  <button
                    type="button"
                    onClick={handleRequestVerification}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Request Verification
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {editing ? (
              <>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    // Reset form to original values
                    if (bankDetails) {
                      setFormData({
                        bankName: bankDetails.bankName || "",
                        accountNumber: bankDetails.accountNumber || "",
                        accountHolderName: bankDetails.accountHolderName || "",
                        ifscCode: bankDetails.ifscCode || "",
                        branch: bankDetails.branch || "",
                      });
                    }
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Details
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Security Notice */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Your data is secure</p>
            <p>
              Bank details are encrypted and only accessible to authorized HR
              personnel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsPage;
