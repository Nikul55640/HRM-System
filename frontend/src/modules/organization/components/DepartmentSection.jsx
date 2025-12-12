import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import useOrganizationStore from "../../../stores/useOrganizationStore";
import { LoadingSpinner } from "../../../shared/components";
import DepartmentModal from "./DepartmentModal";
import DepartmentTable from "./DepartmentTable";

const DepartmentSection = () => {
  const {
    departments,
    loading,
    error,
    pagination,
    fetchDepartments,
    deleteDepartment,
    createDepartment,
    updateDepartment,
    clearErrors
  } = useOrganizationStore();

  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [filters] = useState({
    search: "",
    status: "all"
  });

  const loadDepartments = useCallback(async (params = {}) => {
    try {
      await fetchDepartments({
        ...filters,
        ...params,
        page: pagination.page,
        limit: pagination.limit
      });
    } catch (error) {
      // Error already handled in store
    }
  }, [fetchDepartments, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    loadDepartments();
    
    return () => {
      clearErrors();
    };
  }, [clearErrors, loadDepartments]);

  useEffect(() => {
    if (error.departments) {
      toast.error(error.departments);
    }
  }, [error.departments]);

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setShowModal(true);
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }

    try {
      await deleteDepartment(departmentId);
      loadDepartments();
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleModalSubmit = async (departmentData) => {
    if (selectedDepartment) {
      await updateDepartment(selectedDepartment._id, departmentData);
    } else {
      await createDepartment(departmentData);
    }
    
    setShowModal(false);
    setSelectedDepartment(null);
    loadDepartments();
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDepartment(null);
  };

  if (loading.departments && departments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Department Management</h2>
          <p className="text-gray-600 mt-1">
            Manage organizational departments and their hierarchy
          </p>
        </div>
        
        <button
          onClick={handleCreateDepartment}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Department
        </button>
      </div>

      {/* Department Table */}
      <div className="bg-white rounded-lg shadow">
        <DepartmentTable
          departments={departments}
          loading={loading.departments}
          pagination={pagination}
          onEdit={handleEditDepartment}
          onDelete={handleDeleteDepartment}
        />
      </div>

      {/* Department Modal */}
      {showModal && (
        <DepartmentModal
          department={selectedDepartment}
          departments={departments}
          onSubmit={handleModalSubmit}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default DepartmentSection;