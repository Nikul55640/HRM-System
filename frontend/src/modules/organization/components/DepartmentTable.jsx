import { Button } from "../../../shared/ui/button";
import { Card, CardContent } from "../../../shared/ui/card";
import { Edit, Trash2 } from "lucide-react";
import useOrganizationStore from "../../../stores/useOrganizationStore";
import { toast } from "react-toastify";

const DepartmentTable = ({ data, loading, onEdit }) => {
  const { deleteDepartment, fetchDepartments } = useOrganizationStore();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;

    try {
      await deleteDepartment(id);
      toast.success("Department deleted");
      fetchDepartments();
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  if (loading)
    return (
      <p className="p-6 text-gray-500 text-sm">
        Loading departments...
      </p>
    );

  if (!data || data.length === 0)
    return (
      <Card className="border-gray-200">
        <CardContent className="py-10 text-center text-gray-500">
          No departments found.
        </CardContent>
      </Card>
    );

  return (
    <Card className="border-gray-200">
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-700 font-medium">
                Name
              </th>
              <th className="px-4 py-3 text-left text-gray-700 font-medium">
                Description
              </th>
              <th className="px-4 py-3 text-right text-gray-700 font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.map((dept) => (
              <tr key={dept._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">{dept.name}</td>

                <td className="px-4 py-3">
                  {dept.description || (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                <td className="px-4 py-3 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(dept)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(dept._id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default DepartmentTable;
