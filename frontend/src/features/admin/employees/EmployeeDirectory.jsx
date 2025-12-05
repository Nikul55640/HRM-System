import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import employeeService from "./services/employeeService";
import configService from "../../../services/configService";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { Pagination, ScopeIndicator } from "../../../components/common";
import useAuth from "../../../hooks/useAuth";

const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const { user, isHRManager } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Available filter options (extracted from employees)
  const [availableJobTitles, setAvailableJobTitles] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadDepartments();
    loadAllEmployeesForFilters();
  }, []);

  useEffect(() => {
    loadDirectory();
  }, [
    currentPage,
    searchTerm,
    selectedDepartments,
    selectedJobTitles,
    selectedLocations,
  ]);

  const loadDepartments = async () => {
    try {
      const response = await configService.getDepartments();
      setDepartments(response.departments || []);
    } catch (error) {
      // Silently fail if departments can't be loaded
    }
  };

  const loadAllEmployeesForFilters = async () => {
    try {
      // Load all employees to extract unique job titles and locations
      const response = await employeeService.getEmployeeDirectory({
        limit: 1000,
      });
      const allEmployees = response.employees || [];
      extractFilterOptions(allEmployees);
    } catch (error) {
      // Silently fail if filter options can't be loaded
    }
  };

  const loadDirectory = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      };

      // Add filters if selected
      if (selectedDepartments.length > 0) {
        params.department = selectedDepartments;
      }
      if (selectedJobTitles.length > 0) {
        params.jobTitle = selectedJobTitles.join(",");
      }
      if (selectedLocations.length > 0) {
        params.location = selectedLocations.join(",");
      }

      // Note: Backend should automatically filter by assigned departments for HR Managers
      // The scope filtering is handled server-side based on the authenticated user's role

      const response = await employeeService.getEmployeeDirectory(params);
      const employeeData = response.employees || [];
      setEmployees(employeeData);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load employee directory");
    } finally {
      setLoading(false);
    }
  };

  const extractFilterOptions = (employeeData) => {
    // Extract unique job titles
    const jobTitles = [
      ...new Set(
        employeeData.map((emp) => emp.jobInfo?.jobTitle).filter(Boolean)
      ),
    ].sort();
    setAvailableJobTitles(jobTitles);

    // Extract unique locations
    const locations = [
      ...new Set(
        employeeData.map((emp) => emp.jobInfo?.workLocation).filter(Boolean)
      ),
    ].sort();
    setAvailableLocations(locations);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentFilter = (deptId) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptId)
        ? prev.filter((id) => id !== deptId)
        : [...prev, deptId]
    );
    setCurrentPage(1);
  };

  const handleJobTitleFilter = (jobTitle) => {
    setSelectedJobTitles((prev) =>
      prev.includes(jobTitle)
        ? prev.filter((title) => title !== jobTitle)
        : [...prev, jobTitle]
    );
    setCurrentPage(1);
  };

  const handleLocationFilter = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((loc) => loc !== location)
        : [...prev, location]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedDepartments([]);
    setSelectedJobTitles([]);
    setSelectedLocations([]);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleViewProfile = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  const EmployeeGridCard = ({ employee }) => {
    const isPrivate = employee.isPrivate;

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative">
        {isPrivate && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Private
            </span>
          </div>
        )}

        <div className="flex flex-col items-center text-center">
          {employee.personalInfo?.profilePhoto ? (
            <img
              src={employee.personalInfo.profilePhoto}
              alt={`${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`}
              className="w-20 h-20 rounded-full object-cover mb-4"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold mb-4">
              {getInitials(
                employee.personalInfo?.firstName,
                employee.personalInfo?.lastName
              )}
            </div>
          )}

          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {employee.personalInfo?.firstName} {employee.personalInfo?.lastName}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {employee.jobInfo?.jobTitle}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {employee.jobInfo?.department?.name}
          </p>

          <div className="w-full space-y-2">
            {!isPrivate && employee.contactInfo?.email && (
              <button
                onClick={() => handleEmailClick(employee.contactInfo.email)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email
              </button>
            )}
            {!isPrivate && employee.contactInfo?.phoneNumber && (
              <button
                onClick={() =>
                  handlePhoneClick(employee.contactInfo.phoneNumber)
                }
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call
              </button>
            )}
            {isPrivate && (
              <p className="text-xs text-gray-500 italic py-2">
                Contact info hidden
              </p>
            )}
            <button
              onClick={() => handleViewProfile(employee._id)}
              className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EmployeeListItem = ({ employee }) => {
    const isPrivate = employee.isPrivate;

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 relative">
        {isPrivate && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Private
            </span>
          </div>
        )}

        <div className="flex items-center gap-4">
          {employee.personalInfo?.profilePhoto ? (
            <img
              src={employee.personalInfo.profilePhoto}
              alt={`${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold">
              {getInitials(
                employee.personalInfo?.firstName,
                employee.personalInfo?.lastName
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {employee.personalInfo?.firstName}{" "}
              {employee.personalInfo?.lastName}
            </h3>
            <p className="text-sm text-gray-600">
              {employee.jobInfo?.jobTitle}
            </p>
            <p className="text-sm text-gray-500">
              {employee.jobInfo?.department?.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isPrivate && employee.contactInfo?.email && (
              <button
                onClick={() => handleEmailClick(employee.contactInfo.email)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Send Email"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
            {!isPrivate && employee.contactInfo?.phoneNumber && (
              <button
                onClick={() =>
                  handlePhoneClick(employee.contactInfo.phoneNumber)
                }
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Call"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </button>
            )}
            {isPrivate && (
              <span className="text-xs text-gray-500 italic px-2">
                Contact hidden
              </span>
            )}
            <button
              onClick={() => handleViewProfile(employee._id)}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Check if user is scoped (HR Manager with assigned departments)
  const assignedDepartments = user?.assignedDepartments || [];
  const isScoped = isHRManager() && assignedDepartments.length > 0;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employee Directory</h1>
        <p className="text-gray-600 mt-1">
          Find and connect with your colleagues
        </p>

        {/* Scope Indicator for HR Managers */}
        {isScoped && (
          <ScopeIndicator
            departmentCount={assignedDepartments.length}
            message={`Directory is filtered to show employees from your assigned department${
              assignedDepartments.length > 1 ? "s" : ""
            } only.`}
            className="mt-3"
          />
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name, department, or job title..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* View Toggle and Filter Button */}
          <div className="flex gap-2">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showFilters
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Filter Sidebar */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Department Filter */}
              {departments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Department
                    {isScoped && (
                      <span className="ml-2 text-xs text-blue-600">
                        (Your departments)
                      </span>
                    )}
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {departments
                      .filter((dept) => {
                        // For HR Managers, only show their assigned departments
                        if (isScoped) {
                          return assignedDepartments.some(
                            (assigned) =>
                              (assigned._id || assigned) === dept._id
                          );
                        }
                        return true;
                      })
                      .map((dept) => (
                        <label
                          key={dept._id}
                          className="flex items-center cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDepartments.includes(dept._id)}
                            onChange={() => handleDepartmentFilter(dept._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {dept.name}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {/* Job Title Filter */}
              {availableJobTitles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableJobTitles.map((title) => (
                      <label
                        key={title}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedJobTitles.includes(title)}
                          onChange={() => handleJobTitleFilter(title)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Filter */}
              {availableLocations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Location
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableLocations.map((location) => (
                      <label
                        key={location}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(location)}
                          onChange={() => handleLocationFilter(location)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {location}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Employee List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No employees found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {employees.map((employee) => (
                <EmployeeGridCard key={employee._id} employee={employee} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <EmployeeListItem key={employee._id} employee={employee} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeDirectory;
