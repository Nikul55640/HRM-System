import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import { Button } from "../../../shared/ui/button";
import { FileText, Download, Eye, Trash2 } from "lucide-react";
import { formatDate } from "../../../core/utils/essHelpers";
import { ApprovalStatusBadge } from "../../../shared/components";

const DocumentList = ({ documents = [], onView, onDownload, onDelete }) => {
  const getDocTypeName = (type) => {
    const map = {
      id_proof: "ID Proof",
      address_proof: "Address Proof",
      education: "Education Certificate",
      experience: "Experience Certificate",
      resume: "Resume",
      other: "Other",
    };
    return map[type] || type || "Document";
  };

  if (!documents.length) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-8 text-center text-muted-foreground">
          No documents uploaded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">My Documents</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Uploaded On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc._id || doc.id}>
                  {/* TYPE COLUMN */}
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    {getDocTypeName(doc.type)}
                  </TableCell>

                  {/* FILE NAME */}
                  <TableCell
                    className="max-w-[220px] truncate"
                    title={doc.originalName}
                  >
                    {doc.originalName || "Untitled"}
                  </TableCell>

                  {/* DATE */}
                  <TableCell>
                    {doc.createdAt ? formatDate(doc.createdAt) : "—"}
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <ApprovalStatusBadge status={doc.status || "pending"} />
                  </TableCell>

                  {/* ACTION BUTTONS */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* VIEW */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView?.(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* DOWNLOAD */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload?.(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      {/* DELETE (only if pending or rejected) */}
                      {["pending", "rejected"].includes(
                        (doc.status || "").toLowerCase()
                      ) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => onDelete?.(doc)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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

export default DocumentList;
