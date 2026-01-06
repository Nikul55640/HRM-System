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
  DialogTrigger,
} from "../../../shared/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/ui/tabs";
import {
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import api from "../../../services/api";

const AttendanceCorrections = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processedRequests, setProcessedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

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

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Attendance Corrections</h1>
          <p className="text-sm text-gray-600 mt-1">Review and process attendance correction requests</p>
        </div>
      </div>

      {/* FILTERS */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
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
          <RequestList
            loading={loading}
            data={pendingRequests}
            onAction={(req) => {
              setSelectedRequest(req);
              setAdminNotes("");
            }}
            StatusBadge={StatusBadge}
            formatDateTime={formatDateTime}
            formatDuration={formatDuration}
            pending
          />
        </TabsContent>

        {/* PROCESSED */}
        <TabsContent value="processed">
          <RequestList
            loading={loading}
            data={processedRequests}
            StatusBadge={StatusBadge}
            formatDateTime={formatDateTime}
            formatDuration={formatDuration}
          />
        </TabsContent>
      </Tabs>

      {/* ACTION MODAL */}
      {selectedRequest && (
        <Dialog open onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Process Correction Request</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div>
                <strong>Employee:</strong>{" "}
                {selectedRequest.employee?.firstName}{" "}
                {selectedRequest.employee?.lastName}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {format(parseISO(selectedRequest.date), "dd MMM yyyy")}
              </div>
              <div>
                <strong>Reason:</strong> 
                <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                  {selectedRequest.reason}
                </div>
              </div>

              <Textarea
                placeholder="Admin notes (required for rejection)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="text-sm"
                rows={3}
              />

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 order-2 sm:order-1"
                  onClick={() =>
                    handleAction(selectedRequest.id, "approve")
                  }
                >
                  Approve
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 order-1 sm:order-2"
                  onClick={() =>
                    handleAction(selectedRequest.id, "reject")
                  }
                >
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

/* ================= LIST ================= */

const RequestList = ({
  loading,
  data,
  onAction,
  StatusBadge,
  formatDateTime,
  formatDuration,
  pending = false,
}) => {
  if (loading)
    return (
      <div className="py-10 text-center">
        <Loader2 className="mx-auto animate-spin w-6 h-6 sm:w-8 sm:h-8" />
        <p className="mt-2 text-sm text-gray-600">Loading...</p>
      </div>
    );

  if (!data.length)
    return (
      <div className="text-center text-gray-500 py-10">
        <p className="text-sm sm:text-base">No requests found</p>
      </div>
    );

  return (
    <Card className="rounded-2xl">
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
        {data.map((req) => (
          <div
            key={req.id}
            className="border rounded-lg p-3 sm:p-4 flex flex-col gap-3 hover:bg-gray-50"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base truncate">
                  {req.employee?.firstName} {req.employee?.lastName}
                </span>
                <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0">
                  ({req.employee?.employeeId})
                </span>
                <StatusBadge status={req.status} />
              </div>
              {pending && (
                <Button size="sm" onClick={() => onAction(req)} className="w-full sm:w-auto">
                  Review
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <Info label="Date" value={formatDateTime(req.date)} />
              <Info label="Clock In" value={formatDateTime(req.requestedClockIn)} />
              <Info label="Clock Out" value={formatDateTime(req.requestedClockOut)} />
              <Info label="Break" value={formatDuration(req.requestedBreakMinutes)} />
            </div>

            <div className="text-sm">
              <span className="text-gray-500">Reason:</span>{" "}
              <div className="mt-1 text-gray-700 line-clamp-2">
                {req.reason}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const Info = ({ label, value }) => (
  <div className="min-w-0">
    <div className="text-gray-500 text-xs truncate">{label}</div>
    <div className="font-medium text-sm truncate">{value}</div>
  </div>
);

export default AttendanceCorrections;
