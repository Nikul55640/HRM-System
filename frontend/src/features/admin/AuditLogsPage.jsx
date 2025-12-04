import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Search, Filter, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/essHelpers';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    console.log('🔄 [AUDIT LOGS] Fetching audit logs...');
    try {
      setLoading(true);
      console.warn('⚠️ [AUDIT LOGS] Using mock data - API endpoint not implemented yet');
      // Mock data
      setLogs([
        {
          _id: '1',
          user: 'admin@hrm.com',
          action: 'LOGIN',
          resource: 'Authentication',
          details: 'User logged in successfully',
          ipAddress: '192.168.1.1',
          timestamp: new Date(),
        },
        {
          _id: '2',
          user: 'hr@hrm.com',
          action: 'CREATE',
          resource: 'Employee',
          details: 'Created new employee record',
          ipAddress: '192.168.1.2',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          _id: '3',
          user: 'manager@hrm.com',
          action: 'UPDATE',
          resource: 'Leave Request',
          details: 'Approved leave request',
          ipAddress: '192.168.1.3',
          timestamp: new Date(Date.now() - 7200000),
        },
      ]);
      console.log('✅ [AUDIT LOGS] Mock data loaded:', logs.length, 'logs');
    } catch (error) {
      console.error('❌ [AUDIT LOGS] Failed to fetch logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesFilter;
  });

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'UPDATE':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DELETE':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'LOGIN':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Track system activities and user actions</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(log.timestamp)}
                        <div className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{log.user}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{log.resource}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.details}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.ipAddress}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
