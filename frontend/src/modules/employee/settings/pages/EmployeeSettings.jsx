import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/ui/card";
import { Button } from "../../../../shared/ui/button";
import { User, Shield, Phone, CreditCard, FileText, Settings } from "lucide-react";

const EmployeeSettings = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const settingsCategories = [
    {
      id: "profile",
      title: "Profile Settings",
      description: "Update your personal information, contact details, and profile photo",
      icon: User,
      path: "/employee/settings/profile",
      color: "blue"
    },
    {
      id: "security",
      title: "Security Settings",
      description: "Change your password and manage account security",
      icon: Shield,
      path: "/employee/settings/security",
      color: "green"
    },
    {
      id: "emergency-contacts",
      title: "Emergency Contacts",
      description: "Manage your emergency contact information",
      icon: Phone,
      path: "/employee/settings/emergency-contacts",
      color: "purple"
    },
    {
      id: "bank",
      title: "Bank Details",
      description: "Update your banking information for salary payments",
      icon: CreditCard,
      path: "/employee/bank-details",
      color: "orange"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category) => {
          const IconComponent = category.icon;
          const colorClasses = {
            blue: "text-blue-600 bg-blue-50 border-blue-200",
            green: "text-green-600 bg-green-50 border-green-200",
            purple: "text-purple-600 bg-purple-50 border-purple-200",
            orange: "text-orange-600 bg-orange-50 border-orange-200"
          };

          return (
            <Link key={category.id} to={category.path}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${colorClasses[category.color]}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                        {category.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                    <span>Manage settings</span>
                    <svg 
                      className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/employee/profile">
            <Button variant="outline" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              View Profile
            </Button>
          </Link>
          <Link to="/employee/settings/security">
            <Button variant="outline" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Change Password
            </Button>
          </Link>
          <Link to="/employee/bank-details">
            <Button variant="outline" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Update Bank Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you need assistance with your settings or have questions about your account, 
              please contact your HR department or system administrator.
            </p>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSettings;