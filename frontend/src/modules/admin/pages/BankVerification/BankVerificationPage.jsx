import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Search,
  Filter,
  Download,
  AlertTriangle,
  Building2,
  CreditCard,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../../../../stores/useAuthStore';

const BankVerificationPage = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Get current user info for debugging
  const { user } = useAuthStore();

  const InfoItem = ({ icon, label, value, mono = false }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-500 mt-0.5">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-medium ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  </div>
);

  // Fetch pending verifications
  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      
      // Debug user info
      console.log('🔍 Current user info:', {
        id: user?.id,
        email: user?.email,
        role: user?.role,
        firstName: user?.firstName,
        lastName: user?.lastName
      });
      
      const response = await api.get('/admin/bank-verification/pending-verifications');
      
      if (response.data.success) {
        console.log('🔍 Bank verification data received:', response.data.data);
        setPendingVerifications(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching pending verifications:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      
      if (error.response?.status === 403) {
        console.error('🚫 Permission denied - User role:', user?.role);
        toast.error(`Access denied. Your role (${user?.role}) does not have permission to view bank verifications.`);
      } else {
        toast.error('Failed to load pending verifications');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  // Filter employees based on search
  const filteredEmployees = pendingVerifications.filter(employee =>
    employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.bankName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle verification action
  const handleVerification = async (employeeId, isVerified) => {
    console.log('🔍 Starting verification process:', { employeeId, isVerified, rejectionReason });
    
    if (!isVerified && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      
      const payload = {
        isVerified,
        rejectionReason: !isVerified ? rejectionReason : null
      };

      console.log('📤 Sending verification request:', {
        url: `/admin/bank-verification/verify/${employeeId}`,
        payload
      });

      const response = await api.put(`/admin/bank-verification/verify/${employeeId}`, payload);
      
      console.log('📥 Verification response:', response.data);
      
      if (response.data.success) {
        toast.success(`Bank details ${isVerified ? 'approved' : 'rejected'} successfully`);
        setShowModal(false);
        setSelectedEmployee(null);
        setRejectionReason('');
        fetchPendingVerifications(); // Refresh the list
      } else {
        console.error('❌ Verification failed:', response.data);
        toast.error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('❌ Error processing verification:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission to verify bank details.');
      } else if (error.response?.status === 404) {
        toast.error('Employee or bank details not found.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to process verification');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Open verification modal
  const openVerificationModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
    setRejectionReason('');
  };

  if (loading) {
    return <LoadingSpinner message="Loading bank verifications..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      
      {/* Debug Panel - Development Only
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Debug Info (Development Only)
            </h3>
            <div className="text-xs text-red-700 space-y-1">
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Required Permissions:</strong> employee.view.all, employee.update.any</p>
            </div>
          </CardContent>
        </Card>
      )}
       */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Bank Details Verification</h1>
          <p className="text-gray-600 mt-1">Review and approve employee bank details</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {pendingVerifications.length} Pending
          </Badge>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, employee ID, email, or bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Verifications List */}
   {filteredEmployees.length === 0 ? (
  <Card className="border border-dashed">
    <CardContent className="py-8 text-center">
      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3"/>
      <h3 className="text-lg font-semibold text-gray-900">
        All Caught Up
      </h3>
      <p className="text-gray-600 mt-1">
        No pending bank details verifications at the moment.
      </p>
    </CardContent>
  </Card>
) : (
  <div className="space-y-3">
    {filteredEmployees.map((employee) => (
      <Card
        key={employee.employeeId}
        className="border border-gray-200 hover:shadow-md transition"
      >
        <CardContent className="p-3">
          <div className="flex flex-col lg:flex-row gap-3">

            {/* LEFT : Employee + Bank Info */}
            <div className="flex-1 space-y-2">

              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    {employee.employeeName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ID: {employee.employeeCode} • {employee.email}
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 text-yellow-700 bg-yellow-100"
                >
                  <Clock className="w-3 h-3" />
                  Pending
                </Badge>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 border rounded-md p-2">

                <InfoItem
                  icon={<Building2 className="w-4 h-4" />}
                  label="Bank Name"
                  value={employee.bankName}
                />

                <InfoItem
                  icon={<CreditCard className="w-4 h-4" />}
                  label="Account Number"
                  mono
                  value={employee.accountNumber || "Not Available"}
                />

                <InfoItem
                  icon={<span className="text-xs font-bold">IFSC</span>}
                  label="IFSC Code"
                  mono
                  value={employee.ifscCode}
                />

                <InfoItem
                  icon={<User className="w-4 h-4" />}
                  label="Account Holder"
                  value={employee.accountHolderName}
                />
              </div>

              {/* Submitted Time */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-4 h-4" />
                Submitted{" "}
                {formatDistanceToNow(new Date(employee.updatedAt), {
                  addSuffix: true,
                })}
              </div>
            </div>

            {/* RIGHT : Actions */}
            <div className="flex lg:flex-col gap-2 justify-end">
              <Button
                size="sm"
                onClick={() => openVerificationModal(employee)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)}


      {/* Verification Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-3">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Verify Bank Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </Button>
              </div>

              {/* Employee Details */}
              <div className="space-y-2 mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Employee Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-700">Name:</span>
                      <p className="font-medium">{selectedEmployee.employeeName}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Employee ID:</span>
                      <p className="font-medium">{selectedEmployee.employeeCode}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-blue-700">Email:</span>
                      <p className="font-medium">{selectedEmployee.email}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Details to Verify */}
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Bank Details for Verification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-yellow-700">Bank Name:</span>
                      <p className="font-medium">{selectedEmployee.bankName}</p>
                    </div>
                    <div>
                      <span className="text-yellow-700">IFSC Code:</span>
                      <p className="font-medium font-mono">{selectedEmployee.ifscCode}</p>
                    </div>
                    <div>
                      <span className="text-yellow-700">Account Number:</span>
                      <p className="font-medium font-mono">
                        {selectedEmployee.accountNumber || 'Not Available'}
                      </p>
                      {/* Debug info - remove in production */}
                      {process.env.NODE_ENV === 'development' && (
                        <p className="text-xs text-red-500">
                          Debug: {JSON.stringify(selectedEmployee.accountNumber)}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-yellow-700">Account Holder:</span>
                      <p className="font-medium">{selectedEmployee.accountHolderName}</p>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide reason for rejection (e.g., Invalid IFSC code, Account number mismatch, etc.)"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => handleVerification(selectedEmployee.employeeId, false)}
                  disabled={actionLoading}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {actionLoading ? 'Rejecting...' : 'Reject'}
                </Button>
                
                <Button
                  onClick={() => handleVerification(selectedEmployee.employeeId, true)}
                  disabled={actionLoading}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {actionLoading ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankVerificationPage;