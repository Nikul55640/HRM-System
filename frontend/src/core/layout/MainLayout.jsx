import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useState } from "react";
import useNotifications from "../../hooks/useNotifications";
import NotificationDebug from "../../Debug/NotificationDebug";


const MainLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize notifications
  useNotifications();

  return (
    <div className="min-h-screen bg-gray-50">
      
      <Sidebar 
        setLayoutSidebarExpanded={setSidebarExpanded}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className={`
        flex flex-col min-h-screen transition-all duration-300
        ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}
        ml-0
      `}>
        <Header 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-2 sm:py-3 lg:py-4">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>

      {/* Debug component for development
      <NotificationDebug /> */}
     
    </div>
  );
};

export default MainLayout;
