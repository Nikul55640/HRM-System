import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import UserSwitcher from '../common/UserSwitcher';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
      
      {/* Quick User Switcher for Testing */}
      {process.env.NODE_ENV === 'development' && <UserSwitcher />}
      
      {/* Debug: Show current user role */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black text-white px-3 py-2 rounded text-xs font-mono z-50">
          Role: {JSON.parse(localStorage.getItem('user') || '{}').role || 'None'}
        </div>
      )}
    </div>
  );
};

export default MainLayout;
