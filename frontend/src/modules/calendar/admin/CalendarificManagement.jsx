import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
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
  AlertTriangle,
  Globe2,
  BarChart3,
  Eye,
  RotateCcw
} from 'lucide-react';

import { formatIndianDateTime } from '../../../utils/indianFormatters';
import { DEFAULT_SELECTED_TYPES } from './constants/holidayTypes';

// Import sub-components
import ApiStatusCard from './components/ApiStatusCard';
import CountryYearSelector from './components/CountryYearSelector';
import HolidayTypeSelector from './components/HolidayTypeSelector';
import HolidayPreviewList from './components/HolidayPreviewList';

const CalendarificManagement = () => {
  
  // ===================================================
  // STATE MANAGEMENT - Separated loading states
  // ===================================================
  const [apiLoading, setApiLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  const [apiStatus, setApiStatus] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [holidayStats, setHolidayStats] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Form states
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTypes, setSelectedTypes] = useState(DEFAULT_SELECTED_TYPES);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [bulkStartYear, setBulkStartYear] = useState(new Date().getFullYear());
  const [bulkEndYear, setBulkEndYear] = useState(new Date().getFullYear() + 1);

  // Memoized static data
  const popularCountries = useMemo(() => calendarificService.getPopularCountries(), []);

  // ===================================================
  // INITIALIZATION
  // ===================================================
  useEffect(() => {
    // Only load stats on mount - NO automatic API test
    loadHolidayStats();
  }, []);

  const loadInitialData = async () => {
    // Removed automatic API test - only called manually via button
    setApiLoading(true);
    try {
      await testApiConnection();
      await loadHolidayStats();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setApiLoading(false);
    }
  };

  // ===================================================
  // API OPERATIONS
  // ===================================================
  const testApiConnection = async () => {
    console.log('🔍 [TEST CONNECTION] Starting API connection test...');
    console.log('🔍 [TEST CONNECTION] Current apiStatus:', apiStatus);
    
    try {
      console.log('🔍 [TEST CONNECTION] Calling calendarificService.testConnection()...');
      const result = await calendarificService.testConnection();
      
      console.log('✅ [TEST CONNECTION] Response received:', result);
      console.log('✅ [TEST CONNECTION] Success:', result.success);
      console.log('✅ [TEST CONNECTION] Message:', result.message);
      console.log('✅ [TEST CONNECTION] Data:', result.data);
      
      setApiStatus(result);
      console.log('✅ [TEST CONNECTION] State updated with result');
      
      if (!result.success) {
        console.warn('⚠️ [TEST CONNECTION] API test failed:', result.message);
        toast.error(`API Connection Failed: ${result.message}`);
      } else {
        console.log('🎉 [TEST CONNECTION] API test successful!');
        toast.success('API connection successful!');
      }
    } catch (error) {
      console.error('❌ [TEST CONNECTION] Error caught:', error);
      console.error('❌ [TEST CONNECTION] Error message:', error.message);
      console.error('❌ [TEST CONNECTION] Error stack:', error.stack);
      
      const errorStatus = { success: false, message: error.message || 'Failed to connect to Calendarific API' };
      setApiStatus(errorStatus);
      console.log('❌ [TEST CONNECTION] Error state set:', errorStatus);
      
      toast.error(`API Connection Error: ${error.message}`);
    }
  };

  const loadHolidayStats = async () => {
    setStatsLoading(true);
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
    } finally {
      setStatsLoading(false);
    }
  };

  const handlePreviewHolidays = async () => {
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one holiday type');
      return;
    }

    setPreviewLoading(true);
    setPreviewError(null);
    
    try {
      // ✅ BATCH PREVIEW - ONE API CALL instead of multiple
      // This SAVES API CREDITS significantly
      const result = await calendarificService.batchPreviewHolidays({
        country: selectedCountry,
        year: selectedYear,
        types: selectedTypes
      });
      
      if (result.success) {
        setPreviewData({
          country: selectedCountry,
          year: selectedYear,
          holidays: result.data.holidays,
          count: result.data.count,
          types: selectedTypes,
          breakdown: result.data.breakdown
        });
        
        toast.success(`Found ${result.data.count} holidays across ${selectedTypes.length} categories`);
      } else {
        throw new Error(result.message || 'Preview failed');
      }
      
    } catch (error) {
      const errorMsg = error.message || 'Failed to preview holidays';
      setPreviewError(errorMsg);
      toast.error(`Preview Failed: ${errorMsg}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSyncHolidays = async (dryRun = false) => {
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one holiday type');
      return;
    }

    setSyncLoading(true);
    
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
          await loadHolidayStats();
          setLastSyncTime(formatIndianDateTime(new Date()));
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(`Sync Failed: ${error.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleBulkSync = async () => {
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one holiday type');
      return;
    }

    setSyncLoading(true);
    
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
        
        await loadHolidayStats();
        setLastSyncTime(formatIndianDateTime(new Date()));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(`Bulk Sync Failed: ${error.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================
  const isAnyLoading = apiLoading || previewLoading || syncLoading || statsLoading;
  // Fix: Use strict equality check for apiStatus.success
  const isApiReady = apiStatus?.success === true;

  // Debug logging
  console.log('CalendarificManagement State:', {
    apiStatus,
    isApiReady,
    selectedTypes,
    isAnyLoading
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Calendarific Integration</h1>
          <p className="text-muted-foreground">
            Manage holiday synchronization with Calendarific API
          </p>
        </div>
      </div>

      {/* API Status */}
      <ApiStatusCard 
        apiStatus={apiStatus}
        loading={apiLoading}
        onTestConnection={testApiConnection}
      />

      {/* Quick Actions */}
      {apiStatus?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
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
                disabled={isAnyLoading}
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
                disabled={isAnyLoading}
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
                disabled={isAnyLoading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview All Types
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="sync" className="space-y-3">
        <TabsList>
          <TabsTrigger value="sync">Holiday Sync</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Sync</TabsTrigger>
          <TabsTrigger value="manage">Manage Holidays</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Holiday Sync Tab */}
        <TabsContent value="sync" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Sync Holidays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <CountryYearSelector
                  country={selectedCountry}
                  year={selectedYear}
                  countries={popularCountries}
                  onCountryChange={setSelectedCountry}
                  onYearChange={setSelectedYear}
                  disabled={syncLoading}
                />

                <HolidayTypeSelector
                  selectedTypes={selectedTypes}
                  onTypesChange={setSelectedTypes}
                  disabled={syncLoading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overwrite"
                  checked={overwriteExisting}
                  onCheckedChange={setOverwriteExisting}
                  disabled={syncLoading}
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
                  disabled={syncLoading || selectedTypes.length === 0 || apiStatus?.success === false}
                  title={
                    apiStatus?.success === false 
                      ? 'API connection failed - please test connection first' 
                      : selectedTypes.length === 0 
                      ? 'Select at least one holiday type' 
                      : ''
                  }
                >
                  {syncLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  Dry Run
                </Button>
                <Button 
                  onClick={() => handleSyncHolidays(false)}
                  disabled={syncLoading || selectedTypes.length === 0 || apiStatus?.success === false}
                  title={
                    apiStatus?.success === false 
                      ? 'API connection failed - please test connection first' 
                      : selectedTypes.length === 0 
                      ? 'Select at least one holiday type' 
                      : ''
                  }
                >
                  {syncLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Sync Holidays
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview Holidays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handlePreviewHolidays}
                disabled={previewLoading || selectedTypes.length === 0 || apiStatus?.success === false}
                title={
                  apiStatus?.success === false 
                    ? 'API connection failed - please test connection first' 
                    : selectedTypes.length === 0 
                    ? 'Select at least one holiday type' 
                    : ''
                }
              >
                {previewLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Load Preview ({selectedTypes.length} types)
              </Button>

              {previewError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{previewError}</AlertDescription>
                </Alert>
              )}

              {previewData && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {previewData.country} - {previewData.year}
                    </h3>
                    <div className="flex gap-2">
                      <Badge>{previewData.count} holidays</Badge>
                      <Badge variant="outline">{previewData.types.join(', ')}</Badge>
                    </div>
                  </div>
                  
                  <HolidayPreviewList holidays={previewData.holidays} />
                </div>
              )}

              {!previewData && !previewError && !previewLoading && (
                <div className="text-center p-8 text-muted-foreground">
                  <p>No preview loaded</p>
                  <p className="text-sm mt-2">Click "Load Preview" to see holidays</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Sync Tab */}
        <TabsContent value="bulk" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Bulk Sync Multiple Years
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                    id="startYear"
                    type="number"
                    value={bulkStartYear}
                    onChange={(e) => setBulkStartYear(Number(e.target.value) || new Date().getFullYear())}
                    min="2020"
                    max="2030"
                    disabled={syncLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="endYear">End Year</Label>
                  <Input
                    id="endYear"
                    type="number"
                    value={bulkEndYear}
                    onChange={(e) => setBulkEndYear(Number(e.target.value) || new Date().getFullYear())}
                    min="2020"
                    max="2030"
                    disabled={syncLoading}
                  />
                </div>
              </div>

              <Button 
                onClick={handleBulkSync}
                disabled={syncLoading || bulkEndYear < bulkStartYear || selectedTypes.length === 0 || apiStatus?.success === false}
                title={
                  apiStatus?.success === false 
                    ? 'API connection failed - please test connection first' 
                    : bulkEndYear < bulkStartYear 
                    ? 'End year must be after start year' 
                    : selectedTypes.length === 0 
                    ? 'Select at least one holiday type' 
                    : ''
                }
              >
                {syncLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Bulk Sync ({bulkEndYear - bulkStartYear + 1} years, {selectedTypes.length} types)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Holidays Tab */}
        <TabsContent value="manage" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Manage Existing Holidays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This section allows you to view, update, and delete holidays that have been synced from Calendarific. 
                  Changes here will affect your local holiday database only.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CountryYearSelector
                  country={selectedCountry}
                  year={selectedYear}
                  countries={popularCountries}
                  onCountryChange={setSelectedCountry}
                  onYearChange={setSelectedYear}
                  disabled={statsLoading}
                />

                <div className="flex items-end">
                  <Button 
                    onClick={loadHolidayStats}
                    variant="outline"
                    disabled={statsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                    Load Holidays
                  </Button>
                </div>
              </div>

              {holidayStats && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      Holidays in Database ({holidayStats.breakdown.total} total)
                    </h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSyncHolidays(false)}
                        disabled={syncLoading || selectedTypes.length === 0}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Re-sync Selected Types
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 border rounded-lg bg-blue-50">
                      <div className="text-xl font-bold text-blue-600">
                        {holidayStats.breakdown.national}
                      </div>
                      <div className="text-sm text-muted-foreground">National</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg bg-purple-50">
                      <div className="text-xl font-bold text-purple-600">
                        {holidayStats.breakdown.religious}
                      </div>
                      <div className="text-sm text-muted-foreground">Religious</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg bg-green-50">
                      <div className="text-xl font-bold text-green-600">
                        {holidayStats.breakdown.local}
                      </div>
                      <div className="text-sm text-muted-foreground">Local</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg bg-gray-50">
                      <div className="text-xl font-bold text-gray-600">
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
        <TabsContent value="stats" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Holiday Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={loadHolidayStats} variant="outline" disabled={statsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
                Refresh Stats
              </Button>

              {holidayStats && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {holidayStats.breakdown.national}
                      </div>
                      <div className="text-sm text-muted-foreground">National</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-xl font-bold text-purple-600">
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