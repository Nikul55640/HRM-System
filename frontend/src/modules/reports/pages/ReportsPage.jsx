import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Badge } from '../../../shared/ui/badge';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Users, 
  Clock, 
  DollarSign,
  FileText,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../../core/utils/essHelpers';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('this_month');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockReports = [
        {
          id: 1,
          name: 'Monthly Attendance Report',
          category: 'attendance',
          description: 'Detailed attendance summary for all employees',
          lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'ready',
          fileSize: '2.4 MB',
          recordCount: 1250,
          trend: 'up',
          trendValue: '+5.2%'
        },
        {
          id: 2,
          name: 'Payroll Summary',
          category: 'payroll',
          description: 'Monthly payroll breakdown by department',
          lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: 'ready',
          fileSize: '1.8 MB',
          recordCount: 450,
          trend: 'up',
          trendValue: '+2.1%'
        },
        {
          id: 3,
          name: 'Leave Analytics',
          category: 'leave',
          description: 'Leave patterns and utilization analysis',
          lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'ready',
          fileSize: '950 KB',
          recordCount: 320,
          trend: 'down',
          trendValue: '-1.8%'
        },
        {
          id: 4,
          name: 'Employee Performance',
          category: 'performance',
          description: 'Performance metrics and KPI tracking',
          lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'generating',
          fileSize: null,
          recordCount: null,
          trend: null,
          trendValue: null
        },
        {
          id: 5,
          name: 'Department Headcount',
          category: 'hr',
          description: 'Employee distribution across departments',
          lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'ready',
          fileSize: '650 KB',
          recordCount: 180,
          trend: 'up',
          trendValue: '+8.5%'
        },
        {
          id: 6,
          name: 'Overtime Analysis',
          category: 'attendance',
          description: 'Overtime hours and cost analysis',
          lastGenerated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          status: 'error',
          fileSize: null,
          recordCount: null,
          trend: null,
          trendValue: null
        }
      ];
      
      setReports(mockReports);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const reportCategories = [
    { value: 'all', label: 'All Categories', icon: <FileText className="w-4 h-4" /> },
    { value: 'attendance', label: 'Attendance', icon: <Clock className="w-4 h-4" /> },
    { value: 'payroll', label: 'Payroll', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'leave', label: 'Leave', icon: <Calendar className="w-4 h-4" /> },
    { value: 'hr', label: 'HR Analytics', icon: <Users className="w-4 h-4" /> },
    { value: 'performance', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  const getCategoryIcon = (category) => {
    const categoryData = reportCategories.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : <FileText className="w-4 h-4" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case 'generating':
        return <Badge className="bg-yellow-100 text-yellow-800">Generating</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleDownload = async (reportId) => {
    try {
      // API call would go here
      toast.success('Report download started');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const handleGenerate = async (reportId) => {
    try {
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: 'generating' }
          : report
      ));
      
      // API call would go here
      toast.success('Report generation started');
      
      // Simulate generation completion
      setTimeout(() => {
        setReports(reports.map(report => 
          report.id === reportId 
            ? { 
                ...report, 
                status: 'ready', 
                lastGenerated: new Date(),
                fileSize: '1.2 MB',
                recordCount: Math.floor(Math.random() * 1000) + 100
              }
            : report
        ));
        toast.success('Report generated successfully');
      }, 3000);
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const quickStats = [
    {
      title: 'Total Reports',
      value: reports.length,
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      change: '+12%'
    },
    {
      title: 'Ready to Download',
      value: reports.filter(r => r.status === 'ready').length,
      icon: <Download className="w-5 h-5 text-green-600" />,
      change: '+8%'
    },
    {
      title: 'Generating',
      value: reports.filter(r => r.status === 'generating').length,
      icon: <RefreshCw className="w-5 h-5 text-yellow-600" />,
      change: '0%'
    },
    {
      title: 'Total Records',
      value: reports.reduce((sum, r) => sum + (r.recordCount || 0), 0).toLocaleString(),
      icon: <BarChart3 className="w-5 h-5 text-purple-600" />,
      change: '+15%'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate and download comprehensive reports for your organization
          </p>
        </div>
        
        <Button onClick={fetchReports}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="flex flex-col items-end">
                  {stat.icon}
                  <span className="text-xs text-green-600 mt-1">{stat.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[150px]"
            >
              {reportCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Date Range */}
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[150px]"
            >
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500">
                {searchTerm || filterCategory !== 'all'
                  ? 'Try adjusting your filters to see more reports.'
                  : 'No reports are available at this time.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="p-3 bg-gray-100 rounded-lg">
                      {getCategoryIcon(report.category)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {report.name}
                        </h3>
                        {getStatusBadge(report.status)}
                      </div>

                      <p className="text-gray-600 mb-3">{report.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>Last generated: {formatDate(report.lastGenerated)}</span>
                        {report.fileSize && (
                          <span>Size: {report.fileSize}</span>
                        )}
                        {report.recordCount && (
                          <span>Records: {report.recordCount.toLocaleString()}</span>
                        )}
                        {report.trend && (
                          <span className={`flex items-center gap-1 ${
                            report.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {report.trend === 'up' ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {report.trendValue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {report.status === 'ready' && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(report.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </>
                    )}
                    
                    {report.status === 'generating' && (
                      <Button variant="ghost" size="sm" disabled>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </Button>
                    )}
                    
                    {(report.status === 'error' || report.status === 'ready') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleGenerate(report.id)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {report.status === 'error' ? 'Retry' : 'Regenerate'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportsPage;