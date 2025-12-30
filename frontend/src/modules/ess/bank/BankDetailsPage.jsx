import { useState, useEffect } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

const BankDetailsPage = () => {
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    maskedAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    accountType: "savings",
    isVerified: false,
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // ============================
  // FETCH BANK DETAILS
  // ============================
  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get("/employee/bank-details");

      // Debug: Log the actual response structure
      console.log('🔍 [BANK DETAILS] API Response:', response);

      // Handle different response structures
      let bankData = null;
      
      if (response?.data?.success && response?.data?.data) {
        // Structure: { success: true, data: { bankDetails } }
        bankData = response.data.data;
      } else if (response?.data && !response?.data?.success) {
        // Structure: { success: false, message: "..." }
        bankData = null;
      } else if (response?.data) {
        // Structure: { bankDetails directly }
        bankData = response.data;
      }

      if (bankData) {
        console.log('✅ [BANK DETAILS] Bank data found:', bankData);
        setBankDetails(bankData);
        
        // Check if this is a SuperAdmin message
        if (response.data.message?.includes('SuperAdmin')) {
          toast.info('SuperAdmin users do not have employee records or bank details');
        }
      } else {
        // Handle case where no bank details exist yet
        console.log('ℹ️ [BANK DETAILS] No bank details found, setting empty state');
        setBankDetails({
          accountHolderName: "",
          accountNumber: "",
          maskedAccountNumber: "",
          ifscCode: "",
          bankName: "",
          branchName: "",
          accountType: "savings",
          isVerified: false,
        });
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
      
      // Check if it's a SuperAdmin error
      if (error.response?.data?.message?.includes('SuperAdmin')) {
        toast.info('SuperAdmin users do not have employee records or bank details');
        setBankDetails({
          accountHolderName: "",
          accountNumber: "",
          maskedAccountNumber: "",
          ifscCode: "",
          bankName: "",
          branchName: "",
          accountType: "savings",
          isVerified: false,
        });
      } else {
        // Initialize with empty bank details if API fails
        setBankDetails({
          accountHolderName: "",
          accountNumber: "",
          maskedAccountNumber: "",
          ifscCode: "",
          bankName: "",
          branchName: "",
          accountType: "savings",
          isVerified: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  // ============================
  // HANDLE INPUT CHANGE
  // ============================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // ============================
  // VALIDATE FORM
  // ============================
  const validateForm = () => {
    const errors = {};

    // Required fields
    if (!bankDetails.accountHolderName?.trim()) {
      errors.accountHolderName = "Account holder name is required";
    }

    if (!bankDetails.accountNumber?.trim()) {
      errors.accountNumber = "Account number is required";
    } else if (!/^\d{8,18}$/.test(bankDetails.accountNumber.replace(/[\s\-]/g, ''))) {
      errors.accountNumber = "Account number must be 8-18 digits";
    }

    if (!bankDetails.ifscCode?.trim()) {
      errors.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode.toUpperCase())) {
      errors.ifscCode = "IFSC code format: ABCD0123456 (4 letters + 0 + 6 alphanumeric)";
    }

    if (!bankDetails.bankName?.trim()) {
      errors.bankName = "Bank name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================
  // SAVE BANK DETAILS
  // ============================
  const handleSave = async () => {
    try {
      // Validate form first
      if (!validateForm()) {
        toast.error("Please fix the validation errors");
        return;
      }

      setLoading(true);

      const payload = {
        accountHolderName: bankDetails.accountHolderName.trim(),
        accountNumber: bankDetails.accountNumber.replace(/[\s\-]/g, ''), // Remove spaces/hyphens
        ifscCode: bankDetails.ifscCode.toUpperCase().trim(),
        bankName: bankDetails.bankName.trim(),
        branchName: bankDetails.branchName?.trim() || "",
        accountType: bankDetails.accountType,
      };

      const response = await api.put("/employee/bank-details", payload);

      if (response.data?.success) {
        toast.success(response.data.message || "Bank details updated successfully");
        // Refresh the data from server to get the masked account number
        await fetchBankDetails();
        setEditing(false);
        setValidationErrors({});
      }
    } catch (error) {
      console.error("Bank details save error:", error);
      
      // Handle SuperAdmin case
      if (error.response?.data?.message?.includes('SuperAdmin')) {
        toast.error('SuperAdmin users do not have employee records. Bank details are not applicable.');
        return;
      }
      
      // Handle specific validation errors from backend
      if (error.response?.status === 400) {
        const message = error.response.data?.message || "Validation failed";
        
        // Map backend errors to form fields
        if (message.includes("IFSC")) {
          setValidationErrors(prev => ({
            ...prev,
            ifscCode: message
          }));
        } else if (message.includes("account number")) {
          setValidationErrors(prev => ({
            ...prev,
            accountNumber: message
          }));
        } else if (message.includes("account holder")) {
          setValidationErrors(prev => ({
            ...prev,
            accountHolderName: message
          }));
        } else if (message.includes("bank name")) {
          setValidationErrors(prev => ({
            ...prev,
            bankName: message
          }));
        }
        
        toast.error(message);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update bank details"
        );
      }
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
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Bank Details</h1>
            <button
              onClick={() => setEditing(!editing)}
              className={`px-4 py-2 rounded-md text-white ${
                editing ? "bg-gray-600" : "bg-blue-600"
              }`}
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* FORM */}
          <div className="space-y-4">
            {/* Account Holder */}
            <InputField
              label="Account Holder Name *"
              name="accountHolderName"
              value={bankDetails.accountHolderName}
              onChange={handleInputChange}
              disabled={!editing}
              error={validationErrors.accountHolderName}
              placeholder="Enter full name as per bank records"
            />

            {/* Account Number */}
            <InputField
              label="Account Number *"
              name="accountNumber"
              value={
                editing
                  ? bankDetails.accountNumber
                  : bankDetails.maskedAccountNumber
              }
              onChange={handleInputChange}
              disabled={!editing}
              error={validationErrors.accountNumber}
              placeholder="Enter 8-18 digit account number"
            />

            {/* IFSC */}
            <InputField
              label="IFSC Code *"
              name="ifscCode"
              value={bankDetails.ifscCode}
              onChange={handleInputChange}
              disabled={!editing}
              error={validationErrors.ifscCode}
              placeholder="e.g., SBIN0001234 (4 letters + 0 + 6 alphanumeric)"
              helpText="Format: 4 bank letters + 0 + 6 characters (e.g., HDFC0001234)"
            />

            {/* Bank Name */}
            <InputField
              label="Bank Name *"
              name="bankName"
              value={bankDetails.bankName}
              onChange={handleInputChange}
              disabled={!editing}
              error={validationErrors.bankName}
              placeholder="Enter bank name"
            />

            {/* Branch */}
            <InputField
              label="Branch Name"
              name="branchName"
              value={bankDetails.branchName}
              onChange={handleInputChange}
              disabled={!editing}
              placeholder="Enter branch name (optional)"
            />

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
                  !editing ? "bg-gray-50" : ""
                }`}
              >
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="salary">Salary</option>
              </select>
            </div>
          </div>

          {/* SAVE BUTTON */}
          {editing && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Save Changes
              </button>
            </div>
          )}

          {!editing && (
            <div className="mt-6 space-y-3">
              <div className="p-4 bg-blue-50 border rounded-md text-sm text-blue-700">
                Your bank details are used for salary processing.
              </div>
              
              {bankDetails.isVerified ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                  ✅ Your bank details have been verified by HR.
                </div>
              ) : bankDetails.accountNumber ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                  ⏳ Your bank details are pending HR verification.
                </div>
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-md text-sm text-orange-700">
                  📝 No bank details found. Click "Edit" to add your bank information for salary processing.
                </div>
              )}
            </div>
          )}

          {editing && (
            <div className="mt-6 p-4 bg-gray-50 border rounded-md text-sm text-gray-600">
              <h4 className="font-medium mb-2">📋 Guidelines:</h4>
              <ul className="space-y-1 text-xs">
                <li>• <strong>IFSC Code:</strong> Must be 11 characters (e.g., HDFC0001234, SBIN0005678)</li>
                <li>• <strong>Account Number:</strong> Enter 8-18 digits without spaces or hyphens</li>
                <li>• <strong>Account Holder:</strong> Name should match your bank records exactly</li>
                <li>• <strong>Verification:</strong> HR will verify your details before salary processing</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================
   REUSABLE INPUT COMPONENT
============================ */
const InputField = ({ label, name, value, onChange, disabled, error, placeholder, helpText }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded-md ${
        disabled ? "bg-gray-50" : ""
      } ${
        error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
      }`}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
    {helpText && !error && (
      <p className="mt-1 text-sm text-gray-500">{helpText}</p>
    )}
  </div>
);

export default BankDetailsPage;
