import { useEffect, useState } from "react";
import { useRequests } from "../../../features/admin/employees/useEmployeeSelfService";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Badge } from "../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { FileText, Plus } from "lucide-react";
import {
  formatDate,
  getStatusBadgeVariant,
  formatCurrency,
} from "../../../utils/essHelpers";
import ReimbursementForm from "./ReimbursementForm";
import AdvanceRequestForm from "./AdvanceRequestForm";
import TransferRequestForm from "./TransferRequestForm";
import ShiftChangeForm from "./ShiftChangeForm";
import RequestDetailModal from "../../ui/RequestDetailModal";
const RequestsPage = () => {
  const { requests, loading, getRequests, createRequest } = useRequests();
  const [filter, setFilter] = useState("all");
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedRequestType, setSelectedRequestType] =
    useState("reimbursement");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    getRequests();
  }, [getRequests]);

  const filteredRequests = requests?.filter(
    (req) => filter === "all" || req.status === filter
  );

  const handleCreateRequest = async (data) => {
    const payload = {
      requestType: selectedRequestType,
      [selectedRequestType === "shift_change"
        ? "shiftChange"
        : selectedRequestType]: data,
    };

    const success = await createRequest(payload);
    if (success) {
      setIsNewRequestOpen(false);
      getRequests();
    }
  };

  const renderRequestForm = () => {
    const props = {
      onSubmit: handleCreateRequest,
      isLoading: loading,
      onCancel: () => setIsNewRequestOpen(false),
    };

    switch (selectedRequestType) {
      case "reimbursement":
        return <ReimbursementForm {...props} />;
      case "advance":
        return <AdvanceRequestForm {...props} />;
      case "transfer":
        return <TransferRequestForm {...props} />;
      case "shift_change":
        return <ShiftChangeForm {...props} />;
      default:
        return null;
    }
  };

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Requests</h1>

        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Request</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Request Type</label>
                <Select
                  value={selectedRequestType}
                  onValueChange={setSelectedRequestType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reimbursement">Reimbursement</SelectItem>
                    <SelectItem value="advance">Salary Advance</SelectItem>
                    <SelectItem value="transfer">Transfer Request</SelectItem>
                    <SelectItem value="shift_change">Shift Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">{renderRequestForm()}</div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="space-y-4">
            {filteredRequests?.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No requests found.
              </div>
            ) : (
              filteredRequests?.map((request) => (
                <Card
                  key={request._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2 capitalize text-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        {request.requestType?.replace("_", " ")}
                      </CardTitle>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Submitted:
                        </span>
                        <span>{formatDate(request.submittedAt)}</span>
                      </div>

                      {request.reimbursement && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">
                            {formatCurrency(request.reimbursement.amount)}
                          </span>
                        </div>
                      )}

                      {request.advance && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">
                            {formatCurrency(request.advance.amount)}
                          </span>
                        </div>
                      )}

                      {request.transfer && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Department:
                          </span>
                          <span>{request.transfer.requestedDepartment}</span>
                        </div>
                      )}

                      {request.shiftChange && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shift:</span>
                          <span className="capitalize">
                            {request.shiftChange.requestedShift}
                          </span>
                        </div>
                      )}

                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleViewDetail(request)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <RequestDetailModal
        request={selectedRequest}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};

export default RequestsPage;
