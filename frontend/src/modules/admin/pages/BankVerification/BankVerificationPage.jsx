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

const BankVerificationPage = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending verifications
  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employee/bank-details/pending-verifications');
      
      if (response.data.success) {
        setPendingVerifications(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      toast.error('Failed to load pending verifications');
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

      const response = await api.put(`/employee/bank-details/verify/${employeeId}`, payload);
      
      if (response.data.success) {
        toast.success(`Bank details ${isVerified ? 'approved' : 'rejected'} successfully`);
        setShowModal(false);
        setSelectedEmployee(null);
        setRejectionReason('');
        fetchPendingVerifications(); // Refresh the list
      }
    } catch (error) {
      console.error('Error processing verification:', error);
      toast.error(error.response?.data?.message || 'Failed to process verification');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Details Verification</h1>
          <p className="text-gray-600 mt-1">Review and approve employee bank details</p>
        </div>
        
        <div className="flex items-center gap-3">
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
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
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
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending bank details verifications at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.employeeId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  
                  {/* Employee Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          {employee.employeeName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ID: {employee.employeeCode} • {employee.email}
                        </p>
                      </div>
                      
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </Badge>
                    </div>

                    {/* Bank Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Bank Name</p>
                          <p className="font-medium">{employee.bankName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Account Number</p>
                          <p className="font-medium font-mono">{employee.accountNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 text-gray-500 text-xs font-bold">IFSC</span>
                        <div>
                          <p className="text-xs text-gray-500">IFSC Code</p>
                          <p className="font-medium font-mono">{employee.ifscCode}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Account Holder</p>
                          <p className="font-medium">{employee.accountHolderName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Submitted {formatDistanceToNow(new Date(employee.updatedAt), { addSuffix: true })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-32">
                    <Button
                      onClick={() => openVerificationModal(employee)}
                      className="flex items-center justify-center gap-2"
                      size="sm"
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
            <div className="p-6">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Verify Bank Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </Button>
              </div>

              {/* Employee Details */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Employee Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Bank Details for Verification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                      <p className="font-medium font-mono">{selectedEmployee.accountNumber}</p>
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
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