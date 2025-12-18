import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import LeaveTypeModal from './LeaveTypeModal';
import { leaveTypeService } from '../../services/leaveTypeService';

const LeaveTypesPage = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, [pagination.page, searchTerm, filterActive]);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        isActive: filterActive === 'all' ? undefined : filterActive === 'active'
      };

      const response = await leaveTypeService.getLeaveTypes(params);
      setLeaveTypes(response.data.leaveTypes);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (error) {
      toast.error('Failed to fetch leave types');
      console.error('Error fetching leave types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLeaveType(null);
    setShowModal(true);
  };

  const handleEdit = (leaveType) => {
    setEditingLeaveType(leaveType);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) {
      return;
    }

    try {
      await leaveTypeService.deleteLeaveType(id);
      toast.success('Leave type deleted successfully');
      fetchLeaveTypes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete leave type');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await leaveTypeService.toggleLeaveTypeStatus(id);
      toast.success('Leave type status updated successfully');
      fetchLeaveTypes();
    } catch (error) {
      toast.error('Failed to update leave type status');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingLeaveType(null);
  };

  const handleModalSuccess = () => {
    fetchLeaveTypes();
    handleModalClose();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Types</h1>
          <p className="text-gray-600">Manage different types of leaves available to employees</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Leave Type
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search leave types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leave Types Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading leave types...</p>
          </div>
        ) : leaveTypes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No leave types found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Days/Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveTypes.map((leaveType) => (
                    <tr key={leaveType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: leaveType.color }}
                          ></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {leaveType.name}
                            </div>
                            {leaveType.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {leaveType.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {leaveType.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {leaveType.maxDaysPerYear}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            leaveType.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {leaveType.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                          {leaveType.requiresApproval && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Requires Approval
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          leaveType.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {leaveType.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(leaveType)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(leaveType.id)}
                            className={`${leaveType.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            title={leaveType.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {leaveType.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(leaveType.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <LeaveTypeModal
          leaveType={editingLeaveType}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default LeaveTypesPage;