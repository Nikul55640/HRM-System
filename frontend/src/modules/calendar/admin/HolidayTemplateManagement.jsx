/**
 * Holiday Template Management Component
 * Manages holiday selection templates for reusable holiday configurations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Badge } from '../../../shared/ui/badge';
import { Alert, AlertDescription } from '../../../shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Star,
  Settings,
  Eye,
  Play,
  RefreshCw
} from 'lucide-react';

// Import services
import holidayTemplateService from '../../../services/holidayTemplateService';
import calendarificService from '../../../services/calendarificService';

const HolidayTemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: 'IN',
    holidayTypes: ['national'],
    selectedHolidays: [],
    maxHolidays: 10,
    isDefault: false
  });

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const result = await holidayTemplateService.getTemplates();
      if (result.success) {
        setTemplates(result.data.templates);
      } else {
        toast.error('Failed to load templates');
      }
    } catch (error) {
      toast.error('Error loading templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const result = await holidayTemplateService.createTemplate(formData);
      if (result.success) {
        toast.success('Template created successfully');
        setShowCreateForm(false);
        resetForm();
        loadTemplates();
      } else {
        toast.error(result.message || 'Failed to create template');
      }
    } catch (error) {
      toast.error('Error creating template');
    }
  };

  const handleUpdateTemplate = async (id, updateData) => {
    try {
      const result = await holidayTemplateService.updateTemplate(id, updateData);
      if (result.success) {
        toast.success('Template updated successfully');
        loadTemplates();
      } else {
        toast.error(result.message || 'Failed to update template');
      }
    } catch (error) {
      toast.error('Error updating template');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const result = await holidayTemplateService.deleteTemplate(id);
      if (result.success) {
        toast.success('Template deleted successfully');
        loadTemplates();
      } else {
        toast.error(result.message || 'Failed to delete template');
      }
    } catch (error) {
      toast.error('Error deleting template');
    }
  };

  const handleCloneTemplate = async (template) => {
    const cloneName = prompt('Enter name for cloned template:', `${template.name} (Copy)`);
    if (!cloneName) return;

    try {
      const result = await holidayTemplateService.cloneTemplate(template.id, {
        name: cloneName,
        country: template.country,
        description: `Cloned from ${template.name}`
      });
      
      if (result.success) {
        toast.success('Template cloned successfully');
        loadTemplates();
      } else {
        toast.error(result.message || 'Failed to clone template');
      }
    } catch (error) {
      toast.error('Error cloning template');
    }
  };

  const handlePreviewTemplate = async (template) => {
    setPreviewLoading(true);
    setSelectedTemplate(template);
    
    try {
      // Get current year holidays using template configuration
      const result = await calendarificService.batchPreviewHolidays({
        country: template.country,
        year: new Date().getFullYear(),
        types: template.holidayTypes
      });

      if (result.success) {
        // Filter holidays based on template selection
        const filteredHolidays = result.data.holidays.filter(holiday => 
          template.selectedHolidays.includes(holiday.name)
        );

        setPreviewData({
          template: template,
          holidays: filteredHolidays,
          originalCount: result.data.count,
          selectedCount: filteredHolidays.length,
          year: new Date().getFullYear()
        });
      } else {
        toast.error('Failed to preview template');
      }
    } catch (error) {
      toast.error('Error previewing template');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSyncWithTemplate = async (template, dryRun = true) => {
    try {
      const result = await calendarificService.syncWithTemplate(template.id, {
        year: new Date().getFullYear(),
        dryRun: dryRun
      });

      if (result.success) {
        if (dryRun) {
          toast.success(`Preview: ${result.data.selectedCount} holidays would be synced`);
        } else {
          toast.success(`Sync completed: ${result.data.syncStats.created} holidays created`);
        }
      } else {
        toast.error(result.message || 'Sync failed');
      }
    } catch (error) {
      toast.error('Error syncing with template');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      country: 'IN',
      holidayTypes: ['national'],
      selectedHolidays: [],
      maxHolidays: 10,
      isDefault: false
    });
  };

  const countries = calendarificService.getPopularCountries();
  const holidayTypes = calendarificService.getHolidayTypes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Holiday Templates
          </h1>
          <p className="text-muted-foreground">
            Manage reusable holiday selection templates
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {/* Create Template Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Company National Holidays"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of this template"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Holiday Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {holidayTypes.map(type => (
                      <label key={type.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.holidayTypes.includes(type.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                holidayTypes: [...formData.holidayTypes, type.value]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                holidayTypes: formData.holidayTypes.filter(t => t !== type.value)
                              });
                            }
                          }}
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Templates List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No templates found</p>
                <p className="text-sm mt-2">Create your first holiday template</p>
              </div>
            ) : (
              templates.map(template => (
                <Card key={template.id} className="relative">
                  {template.isDefault && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="default" className="bg-yellow-500">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {countries.find(c => c.code === template.country)?.flag} {template.country}
                      </Badge>
                      <Badge variant="secondary">
                        {template.selectedHolidays.length} holidays
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {template.description && (
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {template.holidayTypes.map(type => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleSyncWithTemplate(template, true)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Dry Run
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCloneTemplate(template)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Clone
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          {previewLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Loading preview...</p>
            </div>
          ) : previewData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Template Preview: {previewData.template.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge>{previewData.selectedCount} selected</Badge>
                  <Badge variant="outline">{previewData.originalCount} total available</Badge>
                  <Badge variant="secondary">{previewData.year}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {previewData.holidays.map((holiday, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{holiday.name}</p>
                        <p className="text-sm text-muted-foreground">{holiday.date}</p>
                      </div>
                      <Badge variant="outline">{holiday.category}</Badge>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => handleSyncWithTemplate(previewData.template, false)}>
                    Sync These Holidays
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewData(null)}>
                    Close Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No preview loaded</p>
              <p className="text-sm mt-2">Select a template to preview its holidays</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HolidayTemplateManagement;