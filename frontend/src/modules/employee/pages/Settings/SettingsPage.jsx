import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Lock, Briefcase, Bell, Shield, FileText, CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../shared/ui/card";
import { Button } from "../../../../shared/ui/button";
import ProfileSettings from "./components/ProfileSettings";
import PasswordSettings from "./components/PasswordSettings";
import WorkDetailsSettings from "./components/WorkDetailsSettings";
import NotificationSettings from "./components/NotificationSettings";
import SecuritySettings from "./components/SecuritySettings";
import DocumentSettings from "./components/DocumentSettings";
import BankDetailsSettings from "./components/BankDetailsSettings";

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  const settingsTabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage your personal information",
      component: ProfileSettings,
    },
    {
      id: "password",
      label: "Password & Security",
      icon: Lock,
      description: "Change password and security settings",
      component: PasswordSettings,
    },
    {
      id: "work",
      label: "Work Details",
      icon: Briefcase,
      description: "View your job information",
      component: WorkDetailsSettings,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Configure notification preferences",
      component: NotificationSettings,
    },
    {
      id: "security",
      label: "Privacy & Security",
      icon: Shield,
      description: "Manage privacy and security settings",
      component: SecuritySettings,
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      description: "Manage your documents and files",
      component: DocumentSettings,
    },
    {
      id: "bank",
      label: "Bank Details",
      icon: CreditCard,
      description: "Manage your banking information",
      component: BankDetailsSettings,
    },
  ];

  // Handle URL parameters for direct tab navigation
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && settingsTabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, settingsTabs]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const ActiveComponent = settingsTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
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
                  const Icon = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      className={`w-full justify-start px-4 py-3 h-auto ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => handleTabChange(tab.id)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {tab.description}
                        </div>
                      </div>
                    </Button>
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
                  const currentTab = settingsTabs.find(tab => tab.id === activeTab);
                  const Icon = currentTab?.icon;
                  return (
                    <>
                      {Icon && <Icon className="w-5 h-5" />}
                      {currentTab?.label}
                    </>
                  );
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ActiveComponent && <ActiveComponent />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;