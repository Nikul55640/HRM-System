import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { FileText, Plus, Edit, Trash2, Download, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

const PolicyPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      // Mock data
      setPolicies([
        { _id: '1', title: 'Leave Policy', description: 'Company leave and vacation policy', category: 'HR', updatedAt: new Date() },
        { _id: '2', title: 'Code of Conduct', description: 'Employee code of conduct and ethics', category: 'General', updatedAt: new Date() },
        { _id: '3', title: 'Remote Work Policy', description: 'Guidelines for remote work', category: 'Operations', updatedAt: new Date() },
      ]);
    } catch (error) {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'HR': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'General': return 'text-green-600 bg-green-50 border-green-200';
      case 'Operations': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return <div className="p-6"><p className="text-gray-500">Loading policies...</p></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Company Policies</h1>
          <p className="text-gray-500 text-sm mt-1">Manage company policies and documents</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map((policy) => (
          <Card key={policy._id} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`text-xs px-2 py-1 rounded border font-medium ${getCategoryColor(policy.category)}`}>
                  {policy.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{policy.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{policy.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PolicyPage;
