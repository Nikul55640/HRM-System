import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import calendarViewService from '../services/calendarViewService';
import useAuth from '../../../core/hooks/useAuth';

const CalendarTestPage = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState({
    monthlyData: { status: 'pending', data: null, error: null },
    dailyData: { status: 'pending', data: null, error: null }
  });
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = { ...testResults };

    try {
      // Test 1: Monthly Calendar Data
      console.log('Testing monthly calendar data...');
      results.monthlyData.status = 'loading';
      setTestResults({ ...results });

      const monthlyData = await calendarViewService.getMonthlyCalendarData({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        employeeId: user?.id
      });

      results.monthlyData = {
        status: 'success',
        data: monthlyData,
        error: null
      };

      console.log('Monthly data test passed:', monthlyData);
    } catch (error) {
      console.error('Monthly data test failed:', error);
      results.monthlyData = {
        status: 'error',
        data: null,
        error: error.message
      };
    }

    try {
      // Test 2: Daily Calendar Data
      console.log('Testing daily calendar data...');
      results.dailyData.status = 'loading';
      setTestResults({ ...results });

      const today = new Date().toISOString().split('T')[0];
      const dailyData = await calendarViewService.getDailyCalendarData({
        date: today,
        employeeId: user?.id
      });

      results.dailyData = {
        status: 'success',
        data: dailyData,
        error: null
      };

      console.log('Daily data test passed:', dailyData);
    } catch (error) {
      console.error('Daily data test failed:', error);
      results.dailyData = {
        status: 'error',
        data: null,
        error: error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      runTests();
    }
  }, [user?.id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'loading':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar API Test</h1>
              <p className="text-sm text-gray-600">
                Testing calendar service endpoints and data flow
              </p>
            </div>
          </div>
          
          <button
            onClick={runTests}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>

        {/* Test Results */}
        <div className="space-y-6">
          {/* Monthly Data Test */}
          <div className={`border rounded-lg p-6 ${getStatusColor(testResults.monthlyData.status)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(testResults.monthlyData.status)}
                <h3 className="text-lg font-semibold text-gray-900">Monthly Calendar Data</h3>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                testResults.monthlyData.status === 'success' ? 'bg-green-100 text-green-800' :
                testResults.monthlyData.status === 'error' ? 'bg-red-100 text-red-800' :
                testResults.monthlyData.status === 'loading' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {testResults.monthlyData.status}
              </span>
            </div>

            {testResults.monthlyData.error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{testResults.monthlyData.error}</p>
              </div>
            )}

            {testResults.monthlyData.data && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {testResults.monthlyData.data.summary?.totalEvents || 0}
                    </div>
                    <div className="text-sm text-gray-600">Events</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-red-600">
                      {testResults.monthlyData.data.summary?.totalHolidays || 0}
                    </div>
                    <div className="text-sm text-gray-600">Holidays</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-orange-600">
                      {testResults.monthlyData.data.summary?.totalLeaves || 0}
                    </div>
                    <div className="text-sm text-gray-600">Leaves</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-pink-600">
                      {testResults.monthlyData.data.summary?.totalBirthdays || 0}
                    </div>
                    <div className="text-sm text-gray-600">Birthdays</div>
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    View Raw Data
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded-md text-xs overflow-auto max-h-64">
                    {JSON.stringify(testResults.monthlyData.data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Daily Data Test */}
          <div className={`border rounded-lg p-6 ${getStatusColor(testResults.dailyData.status)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(testResults.dailyData.status)}
                <h3 className="text-lg font-semibold text-gray-900">Daily Calendar Data</h3>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                testResults.dailyData.status === 'success' ? 'bg-green-100 text-green-800' :
                testResults.dailyData.status === 'error' ? 'bg-red-100 text-red-800' :
                testResults.dailyData.status === 'loading' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {testResults.dailyData.status}
              </span>
            </div>

            {testResults.dailyData.error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{testResults.dailyData.error}</p>
              </div>
            )}

            {testResults.dailyData.data && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {testResults.dailyData.data.events?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Events</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-red-600">
                      {testResults.dailyData.data.holidays?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Holidays</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-orange-600">
                      {testResults.dailyData.data.leaves?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Leaves</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">
                      {testResults.dailyData.data.attendance?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Attendance</div>
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    View Raw Data
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded-md text-xs overflow-auto max-h-64">
                    {JSON.stringify(testResults.dailyData.data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current User Context</h4>
          <div className="text-sm text-gray-600">
            <p><strong>User ID:</strong> {user?.id || 'Not available'}</p>
            <p><strong>Employee ID:</strong> {user?.employeeId || 'Not available'}</p>
            <p><strong>Role:</strong> {user?.role || 'Not available'}</p>
            <p><strong>Name:</strong> {user?.name || 'Not available'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTestPage;