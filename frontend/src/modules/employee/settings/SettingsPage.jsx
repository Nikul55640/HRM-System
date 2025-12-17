import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { User, Lock, Briefcase, Bell, Shield, FileText, CreditCard } from "lucide-react";

// Import setting components
import ProfileSettings from "./components/ProfileSettings";
import PasswordSettings from "./components/PasswordSettings";
import WorkDetailsSettings from "./components/WorkDetailsSettings";
import NotificationSettings from "./components/NotificationSettings";
import SecuritySettings from "./components/SecuritySettings";
import DocumentSettings from "./components/DocumentSettings";
import BankDetailsSettings from "./components/BankDetailsSettings";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const settingsTabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      component: ProfileSettings,
      description: "Manage your personal information"
    },
    {
      id: "password",
      label: "Password & Security",
      icon: Lock,
      component: PasswordSettings,
      description: "Change password and security settings"
    },
    {
      id: "work",
      label: "Work Details",
      icon: Briefcase,
      component: WorkDetailsSettings,
      description: "View your job information and work preferences"
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      component: NotificationSettings,
      description: "Configure notification preferences"
    },
    {
      id: "security",
      label: "Privacy & Security",
      icon: Shield,
      component: SecuritySettings,
      description: "Manage privacy and security settings"
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      component: DocumentSettings,
      description: "Upload and manage your documents"
    },
    {
      id: "banking",
      label: "Bank Details",
      icon: CreditCard,
      component: BankDetailsSettings,
      description: "Manage your banking information"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings Menu</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const activeTabData = settingsTabs.find(tab => tab.id === activeTab);
                  const IconComponent = activeTabData?.icon;
                  return (
                    <>
                      {IconComponent && <IconComponent className="w-5 h-5" />}
                      {activeTabData?.label}
                    </>
                  );
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const activeTabData = settingsTabs.find(tab => tab.id === activeTab);
                const ComponentToRender = activeTabData?.component;
                return ComponentToRender ? <ComponentToRender /> : null;
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;