import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import { useToast } from '../../../../core/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../shared/ui/alert-dialog';
import EmergencyContactForm from '../components/EmergencyContactForm';
import employeeSettingsService from '../services/employeeSettingsService';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true);
      const response = await employeeSettingsService.getEmergencyContacts();
      
      if (response.success) {
        setContacts(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load emergency contacts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async (contactData) => {
    try {
      setSaving(true);
      const response = await employeeSettingsService.createEmergencyContact(contactData);

      if (response.success) {
        setContacts(prev => [...prev, response.data]);
        setShowForm(false);
        
        toast({
          title: 'Success',
          description: 'Emergency contact added successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add emergency contact.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateContact = async (contactData) => {
    try {
      setSaving(true);
      const response = await employeeSettingsService.updateEmergencyContact(
        editingContact.id,
        contactData
      );

      if (response.success) {
        setContacts(prev =>
          prev.map(contact =>
            contact.id === editingContact.id ? response.data : contact
          )
        );
        setEditingContact(null);
        
        toast({
          title: 'Success',
          description: 'Emergency contact updated successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update emergency contact.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async () => {
    try {
      const response = await employeeSettingsService.deleteEmergencyContact(deletingContact.id);

      if (response.success) {
        setContacts(prev => prev.filter(contact => contact.id !== deletingContact.id));
        setDeletingContact(null);
        
        toast({
          title: 'Success',
          description: 'Emergency contact deleted successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete emergency contact.',
        variant: 'destructive',
      });
    }
  };

  const handleSetPrimary = async (contactId) => {
    try {
      const response = await employeeSettingsService.setPrimaryEmergencyContact(contactId);

      if (response.success) {
        setContacts(prev =>
          prev.map(contact => ({
            ...contact,
            isPrimary: contact.id === contactId
          }))
        );
        
        toast({
          title: 'Success',
          description: 'Primary emergency contact updated successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to set primary contact.',
        variant: 'destructive',
      });
    }
  };

  const getRelationshipLabel = (relationship) => {
    const labels = {
      spouse: 'Spouse',
      parent: 'Parent',
      child: 'Child',
      sibling: 'Sibling',
      friend: 'Friend',
      colleague: 'Colleague',
      other: 'Other',
    };
    return labels[relationship] || relationship;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Emergency Contacts</CardTitle>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Emergency Contact</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Phone className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Emergency Contacts</h3>
              <p className="text-gray-500 mb-4">
                Add emergency contacts so we can reach someone in case of an emergency.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Contact</span>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {contacts.map((contact) => (
                <Card key={contact.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {contact.name}
                          </h3>
                          {contact.isPrimary && (
                            <Badge variant="default" className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>Primary</span>
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {getRelationshipLabel(contact.relationship)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{contact.phone}</span>
                          </div>
                          
                          {contact.alternatePhone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>{contact.alternatePhone} (Alternate)</span>
                            </div>
                          )}
                          
                          {contact.address && (
                            <div className="flex items-start space-x-2">
                              <MapPin className="w-4 h-4 mt-0.5" />
                              <span>{contact.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!contact.isPrimary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetPrimary(contact.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingContact(contact)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingContact(contact)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Contact Form */}
      <EmergencyContactForm
        isOpen={showForm || !!editingContact}
        onClose={() => {
          setShowForm(false);
          setEditingContact(null);
        }}
        onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
        loading={saving}
        initialData={editingContact}
        mode={editingContact ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingContact} onOpenChange={() => setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Emergency Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingContact?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContact}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmergencyContacts;