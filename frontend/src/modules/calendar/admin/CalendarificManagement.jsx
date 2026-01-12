/**
 * Calendarific Management Component
 * Admin interface for managing Calendarific API integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Checkbox } from '../../../shared/ui/checkbox';
import { Badge } from '../../../shared/ui/badge';
import { Alert, AlertDescription } from '../../../shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { toast } from 'react-toastify';
import calendarificService from '../../../services/calendarificService';
import { 
  Calendar, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Globe2,
  BarChart3,
  Settings,
  Eye,
  RotateCcw
} from 'lucide-react';

const CalendarificManagement = () => {
  
  // State management
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [countries, setCountries] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [syncStats, setSyncStats] = useState(null);
  const [holidayStats, setHolidayStats] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Form states
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTypes, setSelectedTypes] = useState(['national', 'religious']);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [bulkStartYear, setBulkStartYear] = useState(new Date().getFullYear());
  const [bulkEndYear, setBulkEndYear] = useState(new Date().getFullYear() + 1);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        testApiConnection(),
        loadSyncStatus(),
        loadHolidayStats()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    try {
      const result = await calendarificService.testConnection();
      setApiStatus(result);
      
      if (result.success) {
        // Load countries if API is working
        const countriesResult = await calendarificService.getSupportedCountries();
        if (countriesResult.success) {
          setCountries(countriesResult.data);
        }
      }
    } catch (error) {
      setApiStatus({ success: false, message: error.message });
    }
  };

  const loadSyncStatus = async () => {
    try {
      const result = await calendarificService.getSyncStatus();
      setSyncStats(result.data);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const loadHolidayStats = async () => {
    try {
      const result = await calendarificService.getHolidayStats({
        country: selectedCountry,
        year: selectedYear
      });
      if (result.success) {
        setHolidayStats(result.data);
      }
    } catch (error) {
      console.error('Error loading holiday stats:', error);
    }
  };

  const handlePreviewHolidays = async () => {
    setLoading(true);
    try {
      // Preview all selected types
      const previewPromises = selectedTypes.map(type => 
        calendarificService.previewHolidays({
          country: selectedCountry,
          year: selectedYear,
          type
        })
      );
      
      const results = await Promise.all(previewPromises);
      
      // Combine all holidays from different types
      const allHolidays = [];
      let totalCount = 0;
      
      results.forEach((result, index) => {
        if (result.success) {
          const typeLabel = selectedTypes[index];
          result.data.holidays.forEach(holiday => {
            allHolidays.push({
              ...holiday,
              sourceType: typeLabel
            });
          });
          totalCount += result.data.holidays.length;
        }
      });
      
      // Sort holidays by date
      allHolidays.sort((a, b) => {
        const dateA = new Date(a.date || `${selectedYear}-${a.recurringDate}`);
        const dateB = new Date(b.date || `${selectedYear}-${b.recurringDate}`);
        return dateA - dateB;
      });
      
      setPreviewData({
        country: selectedCountry,
        year: selectedYear,
        holidays: allHolidays,
        count: totalCount,
        types: selectedTypes
      });
      
      toast.success(`Found ${totalCount} holidays across ${selectedTypes.length} categories for ${selectedCountry} in ${selectedYear}`);
      
    } catch (error) {
      toast.error(`Preview Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncHolidays = async (dryRun = false) => {
    setLoading(true);
    try {
      const validation = calendarificService.validateSyncParams({
        country: selectedCountry,
        year: selectedYear
      });
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const result = await calendarificService.syncHolidays({
        country: selectedCountry,
        year: selectedYear,
        overwriteExisting,
        dryRun,
        holidayTypes: selectedTypes.join(',')
      });
      
      if (result.success) {
        const message = dryRun ? "Dry Run Completed" : "Sync Completed";
        toast.success(`${message}: ${result.message}`);
        
        if (!dryRun) {
          await loadSyncStatus();
          await loadHolidayStats();
          setLastSyncTime(new Date().toLocaleString());
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(`Sync Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSync = async () => {
    setLoading(true);
    try {
      const validation = calendarificService.validateSyncParams({
        country: selectedCountry,
        startYear: bulkStartYear,
        endYear: bulkEndYear
      });
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const result = await calendarificService.bulkSyncHolidays({
        country: selectedCountry,
        startYear: bulkStartYear,
        endYear: bulkEndYear,
        overwriteExisting,
        holidayTypes: selectedTypes.join(',')
      });
      
      if (result.success) {
        toast.success(`Bulk Sync Completed: Processed ${result.data.yearsProcessed} years with ${result.data.successfulYears} successful`);
        
        await loadSyncStatus();
        await loadHolidayStats();
        setLastSyncTime(new Date().toLocaleString());
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(`Bulk Sync Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'connected') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'disconnected') return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const popularCountries = calendarificService.getPopularCountries();
  const holidayTypes = calendarificService.getHolidayTypes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendarific Integration</h1>
          <p className="text-muted-foreground">
            Manage holiday synchronization with Calendarific API
          </p>
        </div>
      </div>

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apiStatus ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(apiStatus.success ? 'connected' : 'disconnected')}
                <div>
                  <p className="font-medium">
                    {apiStatus.success ? 'Connected' : 'Disconnected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {apiStatus.message}
                  </p>
                </div>
                {apiStatus.success && apiStatus.data?.holidayCount && (
                  <Badge variant="secondary">
                    {apiStatus.data.holidayCount} holidays available
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testApiConnection}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Testing connection...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {apiStatus?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedTypes(['national']);
                  handlePreviewHolidays();
                }}
                disabled={loading}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Preview National Holidays
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedTypes(['national', 'religious']);
                  handleSyncHolidays(false);
                }}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Quick Sync (National + Religious)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedTypes(['national', 'religious', 'local', 'observance']);
                  handlePreviewHolidays();
                }}
                disabled={loading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview All Types
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="sync" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sync">Holiday Sync</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Sync</TabsTrigger>
          <TabsTrigger value="manage">Manage Holidays</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Holiday Sync Tab */}
        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Sync Holidays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularCountries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                  />
                </div>

                <div>
                  <Label>Holiday Types</Label>
                  <div className="space-y-2 mt-2 border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center space-x-2 mb-3 pb-2 border-b">
                      <Checkbox
                        id="select-all"
                        checked={selectedTypes.length === holidayTypes.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTypes(holidayTypes.map(t => t.value));
                          } else {
                            setSelectedTypes([]);
                          }
                        }}
                      />
                      <Label htmlFor="select-all" className="text-sm font-medium">
                        Select All ({selectedTypes.length}/{holidayTypes.length})
                      </Label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedTypes(['national', 'religious']);
                        }}
                      >
                        Reset to Default
                      </Button>
                    </div>
                    {holidayTypes.map((type) => (
                      <div key={type.value} className={`flex items-center space-x-2 p-2 rounded transition-colors ${
                        selectedTypes.includes(type.value) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'
                      }`}>
                        <Checkbox
                          id={type.value}
                          checked={selectedTypes.includes(type.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes(prev => [...prev, type.value]);
                            } else {
                              setSelectedTypes(prev => prev.filter(t => t !== type.value));
                            }
                          }}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{type.icon}</span>
                          <div>
                            <Label htmlFor={type.value} className="text-sm font-medium cursor-pointer">
                              {type.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                        {selectedTypes.includes(type.value) && (
                          <Badge variant="secondary" className="text-xs">Selected</Badge>
                        )}
                      </div>
                    ))}
                    {selectedTypes.length === 0 && (
                      <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
                        ⚠️ Please select at least one holiday type
                      </div>
                    )}
                    {selectedTypes.length > 0 && (
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                        ✅ {selectedTypes.length} type(s) selected: {selectedTypes.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overwrite"
                  checked={overwriteExisting}
                  onCheckedChange={setOverwriteExisting}
                />
                <Label htmlFor="overwrite">
                  Overwrite existing holidays
                </Label>
              </div>

              {lastSyncTime && (
                <div className="text-sm text-muted-foreground bg-green-50 p-2 rounded">
                  Last successful sync: {lastSyncTime}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSyncHolidays(true)} 
                  variant="outline"
                  disabled={loading || !apiStatus?.success || selectedTypes.length === 0}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Dry Run
                </Button>
                <Button 
                  onClick={() => handleSyncHolidays(false)}
                  disabled={loading || !apiStatus?.success || selectedTypes.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Sync Holidays
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview Holidays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handlePreviewHolidays}
                disabled={loading || !apiStatus?.success || selectedTypes.length === 0}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Load Preview ({selectedTypes.length} types)
              </Button>

              {previewData && (
                  <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {previewData.country} - {previewData.year}
                    </h3>
                    <div className="flex gap-2">
                      <Badge>{previewData.count} holidays</Badge>
                      <Badge variant="outline">{previewData.types.join(', ')}</Badge>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {previewData.holidays.map((holiday, index) => {
                      const formatted = calendarificService.formatHolidayForDisplay(holiday);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{formatted.categoryIcon}</span>
                            <div>
                              <p className="font-medium">{holiday.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatted.displayDate} • {formatted.typeLabel}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" style={{ backgroundColor: holiday.color + '20', color: holiday.color }}>
                              {holiday.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {holiday.sourceType}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Sync Tab */}
        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Bulk Sync Multiple Years
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Bulk sync is restricted to SuperAdmin users and limited to 5 years at once to prevent API quota exhaustion.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startYear">Start Year</Label>
                  <Input
                    type="number"
                    value={bulkStartYear}
                    onChange={(e) => setBulkStartYear(parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                  />
                </div>

                <div>
                  <Label htmlFor="endYear">End Year</Label>
                  <Input
                    type="number"
                    value={bulkEndYear}
                    onChange={(e) => setBulkEndYear(parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                  />
                </div>
              </div>

              <Button 
                onClick={handleBulkSync}
                disabled={loading || !apiStatus?.success || bulkEndYear < bulkStartYear || selectedTypes.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Bulk Sync ({bulkEndYear - bulkStartYear + 1} years, {selectedTypes.length} types)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Holidays Tab */}
        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manage Existing Holidays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This section allows you to view, update, and delete holidays that have been synced from Calendarific. 
                  Changes here will affect your local holiday database only.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="manage-country">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularCountries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="manage-year">Year</Label>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={loadHolidayStats}
                    variant="outline"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Load Holidays
                  </Button>
                </div>
              </div>

              {holidayStats && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      Holidays in Database ({holidayStats.breakdown.total} total)
                    </h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSyncHolidays(false)}
                        disabled={loading || selectedTypes.length === 0}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Re-sync Selected Types
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-blue-50">
                      <div className="text-2xl font-bold text-blue-600">
                        {holidayStats.breakdown.national}
                      </div>
                      <div className="text-sm text-muted-foreground">National</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-purple-50">
                      <div className="text-2xl font-bold text-purple-600">
                        {holidayStats.breakdown.religious}
                      </div>
                      <div className="text-sm text-muted-foreground">Religious</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-600">
                        {holidayStats.breakdown.local}
                      </div>
                      <div className="text-sm text-muted-foreground">Local</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-gray-50">
                      <div className="text-2xl font-bold text-gray-600">
                        {holidayStats.breakdown.total}
                      </div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>• Use "Re-sync Selected Types" to update holidays from Calendarific</p>
                    <p>• Individual holiday management can be done through the main Calendar Management section</p>
                    <p>• Changes here only affect your local database, not the Calendarific API</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Holiday Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={loadHolidayStats} variant="outline" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Stats
              </Button>

              {holidayStats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {holidayStats.breakdown.national}
                      </div>
                      <div className="text-sm text-muted-foreground">National</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {holidayStats.breakdown.religious}
                      </div>
                      <div className="text-sm text-muted-foreground">Religious</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {holidayStats.breakdown.local}
                      </div>
                      <div className="text-sm text-muted-foreground">Local</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {holidayStats.breakdown.total}
                      </div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>

                  {Object.keys(holidayStats.monthlyDistribution).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Monthly Distribution</h4>
                      <div className="grid grid-cols-6 gap-2">
                        {Object.entries(holidayStats.monthlyDistribution).map(([month, count]) => (
                          <div key={month} className="text-center p-2 border rounded">
                            <div className="font-medium">{count}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarificManagement;