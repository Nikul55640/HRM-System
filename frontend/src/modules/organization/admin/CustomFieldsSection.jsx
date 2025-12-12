import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import configService from '../../../core/services/configService';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

const CustomFieldsSection = () => {
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const fieldTypes = ['text', 'number', 'date', 'dropdown', 'boolean'];

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      const response = await configService.getCustomFields();
      setCustomFields(response.data?.employeeFields || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load custom fields');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setEditingField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: [],
    });
    setIsEditing(true);
  };

  const handleEditField = (field, index) => {
    setEditingField({ ...field, index });
    setIsEditing(true);
  };

  const handleSaveField = async () => {
    if (!editingField.name || !editingField.label) {
      toast.error('Field name and label are required');
      return;
    }

    try {
      setSaving(true);
      let updatedFields = [...customFields];

      if (editingField.index !== undefined) {
        // Update existing field
        updatedFields[editingField.index] = {
          name: editingField.name,
          label: editingField.label,
          type: editingField.type,
          required: editingField.required,
          options: editingField.options,
        };
      } else {
        // Add new field
        updatedFields.push({
          name: editingField.name,
          label: editingField.label,
          type: editingField.type,
          required: editingField.required,
          options: editingField.options,
        });
      }

      await configService.setCustomEmployeeFields(updatedFields);
      toast.success('Custom field saved successfully');
      setCustomFields(updatedFields);
      setIsEditing(false);
      setEditingField(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save custom field');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async (index) => {
    if (!window.confirm('Are you sure you want to delete this custom field?')) {
      return;
    }

    try {
      setSaving(true);
      const updatedFields = customFields.filter((_, i) => i !== index);
      await configService.setCustomEmployeeFields(updatedFields);
      toast.success('Custom field deleted successfully');
      setCustomFields(updatedFields);
    } catch (error) {
      toast.error(error.message || 'Failed to delete custom field');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingField(null);
  };

  const addOption = () => {
    setEditingField({
      ...editingField,
      options: [...(editingField.options || []), ''],
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...editingField.options];
    newOptions[index] = value;
    setEditingField({ ...editingField, options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = editingField.options.filter((_, i) => i !== index);
    setEditingField({ ...editingField, options: newOptions });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Custom Employee Fields</h3>
          <p className="mt-1 text-sm text-gray-500">
            Define additional fields for employee profiles
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleAddField}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Field
          </button>
        )}
      </div>

      {/* Edit/Add Form */}
      {isEditing && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {editingField.index !== undefined ? 'Edit Field' : 'Add New Field'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Field Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingField.name}
                onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                placeholder="e.g., employeeCode"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Used as the field identifier (no spaces)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Field Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingField.label}
                onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                placeholder="e.g., Employee Code"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Displayed to users</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Field Type</label>
              <select
                value={editingField.type}
                onChange={(e) => setEditingField({ ...editingField, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {fieldTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={editingField.required}
                onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
                Required field
              </label>
            </div>
          </div>

          {/* Dropdown Options */}
          {editingField.type === 'dropdown' && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Dropdown Options</label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  + Add Option
                </button>
              </div>
              {editingField.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveField}
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Field'}
            </button>
          </div>
        </div>
      )}

      {/* Fields Table */}
      {customFields.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No custom fields defined yet</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Field Name</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Label</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Required</th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {customFields.map((field, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {field.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{field.label}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {field.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {field.required ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => handleEditField(field, index)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteField(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsSection;