import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Calendar, Settings, Clock, Users, AlertCircle, CheckCircle, Plus, Edit, Trash2 , X, Calendar1Icon, ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';
import { smartCalendarService, api } from '../../../services';
import WorkingRuleForm from './WorkingRuleForm';
import HolidayModal from '../../organization/components/HolidayModal';
import useAuth from '../../../core/hooks/useAuth';

const SmartCalendarManagement = () => {
  console.log('🚀 SmartCalendarManagement component initialized');
  
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

  // Get user info for role-based permissions
  const { user } = useAuth();
  console.log('👤 User info:', { user, role: user?.role });
  
  const isAdmin = user?.role === 'SuperAdmin';
  const isHR = user?.role === 'HR' || user?.role === 'HR_Manager';
  
  console.log('🔐 Permissions:', { isAdmin, isHR });
  
  // HR can manage holidays and view working rules, but only Admin can create/edit working rules
  const canManageWorkingRules = isAdmin;
  const canManageHolidays = isAdmin || isHR;
  
  console.log('✅ Access control:', { canManageWorkingRules, canManageHolidays });

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    console.log('🔄 useEffect triggered - calling fetchCalendarData');
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    console.log('📊 Starting fetchCalendarData...');
    try {
      setLoading(true);
      console.log('⏳ Loading state set to true');
      
      // Fetch data with error handling for each API call
      console.log('🔄 Making API calls...');
      const results = await Promise.allSettled([
        smartCalendarService.getWorkingRules(),
        smartCalendarService.getSmartMonthlyCalendar(),
        // Use regular holiday API instead of recurring-specific one for now
        api.get('/admin/holidays')
      ]);

      console.log('📋 API Results:', results.map((result, index) => ({
        index,
        status: result.status,
        success: result.status === 'fulfilled' ? result.value?.success : false,
        error: result.status === 'rejected' ? result.reason : null
      })));

      // Handle working rules
      if (results[0].status === 'fulfilled' && results[0].value.success) {
        console.log('✅ Working rules API success:', results[0].value.data);
        setWorkingRules(results[0].value.data.workingRules || []);
      } else {
        console.warn('❌ Working rules API failed:', results[0].reason);
        setWorkingRules([]);
      }

      // Handle calendar summary - gracefully handle failure
      if (results[1].status === 'fulfilled' && results[1].value.success) {
        console.log('✅ Smart calendar API success:', results[1].value.data);
        console.log('📊 Calendar summary breakdown:', {
          totalDays: results[1].value.data.summary?.totalDays,
          workingDays: results[1].value.data.summary?.workingDays,
          weekends: results[1].value.data.summary?.weekends,
          holidays: results[1].value.data.summary?.holidays,
          leaves: results[1].value.data.summary?.leaves
        });
        console.log('🗓️ Active working rule:', results[1].value.data.activeWorkingRule);
        setCalendarSummary(results[1].value.data);
      } else {
        console.warn('❌ Smart calendar API failed:', results[1].reason);
        // Set a default summary when API fails
        const defaultSummary = {
          summary: {
            totalDays: 0,
            workingDays: 0,
            weekends: 0,
            holidays: 0
          },
          activeWorkingRule: null
        };
        console.log('🔧 Setting default calendar summary:', defaultSummary);
        setCalendarSummary(defaultSummary);
      }

      // Handle holidays
      if (results[2].status === 'fulfilled' && results[2].value.data.success) {
        console.log('✅ Holidays API success:', results[2].value.data.data);
        const holidaysList = results[2].value.data.data.holidays || [];
        console.log('🎉 Holidays details:', holidaysList.map(h => ({
          id: h.id,
          name: h.name,
          type: h.type,
          date: h.date,
          recurringDate: h.recurringDate,
          category: h.category
        })));
        setHolidays(holidaysList);
      } else {
        console.warn('❌ Holidays API failed:', results[2].reason);
        setHolidays([]);
      }

      // Show a warning if any API failed
      const failedAPIs = results.filter(result => result.status === 'rejected').length;
      console.log(`📊 API Summary: ${3 - failedAPIs}/3 successful, ${failedAPIs} failed`);
      
      if (failedAPIs > 0) {
        console.warn(`⚠️ ${failedAPIs} API(s) failed - showing warning toast`);
        toast.warning(`Some calendar data could not be loaded. ${failedAPIs} API(s) failed.`);
      }

    } catch (error) {
      console.error('💥 Error in fetchCalendarData:', error);
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
      console.log('✅ fetchCalendarData completed, loading set to false');
    }
  };

  const getDayName = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dayNum];
    console.log(`📅 getDayName(${dayNum}) = ${dayName}`);
    return dayName;
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
    const color = colors[category] || 'bg-gray-100 text-gray-800';
    console.log(`🎨 getHolidayCategoryColor(${category}) = ${color}`);
    return color;
  };

  // Working Rule handlers - Admin only
  const handleCreateWorkingRule = () => {
    console.log('🆕 handleCreateWorkingRule called');
    console.log('🔐 Permission check - canManageWorkingRules:', canManageWorkingRules);
    
    if (!canManageWorkingRules) {
      console.warn('❌ Access denied - user cannot manage working rules');
      toast.error('Only administrators can create working rules');
      return;
    }
    
    console.log('✅ Opening working rule form for creation');
    setEditingWorkingRule(null);
    setShowWorkingRuleForm(true);
  };

  const handleEditWorkingRule = (rule) => {
    console.log('✏️ handleEditWorkingRule called with rule:', rule);
    console.log('🔐 Permission check - canManageWorkingRules:', canManageWorkingRules);
    
    if (!canManageWorkingRules) {
      console.warn('❌ Access denied - user cannot edit working rules');
      toast.error('Only administrators can edit working rules');
      return;
    }

    // Safety check for active working rule
    if (rule.isActive) {
      console.warn('⚠️ Attempting to edit active working rule - showing confirmation');
      const confirmed = window.confirm(
        'WARNING: This is the currently active working rule.\n\n' +
        'Editing it will immediately affect:\n' +
        '• Attendance calculations\n' +
        '• Weekend detection\n' +
        '• Holiday processing\n\n' +
        'Are you sure you want to proceed?'
      );
      
      console.log('🤔 User confirmation for editing active rule:', confirmed);
      if (!confirmed) {
        console.log('❌ User cancelled editing active rule');
        return;
      }
    }

    console.log('✅ Opening working rule form for editing');
    setEditingWorkingRule(rule);
    setShowWorkingRuleForm(true);
  };

  const handleDeleteWorkingRule = async (ruleId) => {
    console.log('🗑️ handleDeleteWorkingRule called with ruleId:', ruleId);
    console.log('🔐 Permission check - canManageWorkingRules:', canManageWorkingRules);
    
    if (!canManageWorkingRules) {
      console.warn('❌ Access denied - user cannot delete working rules');
      toast.error('Only administrators can delete working rules');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this working rule?');
    console.log('🤔 User confirmation for deletion:', confirmed);
    
    if (!confirmed) {
      console.log('❌ User cancelled deletion');
      return;
    }

    try {
      console.log('🔄 Calling smartCalendarService.deleteWorkingRule...');
      const result = await smartCalendarService.deleteWorkingRule(ruleId);
      console.log('📋 Delete result:', result);
      
      if (result.success) {
        console.log('✅ Working rule deleted successfully');
        toast.success('Working rule deleted successfully');
        fetchCalendarData();
      } else {
        console.error('❌ Delete failed:', result.message);
        toast.error(result.message || 'Failed to delete working rule');
      }
    } catch (error) {
      console.error('💥 Error deleting working rule:', error);
      toast.error('Failed to delete working rule');
    }
  };

  const handleWorkingRuleSave = () => {
    console.log('💾 handleWorkingRuleSave called - closing form and refreshing data');
    setShowWorkingRuleForm(false);
    setEditingWorkingRule(null);
    fetchCalendarData();
  };

  const handleWorkingRuleCancel = () => {
    console.log('❌ handleWorkingRuleCancel called - closing form without saving');
    setShowWorkingRuleForm(false);
    setEditingWorkingRule(null);
  };

  // Holiday handlers - HR and Admin can manage
  const handleCreateHoliday = () => {
    console.log('🎉 handleCreateHoliday called');
    console.log('🔐 Permission check - canManageHolidays:', canManageHolidays);
    
    if (!canManageHolidays) {
      console.warn('❌ Access denied - user cannot create holidays');
      toast.error('You do not have permission to create holidays');
      return;
    }
    
    console.log('✅ Opening holiday modal for creation');
    setEditingHoliday(null);
    setShowHolidayModal(true);
  };

  const handleEditHoliday = (holiday) => {
    console.log('✏️ handleEditHoliday called with holiday:', holiday);
    console.log('🔐 Permission check - canManageHolidays:', canManageHolidays);
    
    if (!canManageHolidays) {
      console.warn('❌ Access denied - user cannot edit holidays');
      toast.error('You do not have permission to edit holidays');
      return;
    }
    
    console.log('✅ Opening holiday modal for editing');
    setEditingHoliday(holiday);
    setShowHolidayModal(true);
  };

  const handleDeleteHoliday = async (holidayId) => {
    console.log('🗑️ handleDeleteHoliday called with holidayId:', holidayId);
    console.log('🔐 Permission check - isAdmin:', isAdmin);
    
    // Only Admin can delete holidays based on permission matrix
    if (!isAdmin) {
      console.warn('❌ Access denied - only admins can delete holidays');
      toast.error('Only administrators can delete holidays');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this holiday?');
    console.log('🤔 User confirmation for holiday deletion:', confirmed);
    
    if (!confirmed) {
      console.log('❌ User cancelled holiday deletion');
      return;
    }

    try {
      console.log('🔄 Calling API to delete holiday...');
      const result = await api.delete(`/admin/holidays/${holidayId}`);
      console.log('📋 Holiday delete result:', result.data);
      
      if (result.data.success) {
        console.log('✅ Holiday deleted successfully');
        toast.success('Holiday deleted successfully');
        fetchCalendarData();
      } else {
        console.error('❌ Holiday delete failed');
        toast.error('Failed to delete holiday');
      }
    } catch (error) {
      console.error('💥 Error deleting holiday:', error);
      toast.error('Failed to delete holiday');
    }
  };

  const handleHolidaySuccess = () => {
    console.log('💾 handleHolidaySuccess called - closing modal and refreshing data');
    setShowHolidayModal(false);
    setEditingHoliday(null);
    fetchCalendarData();
  };

  const handleHolidayClose = () => {
    console.log('❌ handleHolidayClose called - closing modal without saving');
    setShowHolidayModal(false);
    setEditingHoliday(null);
  };

  // Preview calendar functionality
  const handlePreviewCalendar = async () => {
    console.log('👁️ handlePreviewCalendar called');
    try {
      setLoading(true);
      console.log('⏳ Loading state set to true for preview');
      
      // Get current month preview
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      console.log('📅 Generating preview for:', { year, month });
      
      const preview = await smartCalendarService.getSmartMonthlyCalendar({ year, month });
      console.log('📋 Preview result:', preview);
      
      if (preview.success) {
        console.log('✅ Preview generated successfully:', preview.data);
        setPreviewData(preview.data);
        setShowPreview(true);
      } else {
        console.error('❌ Preview generation failed:', preview);
        toast.error('Failed to generate calendar preview');
      }
    } catch (error) {
      console.error('💥 Error generating preview:', error);
      toast.error('Failed to generate calendar preview');
    } finally {
      setLoading(false);
      console.log('✅ Preview loading completed, loading set to false');
    }
  };

  if (loading) {
    console.log('⏳ Component is in loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log('🎨 Rendering SmartCalendarManagement component');
  console.log('📊 Current state:', {
    activeTab,
    workingRulesCount: workingRules.length,
    holidaysCount: holidays.length,
    calendarSummary,
    showWorkingRuleForm,
    showHolidayModal,
    showPreview
  });

  // Debug holiday vs calendar summary discrepancy
  if (calendarSummary && holidays.length > 0) {
    console.log('🔍 Holiday Analysis:');
    console.log('📅 Calendar shows holidays:', calendarSummary.summary?.holidays || 0);
    console.log('🎉 Holidays array count:', holidays.length);
    console.log('📆 Calendar month/year:', calendarSummary.month, calendarSummary.year);
    
    holidays.forEach((holiday, index) => {
      console.log(`🎊 Holiday ${index + 1}:`, {
        name: holiday.name,
        type: holiday.type,
        date: holiday.date,
        recurringDate: holiday.recurringDate,
        category: holiday.category,
        isInCurrentMonth: holiday.type === 'RECURRING' ? 
          holiday.recurringDate?.startsWith(String(calendarSummary.month).padStart(2, '0')) :
          holiday.date?.includes(`${calendarSummary.year}-${String(calendarSummary.month).padStart(2, '0')}`)
      });
    });
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

      {/* Calendar Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex justify-center"><Calendar1Icon/> Calendar Preview - {previewData.year}/{previewData.month}</h2>
                <Button variant="ghost" size="sm" onClick={() => {
                  console.log('❌ Closing calendar preview modal');
                  setShowPreview(false);
                }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Preview Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{previewData.summary.totalDays}</div>
                  <div className="text-sm text-blue-800">Total Days</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{previewData.summary.workingDays}</div>
                  <div className="text-sm text-green-800">Working Days</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{previewData.summary.holidays}</div>
                  <div className="text-sm text-purple-800">Holidays</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{previewData.summary.weekends}</div>
                  <div className="text-sm text-orange-800">Weekends</div>
                </div>
              </div>

              {/* Active Working Rule Info */}
              {previewData.activeWorkingRule && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Active Working Rule
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{previewData.activeWorkingRule.ruleName}</p>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-medium">Working:</span> {previewData.activeWorkingRule.workingDays.map(d => getDayName(d)).join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Weekends:</span> {previewData.activeWorkingRule.weekendDays.map(d => getDayName(d)).join(', ')}
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <Button onClick={() => {
                  console.log('❌ Closing preview from close button');
                  setShowPreview(false);
                }} className="px-8">
                  Close Preview
                </Button>
              </div>
            </div>
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
          <p className="text-sm sm:text-base text-gray-600 mt-1">System rules engine: working days, weekends, holidays, and attendance logic</p>
          
          {/* Architecture explanation */}
      
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <Button onClick={() => {
            console.log('👁️ Preview Calendar button clicked');
            handlePreviewCalendar();
          }} variant="outline" className="w-full sm:w-auto">
            <Calendar className="w-4 h-4 mr-2" />
            Preview Calendar
          </Button>
          <Button onClick={() => {
            console.log('🔄 Refresh button clicked');
            fetchCalendarData();
          }} variant="outline" className="w-full sm:w-auto">
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
      <Tabs value={activeTab} onValueChange={(value) => {
        console.log('📑 Tab changed from', activeTab, 'to', value);
        setActiveTab(value);
      }}>
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
                          {holiday.type === 'RECURRING' ? holiday.recurringDate : new Date(holiday.date).toLocaleDateString()}
                          {holiday.type === 'RECURRING' && ' (Every Year)'}
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
            {canManageWorkingRules && (
              <Button onClick={handleCreateWorkingRule} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Working Rule
              </Button>
            )}
            {!canManageWorkingRules && (
              <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                ℹ️ Only administrators can create or modify working rules
              </div>
            )}
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
                        {/* Warning for active rule editing */}
                        {rule.isActive && canManageWorkingRules && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                            ⚠️ Live Rule
                          </Badge>
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
                      {canManageWorkingRules && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditWorkingRule(rule)}
                          className="flex-1 sm:flex-none"
                        >
                          <Edit className="w-4 h-4 sm:mr-0 mr-1" />
                          <span className="sm:hidden">Edit</span>
                        </Button>
                      )}
                      {canManageWorkingRules && !rule.isDefault && (
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
                      {!canManageWorkingRules && (
                        <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                          View Only
                        </div>
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
                  <p className="text-sm text-gray-600 mb-4">
                    {canManageWorkingRules 
                      ? "Create your first working rule to define working days and weekends."
                      : "No working rules have been configured yet. Contact your administrator to set up working rules."
                    }
                  </p>
                  {canManageWorkingRules && (
                    <Button onClick={handleCreateWorkingRule} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Working Rule
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Holidays Tab */}
        <TabsContent value="holidays" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-base sm:text-lg font-medium">Holiday Management</h3>
            {canManageHolidays && (
              <Button onClick={handleCreateHoliday} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Holiday
              </Button>
            )}
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
                          <span>Date: {new Date(holiday.date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      {canManageHolidays && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditHoliday(holiday)}
                          className="flex-1 sm:flex-none"
                        >
                          <Edit className="w-4 h-4 sm:mr-0 mr-1" />
                          <span className="sm:hidden">Edit</span>
                        </Button>
                      )}
                      {/* Only show delete button to Admin - HR shouldn't see it at all */}
                      {isAdmin && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteHoliday(holiday._id || holiday.id)}
                          className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                        >
                          <Trash2 className="w-4 h-4 sm:mr-0 mr-1" />
                          <span className="sm:hidden">Delete</span>
                        </Button>
                      )}
                      {!canManageHolidays && (
                        <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                          View Only
                        </div>
                      )}
                      {/* Show info for HR users about delete restrictions */}
                      {isHR && !isAdmin && (
                        <div className="text-xs text-amber-600 px-2 py-1 bg-amber-50 border border-amber-200 rounded">
                          Contact Admin to delete
                        </div>
                      )}
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
                  <p className="text-sm text-gray-600 mb-4">
                    {canManageHolidays 
                      ? "Add company holidays to help employees plan their time off."
                      : "No holidays have been configured yet."
                    }
                  </p>
                  {canManageHolidays && (
                    <Button onClick={handleCreateHoliday} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Holiday
                    </Button>
                  )}
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