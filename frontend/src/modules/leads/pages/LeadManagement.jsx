import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Badge } from '../../../shared/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Building,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import LeadForm from '../components/LeadForm';
import LeadDetails from '../components/LeadDetails';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignedTo: '',
    source: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

   const fetchLeads = useCallback(async () => {
     setLoading(true);
     try {
       const queryParams = new URLSearchParams();
       queryParams.append("page", pagination.page);
       queryParams.append("limit", pagination.limit);

       Object.entries(filters).forEach(([key, value]) => {
         if (value) queryParams.append(key, value);
       });

       const response = await api.get(`/admin/leads`);
       setLeads(response.data.data);
       setPagination((prev) => ({
         ...prev,
         total: response.data.pagination.total,
         totalPages: response.data.pagination.totalPages,
       }));
     } catch (error) {
       toast.error("Failed to fetch leads");
     } finally {
       setLoading(false);
     }
   }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [fetchLeads]);

 
  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/leads/stats');
      setStats(response.data.data);
    } catch (error) {
      // Stats are optional, don't show error toast
    }
  };

  const handleCreateLead = () => {
    setSelectedLead(null);
    setShowForm(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setShowForm(true);
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowDetails(true);
  };

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await api.delete(`/admin/leads/${leadId}`);
      toast.success('Lead deleted successfully');
      fetchLeads();
      fetchStats();
    } catch (error) {
      toast.error(error.message || 'Failed to delete lead');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      contacted: { color: 'bg-yellow-100 text-yellow-800', icon: Phone },
      qualified: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      proposal: { color: 'bg-orange-100 text-orange-800', icon: TrendingUp },
      negotiation: { color: 'bg-indigo-100 text-indigo-800', icon: TrendingUp },
      closed_won: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      closed_lost: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={priorityConfig[priority] || 'bg-gray-100 text-gray-800'}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <Button onClick={handleCreateLead}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{stats.totalLeads || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Leads</p>
                <p className="text-2xl font-bold">{stats.statusStats?.new || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualified</p>
                <p className="text-2xl font-bold">{stats.statusStats?.qualified || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed Won</p>
                <p className="text-2xl font-bold">{stats.statusStats?.closed_won || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Select 
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closed_won">Closed Won</SelectItem>
                <SelectItem value="closed_lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.priority}
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.source}
              onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="email_campaign">Email Campaign</SelectItem>
                <SelectItem value="cold_call">Cold Call</SelectItem>
                <SelectItem value="trade_show">Trade Show</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leads found
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">
                          {lead.firstName} {lead.lastName}
                        </span>
                        <span className="text-gray-500">({lead.leadId})</span>
                        {getStatusBadge(lead.status)}
                        {getPriorityBadge(lead.priority)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {lead.company && (
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span>{lead.company}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Source:</span>
                          <div className="capitalize">{lead.source.replace('_', ' ')}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Estimated Value:</span>
                          <div>{formatCurrency(lead.estimatedValue)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Expected Close:</span>
                          <div>{formatDate(lead.expectedCloseDate)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Assigned To:</span>
                          <div>
                            {lead.assignedEmployee 
                              ? `${lead.assignedEmployee.personalInfo?.firstName || ''} ${lead.assignedEmployee.personalInfo?.lastName || ''}`.trim() || lead.assignedEmployee.employeeId
                              : 'Unassigned'
                            }
                          </div>
                        </div>
                      </div>

                      {lead.description && (
                        <div className="text-sm">
                          <span className="text-gray-500">Description:</span>
                          <div className="text-gray-700 mt-1">{lead.description}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewLead(lead)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditLead(lead)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLead ? 'Edit Lead' : 'Create New Lead'}
            </DialogTitle>
          </DialogHeader>
          <LeadForm
            lead={selectedLead}
            onSuccess={() => {
              setShowForm(false);
              fetchLeads();
              fetchStats();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Lead Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <LeadDetails
              leadId={selectedLead.id}
              onClose={() => setShowDetails(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadManagement;