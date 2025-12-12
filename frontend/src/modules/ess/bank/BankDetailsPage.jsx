import React, { useState, useEffect } from "react";
import { useBankDetails } from "../../employees/useEmployeeSelfService";
import BankDetailsView from "./BankDetailsView";
import BankDetailsForm from "./BankDetailsForm";

const BankDetailsPage = () => {
  const { bankDetails, loading, error, getBankDetails, updateBankDetails } =
    useBankDetails();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getBankDetails();
  }, [getBankDetails]);

  const handleSubmit = async (data) => {
    await updateBankDetails(data);
    setIsEditing(false);
  };

  if (loading && !bankDetails) {
    return <div className="p-6 text-center">Loading bank details...</div>;
  }

  if (error && !bankDetails) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Bank Details</h1>

      {isEditing ? (
        <BankDetailsForm
          bankDetails={bankDetails}
          onSubmit={handleSubmit}
          onCancel={() => setIsEditing(false)}
          isLoading={loading}
        />
      ) : (
        <BankDetailsView
          bankDetails={bankDetails}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
};

export default BankDetailsPage;