import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Calendar, Settings, Clock, Users, AlertCircle, CheckCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { smartCalendarService, api } from '../../../services';
import WorkingRuleForm from './WorkingRuleForm';
import HolidayModal from '../../organization/components/HolidayModal';

const SmartCalendarManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [workingRules, setWorkingRules] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [calendarSummary, setCalendarSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showWorkingRuleForm, setShowWorkingRuleForm] = useState(false);
  const [editingWorkingRule, setEditingWorkingRule] = useState(null);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      // Fetch data with error handling for each API call
      const results = await Promise.allSettled([
        smartCalendarService.getWorkingRules(),
        smartCalendarService.getSmartMonthlyCalendar(),
        // Use regular holiday API instead of recurring-specific one for now
        api.get('/admin/holidays')
      ]);

      // Handle working rules
      if (results[0].status === 'fulfilled' && results[0].value.success) {
        setWorkingRules(results[0].value.data.workingRules || []);
      } else {
        console.warn('Working rules API failed:', results[0].reason);
        setWorkingRules([]);
      }

      // Handle calendar summary - gracefully handle failure
      if (results[1].status === 'fulfilled' && results[1].value.success) {
        setCalendarSummary(results[1].value.data);
      } else {
        console.warn('Smart calendar API failed:', results[1].reason);
        // Set a default summary when API fails
        setCalendarSummary({
          summary: {
            totalDays: 0,
            workingDays: 0,
            weekends: 0,
            holidays: 0
          },
          activeWorkingRule: null
        });
      }

      // Handle holidays
      if (results[2].status === 'fulfilled' && results[2].value.data.success) {
        setHolidays(results[2].value.data.data.holidays || []);
      } else {
        console.warn('Holidays API failed:', results[2].reason);
        setHolidays([]);
      }

      // Show a warning if any API failed
      const failedAPIs = results.filter(result => result.status === 'rejected').length;
      if (failedAPIs > 0) {
        toast.warning(`Some calendar data could not be loaded. ${failedAPIs} API(s) failed.`);
      }

    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast.error('Failed to load calendar data');
      // Set empty arrays to prevent iteration errors
      setWorkingRules([]);
      setHolidays([]);
      setCalendarSummary({
        summary: { totalDays: 0, workingDays: 0, weekends: 0, holidays: 0 },
        activeWorkingRule: null
      });
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  };

  const getHolidayTypeColor = (type) => {
    const colors = {
      'ONE_TIME': 'bg-blue-100 text-blue-800',
      'RECURRING': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getHolidayCategoryColor = (category) => {
    const colors = {
      'public': 'bg-red-100 text-red-800',
      'optional': 'bg-yellow-100 text-yellow-800',
      'national': 'bg-purple-100 text-purple-800',
      'religious': 'bg-orange-100 text-orange-800',
      'company': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Working Rule handlers
  const handleCreateWorkingRule = () => {
    setEditingWorkingRule(null);
    setShowWorkingRuleForm(true);
  };

  const handleEditWorkingRule = (rule) => {
    setEditingWorkingRule(rule);
    setShowWorkingRuleForm(true);
  };

  const handleDeleteWorkingRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this working rule?')) {
      return;
    }

    try {
      const result = await smartCalendarService.deleteWorkingRule(ruleId);
      if (result.success) {
        toast.success('Working rule deleted successfully');
        fetchCalendarData();
      } else {
        toast.error(result.message || 'Failed to delete working rule');
      }
    } catch (error) {
      console.error('Error deleting working rule:', error);
      toast.error('Failed to delete working rule');
    }
  };

  const handleWorkingRuleSave = () => {
    setShowWorkingRuleForm(false);
    setEditingWorkingRule(null);
    fetchCalendarData();
  };

  const handleWorkingRuleCancel = () => {
    setShowWorkingRuleForm(false);
    setEditingWorkingRule(null);
  };

  // Holiday handlers
  const handleCreateHoliday = () => {
    setEditingHoliday(null);
    setShowHolidayModal(true);
  };

  const handleEditHoliday = (holiday) => {
    setEditingHoliday(holiday);
    setShowHolidayModal(true);
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      const result = await api.delete(`/admin/holidays/${holidayId}`);
      if (result.data.success) {
        toast.success('Holiday deleted successfully');
        fetchCalendarData();
      } else {
        toast.error('Failed to delete holiday');
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Failed to delete holiday');
    }
  };

  const handleHolidaySuccess = () => {
    setShowHolidayModal(false);
    setEditingHoliday(null);
    fetchCalendarData();
  };

  const handleHolidayClose = () => {
    setShowHolidayModal(false);
    setEditingHoliday(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Working Rule Form Modal */}
      {showWorkingRuleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <WorkingRuleForm
              rule={editingWorkingRule}
              onSave={handleWorkingRuleSave}
              onCancel={handleWorkingRuleCancel}
            />
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      <HolidayModal
        open={showHolidayModal}
        holiday={editingHoliday}
        onClose={handleHolidayClose}
        onSuccess={handleHolidaySuccess}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Smart Calendar Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage working rules, holidays, and calendar settings</p>
        </div>
        <div className="flex-shrink-0">
          <Button onClick={fetchCalendarData} variant="outline" className="w-full sm:w-auto">
            <Calendar className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {calendarSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Days</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{calendarSummary.summary?.totalDays || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Working Days</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{calendarSummary.summary?.workingDays || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Holidays</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{calendarSummary.summary?.holidays || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Weekends</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{calendarSummary.summary?.weekends || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="working-rules" className="text-xs sm:text-sm">Working Rules</TabsTrigger>
          <TabsTrigger value="holidays" className="text-xs sm:text-sm">Holidays</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Active Working Rule */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Active Working Rule
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {calendarSummary?.activeWorkingRule ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                        {calendarSummary.activeWorkingRule.ruleName}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {calendarSummary.activeWorkingRule.description}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Working Days:</p>
                      <div className="flex flex-wrap gap-1">
                        {calendarSummary.activeWorkingRule.workingDays.map(day => (
                          <Badge key={day} variant="secondary" className="text-xs">
                            {getDayName(day)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Weekend Days:</p>
                      <div className="flex flex-wrap gap-1">
                        {calendarSummary.activeWorkingRule.weekendDays.map(day => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {getDayName(day)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">No active working rule found</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Holidays */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Recent Holidays
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {holidays.slice(0, 5).map(holiday => (
                    <div key={holiday.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{holiday.name}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {holiday.type === 'RECURRING' ? holiday.recurringDate : holiday.date}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2 flex-shrink-0">
                        <Badge className={`${getHolidayTypeColor(holiday.type)} text-xs`}>
                          {holiday.type}
                        </Badge>
                        <Badge className={`${getHolidayCategoryColor(holiday.category)} text-xs hidden sm:inline-flex`}>
                          {holiday.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {holidays.length === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm">No holidays configured</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Working Rules Tab */}
        <TabsContent value="working-rules" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-base sm:text-lg font-medium">Working Rules Configuration</h3>
            <Button onClick={handleCreateWorkingRule} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Working Rule
            </Button>
          </div>

          <div className="grid gap-4">
            {workingRules.map(rule => (
              <Card key={rule.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">{rule.ruleName}</h4>
                        {rule.isDefault && (
                          <Badge variant="default" className="text-xs">Default</Badge>
                        )}
                        {rule.isActive ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">{rule.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Working Days:</p>
                          <div className="flex flex-wrap gap-1">
                            {rule.workingDays.map(day => (
                              <Badge key={day} variant="secondary" className="text-xs">
                                {getDayName(day)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Weekend Days:</p>
                          <div className="flex flex-wrap gap-1">
                            {rule.weekendDays.map(day => (
                              <Badge key={day} variant="outline" className="text-xs">
                                {getDayName(day)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Effective: {rule.effectiveFrom} {rule.effectiveTo && `to ${rule.effectiveTo}`}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditWorkingRule(rule)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit className="w-4 h-4 sm:mr-0 mr-1" />
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      {!rule.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteWorkingRule(rule.id)}
                          className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                        >
                          <Trash2 className="w-4 h-4 sm:mr-0 mr-1" />
                          <span className="sm:hidden">Delete</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {workingRules.length === 0 && (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <Settings className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Working Rules</h3>
                  <p className="text-sm text-gray-600 mb-4">Create your first working rule to define working days and weekends.</p>
                  <Button onClick={handleCreateWorkingRule} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Working Rule
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Holidays Tab */}
        <TabsContent value="holidays" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-base sm:text-lg font-medium">Holiday Management</h3>
            <Button onClick={handleCreateHoliday} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Holiday
            </Button>
          </div>

          <div className="grid gap-4">
            {holidays.map(holiday => (
              <Card key={holiday.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">{holiday.name}</h4>
                        <Badge className={`${getHolidayTypeColor(holiday.type)} text-xs`}>
                          {holiday.type}
                        </Badge>
                        <Badge className={`${getHolidayCategoryColor(holiday.category)} text-xs`}>
                          {holiday.category}
                        </Badge>
                        {holiday.isPaid && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            Paid
                          </Badge>
                        )}
                      </div>
                      
                      {holiday.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{holiday.description}</p>
                      )}
                      
                      <div className="text-xs sm:text-sm text-gray-500">
                        {holiday.type === 'RECURRING' ? (
                          <span>Recurring: {holiday.recurringDate} (MM-DD)</span>
                        ) : (
                          <span>Date: {holiday.date}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditHoliday(holiday)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit className="w-4 h-4 sm:mr-0 mr-1" />
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteHoliday(holiday._id || holiday.id)}
                        className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                      >
                        <Trash2 className="w-4 h-4 sm:mr-0 mr-1" />
                        <span className="sm:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {holidays.length === 0 && (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Holidays</h3>
                  <p className="text-sm text-gray-600 mb-4">Add company holidays to help employees plan their time off.</p>
                  <Button onClick={handleCreateHoliday} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Holiday
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartCalendarManagement;