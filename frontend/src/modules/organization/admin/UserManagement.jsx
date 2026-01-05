import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import userService from "../../../services/userService";
import departmentService from "../../../services/departmentService";
import { LoadingSpinner } from "../../../shared/components";
import UserModal from "../../../shared/ui/UserModal";
import { Search, Plus, Edit2 } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptRes] = await Promise.all([
        userService.getUsers(),
        departmentService.getDepartments(),
      ]);

      const usersData =
        usersRes?.data?.users ||
        usersRes?.data ||
        usersRes ||
        [];

      const departmentsData =
        deptRes?.data ||
        deptRes?.departments ||
        deptRes ||
        [];

      setUsers(usersData);
      setDepartments(departmentsData);
    } catch (error) {
      toast.error(error.message || "Failed to load users");
      setUsers([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleToggleActive = async (user) => {
    try {
      const userId = user.id;
      if (user.isActive) {
        await userService.deactivateUser(userId);
        toast.success("User deactivated");
      } else {
        await userService.activateUser(userId);
        toast.success("User activated");
      }
      loadData();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleModalSubmit = async (userData) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, userData);
        toast.success("User updated");
      } else {
        await userService.createUser(userData);
        toast.success("User created");
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error(error.message || "Failed to save user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) => {
    const map = {
      SuperAdmin: "bg-purple-100 text-purple-700",
      "HR Manager": "bg-blue-100 text-blue-700",
      "HR Administrator": "bg-green-100 text-green-700",
      Employee: "bg-gray-100 text-gray-700",
    };
    return map[role] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-500">Manage system users & roles</p>
        </div>

        <button
          onClick={handleCreateUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or role..."
          className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm"
        />
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">Role</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">Departments</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">Last Login</th>
              <th className="px-6 py-3 text-right text-xs text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{user.email}</td>

                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${roleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm">
                  {user.assignedDepartments?.length
                    ? user.assignedDepartments.map((d) => (
                        <span
                          key={d.id}
                          className="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1"
                        >
                          {d.name}
                        </span>
                      ))
                    : "-"}
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`h-6 w-11 rounded-full relative ${
                      user.isActive ? "bg-green-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 bg-white rounded-full absolute top-1 transition ${
                        user.isActive ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "Never"}
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white border rounded-lg p-4 space-y-2">
            <div className="font-medium">{user.email}</div>

            <span className={`inline-block px-2 py-1 text-xs rounded ${roleBadge(user.role)}`}>
              {user.role}
            </span>

            <div className="text-sm text-gray-500">
              Last login:{" "}
              {user.lastLogin
                ? new Date(user.lastLogin).toLocaleDateString()
                : "Never"}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleToggleActive(user)}
                className={`text-xs px-3 py-1 rounded ${
                  user.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </button>

              <button
                onClick={() => handleEditUser(user)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <UserModal
          user={selectedUser}
          departments={departments}
          onSubmit={handleModalSubmit}
          onClose={() => setShowModal(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default UserManagement;
