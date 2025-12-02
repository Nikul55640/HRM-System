import { useEffect, useState } from 'react';
import { useDocuments } from '../../../features/employees/useEmployeeSelfService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Upload, Download, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate, downloadBlob } from '../../../utils/essHelpers';
const DocumentsPage = () => {
  const { documents, loading, getDocuments, uploadDocument, downloadDocument } = useDocuments();
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');

  useEffect(() => {
    getDocuments();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast.error('Please select a file and document type');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', documentType);

    try {
      await uploadDocument(formData);
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      setDocumentType('');
      // Reset file input
      const fileInput = document.getElementById('file');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  const handleDownload = async (doc) => {
    try {
      toast.info('Downloading document...');
      const result = await downloadDocument(doc._id);
      
      if (result.meta.requestStatus === 'fulfilled') {
        const blob = result.payload;
        downloadBlob(blob, doc.fileName || `Document_${doc.type}.pdf`);
        toast.success('Document downloaded successfully');
      } else {
        throw new Error(result.payload || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Documents</h1>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id_proof">ID Proof</SelectItem>
                  <SelectItem value="address_proof">Address Proof</SelectItem>
                  <SelectItem value="education">Education Certificate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="file">Choose File</Label>
              <Input id="file" type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
            </div>
            <Button onClick={handleUpload} disabled={loading}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>My Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documents?.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No documents uploaded yet.</div>
            ) : (
              documents?.map((doc) => (
                <div key={doc._id} className="flex justify-between items-center p-3 border rounded hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.fileName}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {doc.type?.replace('_', ' ')} • {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;
