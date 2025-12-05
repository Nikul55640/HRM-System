import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { FileText, Download, Eye, Upload, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { documentService } from '../../../services';
import { formatDate } from '../../../utils/essHelpers';

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.getMyDocuments();
      
      if (response.success) {
        setDocuments(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await documentService.uploadDocument(formData);
      
      if (response.success) {
        toast.success('Document uploaded successfully');
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const blob = await documentService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Document downloaded');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await documentService.deleteDocument(documentId);
      if (response.success) {
        toast.success('Document deleted');
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getFileIcon = (type) => {
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">My Documents</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your personal documents</p>
        </div>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button asChild disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </label>
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.length === 0 ? (
          <Card className="col-span-full border-gray-200">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">No documents uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc._id} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 truncate">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {doc.size ? `${(doc.size / 1024).toFixed(2)} KB` : 'Unknown size'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(doc.uploadedAt || doc.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(doc._id, doc.name)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc._id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyDocuments;
