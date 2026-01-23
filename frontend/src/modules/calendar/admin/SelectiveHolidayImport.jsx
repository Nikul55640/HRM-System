import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Badge } from '../../../shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Checkbox } from '../../../shared/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Alert, AlertDescription } from '../../../shared/ui/alert';
import { Loader2, Filter, Download, Eye, Settings, Sparkles, Flag, Building, Calendar } from 'lucide-react';
import { selectiveHolidayService } from '../../../services';
import { toast } from 'react-hot-toast';

const SelectiveHolidayImport = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [availableFilters, setAvailableFilters] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [apiUsageStats, setApiUsageStats] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    country: 'IN',
    year: new Date().getFullYear(),
    holidayTypes: 'national,religious'
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('quick');
  const [showPreview, setShowPreview] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [filtersChanged, setFiltersChanged] = useState(false); // Track if filters changed

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Test connection and load filters
      const [connectionResult, filtersResult, usageResult] = await Promise.all([
        selectiveHolidayService.testConnection(),
        selectiveHolidayService.getAvailableFilters(),
        selectiveHolidayService.getApiUsageStats().catch(() => null) // Don't fail if this errors
      ]);
      
      setConnectionStatus(connectionResult);
      setAvailableFilters(filtersResult.data);
      setApiUsageStats(usageResult?.data);
      
      if (connectionResult.success) {
        toast.success('Calendarific API connected successfully');
      } else {
        toast.error('Calendarific API connection failed');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load holiday import settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setShowPreview(false); // Reset preview when filters change
    setFiltersChanged(true); // Mark that filters have changed
  };

  // Preview holidays with current filters
  const previewHolidays = async () => {
    setLoading(true);
    try {
      const result = await selectiveHolidayService.previewHolidaysWithFilters(selectedFilters);
      setPreviewData(result.data);
      setShowPreview(true);
      setFiltersChanged(false); // Reset filters changed flag
      
      // Show API usage info if available
      const apiMessage = result.data.apiUsage?.message || '';
      toast.success(`Preview loaded: ${result.data.count} holidays found. ${apiMessage}`);
    } catch (error) {
      console.error('Error previewing holidays:', error);
      toast.error('Failed to preview holidays');
    } finally {
      setLoading(false);
    }
  };

  // Sync holidays to database
  const syncHolidays = async (dryRun = false) => {
    setSyncInProgress(true);
    try {
      const syncOptions = {
        ...selectedFilters,
        dryRun,
        overwriteExisting: false
      };
      
      const result = await selectiveHolidayService.syncHolidaysWithFilters(syncOptions);
      
      if (dryRun) {
        toast.success(`Dry run completed: ${result.data.stats.created + result.data.stats.updated} holidays would be synced`);
      } else {
        toast.success(`Successfully synced ${result.data.stats.created + result.data.stats.updated} holidays`);
        setShowPreview(false); // Reset preview after sync
      }
    } catch (error) {
      console.error('Error syncing holidays:', error);
      toast.error('Failed to sync holidays');
    } finally {
      setSyncInProgress(false);
    }
  };

  // Apply quick filter presets
  const applyQuickFilter = async (presetName) => {
    const presets = selectiveHolidayService.getFilterPresets();
    const preset = presets[presetName];
    
    if (preset) {
      setSelectedFilters(prev => ({
        ...prev,
        ...preset.filters
      }));
      
      // ✅ FIX: Don't auto-preview, let user click Preview manually
      setShowPreview(false); // Reset preview state
      toast.success(`${preset.name} filter applied. Click Preview to see results.`);
    }
  };

  // Apply company policy
  const applyCompanyPolicy = async (policyTemplate) => {
    setSelectedFilters(prev => ({
      ...prev,
      companyPolicy: policyTemplate
    }));
    
    // ✅ FIX: Don't auto-preview, let user click Preview manually
    setShowPreview(false); // Reset preview state
    
    const templates = availableFilters?.companyPolicyTemplates;
    const template = templates?.[policyTemplate];
    
    toast.success(`${template?.name || policyTemplate} policy applied. Click Preview to see results.`);
  };

  // Render connection status with API usage
  const renderConnectionStatus = () => (
    <div className="space-y-3">
      <Alert className={connectionStatus?.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <AlertDescription className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connectionStatus?.success ? 'bg-green-500' : 'bg-red-500'}`} />
          {connectionStatus?.message || 'Checking connection...'}
          {connectionStatus?.success && connectionStatus.data?.holidayCount && (
            <Badge variant="secondary" className="ml-2">
              {connectionStatus.data.holidayCount} holidays available
            </Badge>
          )}
        </AlertDescription>
      </Alert>
      
      {/* API Usage Stats */}
      {apiUsageStats && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium">API Usage:</span> {apiUsageStats.apiCallsToday}/{apiUsageStats.apiCallsToday + apiUsageStats.remainingCalls}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Cache Hit Rate:</span> {apiUsageStats.cacheHitRate}%
                </div>
                <div className="text-sm">
                  <span className="font-medium">Status:</span> 
                  <Badge 
                    variant={apiUsageStats.recommendations?.status === 'healthy' ? 'success' : 'warning'}
                    className="ml-1"
                  >
                    {apiUsageStats.recommendations?.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    const result = await selectiveHolidayService.getApiUsageStats();
                    setApiUsageStats(result.data);
                    toast.success('API usage stats refreshed');
                  } catch (error) {
                    toast.error('Failed to refresh stats');
                  }
                }}
              >
                Refresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Render quick filter buttons
  const renderQuickFilters = () => {
    const presets = selectiveHolidayService.getFilterPresets();
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(presets).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => applyQuickFilter(key)}
              disabled={loading}
            >
              <div className="text-lg">
                {key === 'festivalsOnly' && <Sparkles className="w-5 h-5" />}
                {key === 'nationalOnly' && <Flag className="w-5 h-5" />}
                {key === 'essentialHolidays' && <Calendar className="w-5 h-5" />}
                {key === 'paidHolidaysOnly' && <Building className="w-5 h-5" />}
                {key.includes('tech') && <Settings className="w-5 h-5" />}
                {key.includes('traditional') && <Building className="w-5 h-5" />}
                {key.includes('government') && <Flag className="w-5 h-5" />}
                {key.includes('manufacturing') && <Settings className="w-5 h-5" />}
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{preset.name}</div>
                <div className="text-xs text-gray-500">{preset.description}</div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm">
              <strong>Tip:</strong> Quick filters set your preferences. Click "Preview" to see results and avoid unnecessary API calls.
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render company policy templates
  const renderCompanyPolicies = () => {
    if (!availableFilters?.companyPolicyTemplates) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(availableFilters.companyPolicyTemplates).map(([key, policy]) => (
          <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{policy.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary">Max: {policy.maxHolidays}</Badge>
                    {policy.excludeObservances && <Badge variant="outline">No Observances</Badge>}
                    {policy.allowOptional && <Badge variant="outline">Optional Allowed</Badge>}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => applyCompanyPolicy(key)}
                  disabled={loading}
                >
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render advanced filters
  const renderAdvancedFilters = () => (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="country">Country</Label>
          <Select 
            key={selectedFilters.country}
            value={selectedFilters.country} 
            onValueChange={(value) => handleFilterChange('country', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN">India</SelectItem>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="GB">United Kingdom</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            type="number"
            value={selectedFilters.year}
            onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
            min="2020"
            max="2030"
          />
        </div>
        
        <div>
          <Label htmlFor="maxHolidays">Max Holidays</Label>
          <Input
            type="number"
            value={selectedFilters.maxHolidays || ''}
            onChange={(e) => handleFilterChange('maxHolidays', parseInt(e.target.value) || undefined)}
            placeholder="No limit"
            min="1"
            max="50"
          />
        </div>
      </div>

      {/* Filter Checkboxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="festivalsOnly"
            checked={selectedFilters.festivalsOnly || false}
            onCheckedChange={(checked) => handleFilterChange('festivalsOnly', checked)}
          />
          <Label htmlFor="festivalsOnly">Festivals Only</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="nationalOnly"
            checked={selectedFilters.nationalOnly || false}
            onCheckedChange={(checked) => handleFilterChange('nationalOnly', checked)}
          />
          <Label htmlFor="nationalOnly">National Only</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="paidOnly"
            checked={selectedFilters.paidOnly || false}
            onCheckedChange={(checked) => handleFilterChange('paidOnly', checked)}
          />
          <Label htmlFor="paidOnly">Paid Only</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="excludeObservances"
            checked={selectedFilters.excludeObservances || false}
            onCheckedChange={(checked) => handleFilterChange('excludeObservances', checked)}
          />
          <Label htmlFor="excludeObservances">Exclude Observances</Label>
        </div>
      </div>

      {/* Importance Level */}
      <div>
        <Label htmlFor="importanceLevel">Importance Level</Label>
        <Select 
          key={selectedFilters.importanceLevel}
          value={selectedFilters.importanceLevel || ''} 
          onValueChange={(value) => handleFilterChange('importanceLevel', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All importance levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All importance levels</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Render holiday preview
  const renderHolidayPreview = () => {
    if (!showPreview || !previewData) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Holiday Preview ({previewData.count} holidays)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          {previewData.summary && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total:</span>
                  <span className="ml-2 font-medium">{previewData.summary.total}</span>
                </div>
                <div>
                  <span className="text-gray-600">Paid:</span>
                  <span className="ml-2 font-medium">{previewData.summary.paidHolidays}</span>
                </div>
                <div>
                  <span className="text-gray-600">Recurring:</span>
                  <span className="ml-2 font-medium">{previewData.summary.recurringHolidays}</span>
                </div>
                <div>
                  <span className="text-gray-600">Categories:</span>
                  <span className="ml-2 font-medium">{Object.keys(previewData.summary.byCategory).length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Holiday List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {previewData.holidays.map((holiday, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{holiday.name}</div>
                  <div className="text-sm text-gray-600">
                    {holiday.date || holiday.recurringDate} • {holiday.category}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {holiday.isPaid && <Badge variant="secondary">Paid</Badge>}
                  {holiday.type === 'RECURRING' && <Badge variant="outline">Recurring</Badge>}
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: holiday.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => syncHolidays(true)}
              variant="outline"
              disabled={syncInProgress || !showPreview || filtersChanged}
            >
              {syncInProgress ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Dry Run
            </Button>
            <Button
              onClick={() => syncHolidays(false)}
              disabled={syncInProgress || !showPreview || filtersChanged}
            >
              {syncInProgress ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              Import Holidays
            </Button>
            
            {(!showPreview || filtersChanged) && (
              <div className="flex items-center gap-2 text-gray-500 text-sm ml-3">
                <span>Preview required before import</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading && !availableFilters) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading holiday import settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Selective Holiday Import</h2>
        <p className="text-gray-600">Choose exactly which holidays to import from Calendarific</p>
      </div>

      {/* Connection Status */}
      {connectionStatus && renderConnectionStatus()}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick">Quick Filters</TabsTrigger>
          <TabsTrigger value="policies">Company Policies</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Quick Filter Presets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderQuickFilters()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Policy Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCompanyPolicies()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderAdvancedFilters()}
              
              {/* Preview Status Indicator */}
              {filtersChanged && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Filters changed - Click Preview to see updated results</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={previewHolidays} 
                  disabled={loading}
                  className={filtersChanged ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {filtersChanged ? 'Preview Updated Filters' : 'Preview Holidays'}
                </Button>
                
                {showPreview && !filtersChanged && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Preview is current
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Holiday Preview */}
      {renderHolidayPreview()}
    </div>
  );
};

export default SelectiveHolidayImport;