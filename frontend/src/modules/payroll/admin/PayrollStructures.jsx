import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { payrollService } from "../../../services";
import { toast } from "react-toastify";

const PayrollStructures = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    basic: 0,
    hra: 0,
    allowances: 0,
  });

  useEffect(() => {
    fetchStructures();
  }, []);

  const fetchStructures = async () => {
    console.log("🔄 [SALARY STRUCTURES] Fetching salary structures...");
    try {
      setLoading(true);
      const response = await payrollService.getSalaryStructures();
      console.log("✅ [SALARY STRUCTURES] Response received:", response);

      if (response.success) {
        setStructures(response.data);
        console.log(
          "✅ [SALARY STRUCTURES] Loaded:",
          response.data?.length || 0,
          "structures"
        );
      }
    } catch (error) {
      console.error(
        "❌ [SALARY STRUCTURES] Failed to fetch structures:",
        error
      );
      toast.error("Failed to load salary structures");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStructure) {
        await payrollService.updateSalaryStructure(
          editingStructure._id,
          formData
        );
        toast.success("Structure updated");
      } else {
        await payrollService.createSalaryStructure(formData);
        toast.success("Structure created");
      }
      setShowModal(false);
      resetForm();
      fetchStructures();
    } catch (error) {
      toast.error("Failed to save structure");
    }
  };

  const handleEdit = (structure) => {
    setEditingStructure(structure);
    setFormData({
      name: structure.name,
      basic: structure.basic,
      hra: structure.hra,
      allowances: structure.allowances,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this structure?")) {
      try {
        await payrollService.deleteSalaryStructure(id);
        toast.success("Structure deleted");
        fetchStructures();
      } catch (error) {
        toast.error("Failed to delete structure");
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", basic: 0, hra: 0, allowances: 0 });
    setEditingStructure(null);
  };

  const calculateTotal = (structure) => {
    return (
      (structure.basic || 0) +
      (structure.hra || 0) +
      (structure.allowances || 0)
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading salary structures...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Salary Structures
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage salary templates</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Structure
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {structures.length === 0 ? (
          <Card className="col-span-full border-gray-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 text-sm">
                No salary structures found. Click{" "}
                <Button variant="link" className="text-blue-600 font-medium">
                  Add Structure
                </Button>{" "}
                to create one.
              </p>
            </CardContent>
          </Card>
        ) : (
          structures.map((structure) => (
            <Card key={structure._id} className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-800">
                  {structure.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Basic:</span>
                    <span className="font-medium text-gray-800">
                      ₹{structure.basic?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">HRA:</span>
                    <span className="font-medium text-gray-800">
                      ₹{structure.hra?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Allowances:</span>
                    <span className="font-medium text-gray-800">
                      ₹{structure.allowances?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-gray-800">
                      ₹{calculateTotal(structure).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4 pt-2 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(structure)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(structure._id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {editingStructure ? "Edit Structure" : "Add Structure"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Structure Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Basic Salary *
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.basic}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        basic: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HRA *
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.hra}
                    onChange={(e) =>
                      setFormData({ ...formData, hra: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowances *
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.allowances}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowances: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingStructure ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PayrollStructures;
