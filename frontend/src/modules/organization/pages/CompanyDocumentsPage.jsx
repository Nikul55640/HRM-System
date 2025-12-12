import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { FileText, Download, Eye, Upload, Trash2 } from 'lucide-react';
import { documentService } from '../../../services';
import { toast } from 'react-toastify';

const CompanyDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Mock data
      setDocuments([
        { _id: '1', name: 'Employee Handbook.pdf', type: 'PDF', size: 2048000, uploadedAt: new Date() },
        { _id: '2', name: 'Company Policies.docx', type: 'DOCX', size: 1024000, uploadedAt: new Date() },
      ]);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6"><p className="text-gray-500">Loading documents...</p></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Company Documents</h1>
          <p className="text-gray-500 text-sm mt-1">Manage company-wide documents</p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card key={doc._id} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-800 truncate">{doc.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{(doc.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyDocumentsPage;
