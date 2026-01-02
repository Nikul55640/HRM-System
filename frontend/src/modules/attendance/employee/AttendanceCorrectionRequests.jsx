import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
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
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Plus,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import api from "../../../services/api";

const AttendanceCorrectionRequests = () => {
  const [attendanceIssues, setAttendanceIssues] = useState([]);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("issues");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [requestForm, setRequestForm] = useState({
    date: "",
    expectedClockIn: "",
    expectedClockOut: "",
    breakDuration: "",
    reason: "",
    issueType: "missed_punch",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    activeTab === "issues"
      ? fetchAttendanceIssues()
      : fetchCorrectionRequests();
  }, [activeTab]);

  /* ================= FETCH ================= */

  const fetchAttendanceIssues = async () => {
    setLoading(true);
    try {
      const res = await api.get("/employee/attendance/issues");
      setAttendanceIssues(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch attendance issues");
    } finally {
      setLoading(false);
    }
  };

  const fetchCorrectionRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        "/employee/attendance-correction-requests"
      );
      setCorrectionRequests(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch correction requests");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FORM ================= */

  const validateForm = () => {
    const errors = {};

    if (!requestForm.reason || requestForm.reason.length < 10) {
      errors.reason = "Minimum 10 characters required";
    }

    if (
      requestForm.breakDuration &&
      (+requestForm.breakDuration < 0 || +requestForm.breakDuration > 480)
    ) {
      errors.breakDuration = "Break must be 0–480 minutes";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitRequest = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      await api.post("/employee/attendance-correction-requests", {
        ...requestForm,
        breakDuration: requestForm.breakDuration
          ? Number(requestForm.breakDuration)
          : undefined,
      });

      toast.success("Correction request submitted");
      setIsModalOpen(false);
      setRequestForm({
        date: "",
        expectedClockIn: "",
        expectedClockOut: "",
        breakDuration: "",
        reason: "",
        issueType: "missed_punch",
      });

      fetchCorrectionRequests();
      fetchAttendanceIssues();
    } catch {
      toast.error("Failed to submit correction request");
    }
  };

  /* ================= HELPERS ================= */

  const formatTime = (v) =>
    v ? format(parseISO(v), "dd MMM yyyy, HH:mm") : "N/A";

  const formatDuration = (min = 0) =>
    min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`;

  const StatusBadge = ({ status }) => {
    const map = {
      pending: ["Pending", "bg-yellow-100 text-yellow-800"],
      approved: ["Approved", "bg-green-100 text-green-800"],
      rejected: ["Rejected", "bg-red-100 text-red-800"],
      corrected: ["Corrected", "bg-blue-100 text-blue-800"],
    };
    const [label, cls] = map[status] || ["Unknown", "bg-gray-100"];
    return <Badge className={cls}>{label}</Badge>;
  };

  const IssueBadge = ({ type }) => {
    const map = {
      missed_punch: ["Missed Punch", "bg-red-100 text-red-800"],
      incorrect_time: ["Incorrect Time", "bg-orange-100 text-orange-800"],
      system_error: ["System Error", "bg-purple-100 text-purple-800"],
      other: ["Other", "bg-gray-100 text-gray-800"],
    };
    const [label, cls] = map[type] || ["Other", "bg-gray-100"];
    return <Badge className={cls}>{label}</Badge>;
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Attendance Correction Requests
        </h1>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Correction Request</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                type="date"
                value={requestForm.date}
                onChange={(e) =>
                  setRequestForm((p) => ({ ...p, date: e.target.value }))
                }
              />

              <select
                className="w-full border rounded-md p-2"
                value={requestForm.issueType}
                onChange={(e) =>
                  setRequestForm((p) => ({
                    ...p,
                    issueType: e.target.value,
                  }))
                }
              >
                <option value="missed_punch">Missed Punch</option>
                <option value="incorrect_time">Incorrect Time</option>
                <option value="system_error">System Error</option>
                <option value="other">Other</option>
              </select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  type="time"
                  value={requestForm.expectedClockIn}
                  onChange={(e) =>
                    setRequestForm((p) => ({
                      ...p,
                      expectedClockIn: e.target.value,
                    }))
                  }
                />
                <Input
                  type="time"
                  value={requestForm.expectedClockOut}
                  onChange={(e) =>
                    setRequestForm((p) => ({
                      ...p,
                      expectedClockOut: e.target.value,
                    }))
                  }
                />
              </div>

              <Input
                type="number"
                placeholder="Break (minutes)"
                value={requestForm.breakDuration}
                onChange={(e) =>
                  setRequestForm((p) => ({
                    ...p,
                    breakDuration: e.target.value,
                  }))
                }
              />

              <Textarea
                placeholder="Reason (min 10 chars)"
                value={requestForm.reason}
                onChange={(e) =>
                  setRequestForm((p) => ({
                    ...p,
                    reason: e.target.value,
                  }))
                }
              />
              {formErrors.reason && (
                <p className="text-sm text-red-600">
                  {formErrors.reason}
                </p>
              )}

              <Button onClick={submitRequest}>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="issues">Attendance Issues</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
        </TabsList>

        {/* ISSUES */}
        <TabsContent value="issues">
          <DataCard
            loading={loading}
            empty="No attendance issues found"
            data={attendanceIssues}
            render={(issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                IssueBadge={IssueBadge}
                formatTime={formatTime}
                formatDuration={formatDuration}
                onRequest={() => {
                  setRequestForm({
                    date: format(parseISO(issue.date), "yyyy-MM-dd"),
                    expectedClockIn: "",
                    expectedClockOut: "",
                    breakDuration: issue.totalBreakMinutes || "",
                    reason: "",
                    issueType: issue.issueType,
                  });
                  setIsModalOpen(true);
                }}
              />
            )}
          />
        </TabsContent>

        {/* REQUESTS */}
        <TabsContent value="requests">
          <DataCard
            loading={loading}
            empty="No correction requests found"
            data={correctionRequests}
            render={(req) => (
              <RequestRow
                key={req.id}
                request={req}
                StatusBadge={StatusBadge}
                IssueBadge={IssueBadge}
                formatTime={formatTime}
                formatDuration={formatDuration}
              />
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ================= REUSABLE ================= */

const DataCard = ({ loading, data, empty, render }) => (
  <Card className="rounded-xl">
    <CardContent className="p-6 space-y-4">
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="mx-auto animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center text-gray-500 py-8">{empty}</div>
      ) : (
        data.map(render)
      )}
    </CardContent>
  </Card>
);

const IssueRow = ({
  issue,
  IssueBadge,
  formatTime,
  formatDuration,
  onRequest,
}) => (
  <div className="border rounded-lg p-4 flex flex-col md:flex-row md:justify-between gap-4">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span className="font-medium">
          {format(parseISO(issue.date), "dd MMM yyyy")}
        </span>
        <IssueBadge type={issue.issueType} />
      </div>
      <div className="text-sm text-gray-600">
        In: {formatTime(issue.clockIn)} | Out:{" "}
        {formatTime(issue.clockOut)} | Break:{" "}
        {formatDuration(issue.totalBreakMinutes)}
      </div>
    </div>
    <Button size="sm" variant="outline" onClick={onRequest}>
      Request Correction
    </Button>
  </div>
);

const RequestRow = ({
  request,
  StatusBadge,
  IssueBadge,
  formatTime,
  formatDuration,
}) => (
  <div className="border rounded-lg p-4 space-y-2">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span className="font-medium">
          {format(parseISO(request.date), "dd MMM yyyy")}
        </span>
        <IssueBadge type={request.issueType} />
      </div>
      <StatusBadge status={request.status} />
    </div>

    <div className="text-sm text-gray-600">
      In: {formatTime(request.requestedClockIn)} | Out:{" "}
      {formatTime(request.requestedClockOut)} | Break:{" "}
      {formatDuration(request.requestedBreakMinutes)}
    </div>

    <div className="text-sm text-blue-600">{request.reason}</div>
  </div>
);

export default AttendanceCorrectionRequests;
