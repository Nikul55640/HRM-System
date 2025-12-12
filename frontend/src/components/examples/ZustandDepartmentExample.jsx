import { useEffect } from 'react';
import useDepartmentStore from '../../stores/useDepartmentStore';
import useUIStore from '../../stores/useUIStore';
import { LoadingSpinner } from '../../shared/components';

const ZustandDepartmentExample = () => {
  // Zustand stores - much simpler than Redux!
  const {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    deleteDepartment,
    setFilters,
    filters
  } = useDepartmentStore();
  
  const {
    openModal,
    closeModal,
    modals,
    addNotification
  } = useUIStore();

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleCreateDepartment = async (departmentData) => {
    try {
      await createDepartment(departmentData);
      closeModal('departmentModal');
      addNotification({
        type: 'success',
        message: 'Department created successfully!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to create department'
      });
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteDepartment(id);
        addNotification({
          type: 'success',
          message: 'Department deleted successfully!'
        });
      } catch (error) {
        // Error already handled in store
      }
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters({ search: searchTerm });
    fetchDepartments();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments (Zustand)</h1>
        <button
          onClick={() => openModal('departmentModal')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Department
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search departments..."
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Departments List */}
      <div className="grid gap-4">
        {departments.map((department) => (
          <div key={department._id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{department.name}</h3>
                <p className="text-gray-600">{department.description}</p>
                <p className="text-sm text-gray-500">
                  Employees: {department.employeeCount || 0}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Set current department and open edit modal
                    openModal('departmentModal');
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteDepartment(department._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modals.departmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Department</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleCreateDepartment({
                  name: formData.get('name'),
                  description: formData.get('description')
                });
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => closeModal('departmentModal')}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZustandDepartmentExample;