import React, { useState } from 'react';
import apiConnectionTest from '../utils/apiConnectionTest';

const APITestRunner = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await apiConnectionTest.testAllEmployeeAPIs();
      setTestResults(results);
    } catch (error) {
      console.error('Test runner error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (!testResults) return;
    
    const report = apiConnectionTest.generateReport(testResults);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-test-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">API Connection Test Runner</h2>
        
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mr-4"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          {testResults && (
            <button
              onClick={downloadReport}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Download Report
            </button>
          )}
        </div>

        {testResults && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Test Summary</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{testResults.totalTests}</div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{testResults.passed}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{testResults.failed}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {((testResults.passed / testResults.totalTests) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Test Results</h3>
              {testResults.tests.map((test, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${
                    test.status === 'PASS'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{test.name}</div>
                      {test.error && (
                        <div className="text-sm text-red-600 mt-1">{test.error}</div>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        test.status === 'PASS'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITestRunner;