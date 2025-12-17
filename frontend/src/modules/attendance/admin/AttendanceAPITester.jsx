import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { 
  Play, 
  Square, 
  Coffee, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Activity 
} from 'lucide-react';
import attendanceService from '../services/attendanceService';
import api from '../../../core/api/api';

const AttendanceAPITester = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentBreak, setCurrentBreak] = useState(null);
  const [liveData, setLiveData] = useState(null);

  const updateResult = (testName, success, message, data = null) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: { success, message, data, timestamp: new Date() }
    }));
  };

  const testLegacyClockIn = async () => {
    try {
      setLoading(true);
      const result = await attendanceService.clockIn({
        location: { address: 'Test Office' },
        notes: 'API Test Clock In'
      });
      updateResult('legacyClockIn', true, 'Legacy clock-in successful', result);
    } catch (error) {
      updateResult('legacyClockIn', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testLegacyClockOut = async () => {
    try {
      setLoading(true);
      const result = await attendanceService.clockOut({
        location: { address: 'Test Office' },
        notes: 'API Test Clock Out'
      });
      updateResult('legacyClockOut', true, 'Legacy clock-out successful', result);
    } catch (error) {
      updateResult('legacyClockOut', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSessionStart = async () => {
    try {
      setLoading(true);
      const response = await api.post('/employee/attendance/session/start', {
        workLocation: 'office',
        locationDetails: 'Main Office - Floor 3'
      });
      
      if (response.data.success) {
        setCurrentSession(response.data.data.session);
        updateResult('sessionStart', true, 'Session started successfully', response.data);
      } else {
        updateResult('sessionStart', false, response.data.message);
      }
    } catch (error) {
      updateResult('sessionStart', false, error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSessionEnd = async () => {
    try {
      setLoading(true);
      const response = await api.post('/employee/attendance/session/end');
      
      if (response.data.success) {
        setCurrentSession(null);
        updateResult('sessionEnd', true, 'Session ended successfully', response.data);
      } else {
        updateResult('sessionEnd', false, response.data.message);
      }
    } catch (error) {
      updateResult('sessionEnd', false, error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const testBreakStart = async () => {
    try {
      setLoading(true);
      const response = await api.post('/employee/attendance/break/start', {
        breakType: 'lunch'
      });
      
      if (response.data.success) {
        setCurrentBreak(response.data.data.break);
        updateResult('breakStart', true, 'Break started successfully', response.data);
      } else {
        updateResult('breakStart', false, response.data.message);
      }
    } catch (error) {
      updateResult('breakStart', false, error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const testBreakEnd = async () => {
    try {
      setLoading(true);
      const response = await api.post('/employee/attendance/break/end');
      
      if (response.data.success) {
        setCurrentBreak(null);
        updateResult('breakEnd', true, 'Break ended successfully', response.data);
      } else {
        updateResult('breakEnd', false, response.data.message);
      }
    } catch (error) {
      updateResult('breakEnd', false, error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const testLiveAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/attendance/live');
      
      if (response.data.success) {
        setLiveData(response.data);
        updateResult('liveAttendance', true, `Found ${response.data.data.length} active employees`, response.data);
      } else {
        updateResult('liveAttendance', false, response.data.message);
      }
    } catch (error) {
      updateResult('liveAttendance', false, error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const testGetAttendanceRecords = async () => {
    try {
      setLoading(true);
      const result = await attendanceService.getMyAttendance();
      updateResult('getRecords', true, `Retrieved ${result.data?.length || 0} records`, result);
    } catch (error) {
      updateResult('getRecords', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testGetSummary = async () => {
    try {
      setLoading(true);
      const result = await attendanceService.getMyAttendanceSummary(
        new Date().getFullYear(),
        new Date().getMonth() + 1
      );
      updateResult('getSummary', true, 'Summary retrieved successfully', result);
    } catch (error) {
      updateResult('getSummary', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults({});
    setLoading(true);
    
    try {
      // Test in sequence to avoid conflicts
      await testGetAttendanceRecords();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testGetSummary();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testSessionStart();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await testBreakStart();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await testBreakEnd();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testSessionEnd();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testLiveAttendance();
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const ResultBadge = ({ result }) => {
    if (!result) return <Badge variant="outline">Not tested</Badge>;
    
    return (
      <Badge variant={result.success ? "success" : "destructive"} className="ml-2">
        {result.success ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
        {result.success ? 'Pass' : 'Fail'}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Attendance API Tester
          </CardTitle>
          <p className="text-sm text-gray-600">
            Test all attendance API endpoints to verify functionality
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button 
              onClick={() => setTestResults({})} 
              variant="outline"
            >
              Clear Results
            </Button>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Session Status</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {currentSession ? `Active (${currentSession.sessionId})` : 'No active session'}
              </p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-orange-500" />
                <span className="font-medium">Break Status</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {currentBreak ? `On break (${currentBreak.breakId})` : 'Not on break'}
              </p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span className="font-medium">Live Data</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {liveData ? `${liveData.data.length} active employees` : 'Not loaded'}
              </p>
            </Card>
          </div>

          {/* Test Buttons and Results */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Individual Tests</h3>
            
            {/* Data Retrieval Tests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Get Attendance Records</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={testGetAttendanceRecords} disabled={loading}>
                    Test
                  </Button>
                  <ResultBadge result={testResults.getRecords} />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Get Monthly Summary</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={testGetSummary} disabled={loading}>
                    Test
                  </Button>
                  <ResultBadge result={testResults.getSummary} />
                </div>
              </div>
            </div>

            {/* Legacy Attendance Tests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Legacy Clock In</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={testLegacyClockIn} disabled={loading}>
                    <Play className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                  <ResultBadge result={testResults.legacyClockIn} />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Legacy Clock Out</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={testLegacyClockOut} disabled={loading}>
                    <Square className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                  <ResultBadge result={testResults.legacyClockOut} />
                </div>
              </div>
            </div>

            {/* Session Management Tests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Start Session</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={testSessionStart} disabled={loading}>
                    <Play className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                  <ResultBadge result={testResults.sessionStart} />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <span>End Session</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={testSessionEnd} disabled={loading}>
                    <Square className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                  <ResultBadge result={testResults.sessionEnd} />
                </div>
              </div>
            </div>

            {/* Break Management Tests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Start Break</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={testBreakStart} disabled={loading}>
                    <Coffee className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                  <ResultBadge result={testResults.breakStart} />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <span>End Break</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={testBreakEnd} disabled={loading}>
                    <Play className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                  <ResultBadge result={testResults.breakEnd} />
                </div>
              </div>
            </div>

            {/* Admin Tests */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Live Attendance (Admin)</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={testLiveAttendance} disabled={loading}>
                    <Users className="w-3 h-3 mr-1" />
                    Test
                  </Button>
                  <ResultBadge result={testResults.liveAttendance} />
                </div>
              </div>
            </div>
          </div>

          {/* Test Results Details */}
          {Object.keys(testResults).length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Test Results Details</h3>
              <div className="space-y-2">
                {Object.entries(testResults).map(([testName, result]) => (
                  <div key={testName} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{testName}</span>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer">
                          View Response Data
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceAPITester;