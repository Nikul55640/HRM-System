import { Button } from "../../../shared/ui/button";
import { Card, CardContent } from "../../../shared/ui/card";
import { Edit, Trash2 } from "lucide-react";
import useOrganizationStore from "../../../stores/useOrganizationStore";
import { toast } from "react-toastify";

const DesignationTable = ({ data, loading, onEdit }) => {
  const { deleteDesignation, fetchDesignations } = useOrganizationStore();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this designation?")) return;

    try {
      await deleteDesignation(id);
      toast.success("Designation deleted");
      fetchDesignations();
    } catch (error) {
      toast.error("Failed to delete designation");
    }
  };

  if (loading)
    return <p className="p-6 text-gray-500">Loading designations...</p>;

  if (!data || data.length === 0)
    return (
      <Card className="border-gray-200">
        <CardContent className="py-10 text-center text-gray-500">
          No designations found.
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
                Title
              </th>
              <th className="px-4 py-3 text-left text-gray-700 font-medium">
                Description
              </th>
              <th className="px-4 py-3 text-left text-gray-700 font-medium">
                Level
              </th>
              <th className="px-4 py-3 text-right text-gray-700 font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.map((des) => (
              <tr key={des._id} className="hover:bg-gray-50 transition">
                {/* TITLE */}
                <td className="px-4 py-3 font-medium text-gray-800">
                  {des.title}
                </td>

                {/* DESCRIPTION */}
                <td className="px-4 py-3 text-gray-600">
                  {des.description || (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                {/* LEVEL */}
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs rounded border border-blue-300 bg-blue-50 text-blue-700">
                    {des.level}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-3 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(des)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(des._id)}
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

export default DesignationTable;
