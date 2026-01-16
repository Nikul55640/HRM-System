import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Calendar, Settings, Grid, List, BarChart3, Users, Plus , TabletSmartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import UnifiedCalendarView from '../components/UnifiedCalendarView';

const CalendarManagement = () => {
  const [viewMode, setViewMode] = useState('list');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first responsive container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Header Section - Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            {/* Title and Description */}
            <div className="flex-1">
              <h4 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Calendar Management
              </h4>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl">
                Manage company events, holidays, meetings, and important dates across your organization
              </p>
            </div>

            {/* Action Buttons - Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {/* View Toggle - Mobile friendly */}
              <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1 sm:flex-none"
                >
                  <List className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">List</span>
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="flex-1 sm:flex-none"
                >
                  <Grid className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Calendar</span>
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* Quick Stats Cards - Compact Design */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Total Events
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">24</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    This Month
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">8</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-full">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Holidays
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">12</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-red-100 rounded-full">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Attendees
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900">156</p>
                </div>
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-full">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar - Compact */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  Quick Actions
                </h3>
                <p className="text-xs text-gray-600">
                  Manage your calendar efficiently
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
                
                <Link to="/admin/calendar/smart" className="contents">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Smart Calendar</span>
                    <span className="sm:hidden">Smart</span>
                  </Button>
                </Link>
                
                <Link to="/admin/calendar/calendarific" className="contents">
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Holiday Sync</span>
                    <span className="sm:hidden">Sync</span>
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Calendar Component - Fully Responsive */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <UnifiedCalendarView 
            viewMode={viewMode} 
            showManagementFeatures={true} 
          />
        </div>

        {/* Mobile-specific Help Section */}
        <div className="mt-4 sm:mt-6 block sm:hidden">
          <Card>
            <CardContent className="p-3">
              <h3 className="text-sm font-semibold flex justify-center  text-gray-900 mb-2">
                <TabletSmartphone /> Mobile Tips
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Tap calendar days to add events</li>
                <li>• Use list view for easier browsing</li>
                <li>• Swipe left/right to navigate months</li>
                <li>• Long press events for quick actions</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Desktop-specific Features */}
        <div className="mt-4 sm:mt-6 hidden lg:block">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Activity
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Team meeting scheduled</span>
                    <span className="text-gray-400 ml-auto text-xs">2h ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Holiday added</span>
                    <span className="text-gray-400 ml-auto text-xs">1d ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Training session updated</span>
                    <span className="text-gray-400 ml-auto text-xs">2d ago</span>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Upcoming Events */}
            {/* <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="border-l-4 border-blue-500 pl-2">
                    <p className="font-medium text-sm">All Hands Meeting</p>
                    <p className="text-xs text-gray-600">Tomorrow, 10:00 AM</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-2">
                    <p className="font-medium text-sm">Team Building</p>
                    <p className="text-xs text-gray-600">Friday, 2:00 PM</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-2">
                    <p className="font-medium text-sm">Training Workshop</p>
                    <p className="text-xs text-gray-600">Next Monday, 9:00 AM</p>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Calendar Stats
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Calendar Insights</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Events This Month</span>
                      <span className="font-medium">8/12</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Attendance Rate</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Engagement</span>
                      <span className="font-medium">High</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarManagement;