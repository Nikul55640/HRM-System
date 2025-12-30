import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../../shared/ui/table";
import { Download, Eye, Edit, Trash2, FileText } from "lucide-react";
import { formatDate } from "../../ess/utils/essHelpers";

const PolicyTable = ({
  data = [],
  loading,
  onEdit,
  onDelete,
  onView,
  onDownload,
}) => {
  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-gray-500">
          Loading policies...
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-10 text-center text-gray-500">
          No policies found.
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (isActive) => {
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium border ${
          isActive
            ? "text-green-600 bg-green-50 border-green-200"
            : "text-red-600 bg-red-50 border-red-200"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle>Company Policies</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((policy) => (
                <TableRow key={policy._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    {policy.title}
                  </TableCell>

                  <TableCell>{policy.category || "-"}</TableCell>

                  <TableCell>{formatDate(policy.effectiveDate)}</TableCell>

                  <TableCell className="max-w-[180px] truncate">
                    {policy.fileName || "No file"}
                  </TableCell>

                  <TableCell>{getStatusBadge(policy.isActive)}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(policy)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload(policy)}
                        disabled={!policy.file}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(policy)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => onDelete(policy)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default PolicyTable;
