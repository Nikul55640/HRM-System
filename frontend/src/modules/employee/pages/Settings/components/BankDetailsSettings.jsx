import { useState, useEffect } from "react";
import { useBankDetails } from "../../../../../services/useEmployeeSelfService";
import { LoadingSpinner } from "../../../../../shared/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../../../shared/ui/button";
import { Input } from "../../../../../shared/ui/input";
import { Label } from "../../../../../shared/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../../shared/ui/card";
import { toast } from "react-toastify";
import { CreditCard, Shield, CheckCircle } from "lucide-react";

const bankDetailsSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
  confirmAccountNumber: z.string().min(1, "Please confirm account number"),
  bankName: z.string().min(1, "Bank name is required"),
  routingNumber: z.string().min(1, "Routing number is required"),
  accountType: z.string().min(1, "Account type is required"),
  accountHolderName: z.string().min(1, "Account holder name is required"),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers don't match",
  path: ["confirmAccountNumber"],
});

const BankDetailsSettings = () => {
  const {
    bankDetails,
    loading: bankDetailsLoading,
    getBankDetails,
    updateBankDetails,
  } = useBankDetails();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(bankDetailsSchema),
  });

  useEffect(() => {
    getBankDetails();
  }, [getBankDetails]);

  useEffect(() => {
    if (bankDetails) {
      reset({
        accountNumber: bankDetails.accountNumber || "",
        confirmAccountNumber: bankDetails.accountNumber || "",
        bankName: bankDetails.bankName || "",
        routingNumber: bankDetails.routingNumber || "",
        accountType: bankDetails.accountType || "",
        accountHolderName: bankDetails.accountHolderName || "",
      });
    }
  }, [bankDetails, reset]);

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateBankDetails(data);
      toast.success("Bank details updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update bank details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (bankDetails) {
      reset({
        accountNumber: bankDetails.accountNumber || "",
        confirmAccountNumber: bankDetails.accountNumber || "",
        bankName: bankDetails.bankName || "",
        routingNumber: bankDetails.routingNumber || "",
        accountType: bankDetails.accountType || "",
        accountHolderName: bankDetails.accountHolderName || "",
      });
    }
    setIsEditing(false);
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return "";
    const length = accountNumber.length;
    if (length <= 4) return accountNumber;
    return "*".repeat(length - 4) + accountNumber.slice(-4);
  };

  if (bankDetailsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bank Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Bank Account Details
          </CardTitle>
          <CardDescription>
            Manage your bank account information for salary payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Edit Button */}
            <div className="flex justify-end mb-4">
              {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Bank Details
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Holder Name *</Label>
                <Input
                  disabled={!isEditing}
                  {...register("accountHolderName")}
                  className={errors.accountHolderName ? "border-red-500" : ""}
                />
                {errors.accountHolderName && (
                  <p className="text-red-500 text-sm">{errors.accountHolderName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Bank Name *</Label>
                <Input
                  disabled={!isEditing}
                  {...register("bankName")}
                  className={errors.bankName ? "border-red-500" : ""}
                />
                {errors.bankName && (
                  <p className="text-red-500 text-sm">{errors.bankName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Account Number *</Label>
                <Input
                  type={isEditing ? "text" : "password"}
                  disabled={!isEditing}
                  {...register("accountNumber")}
                  className={errors.accountNumber ? "border-red-500" : ""}
                  placeholder={!isEditing ? maskAccountNumber(bankDetails?.accountNumber) : ""}
                />
                {errors.accountNumber && (
                  <p className="text-red-500 text-sm">{errors.accountNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Confirm Account Number *</Label>
                <Input
                  type={isEditing ? "text" : "password"}
                  disabled={!isEditing}
                  {...register("confirmAccountNumber")}
                  className={errors.confirmAccountNumber ? "border-red-500" : ""}
                  placeholder={!isEditing ? maskAccountNumber(bankDetails?.accountNumber) : ""}
                />
                {errors.confirmAccountNumber && (
                  <p className="text-red-500 text-sm">{errors.confirmAccountNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Routing Number *</Label>
                <Input
                  disabled={!isEditing}
                  {...register("routingNumber")}
                  className={errors.routingNumber ? "border-red-500" : ""}
                />
                {errors.routingNumber && (
                  <p className="text-red-500 text-sm">{errors.routingNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Account Type *</Label>
                <select
                  disabled={!isEditing}
                  {...register("accountType")}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                    errors.accountType ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Account Type</option>
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                </select>
                {errors.accountType && (
                  <p className="text-red-500 text-sm">{errors.accountType.message}</p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Bank Details Verified</p>
              <p className="text-sm text-green-600">
                Your bank account has been verified and is ready for salary payments
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <p>Your bank details are encrypted and stored securely</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <p>Only authorized HR personnel can access this information</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <p>Changes to bank details require verification before taking effect</p>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <p>You will be notified of any changes made to your bank details</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankDetailsSettings;