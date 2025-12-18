import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  DollarSign, 
  Activity,
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import ActivityForm from './ActivityForm';
import NoteForm from './NoteForm';

const LeadDetails = ({ leadId, onClose }) => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLead(data.data);
      } else {
        toast.error('Failed to fetch lead details');
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
      toast.error('Failed to fetch lead details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      contacted: { color: 'bg-yellow-100 text-yellow-800', icon: Phone },
      qualified: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      proposal: { color: 'bg-orange-100 text-orange-800', icon: DollarSign },
      negotiation: { color: 'bg-indigo-100 text-indigo-800', icon: DollarSign },
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

  const getActivityIcon = (type) => {
    const icons = {
      call: Phone,
      email: Mail,
      meeting: Calendar,
      task: CheckCircle,
      note: MessageSquare,
      status_change: Activity,
      assignment_change: User
    };
    return icons[type] || Activity;
  };

  const getActivityStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
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
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'MMM dd, yyyy');
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!lead) {
    return <div className="text-center py-8">Lead not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Lead Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">
            {lead.firstName} {lead.lastName}
          </h2>
          <p className="text-gray-600">{lead.leadId}</p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(lead.status)}
          {getPriorityBadge(lead.priority)}
        </div>
      </div>

      {/* Lead Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{lead.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {lead.phone && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {lead.company && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{lead.company}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Est. Value</p>
                <p className="font-medium">{formatCurrency(lead.estimatedValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Source</p>
              <p className="font-medium capitalize">{lead.source.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-medium">{lead.position || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected Close Date</p>
              <p className="font-medium">{formatDateOnly(lead.expectedCloseDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned To</p>
              <p className="font-medium">
                {lead.assignedEmployee 
                  ? `${lead.assignedEmployee.firstName} ${lead.assignedEmployee.lastName}`
                  : 'Unassigned'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Contact</p>
              <p className="font-medium">{formatDate(lead.lastContactDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium">{formatDate(lead.createdAt)}</p>
            </div>
          </div>
          {lead.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium mt-1">{lead.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities and Notes */}
      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Activities</CardTitle>
                <Button onClick={() => setShowActivityForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lead.activities && lead.activities.length > 0 ? (
                <div className="space-y-4">
                  {lead.activities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 text-gray-400 mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{activity.subject}</h4>
                                {getActivityStatusBadge(activity.status)}
                              </div>
                              {activity.description && (
                                <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                              )}
                              <div className="text-xs text-gray-500">
                                {activity.scheduledDate && (
                                  <span>Scheduled: {formatDate(activity.scheduledDate)} • </span>
                                )}
                                Created by {activity.creator?.firstName} {activity.creator?.lastName} on {formatDate(activity.createdAt)}
                              </div>
                              {activity.outcome && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                  <strong>Outcome:</strong> {activity.outcome}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No activities found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Notes</CardTitle>
                <Button onClick={() => setShowNoteForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lead.notes && lead.notes.length > 0 ? (
                <div className="space-y-4">
                  {lead.notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <Badge variant="outline" className="capitalize">
                            {note.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {note.creator?.firstName} {note.creator?.lastName} • {formatDate(note.createdAt)}
                        </div>
                      </div>
                      <p className="text-gray-700">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No notes found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activity Form Modal */}
      {showActivityForm && (
        <ActivityForm
          leadId={leadId}
          activity={selectedActivity}
          onSuccess={() => {
            setShowActivityForm(false);
            setSelectedActivity(null);
            fetchLeadDetails();
          }}
          onCancel={() => {
            setShowActivityForm(false);
            setSelectedActivity(null);
          }}
        />
      )}

      {/* Note Form Modal */}
      {showNoteForm && (
        <NoteForm
          leadId={leadId}
          onSuccess={() => {
            setShowNoteForm(false);
            fetchLeadDetails();
          }}
          onCancel={() => setShowNoteForm(false)}
        />
      )}
    </div>
  );
};

export default LeadDetails;