import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../../ess/utils/essHelpers';
import auditLogService from '../../../../services/auditLogService';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterEntityType, setFilterEntityType] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });
  const [summary, setSummary] = useState(null);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      // Apply filters
      if (filterAction !== 'all') params.action = filterAction;
      if (filterSeverity !== 'all') params.severity = filterSeverity;
      if (filterEntityType !== 'all') params.targetType = filterEntityType;

      const response = await auditLogService.getLogs(params);
      
      if (response.success) {
        setLogs(response.data.logs || []);
        setSummary(response.data.summary || null);
        setPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 50
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterSeverity, filterEntityType]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      log.user?.email?.toLowerCase().includes(searchLower) ||
      log.user?.name?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.targetType?.toLowerCase().includes(searchLower) ||
      log.description?.toLowerCase().includes(searchLower)
    );
  });

  const handleExportLogs = async () => {
    try {
      const params = {
        action: filterAction !== 'all' ? filterAction : undefined,
        severity: filterSeverity !== 'all' ? filterSeverity : undefined,
        targetType: filterEntityType !== 'all' ? filterEntityType : undefined,
      };
      
      await auditLogService.exportLogs(params);
    } catch (error) {
      toast.error('Failed to export audit logs');
    }
  };

  const handlePageChange = (newPage) => {
    fetchLogs(newPage);
  };

  const getActionColor = (action) => {
    switch (action?.toUpperCase()) {
      case 'CREATE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'UPDATE':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DELETE':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'VIEW':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'LOGIN':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'warning':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'info':
        return 'text-blue-700 bg-blue-100 border-blue-300';
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
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => fetchLogs(pagination.currentPage)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{summary.totalLogs}</div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </CardContent>
          </Card>
          
          {summary.actionBreakdown?.map((item) => (
            <Card key={item.action}>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                <div className="text-sm text-gray-600">{item.action} Actions</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="VIEW">View</option>
                <option value="LOGIN">Login</option>
              </select>
              
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severity</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>

              <select
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Employee">Employee</option>
                <option value="Department">Department</option>
                <option value="LeaveRequest">Leave Request</option>
                <option value="AttendanceRecord">Attendance</option>
                <option value="User">User</option>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(log.createdAt)}
                        <div className="text-xs text-gray-400">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="text-gray-800">{log.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{log.user?.email}</div>
                        <div className="text-xs text-gray-400">{log.user?.role}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{log.targetType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {log.description || log.targetId}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.ipAddress === 'encrypted' ? '***.***.***' : log.ipAddress}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, pagination.currentPage - 2) + i;
              if (pageNum > pagination.totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;