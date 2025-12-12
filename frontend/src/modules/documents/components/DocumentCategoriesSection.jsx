import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import configService from '../../../core/services/configService';
import { LoadingSpinner } from '../../../shared/components';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

const DocumentCategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState({ name: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await configService.getDocumentCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching document categories:', error);
      toast.error('Failed to load document categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await configService.createDocumentCategory(newCategory);
      setCategories([...categories, response.data]);
      setNewCategory({ name: '', description: '' });
      setShowAddForm(false);
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingId(category.id);
    setEditingCategory({ name: category.name, description: category.description || '' });
  };

  const handleSaveEdit = async () => {
    if (!editingCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await configService.updateDocumentCategory(editingId, editingCategory);
      setCategories(categories.map(cat => 
        cat.id === editingId ? response.data : cat
      ));
      setEditingId(null);
      setEditingCategory({ name: '', description: '' });
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await configService.deleteDocumentCategory(categoryId);
      setCategories(categories.filter(cat => cat.id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCategory({ name: '', description: '' });
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewCategory({ name: '', description: '' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Document Categories</CardTitle>
          <Button
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add New Category Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Add New Category</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-name">Category Name</Label>
                  <Input
                    id="new-name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <Label htmlFor="new-description">Description</Label>
                  <Input
                    id="new-description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Enter description (optional)"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={handleCancelAdd}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleAddCategory}>
                  <Save className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </div>
          )}

          {/* Categories List */}
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No document categories found.</p>
              <p className="text-sm">Add a category to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  {editingId === category.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`edit-name-${category.id}`}>Category Name</Label>
                          <Input
                            id={`edit-name-${category.id}`}
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-description-${category.id}`}>Description</Label>
                          <Input
                            id={`edit-description-${category.id}`}
                            value={editingCategory.description}
                            onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleCancelEdit} size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-gray-600">{category.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {category.documentCount || 0} documents
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCategoriesSection;