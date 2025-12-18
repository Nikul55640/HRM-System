import { useState } from 'react';
import { toast } from 'react-toastify';
import employeeDashboardService from '../../../../services/employeeDashboardService';
import attendanceService from '../../../attendance/services/attendanceService';
import leaveService from '../../../../core/services/leaveService';

const APITester = () => {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);

  const testAPI = async (name, apiCall) => {
    try {
      console.log(`Testing ${name}...`);
      const result = await apiCall();
      setResults(prev => ({
        ...prev,
        [name]: { success: true, data: result }
      }));
      console.log(`✅ ${name} success:`, result);
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: { success: false, error: error.message }
      }));
      console.error(`❌ ${name} failed:`, error);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults({});

    await Promise.all([
      testAPI('Dashboard Data', () => employeeDashboardService.getDashboardData()),
      testAPI('Profile Summary', () => employeeDashboardService.getProfileSummary()),
      testAPI('Attendance Summary', () => employeeDashboardService.getAttendanceSummary()),
      testAPI('Leave Balance', () => leaveService.getMyLeaveBalance()),
      testAPI('Leave History', () => leaveService.getMyLeaveHistory()),
      testAPI('Today Attendance', () => attendanceService.getTodayStatus()),
      testAPI('My Attendance', () => attendanceService.getMyAttendance()),
    ]);

    setTesting(false);
    toast.success('API tests completed! Check console for details.');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">API Endpoint Tester</h3>
      
      <button
        onClick={runAllTests}
        disabled={testing}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {testing ? 'Testing APIs...' : 'Test All APIs'}
      </button>

      <div className="mt-6 space-y-3">
        {Object.entries(results).map(([name, result]) => (
          <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">{name}</span>
            <span className={`px-2 py-1 rounded text-sm ${
              result.success 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {result.success ? '✅ Success' : '❌ Failed'}
            </span>
          </div>
        ))}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Results Summary:</h4>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default APITester;