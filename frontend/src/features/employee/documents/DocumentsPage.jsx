import { useEffect, useState } from "react";
import { useDocuments } from "../../admin/employees/useEmployeeSelfService";
import { Upload, Download, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { formatDate, downloadBlob } from "../../../utils/essHelpers";

const DocumentsPage = () => {
  const { documents, loading, getDocuments, uploadDocument, downloadDocument } =
    useDocuments();
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("");

  useEffect(() => {
    getDocuments();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast.error("Please select a file and document type");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", documentType);

    try {
      await uploadDocument(formData);
      toast.success("Document uploaded successfully");
      setSelectedFile(null);
      setDocumentType("");
      const fileInput = document.getElementById("file");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast.error("Failed to upload document");
    }
  };

  const handleDownload = async (doc) => {
    try {
      toast.info("Downloading document...");
      const result = await downloadDocument(doc._id);

      if (result.meta.requestStatus === "fulfilled") {
        const blob = result.payload;
        downloadBlob(blob, doc.fileName || `Document_${doc.type}.pdf`);
        toast.success("Document downloaded successfully");
      } else {
        throw new Error(result.payload || "Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Documents</h1>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option value="id_proof">ID Proof</option>
              <option value="address_proof">Address Proof</option>
              <option value="education">Education Certificate</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose File
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Documents</h2>
        <div className="space-y-3">
          {documents?.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No documents uploaded yet.
            </div>
          ) : (
            documents?.map((doc) => (
              <div
                key={doc._id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doc.fileName}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {doc.type?.replace("_", " ")} •{" "}
                      {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
