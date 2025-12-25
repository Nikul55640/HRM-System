import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import { Icon, LoadingSpinner } from '../../../../shared/components';
import { useToast } from '../../../../core/hooks/use-toast';
import api from '../../../../core/services/api';

const HolidaysPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/holidays');
      setHolidays(response.data?.data?.holidays || []);
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
      toast({
        title: "Error",
        description: "Failed to fetch holidays",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "national":
        return "bg-red-100 text-red-800";
      case "religious":
        return "bg-purple-100 text-purple-800";
      case "company":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading holidays..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Holidays</h1>
          <p className="text-gray-600">Manage company holidays and observances</p>
        </div>
        <Button className="flex items-center gap-2">
          <Icon name="Plus" className="w-4 h-4" />
          Add Holiday
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Icon name="PartyPopper" className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Holidays</p>
                <p className="text-2xl font-bold">{holidays.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon name="DollarSign" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid Holidays</p>
                <p className="text-2xl font-bold">
                  {(holidays || []).filter(h => h.isPaid).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="Calendar" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Year</p>
                <p className="text-2xl font-bold">
                  {(holidays || []).filter(h => new Date(h.date).getFullYear() === new Date().getFullYear()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holidays List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="PartyPopper" className="w-5 h-5" />
            Company Holidays
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(holidays || []).length > 0 ? (
            <div className="space-y-4">
              {(holidays || []).map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{holiday.name}</h3>
                      <Badge className={getTypeColor(holiday.type)}>
                        {holiday.type}
                      </Badge>
                      {holiday.isPaid && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Paid
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" className="w-4 h-4" />
                        {formatDate(holiday.date)}
                      </span>
                      {holiday.description && (
                        <span>{holiday.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Icon name="Edit" className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Icon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="PartyPopper" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No holidays configured</p>
              <Button className="mt-4">
                <Icon name="Plus" className="w-4 h-4 mr-2" />
                Add First Holiday
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HolidaysPage;