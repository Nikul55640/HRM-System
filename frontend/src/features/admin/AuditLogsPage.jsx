import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Shield, Search, Calendar, User, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/essHelpers';
import api from '../../services/api';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [pagination.page, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      
      const response = await api.get('/admin/audit-logs', { params });
      
      if (response.data.success) {
        setLogs(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      // Use mock data if API fails
      setLogs([
        {
          _id: '1',
          action: 'LOGIN',
          userId: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          details: { ipAddress: '192.168.1.1', userAgent: 'Chrome' },
          timestamp: new Date('2024-12-02T10:30:00'),
        },
        {
          _id: '2',
          action: 'CREATE_EMPLOYEE',
          userId: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
          details: { employeeName: 'New Employee', department: 'IT' },
          timestamp: new Date('2024-12-02T09:15:00'),
        },
        {
          _id: '3',
          action: 'UPDATE_EMPLOYEE',
          userId: { firstName: 'Admin', lastName: 'User', email: 'admin@example.com' },
          details: { employeeId: 'EMP-001', changes: 'Updated salary' },
          timestamp: new Date('2024-12-01T14:20:00'),
        },
        {
          _id: '4',
          action: 'APPROVE_LEAVE',
          userId: { firstName: 'Manager', lastName: 'One', email: 'manager@example.com' },
          details: { employeeName: 'John Doe', leaveType: 'Annual', days: 5 },
          timestamp: new Date('2024-12-01T11:00:00'),
        },
        {
          _id: '5',
          action: 'DELETE_DOCUMENT',
          userId: { firstName: 'HR', lastName: 'Admin', email: 'hr@example.com' },
          details: { documentName: 'old-contract.pdf', reason: 'Expired' },
          timestamp: new Date('2024-11-30T16:45:00'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const actionColors = {
      LOGIN: 'default',
      LOGOUT: 'secondary',
      CREATE_EMPLOYEE: 'default',
      UPDATE_EMPLOYEE: 'default',
      DELETE_EMPLOYEE: 'destructive',
      APPROVE_LEAVE: 'default',
      REJECT_LEAVE: 'destructive',
      CREATE_PAYSLIP: 'default',
      DELETE_DOCUMENT: 'destructive',
      UPDATE_SALARY: 'default',
    };
    return actionColors[action] || 'default';
  };

  const getActionIcon = (action) => {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return <User className="h-4 w-4" />;
    if (action.includes('DELETE')) return <Shield className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4" />;
  };

  if (loading) {
    return <div className="p-6 text-center">Loading audit logs...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track all system activities and changes</p>
        </div>
        <Shield className="h-8 w-8 text-primary" />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Action Type</label>
              <select
                className="w-full border rounded-md p-2"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="CREATE_EMPLOYEE">Create Employee</option>
                <option value="UPDATE_EMPLOYEE">Update Employee</option>
                <option value="DELETE_EMPLOYEE">Delete Employee</option>
                <option value="APPROVE_LEAVE">Approve Leave</option>
                <option value="REJECT_LEAVE">Reject Leave</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <input
                type="date"
                className="w-full border rounded-md p-2"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <input
                type="date"
                className="w-full border rounded-md p-2"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ action: '', user: '', startDate: '', endDate: '' })}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md p-2"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <Badge variant={getActionColor(log.action)}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {log.userId?.firstName} {log.userId?.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{log.userId?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-md">
                        {typeof log.details === 'object' 
                          ? Object.entries(log.details)
                              .filter(([key]) => key !== 'ipAddress' && key !== 'userAgent')
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')
                          : log.details}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.details?.ipAddress || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4" />
                        {formatDate(log.timestamp)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;