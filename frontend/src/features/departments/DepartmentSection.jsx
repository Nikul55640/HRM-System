import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import configService from '../../services/configService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DepartmentModal from '../../components/ui/DepartmentModal';  
const DepartmentSection = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await configService.getDepartments();
      console.log('Departments API response:', response); // Debug log
      
      // The API returns { success: true, data: { departments: [...], pagination: {...} } }
      if (response?.success && response?.data?.departments && Array.isArray(response.data.departments)) {
        setDepartments(response.data.departments);
        console.log(`✅ Loaded ${response.data.departments.length} departments`);
      } else if (response?.data && Array.isArray(response.data)) {
        // Fallback for direct array response
        setDepartments(response.data);
        console.log(`✅ Loaded ${response.data.length} departments (fallback 1)`);
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        setDepartments(response);
        console.log(`✅ Loaded ${response.length} departments (fallback 2)`);
      } else {
        console.warn('❌ Unexpected departments response structure:', response);
        setError('Unexpected response format from server');
        setDepartments([]);
      }
    } catch (error) {
      console.error('❌ Error loading departments:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to load departments';
      setError(errorMessage);
      toast.error(errorMessage);
      setDepartments([]); // Ensure we set an empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setShowModal(true);
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const handleDelete = async (department) => {
    if (!window.confirm(`Are you sure you want to delete the department "${department.name}"?`)) {
      return;
    }

    try {
      await configService.deleteDepartment(department._id);
      toast.success('Department deleted successfully');
      loadDepartments();
    } catch (error) {
      toast.error(error.message || 'Failed to delete department');
    }
  };

  const handleModalSubmit = async (departmentData) => {
    setIsSubmitting(true);
    try {
      if (selectedDepartment) {
        await configService.updateDepartment(selectedDepartment._id, departmentData);
        toast.success('Department updated successfully');
      } else {
        await configService.createDepartment(departmentData);
        toast.success('Department created successfully');
      }
      setShowModal(false);
      loadDepartments();
    } catch (error) {
      toast.error(error.message || 'Failed to save department');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDepartment(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading departments</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={loadDepartments}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Department Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage organizational departments and hierarchy</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Department
        </button>
      </div>

      {/* Departments List */}
      {!Array.isArray(departments) || departments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No departments</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new department.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(departments) && departments.map((department) => (
            <div
              key={department._id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{department.name}</h3>
                  {department.code && (
                    <p className="text-sm text-gray-500">Code: {department.code}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  department.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {department.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {department.description && (
                <p className="text-sm text-gray-600 mb-3">{department.description}</p>
              )}

              {department.location && (
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {department.location}
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(department)}
                  className="flex-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(department)}
                  className="flex-1 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Department Modal */}
      {showModal && (
        <DepartmentModal
          department={selectedDepartment}
          departments={departments}
          onSubmit={handleModalSubmit}
          onClose={handleModalClose}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default DepartmentSection;
