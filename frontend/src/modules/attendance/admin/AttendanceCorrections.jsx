import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { Textarea } from "../../../shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/ui/tabs";
import {
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  ArrowRight,
  MoreHorizontal,
  Eye,
  ChevronUp,
  ChevronDown,
  Filter,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import api from "../../../services/api";

const AttendanceCorrections = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processedRequests, setProcessedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewRequest, setViewRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [filters, setFilters] = useState({
    employeeId: "",
    dateFrom: "",
    dateTo: "",
    status: "",
  });

  useEffect(() => {
    activeTab === "pending"
      ? fetchPendingRequests()
      : fetchProcessedRequests();
  }, [activeTab]);

  /* ================= FETCH ================= */

  const buildParams = (extra = {}) => {
    const params = { ...extra };
    if (filters.employeeId) params.employeeId = filters.employeeId;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.status) params.status = filters.status;
    return params;
  };

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        "/admin/attendance-corrections/requests",
        { params: buildParams({ status: "pending" }) }
      );
      setPendingRequests(res.data?.data || []);
    } catch {
      toast.error("Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessedRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        "/admin/attendance-corrections/requests",
        { params: buildParams() }
      );
      setProcessedRequests(
        (res.data?.data || []).filter(
          (r) => r.status !== "pending"
        )
      );
    } catch {
      toast.error("Failed to load processed requests");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIONS ================= */

  const handleAction = async (id, type) => {
    if (type === "reject" && !adminNotes.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    try {
      await api.put(
        `/admin/attendance-corrections/requests/${id}/${type}`,
        { adminNotes }
      );
      toast.success(`Request ${type}ed successfully`);
      setSelectedRequest(null);
      setAdminNotes("");
      fetchPendingRequests();
    } catch {
      toast.error(`Failed to ${type} request`);
    }
  };

  /* ================= HELPERS ================= */

  const formatDateTime = (date) =>
    date ? format(parseISO(date), "dd MMM yyyy, hh:mm a") : "N/A";

  const formatDuration = (min = 0) =>
    min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`;

  const StatusBadge = ({ status }) => {
    const map = {
      pending: ["Pending", "bg-yellow-100 text-yellow-800"],
      approved: ["Approved", "bg-green-100 text-green-800"],
      rejected: ["Rejected", "bg-red-100 text-red-800"],
      corrected: ["Corrected", "bg-blue-100 text-blue-800"],
      cancelled: ["Cancelled", "bg-gray-100 text-gray-800"],
    };
    const [label, style] = map[status] || map.pending;
    return <Badge className={style}>{label}</Badge>;
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested employee data
      if (sortConfig.key === 'employee') {
        aValue = `${a.employee?.firstName} ${a.employee?.lastName}`;
        bValue = `${b.employee?.firstName} ${b.employee?.lastName}`;
      }

      // Handle date sorting
      if (sortConfig.key === 'date' || sortConfig.key.includes('Clock')) {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const SortableHeader = ({ children, sortKey, className = "" }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </TableHead>
  );

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Attendance Corrections</h1>
          <p className="text-sm text-gray-600 mt-1">Review and process attendance correction requests</p>
        </div>
      </div>

      {/* FILTERS */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Input
              placeholder="Employee ID"
              value={filters.employeeId}
              onChange={(e) =>
                setFilters((p) => ({ ...p, employeeId: e.target.value }))
              }
              className="text-sm"
            />
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((p) => ({ ...p, dateFrom: e.target.value }))
              }
              className="text-sm"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters((p) => ({ ...p, dateTo: e.target.value }))
              }
              className="text-sm"
            />
            <Select
              value={filters.status}
              onValueChange={(v) =>
                setFilters((p) => ({ ...p, status: v }))
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="corrected">Corrected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() =>
                activeTab === "pending"
                  ? fetchPendingRequests()
                  : fetchProcessedRequests()
              }
              className="w-full"
            >
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="text-sm">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="processed" className="text-sm">
            Processed ({processedRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* PENDING */}
        <TabsContent value="pending">
          <AttendanceCorrectionTable
            loading={loading}
            data={getSortedData(pendingRequests)}
            onView={(req) => setViewRequest(req)}
            onAction={(req) => {
              setSelectedRequest(req);
              setAdminNotes("");
            }}
            StatusBadge={StatusBadge}
            formatDateTime={formatDateTime}
            formatDuration={formatDuration}
            SortableHeader={SortableHeader}
            pending
          />
        </TabsContent>

        {/* PROCESSED */}
        <TabsContent value="processed">
          <AttendanceCorrectionTable
            loading={loading}
            data={getSortedData(processedRequests)}
            onView={(req) => setViewRequest(req)}
            StatusBadge={StatusBadge}
            formatDateTime={formatDateTime}
            formatDuration={formatDuration}
            SortableHeader={SortableHeader}
          />
        </TabsContent>
      </Tabs>

      {/* VIEW MODAL */}
      {viewRequest && (
        <Dialog open onOpenChange={() => setViewRequest(null)}>
          <DialogContent className="max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Correction Request Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 text-sm">
              {/* Employee & Request Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Employee Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <div className="font-medium">
                        {viewRequest.employee?.firstName} {viewRequest.employee?.lastName}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Employee ID:</span>
                      <div className="font-medium">{viewRequest.employee?.employeeId}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <div className="font-medium">{viewRequest.employee?.department?.name || 'N/A'}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Request Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <div className="font-medium">
                        {format(parseISO(viewRequest.date), "dd MMM yyyy")}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className="mt-1">
                        <StatusBadge status={viewRequest.status} />
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted:</span>
                      <div className="font-medium">
                        {formatDateTime(viewRequest.createdAt)}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Attendance Comparison */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Attendance Comparison
                </h4>
                
                <div className="space-y-4">
                  {/* Clock In Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="text-sm text-gray-600 font-medium">Clock In:</div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Original:</div>
                      <div className="font-medium">
                        {viewRequest.originalClockIn 
                          ? formatDateTime(viewRequest.originalClockIn)
                          : <span className="text-red-500">Missing</span>
                        }
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Requested:</div>
                      <div className="font-medium text-blue-700">
                        {viewRequest.requestedClockIn 
                          ? formatDateTime(viewRequest.requestedClockIn)
                          : <span className="text-gray-400">No change</span>
                        }
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-blue-200"></div>

                  {/* Clock Out Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="text-sm text-gray-600 font-medium">Clock Out:</div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Original:</div>
                      <div className="font-medium">
                        {viewRequest.originalClockOut 
                          ? formatDateTime(viewRequest.originalClockOut)
                          : <span className="text-red-500">Missing</span>
                        }
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Requested:</div>
                      <div className="font-medium text-blue-700">
                        {viewRequest.requestedClockOut 
                          ? formatDateTime(viewRequest.requestedClockOut)
                          : <span className="text-gray-400">No change</span>
                        }
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-blue-200"></div>

                  {/* Break Minutes Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="text-sm text-gray-600 font-medium">Break Time:</div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Original:</div>
                      <div className="font-medium">
                        {formatDuration(viewRequest.originalBreakMinutes || 0)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Requested:</div>
                      <div className="font-medium text-blue-700">
                        {formatDuration(viewRequest.requestedBreakMinutes || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Employee Reason */}
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Employee's Reason</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  {viewRequest.reason}
                </div>
              </Card>

              {/* Admin Notes (if any) */}
              {viewRequest.adminNotes && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Admin Notes</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {viewRequest.adminNotes}
                  </div>
                </Card>
              )}

              {/* Processing History */}
              {viewRequest.status !== 'pending' && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Processing History</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Processed by:</span>
                      <span className="font-medium">{viewRequest.processedBy || 'System'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Processed at:</span>
                      <span className="font-medium">
                        {viewRequest.updatedAt ? formatDateTime(viewRequest.updatedAt) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ACTION MODAL */}
      {selectedRequest && (
        <Dialog open onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Process Correction Request</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              {/* Employee Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <strong>Employee:</strong>{" "}
                  {selectedRequest.employee?.firstName}{" "}
                  {selectedRequest.employee?.lastName}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {format(parseISO(selectedRequest.date), "dd MMM yyyy")}
                </div>
              </div>

              {/* ✅ IMPROVEMENT: Original vs Requested Comparison */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Attendance Comparison
                </h4>
                
                <div className="space-y-3">
                  {/* Clock In Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div className="text-xs text-gray-600 font-medium">Clock In:</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Original:</span>
                        <div className="font-medium">
                          {selectedRequest.originalClockIn 
                            ? formatDateTime(selectedRequest.originalClockIn)
                            : <span className="text-red-500">Missing</span>
                          }
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400 hidden sm:block" />
                      <div className="text-sm">
                        <span className="text-gray-500">Requested:</span>
                        <div className="font-medium text-blue-700">
                          {selectedRequest.requestedClockIn 
                            ? formatDateTime(selectedRequest.requestedClockIn)
                            : <span className="text-gray-400">No change</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clock Out Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div className="text-xs text-gray-600 font-medium">Clock Out:</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Original:</span>
                        <div className="font-medium">
                          {selectedRequest.originalClockOut 
                            ? formatDateTime(selectedRequest.originalClockOut)
                            : <span className="text-red-500">Missing</span>
                          }
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400 hidden sm:block" />
                      <div className="text-sm">
                        <span className="text-gray-500">Requested:</span>
                        <div className="font-medium text-blue-700">
                          {selectedRequest.requestedClockOut 
                            ? formatDateTime(selectedRequest.requestedClockOut)
                            : <span className="text-gray-400">No change</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Break Minutes Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div className="text-xs text-gray-600 font-medium">Break Time:</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Original:</span>
                        <div className="font-medium">
                          {formatDuration(selectedRequest.originalBreakMinutes || 0)}
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400 hidden sm:block" />
                      <div className="text-sm">
                        <span className="text-gray-500">Requested:</span>
                        <div className="font-medium text-blue-700">
                          {formatDuration(selectedRequest.requestedBreakMinutes || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact Summary */}
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="text-xs text-blue-700 font-medium">Impact Summary:</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {(() => {
                      const changes = [];
                      if (selectedRequest.originalClockIn !== selectedRequest.requestedClockIn) {
                        changes.push("Clock-in time");
                      }
                      if (selectedRequest.originalClockOut !== selectedRequest.requestedClockOut) {
                        changes.push("Clock-out time");
                      }
                      if ((selectedRequest.originalBreakMinutes || 0) !== (selectedRequest.requestedBreakMinutes || 0)) {
                        changes.push("Break duration");
                      }
                      return changes.length > 0 
                        ? `Changes: ${changes.join(", ")}`
                        : "No significant changes detected";
                    })()}
                  </div>
                </div>
              </div>

              {/* Employee Reason */}
              <div>
                <strong>Employee's Reason:</strong> 
                <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                  {selectedRequest.reason}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block font-medium mb-2">
                  Admin Notes 
                  <span className="text-red-500 text-xs ml-1">(required for rejection)</span>
                </label>
                <Textarea
                  placeholder="Add your review notes, approval reason, or rejection explanation..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="text-sm"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 order-2 sm:order-1"
                  onClick={() =>
                    handleAction(selectedRequest.id, "approve")
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Request
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 order-1 sm:order-2"
                  onClick={() =>
                    handleAction(selectedRequest.id, "reject")
                  }
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Reject Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

/* ================= TABLE COMPONENT ================= */

const AttendanceCorrectionTable = ({
  loading,
  data,
  onView,
  onAction,
  StatusBadge,
  formatDateTime,
  formatDuration,
  SortableHeader,
  pending = false,
}) => {
  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin w-6 h-6 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Loading correction requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <Clock className="mx-auto w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No correction requests found
            </h3>
            <p className="text-sm">
              {pending 
                ? "There are no pending correction requests at the moment."
                : "No processed correction requests match your current filters."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {pending ? 'Pending Requests' : 'Processed Requests'}
          </CardTitle>
          <div className="text-sm text-gray-500">
            {data.length} request{data.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortableHeader sortKey="employee" className="min-w-[200px]">
                  Employee
                </SortableHeader>
                <SortableHeader sortKey="date" className="min-w-[120px]">
                  Date
                </SortableHeader>
                <TableHead className="min-w-[140px]">Clock In</TableHead>
                <TableHead className="min-w-[140px]">Clock Out</TableHead>
                <TableHead className="min-w-[100px]">Break</TableHead>
                <SortableHeader sortKey="status" className="min-w-[100px]">
                  Status
                </SortableHeader>
                <TableHead className="min-w-[200px]">Reason</TableHead>
                <SortableHeader sortKey="createdAt" className="min-w-[140px]">
                  Submitted
                </SortableHeader>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((request) => (
                <TableRow key={request.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                          {request.employee?.firstName} {request.employee?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          ID: {request.employee?.employeeId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {format(parseISO(request.date), "dd MMM yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {request.requestedClockIn 
                        ? format(parseISO(request.requestedClockIn), "hh:mm a")
                        : <span className="text-gray-400">No change</span>
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {request.requestedClockOut 
                        ? format(parseISO(request.requestedClockOut), "hh:mm a")
                        : <span className="text-gray-400">No change</span>
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDuration(request.requestedBreakMinutes || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 max-w-[200px] truncate">
                      {request.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(request.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onView(request)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {pending && onAction && (
                          <DropdownMenuItem onClick={() => onAction(request)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Process Request
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
      </CardContent>
    </Card>
  );
};

export default AttendanceCorrections;
