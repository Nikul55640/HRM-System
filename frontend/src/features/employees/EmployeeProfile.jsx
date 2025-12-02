import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchEmployeeById } from '../../store/thunks/employeeThunks';
import { clearCurrentEmployee } from '../../store/slices/employeeSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import OverviewTab from '../../components/employees/profile-tabs/OverviewTab';
import DocumentsTab from '../../features/ess/documents/DocumentsTab';
import ActivityTab from '../../components/employees/profile-tabs/ActivityTab';


const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentEmployee, loading, error } = useSelector((state) => state.employee);
  const { user, hasRole, canAccessDepartment, isHRManager } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    loadEmployee();
    return () => {
      dispatch(clearCurrentEmployee());
    };
  }, [id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const loadEmployee = async () => {
    try {
      const employee = await dispatch(fetchEmployeeById(id)).unwrap();
      
      // Check if HR Manager has access to this employee's department
      if (isHRManager() && employee?.jobInfo?.department) {
        const departmentId = employee.jobInfo.department._id || employee.jobInfo.department;
        if (!canAccessDepartment(departmentId)) {
          setAccessDenied(true);
          toast.error('You do not have access to this employee');
          navigate('/employees');
          return;
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to load employee';
      toast.error(errorMsg);
      
      // If it's a 403 error, show access denied
      if (err.response?.status === 403) {
        setAccessDenied(true);
      }
      navigate('/employees');
    }
  };

  const canEdit = () => {
    if (!currentEmployee) return false;
    
    // Check role-based permissions
    const hasEditRole = hasRole(['SuperAdmin', 'HR Administrator', 'HR Manager']);
    if (!hasEditRole) return false;
    
    // For HR Managers, check department access
    if (isHRManager() && currentEmployee?.jobInfo?.department) {
      const departmentId = currentEmployee.jobInfo.department._id || currentEmployee.jobInfo.department;
      return canAccessDepartment(departmentId);
    }
    
    return true;
  };

  const handleEdit = () => {
    navigate(`/employees/${id}/edit`);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      'On Leave': 'bg-yellow-100 text-yellow-800',
      Terminated: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading || !currentEmployee) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'documents', label: 'Documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'activity', label: 'Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Profile Photo */}
            {currentEmployee.personalInfo?.profilePhoto ? (
              <img
                src={currentEmployee.personalInfo.profilePhoto}
                alt={`${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-semibold">
                {getInitials(currentEmployee.personalInfo?.firstName, currentEmployee.personalInfo?.lastName)}
              </div>
            )}
            
            {/* Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {currentEmployee.personalInfo?.firstName} {currentEmployee.personalInfo?.lastName}
              </h1>
              <p className="text-lg text-gray-600 mt-1">{currentEmployee.jobInfo?.jobTitle}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(currentEmployee.status)}`}>
                  {currentEmployee.status}
                </span>
                {currentEmployee.employeeId && (
                  <span className="text-sm text-gray-600">
                    ID: <span className="font-medium">{currentEmployee.employeeId}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/employees')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to List
            </button>
            {canEdit() && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab employee={currentEmployee} />}
          {activeTab === 'documents' && <DocumentsTab employeeId={id} canManage={canEdit()} />}
          {activeTab === 'activity' && <ActivityTab employeeId={id} />}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
