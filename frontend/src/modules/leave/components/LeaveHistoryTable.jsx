import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../shared/ui/dropdown-menu";
import { DetailModal } from "../../../shared/components";
import { ApprovalStatusBadge } from "../../../shared/components";
import { formatDate } from "../../ess/utils/essHelpers";
import { formatIndianDateTime } from "../../../utils/indianFormatters";
import {
  Calendar,
  Clock,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  User,
  MoreHorizontal,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../../core/utils/errorMessageExtractor";
import leaveService from "../../../services/leaveService";

const LeaveHistoryTable = ({ history, onRefresh }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return null;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
  };

  const sortedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    let sortableHistory = [...history];
    if (sortConfig.key) {
      sortableHistory.sort((a, b) => {
        if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
          const aDate = new Date(a[sortConfig.key]);
          const bDate = new Date(b[sortConfig.key]);
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }
        if (sortConfig.key === 'totalDays') {
          const aDays = a.totalDays || 0;
          const bDays = b.totalDays || 0;
          return sortConfig.direction === 'asc' ? aDays - bDays : bDays - aDays;
        }
        if (sortConfig.key === 'leaveType') {
          const aType = a.leaveType || '';
          const bType = b.leaveType || '';
          return sortConfig.direction === 'asc' ? 
            aType.localeCompare(bType) : bType.localeCompare(aType);
        }
        return 0;
      });
    }
    return sortableHistory;
  }, [history, sortConfig]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    
    return (
      <Badge variant="outline" className={`${config.className} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const handleCancelRequest = async (requestId) => {
    if (
      !window.confirm("Are you sure you want to cancel this leave request?")
    ) {
      return;
    }

    const reason = window.prompt(
      "Please provide a reason for cancellation (optional):",
    );
    if (reason === null) return;

    try {
      setCancellingId(requestId);
      await leaveService.cancelLeaveRequest(requestId, reason);
      toast.success("Leave request cancelled successfully");
      onRefresh?.();
    } catch (error) {
      const errorMessage = extractErrorMessage(error, "Failed to cancel leave request");
      toast.error(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  if (!history || history.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Leave History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave history</h3>
            <p className="text-sm text-gray-600">You haven't submitted any leave requests yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Leave History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Leave History Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead 
                    className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('leaveType')}
                  >
                    <div className="flex items-center">
                      Leave Type
                      {getSortIcon('leaveType')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center">
                      Start Date
                      {getSortIcon('startDate')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('endDate')}
                  >
                    <div className="flex items-center">
                      End Date
                      {getSortIcon('endDate')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('totalDays')}
                  >
                    <div className="flex items-center">
                      Duration
                      {getSortIcon('totalDays')}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHistory.map((item) => (
                  <TableRow 
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        {item.leaveType}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(item.startDate)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(item.endDate)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {item.totalDays} {item.totalDays === 1 ? "day" : "days"}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleViewDetails(item)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {item.canCancel && (
                            <DropdownMenuItem 
                              className="cursor-pointer text-red-600 focus:text-red-600"
                              onClick={() => handleCancelRequest(item.id)}
                              disabled={cancellingId === item.id}
                            >
                              <X className="mr-2 h-4 w-4" />
                              {cancellingId === item.id ? 'Cancelling...' : 'Cancel Leave'}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Expanded Details */}
          {expandedId && (
            <Card className="border-l-4 border-l-blue-500 bg-blue-50">
              <CardContent className="p-4">
                {(() => {
                  const item = sortedHistory.find(h => h.id === expandedId);
                  if (!item) return null;

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-blue-900">Leave Request Details</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setExpandedId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Reason */}
                      {item.reason && (
                        <div>
                          <span className="text-sm font-medium text-blue-800">Reason:</span>
                          <p className="mt-1 text-sm text-blue-700 bg-white p-3 rounded-md border border-blue-200">
                            {item.reason}
                          </p>
                        </div>
                      )}

                      {/* Status Details */}
                      {item.status === "approved" && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                          <div className="flex items-center gap-2 text-green-700 font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Approved
                          </div>
                          <div className="mt-2 text-sm text-green-700">
                            <div>Approved by: {item.approver?.email || "HR"}</div>
                            <div>
                              Approved on: {item.approvedAt ? formatIndianDateTime(item.approvedAt) : "-"}
                            </div>
                          </div>
                        </div>
                      )}

                      {item.status === "rejected" && item.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <div className="flex items-center gap-2 text-red-700 font-medium">
                            <XCircle className="h-4 w-4" />
                            Rejected
                          </div>
                          <p className="mt-2 text-sm text-red-700">{item.rejectionReason}</p>
                        </div>
                      )}

                      {item.status === "cancelled" && item.cancellationReason && (
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                          <span className="font-medium text-gray-700">Cancellation Reason:</span>
                          <p className="mt-1 text-sm text-gray-600">{item.cancellationReason}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {sortedHistory.length}
              </div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sortedHistory.filter(h => h.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {sortedHistory.filter(h => h.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sortedHistory.reduce((total, h) => total + (h.totalDays || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Days</div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Leave Details Modal */}
      {showDetailModal && selectedRequest && (
        <DetailModal
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          title="Leave Request Details"
          data={selectedRequest}
          sections={[
            {
              label: 'Leave Information',
              fields: [
                { key: 'leaveType', label: 'Leave Type', icon: 'description' },
                { key: 'status', label: 'Status', type: 'status' },
                { key: 'duration', label: 'Duration (Days)', type: 'number', icon: 'time' },
                { key: 'totalDays', label: 'Total Days', type: 'number', icon: 'time' },
                { key: 'halfDayType', label: 'Half Day Type', icon: 'time' }
              ]
            },
            {
              label: 'Dates & Timeline',
              fields: [
                { key: 'startDate', label: 'Start Date', type: 'date', icon: 'date' },
                { key: 'endDate', label: 'End Date', type: 'date', icon: 'date' },
                { key: 'createdAt', label: 'Applied Date', type: 'date', icon: 'date' },
                { key: 'appliedDate', label: 'Applied Date (Alt)', type: 'date', icon: 'date' }
              ]
            },
            {
              label: 'Details & Reason',
              fields: [
                { key: 'reason', label: 'Leave Reason', type: 'longtext', fullWidth: true },
                { key: 'emergencyContact', label: 'Emergency Contact', icon: 'user' },
                { key: 'workHandover', label: 'Work Handover', type: 'longtext', fullWidth: true }
              ]
            },
            ...(selectedRequest.status === 'approved' || selectedRequest.approvedBy ? [{
              label: 'Approval Information',
              fields: [
                { key: 'approvedBy', label: 'Approved By', icon: 'user' },
                { key: 'approvedDate', label: 'Approved Date', type: 'date', icon: 'date' },
                { key: 'approvedAt', label: 'Approved At', type: 'date', icon: 'date' },
                { key: 'approverComments', label: 'Approver Comments', type: 'longtext', fullWidth: true }
              ]
            }] : []),
            ...(selectedRequest.status === 'rejected' || selectedRequest.rejectionReason ? [{
              label: 'Rejection Information',
              fields: [
                { key: 'rejectionReason', label: 'Rejection Reason', type: 'longtext', fullWidth: true },
                { key: 'rejectedBy', label: 'Rejected By', icon: 'user' },
                { key: 'rejectedDate', label: 'Rejected Date', type: 'date', icon: 'date' }
              ]
            }] : []),
            ...(selectedRequest.status === 'cancelled' || selectedRequest.cancellationReason ? [{
              label: 'Cancellation Information',
              fields: [
                { key: 'cancellationReason', label: 'Cancellation Reason', type: 'longtext', fullWidth: true },
                { key: 'cancelledBy', label: 'Cancelled By', icon: 'user' },
                { key: 'cancelledDate', label: 'Cancelled Date', type: 'date', icon: 'date' }
              ]
            }] : [])
          ]}
          actions={[
            ...(selectedRequest.status === 'pending' ? [{
              label: 'Cancel Request',
              icon: X,
              onClick: () => {
                setShowDetailModal(false);
                handleCancelRequest(selectedRequest.id || selectedRequest._id);
              },
              variant: 'destructive'
            }] : []),
            {
              label: 'Close',
              onClick: () => {
                setShowDetailModal(false);
                setSelectedRequest(null);
              },
              variant: 'outline'
            }
          ]}
        />
      )}
    </Card>
  );
};

LeaveHistoryTable.propTypes = {
  history: PropTypes.array.isRequired,
  onRefresh: PropTypes.func,
};

export default LeaveHistoryTable;
