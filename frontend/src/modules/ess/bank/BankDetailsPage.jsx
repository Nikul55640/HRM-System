import { useState, useEffect } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Edit2, CheckCircle, AlertCircle } from "lucide-react";

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

  /* ================= FETCH ================= */
  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get("/employee/bank-details");

      let bankData = response?.data?.data || response?.data || null;

      if (bankData) {
        setBankDetails(bankData);
      } else {
        resetBankDetails();
      }
    } catch (error) {
      if (error.response?.data?.message?.includes("SuperAdmin")) {
        toast.info("SuperAdmin users do not have bank details");
      }
      resetBankDetails();
    } finally {
      setLoading(false);
    }
  };

  const resetBankDetails = () => {
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
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  /* ================= INPUT ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const errors = {};

    if (!bankDetails.accountHolderName?.trim()) {
      errors.accountHolderName = "Account holder name is required";
    }

    if (!/^\d{8,18}$/.test(bankDetails.accountNumber?.replace(/[\s-]/g, ""))) {
      errors.accountNumber = "Account number must be 8–18 digits";
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode?.toUpperCase())) {
      errors.ifscCode = "Invalid IFSC format";
    }

    if (!bankDetails.bankName?.trim()) {
      errors.bankName = "Bank name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...bankDetails,
        accountNumber: bankDetails.accountNumber.replace(/[\s-]/g, ""),
        ifscCode: bankDetails.ifscCode.toUpperCase(),
      };

      const response = await api.put("/employee/bank-details", payload);

      if (response.data?.success) {
        toast.success("Bank details updated successfully");
        await fetchBankDetails();
        setEditing(false);
        setValidationErrors({});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bank details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading bank details..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3">

      {/* ================= HEADER ================= */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle className="text-lg font-semibold">
            Bank Details
          </CardTitle>
          <Button
            variant={editing ? "secondary" : "default"}
            onClick={() => setEditing(!editing)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto btn-touch"
          >
            <Edit2 className="w-4 h-4" />
            {editing ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>
      </Card>

      {/* ================= FORM ================= */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardContent className="p-3 space-y-3">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Account Holder Name *"
              name="accountHolderName"
              value={bankDetails.accountHolderName}
              onChange={handleInputChange}
              disabled={!editing}
              error={validationErrors.accountHolderName}
            />

            <InputField
              label="Account Number *"
              name="accountNumber"
              value={editing ? bankDetails.accountNumber : bankDetails.maskedAccountNumber}
              onChange={handleInputChange}
              disabled={!editing}
              error={validationErrors.accountNumber}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="IFSC Code *"
              name="ifscCode"
              value={bankDetails.ifscCode}
              onChange={handleInputChange}
              disabled={!editing}
              error={validationErrors.ifscCode}
              helpText="Example: HDFC0001234"
            />

            <InputField
              label="Bank Name *"
              name="bankName"
              value={bankDetails.bankName}
              onChange={handleInputChange}
              disabled={!editing}
              error={validationErrors.bankName}
            />
          </div>

          <InputField
            label="Branch Name"
            name="branchName"
            value={bankDetails.branchName}
            onChange={handleInputChange}
            disabled={!editing}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              name="accountType"
              value={bankDetails.accountType}
              onChange={handleInputChange}
              disabled={!editing}
              className="w-full border rounded-md px-3 py-2 bg-white"
            >
              <option value="savings">Savings</option>
              <option value="current">Current</option>
              <option value="salary">Salary</option>
            </select>
          </div>

          {/* ================= ACTIONS ================= */}
          {editing && (
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================= STATUS ================= */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardContent className="p-3 space-y-2 text-sm">
          {bankDetails.isVerified ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-md">
              <CheckCircle className="w-4 h-4" />
              Bank details verified by HR
            </div>
          ) : bankDetails.accountNumber ? (
            <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-2 rounded-md">
              <AlertCircle className="w-4 h-4" />
              Pending HR verification
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded-md">
              <AlertCircle className="w-4 h-4" />
              No bank details added yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/* ================= INPUT ================= */
const InputField = ({
  label,
  name,
  value,
  onChange,
  disabled,
  error,
  helpText,
}) => (
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
      className={`w-full px-3 py-2 rounded-md border ${
        error ? "border-red-500" : "border-gray-300"
      } ${disabled ? "bg-gray-50" : "bg-white"}`}
    />
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    {helpText && !error && (
      <p className="text-xs text-gray-500 mt-1">{helpText}</p>
    )}
  </div>
);

export default BankDetailsPage;
