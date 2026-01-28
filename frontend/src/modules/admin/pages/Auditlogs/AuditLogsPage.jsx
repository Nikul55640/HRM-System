import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Search, Filter, Download, RefreshCw, Eye, ChevronDown, ChevronUp , NotepadText, X}  from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogDetails, setShowLogDetails] = useState(false);
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
      log.user?.firstName?.toLowerCase().includes(searchLower) ||
      log.user?.lastName?.toLowerCase().includes(searchLower) ||
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
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 text-sm">Loading audit logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header Section - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">Track system activities and user actions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchLogs(pagination.currentPage)}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportLogs}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards - Responsive Grid */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{summary.totalLogs}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total Logs</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                  {summary.actionBreakdown?.find(item => item.action === 'CREATE')?.count || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Created</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                  {summary.actionBreakdown?.find(item => item.action === 'UPDATE')?.count || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Updated</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
                  {summary.actionBreakdown?.find(item => item.action === 'DELETE')?.count || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Deleted</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter Toggle - Mobile First */}
      <Card className="border-gray-200">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Toggle Button - Mobile */}
            <div className="flex items-center justify-between sm:hidden">
              <span className="text-sm font-medium text-gray-700">Filters</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {/* Filters - Responsive */}
            <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severity</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>

                <select
                  value={filterEntityType}
                  onChange={(e) => setFilterEntityType(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>
        </CardContent>
      </Card>

      {/* Logs Display - Mobile Cards / Desktop Table */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="flex justify-center mb-4">
                  <NotepadText size={32} />
                </div>
                <p className="text-sm">No logs found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50">
                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                              {log.severity}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.user?.firstName && log.user?.lastName 
                              ? `${log.user.firstName} ${log.user.lastName}`
                              : log.user?.email || 'Unknown'
                            }
                          </div>
                          <div className="text-xs text-gray-500">{log.user?.role}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setShowLogDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Details */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Entity:</span>
                          <span className="text-gray-900 font-medium">{log.targetType}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Time:</span>
                          <span className="text-gray-900">
                            {formatDate(log.createdAt)} {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">IP:</span>
                          <span className="text-gray-900">
                            {log.ipAddress === 'encrypted' ? '***.***.***' : log.ipAddress}
                          </span>
                        </div>
                        {log.description && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {log.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                      <div className="flex justify-center mb-4">
                        <NotepadText size={32} />
                      </div> 
                      <p>No logs found</p>
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
                        <div className="text-gray-800">
                          {log.user?.firstName && log.user?.lastName 
                            ? `${log.user.firstName} ${log.user.lastName}`
                            : log.user?.email || 'Unknown'
                          }
                        </div>
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
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setShowLogDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination - Mobile Optimized */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="text-xs sm:text-sm"
            >
              Previous
            </Button>
            
            {/* Page numbers - Responsive */}
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                if (pageNum > pagination.totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="text-xs sm:text-sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            {/* Mobile page indicator */}
            <div className="sm:hidden px-3 py-1 text-xs bg-gray-100 rounded">
              {pagination.currentPage} / {pagination.totalPages}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="text-xs sm:text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Log Details Modal - Mobile Optimized */}
      {showLogDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Log Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLogDetails(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">User</label>
                    <p className="text-sm text-gray-900">
                      {selectedLog.user?.firstName && selectedLog.user?.lastName 
                        ? `${selectedLog.user.firstName} ${selectedLog.user.lastName}`
                        : selectedLog.user?.email || 'Unknown'
                      }
                    </p>
                    <p className="text-xs text-gray-500">{selectedLog.user?.role}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Timestamp</label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedLog.createdAt)} {new Date(selectedLog.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Action</label>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getActionColor(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Severity</label>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(selectedLog.severity)}`}>
                      {selectedLog.severity}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Entity Type</label>
                    <p className="text-sm text-gray-900">{selectedLog.targetType}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">IP Address</label>
                    <p className="text-sm text-gray-900">
                      {selectedLog.ipAddress === 'encrypted' ? '***.***.***' : selectedLog.ipAddress}
                    </p>
                  </div>
                </div>
                
                {selectedLog.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1">
                      {selectedLog.description}
                    </p>
                  </div>
                )}
                
                {selectedLog.metadata && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Metadata</label>
                    <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;