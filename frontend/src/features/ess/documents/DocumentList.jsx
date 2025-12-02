import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { FileText, Download, Eye, Trash2 } from 'lucide-react';
import { formatDate } from '../../../utils/essHelpers';
import ApprovalStatusBadge from '../../../components/employee-self-service/profile/ApprovalStatusBadge';

const DocumentList = ({ documents, onView, onDownload, onDelete }) => {
  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No documents uploaded yet.
        </CardContent>
      </Card>
    );
  }

  const getDocTypeName = (type) => {
    const types = {
      id_proof: 'ID Proof',
      address_proof: 'Address Proof',
      education: 'Education Certificate',
      other: 'Other'
    };
    return types[type] || type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
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
                <TableRow key={doc.id || doc._id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    {getDocTypeName(doc.type)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={doc.originalName}>
                    {doc.originalName}
                  </TableCell>
                  <TableCell>{formatDate(doc.createdAt)}</TableCell>
                  <TableCell>
                    <ApprovalStatusBadge status={doc.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onView(doc)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {/* Only show delete if pending or rejected */}
                      {['pending', 'rejected'].includes(doc.status?.toLowerCase()) && (
                        <Button variant="ghost" size="icon" onClick={() => onDelete(doc)} className="text-red-500 hover:text-red-700">
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
