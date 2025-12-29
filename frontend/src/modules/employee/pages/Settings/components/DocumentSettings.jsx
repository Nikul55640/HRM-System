import { useState, useEffect } from "react";
import { useDocuments } from "../../../../../services/useEmployeeSelfService";
import { LoadingSpinner } from "../../../../../shared/components";
import { Button } from "../../../../../shared/ui/button";
import { Input } from "../../../../../shared/ui/input";
import { Label } from "../../../../../shared/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../../shared/ui/card";
import { toast } from "react-toastify";
import { Upload, Download, Trash2, FileText, Eye } from "lucide-react";

const DocumentSettings = () => {
  const {
    documents,
    loading: documentsLoading,
    getDocuments,
    uploadDocument,
    downloadDocument,
  } = useDocuments();

  const [uploadingFile, setUploadingFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("");

  useEffect(() => {
    getDocuments();
  }, [getDocuments]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast.error("Please select a file and document type");
      return;
    }

    setUploadingFile(selectedFile.name);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", documentType);
      formData.append("category", "employee_document");

      await uploadDocument(formData);
      toast.success("Document uploaded successfully");
      setSelectedFile(null);
      setDocumentType("");
      // Reset file input
      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploadingFile(null);
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      await downloadDocument(documentId);
      toast.success("Document downloaded successfully");
    } catch (error) {
      toast.error("Failed to download document");
    }
  };

  const documentTypes = [
    { value: "id_proof", label: "ID Proof" },
    { value: "address_proof", label: "Address Proof" },
    { value: "bank_proof", label: "Bank Proof" },
    { value: "education_certificate", label: "Education Certificate" },
    { value: "experience_letter", label: "Experience Letter" },
    { value: "other", label: "Other" },
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (documentsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Document */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Document
          </CardTitle>
          <CardDescription>
            Upload your personal documents for HR records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Select File</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <p className="text-xs text-gray-500">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </p>
          </div>

          {selectedFile && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !documentType || uploadingFile}
            >
              {uploadingFile ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            My Documents
          </CardTitle>
          <CardDescription>
            View and manage your uploaded documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents && documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{document.originalName || document.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {document.documentType} • {formatFileSize(document.fileSize)} • 
                        Uploaded on {formatDate(document.uploadedAt || document.createdAt)}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        document.status === "approved" 
                          ? "bg-green-100 text-green-800"
                          : document.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {document.status || "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document.id, document.originalName)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Upload your first document using the form above
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Document Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• All documents should be clear and legible</li>
            <li>• Maximum file size: 10MB per document</li>
            <li>• Accepted formats: PDF, DOC, DOCX, JPG, PNG</li>
            <li>• Documents are reviewed by HR within 2-3 business days</li>
            <li>• Keep your documents up to date for compliance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentSettings;