import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { Textarea } from "../../../shared/ui/textarea";
import { Icon, LoadingSpinner } from "../../../shared/components";
import { useToast } from "../../../core/hooks/use-toast";
import { usePermissions } from "../../../core/hooks";
import { MODULES } from "../../../core/utils/rolePermissions";
import useAuth from "../../../core/hooks/useAuth";

import { formatIndianCurrency } from '../../../utils/indianFormatters';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const { toast } = useToast();
  const { can } = usePermissions();
  const { user } = useAuth();

  // Check if user has permission to view leads
  const canViewLeads = can.do(MODULES.LEAD.VIEW_OWN);
  const canUpdateLeads = can.do(MODULES.LEAD.UPDATE_OWN);

  const fetchMyLeads = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get('/admin/leads?assignedTo=me');
      
      // Mock data for now
      const mockLeads = [
        {
          id: 1,
          leadId: "LEAD-000001",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1234567890",
          company: "Tech Corp",
          position: "CTO",
          status: "new",
          priority: "high",
          estimatedValue: 50000,
          expectedCloseDate: "2024-12-30",
          source: "website",
          description: "Interested in our enterprise solution",
          followUpNotes: [
            {
              id: 1,
              note: "Initial contact made, very interested",
              createdAt: "2024-12-20",
              createdBy: "Current User"
            }
          ],
          lastContactDate: "2024-12-20",
          nextFollowUpDate: "2024-12-27"
        },
        {
          id: 2,
          leadId: "LEAD-000002",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phone: "+1234567891",
          company: "Business Inc",
          position: "Manager",
          status: "contacted",
          priority: "medium",
          estimatedValue: 25000,
          expectedCloseDate: "2025-01-15",
          source: "referral",
          description: "Looking for HR management solution",
          followUpNotes: [],
          lastContactDate: "2024-12-22",
          nextFollowUpDate: "2024-12-28"
        }
      ];
      
      setLeads(mockLeads);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (canViewLeads) {
      fetchMyLeads();
    }
  }, [canViewLeads, fetchMyLeads]);

  // If user doesn't have permission, show access denied
  if (!canViewLeads) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Lock" className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
            <p className="text-red-700 mb-4">
              You don&apos;t have permission to view leads. This feature is available for HR and management roles only.
            </p>
            <p className="text-sm text-gray-600">
              Current role: <span className="font-medium">{user?.role || 'Employee'}</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Contact your HR administrator if you need access to lead management features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "qualified":
        return "bg-green-100 text-green-800";
      case "proposal":
        return "bg-purple-100 text-purple-800";
      case "negotiation":
        return "bg-orange-100 text-orange-800";
      case "closed_won":
        return "bg-green-100 text-green-800";
      case "closed_lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      // TODO: Replace with actual API call
      // await api.put(`/admin/leads/${leadId}`, { status: newStatus });
      
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      
      toast({
        title: "Success",
        description: "Lead status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const addFollowUpNote = async (leadId) => {
    if (!newNote.trim()) return;

    try {
      // TODO: Replace with actual API call
      // await api.post(`/admin/leads/${leadId}/notes`, { note: newNote });
      
      const updatedLeads = leads.map(lead => {
        if (lead.id === leadId) {
          return {
            ...lead,
            followUpNotes: [
              ...lead.followUpNotes,
              {
                id: Date.now(),
                note: newNote,
                createdAt: new Date().toISOString().split('T')[0],
                createdBy: "Current User"
              }
            ]
          };
        }
        return lead;
      });
      
      setLeads(updatedLeads);
      setNewNote("");
      setShowAddNote(false);
      
      toast({
        title: "Success",
        description: "Follow-up note added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add follow-up note",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your leads..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your assigned leads and track progress</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Icon name="Filter" className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Icon name="Download" className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Icon name="Target" className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Leads</p>
                <p className="text-lg sm:text-2xl font-bold">{leads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                <Icon name="TrendingUp" className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Qualified</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {leads.filter(l => l.status === 'qualified').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
                <Icon name="Clock" className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">In Progress</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {leads.filter(l => ['contacted', 'proposal', 'negotiation'].includes(l.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                <Icon name="DollarSign" className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Est. Value</p>
                <p className="text-sm sm:text-2xl font-bold">
                  {formatIndianCurrency(leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length > 0 ? (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </h3>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(lead.priority)}>
                          {lead.priority}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Company:</span> {lead.company}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {lead.email}
                        </div>
                        <div>
                          <span className="font-medium">Est. Value:</span> {formatIndianCurrency(lead.estimatedValue)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2">{lead.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                        onClick={(e) => e.stopPropagation()}
                        disabled={!canUpdateLeads}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal">Proposal</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="closed_won">Closed Won</option>
                        <option value="closed_lost">Closed Lost</option>
                      </select>
                      
                      {canUpdateLeads && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                            setShowAddNote(true);
                          }}
                        >
                          <Icon name="Plus" className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedLead?.id === lead.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-2">Contact Information</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Phone:</span> {lead.phone}</p>
                            <p><span className="font-medium">Position:</span> {lead.position}</p>
                            <p><span className="font-medium">Source:</span> {lead.source}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Timeline</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Last Contact:</span> {lead.lastContactDate}</p>
                            <p><span className="font-medium">Next Follow-up:</span> {lead.nextFollowUpDate}</p>
                            <p><span className="font-medium">Expected Close:</span> {lead.expectedCloseDate}</p>
                          </div>
                        </div>
                      </div>

                      {/* Follow-up Notes */}
                      <div>
                        <h4 className="font-medium mb-2">Follow-up Notes</h4>
                        {lead.followUpNotes.length > 0 ? (
                          <div className="space-y-2 mb-3">
                            {lead.followUpNotes.map((note) => (
                              <div key={note.id} className="bg-gray-50 p-3 rounded text-sm">
                                <p>{note.note}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {note.createdAt} by {note.createdBy}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm mb-3">No follow-up notes yet</p>
                        )}

                        {showAddNote && selectedLead?.id === lead.id && canUpdateLeads && (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Add a follow-up note..."
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => addFollowUpNote(lead.id)}
                              >
                                Add Note
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowAddNote(false);
                                  setNewNote("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="Target" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leads assigned to you</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsPage;