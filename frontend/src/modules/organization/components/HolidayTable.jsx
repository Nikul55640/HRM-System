import React from "react";
import useOrganizationStore from "../../../stores/useOrganizationStore";

import { Card, CardContent } from "../../../shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";

import { Button } from "../../../shared/ui/button";
import { Edit, Trash2, CalendarDays } from "lucide-react";

import { formatDate } from "../../../core/utils/essHelpers";
const HolidayTable = ({ data = [], loading, onEdit }) => {
  const { deleteHoliday, fetchHolidays } = useOrganizationStore();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      await deleteHoliday(id);
      fetchHolidays();
    }
  };

  if (loading) {
    return <p className="text-gray-500 p-6">Loading holidays...</p>;
  }

  if (!data.length) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-10 text-center text-gray-500">
          No holidays found.
        </CardContent>
      </Card>
    );
  }

  const getHolidayTypeBadge = (type) => {
    const map = {
      public: "bg-blue-50 text-blue-700 border border-blue-200",
      national: "bg-red-50 text-red-700 border border-red-200",
      optional: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      religious: "bg-purple-50 text-purple-700 border-purple-200",
    };

    return map[type] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <Card className="border-gray-200">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Holiday</TableHead>
                <TableHead className="text-left">Date</TableHead>
                <TableHead className="text-left">Type</TableHead>
                <TableHead className="text-left">Paid</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((holiday) => (
                <TableRow key={holiday._id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-500" />
                    {holiday.name}
                  </TableCell>

                  <TableCell className="text-gray-700">
                    {formatDate(holiday.date)}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${getHolidayTypeBadge(
                        holiday.type
                      )}`}
                    >
                      {holiday.type?.charAt(0).toUpperCase() +
                        holiday.type?.slice(1)}
                    </span>
                  </TableCell>

                  <TableCell className="text-gray-800">
                    {holiday.isPaid ? "Yes" : "No"}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      {/* EDIT BUTTON */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(holiday)}
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>

                      {/* DELETE BUTTON */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(holiday._id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HolidayTable;
