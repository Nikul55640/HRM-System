import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchEmployees,
  deleteEmployee,
} from "../../../../store/thunks/employeeThunks";
import {
  setPagination,
  clearError,
} from "../../../../store/slices/employeeSlice";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { LayoutGrid, List, Plus, Users } from "lucide-react";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import {
  Pagination,
  RoleGuard,
  ScopeIndicator,
  PermissionGate,
} from "../../../../components/common";
import EmployeeCard from "../components/EmployeeCard";
import EmployeeTable from "../EmployeeTable";
import DeleteConfirmModal from "../../../../components/ui/DeleteConfirmModal";
import useAuth from "../../../../hooks/useAuth";
import { usePermissions } from "../../../../hooks";
import { MODULES } from "../../../../utils/rolePermissions";

const EmployeeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    employees = [],
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
    loading,
    error,
  } = useSelector((state) => state.employee || {});
  const { user, isHRManager } = useAuth();
  const { can } = usePermissions();

  const [viewMode, setViewMode] = useState("card"); // 'card' or 'table'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
    loadEmployees();
  }, [pagination.currentPage, pagination.itemsPerPage, selectedDepartment]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadEmployees = () => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
    };

    // Add department filter if HR Manager has selected a specific department
    if (selectedDepartment !== "all") {
      params.department = selectedDepartment;
    }

    dispatch(fetchEmployees(params));
  };

  const handlePageChange = (page) => {
    dispatch(setPagination({ currentPage: page }));
  };

  const handleView = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  const handleEdit = (employeeId) => {
    navigate(`/employees/${employeeId}/edit`);
  };

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteEmployee(selectedEmployee._id)).unwrap();
      toast.success(
        `Employee ${selectedEmployee.personalInfo?.firstName} ${selectedEmployee.personalInfo?.lastName} has been deleted successfully`
      );
      setShowDeleteModal(false);
      setSelectedEmployee(null);
      loadEmployees();
    } catch (err) {
      toast.error(
        err.message || "Failed to delete employee. Please try again."
      );
      throw err; // Re-throw to let modal handle error display
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  };

  const handleCreateNew = () => {
    navigate("/employees/new");
  };

  const canManageEmployees = () => {
    return can.doAny([
      MODULES.EMPLOYEE.UPDATE_ANY,
      MODULES.EMPLOYEE.UPDATE_OWN,
      MODULES.EMPLOYEE.DELETE,
    ]);
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Get user's assigned departments for HR Managers
  const assignedDepartments = user?.assignedDepartments || [];
  const isScoped = isHRManager() && assignedDepartments.length > 0;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Scope Indicator for HR Managers */}
      {isScoped && (
        <ScopeIndicator
          departmentCount={assignedDepartments.length}
          message={`You are viewing employees from your assigned department${
            assignedDepartments.length > 1 ? "s" : ""
          } only.`}
          className="mb-4"
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Employees</h1>

          {/* Department Filter for HR Managers with multiple departments */}
          {isScoped && assignedDepartments.length > 1 && (
            <Select
              value={selectedDepartment}
              onValueChange={(value) => {
                setSelectedDepartment(value);
                dispatch(setPagination({ currentPage: 1 }));
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All My Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All My Departments</SelectItem>
                {assignedDepartments.map((dept) => (
                  <SelectItem key={dept._id || dept} value={dept._id || dept}>
                    {dept.name || dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

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

          {/* Create Button */}
          <PermissionGate permission={MODULES.EMPLOYEE.CREATE}>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Employee List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No employees found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get started by creating a new employee.
            </p>
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
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee._id}
                  employee={employee}
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
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEmployee && (
        <DeleteConfirmModal
          employee={selectedEmployee}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default EmployeeList;
