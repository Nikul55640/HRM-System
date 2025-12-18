import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import HolidayModal from './HolidayModal';
import { holidayService } from '../../services/holidayService';

const HolidaysPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterActive, setFilterActive] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchHolidays();
  }, [pagination.page, searchTerm, filterType, filterYear, filterActive]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        type: filterType === 'all' ? undefined : filterType,
        year: filterYear,
        isActive: filterActive === 'all' ? undefined : filterActive === 'active'
      };

      const response = await holidayService.getHolidays(params);
      setHolidays(response.data.holidays);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (error) {
      toast.error('Failed to fetch holidays');
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingHoliday(null);
    setShowModal(true);
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      await holidayService.deleteHoliday(id);
      toast.success('Holiday deleted successfully');
      fetchHolidays();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete holiday');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await holidayService.toggleHolidayStatus(id);
      toast.success('Holiday status updated successfully');
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to update holiday status');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingHoliday(null);
  };

  const handleModalSuccess = () => {
    fetchHolidays();
    handleModalClose();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      national: 'bg-red-100 text-red-800',
      religious: 'bg-purple-100 text-purple-800',
      company: 'bg-blue-100 text-blue-800',
      regional: 'bg-green-100 text-green-800',
      optional: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Holiday Management</h1>
          <p className="text-gray-600">Manage company holidays and observances</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Holiday
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search holidays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="national">National</option>
                <option value="religious">Religious</option>
                <option value="company">Company</option>
                <option value="regional">Regional</option>
                <option value="optional">Optional</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-400" />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() + i - 2;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
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

      {/* Holidays Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading holidays...</p>
          </div>
        ) : holidays.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No holidays found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Holiday
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Properties
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
                  {holidays.map((holiday) => (
                    <tr key={holiday.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: holiday.color }}
                          ></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {holiday.name}
                            </div>
                            {holiday.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {holiday.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(holiday.date)}
                        </div>
                        {holiday.isRecurring && (
                          <div className="text-xs text-blue-600">Recurring</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(holiday.type)}`}>
                          {holiday.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            holiday.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {holiday.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                          {holiday.isOptional && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Optional
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          holiday.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {holiday.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(holiday)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(holiday.id)}
                            className={`${holiday.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            title={holiday.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {holiday.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(holiday.id)}
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
        <HolidayModal
          holiday={editingHoliday}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default HolidaysPage;