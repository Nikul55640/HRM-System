import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Clock, Calendar, Users, BarChart2 } from 'lucide-react';
import useAttendanceStore from '../../../stores/useAttendanceStore';
import useAuthStore from '../../../stores/useAuthStore';
import MyAttendance from '../components/MyAttendance';
import ManageAttendance from '../components/ManageAttendance';

const AttendancePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { fetchTodayStatus } = useAttendanceStore();
  
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  
  // Set default tab based on URL or user role
  const defaultTab = location.hash.replace('#', '') || (isAdmin ? 'overview' : 'my-attendance');
  
  useEffect(() => {
    // Fetch today's status on component mount
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  const handleTabChange = (value) => {
    navigate(`#${value}`, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="ml-auto">
            <Calendar className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue={defaultTab} 
        className="space-y-4"
        onValueChange={handleTabChange}
      >
        <TabsList>
          {isAdmin && (
            <TabsTrigger value="overview">
              <BarChart2 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
          )}
          <TabsTrigger value="my-attendance">
            <Clock className="mr-2 h-4 w-4" />
            My Attendance
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="manage">
              <Users className="mr-2 h-4 w-4" />
              Manage Attendance
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+2 from yesterday</p>
              </CardContent>
            </Card>
            {/* Add more stat cards */}
          </div>
        </TabsContent>

        <TabsContent value="my-attendance">
          <MyAttendance />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="manage">
            <ManageAttendance />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AttendancePage;
