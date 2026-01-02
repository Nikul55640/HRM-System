import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../shared/ui/card";
import { Button } from "../../../../shared/ui/button";
import {
  User,
  Shield,
  Phone,
  CreditCard,
  FileText,
  Settings,
} from "lucide-react";

const EmployeeSettings = () => {
  const settingsCategories = [
    {
      id: "profile",
      title: "Profile Settings",
      description:
        "Update your personal information, contact details, and profile photo",
      icon: User,
      path: "/employee/settings/profile",
      color: "blue",
    },
    {
      id: "security",
      title: "Security Settings",
      description: "Change your password and manage account security",
      icon: Shield,
      path: "/employee/settings/security",
      color: "green",
    },
    {
      id: "emergency-contacts",
      title: "Emergency Contacts",
      description: "Manage your emergency contact information",
      icon: Phone,
      path: "/employee/settings/emergency-contacts",
      color: "purple",
    },
    {
      id: "bank",
      title: "Bank Details",
      description: "Update your banking information for salary payments",
      icon: CreditCard,
      path: "/employee/bank-details",
      color: "orange",
    },
    {
      id: "documents",
      title: "Documents",
      description: "Upload and manage your official documents",
      icon: FileText,
      path: "/employee/settings/documents",
      color: "indigo",
    },
  ];

  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    green: "text-green-600 bg-green-50 border-green-200",
    purple: "text-purple-600 bg-purple-50 border-purple-200",
    orange: "text-orange-600 bg-orange-50 border-orange-200",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-200",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

      {/* ================= HEADER ================= */}
      <Card className="rounded-3xl border border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and preferences
          </p>
        </CardContent>
      </Card>

      {/* ================= SETTINGS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category) => {
          const IconComponent = category.icon;

          return (
            <Link key={category.id} to={category.path}>
              <Card className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group">
                <CardContent className="p-6 space-y-4">

                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl border ${colorMap[category.color]}`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                        {category.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {category.description}
                  </p>

                  <div className="flex items-center text-sm font-medium text-blue-600">
                    <span>Manage settings</span>
                    <svg
                      className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">
          <Link to="/employee/profile">
            <Button variant="outline" className="rounded-full flex items-center gap-2">
              <User className="w-4 h-4" />
              View Profile
            </Button>
          </Link>

          <Link to="/employee/settings/security">
            <Button variant="outline" className="rounded-full flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Change Password
            </Button>
          </Link>

          <Link to="/employee/bank-details">
            <Button variant="outline" className="rounded-full flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Bank Details
            </Button>
          </Link>
        </div>
      </div>

      {/* ================= HELP ================= */}
      <Card className="rounded-2xl border border-gray-100 bg-gray-50">
        <CardContent className="p-6 flex gap-4">

          <div className="p-3 bg-blue-100 rounded-xl">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">
              Need Help?
            </h3>
            <p className="text-sm text-gray-600 max-w-xl">
              If you need assistance with your settings or have questions about
              your account, please contact your HR department or system
              administrator.
            </p>
            <Button variant="outline" size="sm" className="rounded-full">
              Contact Support
            </Button>
          </div>

        </CardContent>
      </Card>

    </div>
  );
};

export default EmployeeSettings;
