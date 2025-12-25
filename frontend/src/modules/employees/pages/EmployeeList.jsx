import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import useEmployeeStore from "../../../stores/useEmployeeStore";
import { Button } from "../../../shared/ui/button";
import { Card, CardContent } from "../../../shared/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";

import { LayoutGrid, List, Plus, Users } from "lucide-react";
import {
  LoadingSpinner,
  Pagination,
  ScopeIndicator,
} from "../../../shared/components";

import EmployeeCard from "../components/EmployeeCard";
import EmployeeTable from "../components/EmployeeTable";
import DeleteConfirmModal from "../../../shared/ui/DeleteConfirmModal";

import useAuth from "../../../core/hooks/useAuth";
import { usePermissions } from "../../../core/hooks";
import { MODULES } from "../../../core/utils/rolePermissions";
import { PermissionGate } from "../../../core/guards";



const EmployeeList = () => {
  const navigate = useNavigate();

  const {
    employees = [],
    pagination = { page: 1, totalPages: 1, total: 0, limit: 10 },
    loading,
    error,
    fetchEmployees,
    deleteEmployee,
    clearError,
    setPagination,
  } = useEmployeeStore();

  console.log("📊 [EmployeeList] Current employees:", employees);
  console.log("📊 [EmployeeList] Pagination:", pagination);

  const { user, isHRManager } = useAuth();
  const { can } = usePermissions();

  const [viewMode, setViewMode] = useState("card");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedJobTitle, setSelectedJobTitle] = useState("all");



  /* ------------------------------------------------------
    ✅ FIXED — loadEmployees declared BEFORE useEffect
  ------------------------------------------------------ */
  const loadEmployees = useCallback(async () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
    };

    if (selectedDepartment !== "all") {
      params.department = selectedDepartment;
    }

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (selectedStatus !== "all") {
      params.status = selectedStatus;
    }

    if (selectedJobTitle !== "all") {
      params.jobTitle = selectedJobTitle;
    }

    try {
      await fetchEmployees(params);
    } catch (error) {
      // handled in store
    }
  }, [pagination.page, pagination.limit, selectedDepartment, searchTerm, selectedStatus, selectedJobTitle, fetchEmployees]);



  /* ------------------------------------------------------
    🚀 Fetch employees whenever filters/pagination change
  ------------------------------------------------------ */
  useEffect(() => {
    console.log("🔄 [EmployeeList] useEffect triggered, calling loadEmployees");
    loadEmployees();
  }, [loadEmployees]);



  /* ------------------------------------------------------
    ❗ Handle error from store
  ------------------------------------------------------ */
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);



  const handlePageChange = (page) => {
    setPagination({ page });
  };

  const handleView = (employeeId) => navigate(`/employees/${employeeId}`);
  const handleEdit = (id) => navigate(`/employees/${id}/edit`);

  const handleDeleteClick = (emp) => {
    setSelectedEmployee(emp);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      await deleteEmployee(selectedEmployee._id);
      setShowDeleteModal(false);
      setSelectedEmployee(null);

      loadEmployees();
    } catch (err) {
      // Already handled in store
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateNew = () => navigate("/employees/new");

  const canManageEmployees = () =>
    can.doAny([
      MODULES.EMPLOYEE.UPDATE_ANY,
      MODULES.EMPLOYEE.UPDATE_OWN,
      MODULES.EMPLOYEE.DELETE,
    ]);



  const assignedDepartments = user?.assignedDepartments || [];
  const isScoped = isHRManager() && assignedDepartments.length > 0;



  /* ------------------------------------------------------
    ⏳ Loading state
  ------------------------------------------------------ */
  if (loading && employees.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }



  return (
    <div className="container mx-auto px-4 py-6">

      {/* Scope Indicator */}
      {isScoped && (
        <ScopeIndicator
          departmentCount={assignedDepartments.length}
          message={`You are viewing employees from your assigned department${
            assignedDepartments.length > 1 ? "s" : ""
          }.`}
          className="mb-4"
        />
      )}

      {/* Filters Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination({ page: 1 });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department Filter */}
          {isScoped && assignedDepartments.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <Select
                value={selectedDepartment}
                onValueChange={(value) => {
                  setSelectedDepartment(value);
                  setPagination({ page: 1 });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {assignedDepartments.map((dept) => (
                    <SelectItem key={dept._id || dept} value={dept._id || dept}>
                      {dept.name || dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Employment Type / Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Type
            </label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value);
                setPagination({ page: 1 });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              placeholder="Filter by job title..."
              value={selectedJobTitle}
              onChange={(e) => {
                setSelectedJobTitle(e.target.value);
                setPagination({ page: 1 });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ---------------- Header ---------------- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employees</h1>

        {/* Buttons */}
        <div className="flex gap-3">

          {/* View Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "card" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("card")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>

            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Create Employee */}
          <PermissionGate permission={MODULES.EMPLOYEE.CREATE}>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* ---------------- Employee List ---------------- */}
      {!loading && employees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No employees found</h3>

            <PermissionGate permission={MODULES.EMPLOYEE.CREATE}>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </PermissionGate>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((emp) => (
                <EmployeeCard
                  key={emp.id || emp._id}
                  employee={emp}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  canManage={canManageEmployees()}
                />
              ))}
            </div>
          ) : (
            <EmployeeTable
              employees={employees}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              canManage={canManageEmployees()}
            />
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedEmployee && (
        <DeleteConfirmModal
          employee={selectedEmployee}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default EmployeeList;
