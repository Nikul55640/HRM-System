# HRMS Frontend

React frontend application for the HRMS Employee Management module.

## Directory Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # Redux store and slices
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── .env.example         # Environment variables template
├── .eslintrc.json       # ESLint configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.js       # Vite configuration
└── package.json
```

## Features

- React 18 with functional components and hooks
- Redux Toolkit for state management
- React Router v6 for navigation
- Tailwind CSS for styling
- Formik + Yup for forms and validation
- Axios for API communication
- Toast notifications

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```
VITE_API_URL=http://localhost:5000/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

## Component Structure

Components are organized by feature:

- **components/** - Shared/reusable components
- **pages/** - Page-level components
- **store/slices/** - Redux slices for state management

## Styling

This project uses Tailwind CSS for styling. Custom theme configuration can be found in `tailwind.config.js`.

## Testing

Tests are written using React Testing Library and Jest.
import { useState } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const Sidebar = () => {
  const [openSections, setOpenSections] = useState(["General"]);
  const [activePath, setActivePath] = useState("/dashboard");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleNavigate = (path) => {
    setActivePath(path);
  };

  const Icon = ({ name, className = "w-4 h-4" }) => {
    const LucideIcon = Icons[name];
    return LucideIcon ? (
      <LucideIcon className={className} />
    ) : (
      <Icons.Circle className={className} />
    );
  };

  const nav = [
    {
      section: "General",
      icon: "Home",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: "LayoutDashboard",
          badge: null,
        },
        {
          name: "Directory",
          path: "/directory",
          icon: "BookOpen",
          badge: null,
        },
      ],
    },
    {
      section: "My Self Service",
      icon: "User",
      items: [
        { name: "My Profile", path: "/profile", icon: "User", badge: null },
        {
          name: "Bank Details",
          path: "/bank-details",
          icon: "Banknote",
          badge: null,
        },
        {
          name: "My Payslips",
          path: "/payslips",
          icon: "Receipt",
          badge: null,
        },
        { name: "Leave", path: "/leave", icon: "CalendarDays", badge: 2 },
        { name: "Attendance", path: "/attendance", icon: "Clock", badge: null },
        {
          name: "My Documents",
          path: "/documents",
          icon: "FileText",
          badge: null,
        },
        {
          name: "My Requests",
          path: "/requests",
          icon: "FileSignature",
          badge: 1,
        },
      ],
    },
    {
      section: "Calendar",
      icon: "Calendar",
      collapsible: true,
      items: [
        {
          name: "Calendar Overview",
          path: "/calendar",
          icon: "CalendarRange",
          badge: null,
        },
        {
          name: "Daily View",
          path: "/calendar/daily",
          icon: "CalendarCheck",
          badge: null,
        },
        {
          name: "Monthly View",
          path: "/calendar/monthly",
          icon: "Calendar",
          badge: null,
        },
      ],
    },
    {
      section: "Manager Tools",
      icon: "Users",
      items: [
        {
          name: "Approvals",
          path: "/manager/approvals",
          icon: "CheckSquare",
          badge: 5,
        },
        { name: "My Team", path: "/manager/team", icon: "Users", badge: null },
        {
          name: "Reports",
          path: "/manager/reports",
          icon: "BarChart3",
          badge: null,
        },
      ],
    },
    {
      section: "HR Administration",
      icon: "Settings",
      collapsible: true,
      items: [
        {
          name: "Attendance Admin",
          path: "/admin/attendance",
          icon: "Clock4",
          badge: null,
        },
        {
          name: "Leave Approvals",
          path: "/admin/leave-requests",
          icon: "ClipboardCheck",
          badge: 3,
        },
        {
          name: "Departments",
          path: "/hr/departments",
          icon: "Building2",
          badge: null,
        },
        {
          name: "Designations",
          path: "/hr/designations",
          icon: "Briefcase",
          badge: null,
        },
        {
          name: "Policies",
          path: "/hr/policies",
          icon: "ScrollText",
          badge: null,
        },
        {
          name: "Holidays",
          path: "/hr/holidays",
          icon: "PartyPopper",
          badge: null,
        },
        {
          name: "Company Docs",
          path: "/hr/documents",
          icon: "Folder",
          badge: null,
        },
      ],
    },
    {
      section: "Payroll",
      icon: "DollarSign",
      collapsible: true,
      items: [
        {
          name: "Payroll Dashboard",
          path: "/payroll",
          icon: "Wallet",
          badge: null,
        },
        {
          name: "Employees",
          path: "/payroll/employees",
          icon: "UserCheck",
          badge: null,
        },
        {
          name: "Structures",
          path: "/payroll/structures",
          icon: "Layers",
          badge: null,
        },
        {
          name: "Payslips",
          path: "/payroll/payslips",
          icon: "FileSpreadsheet",
          badge: null,
        },
      ],
    },
    {
      section: "Admin",
      icon: "Shield",
      items: [
        { name: "Users", path: "/users", icon: "Shield", badge: null },
        { name: "Settings", path: "/settings", icon: "Settings", badge: null },
        {
          name: "Audit Logs",
          path: "/admin/logs",
          icon: "ListChecks",
          badge: null,
        },
      ],
    },
  ];

  const totalBadges = nav.reduce(
    (sum, group) =>
      sum +
      group.items.reduce((itemSum, item) => itemSum + (item.badge || 0), 0),
    0
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: isSidebarExpanded ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-r border-gray-200 shadow-sm flex flex-col relative"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <motion.div
            animate={{
              opacity: isSidebarExpanded ? 1 : 0,
              width: isSidebarExpanded ? "auto" : 0,
            }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icons.Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">HRM</h1>
              <p className="text-xs text-gray-500">System</p>
            </div>
          </motion.div>
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            {isSidebarExpanded ? (
              <Icons.ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <Icons.ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Notifications Badge */}
        {isSidebarExpanded && totalBadges > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-4 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-blue-700">
              {totalBadges} pending action{totalBadges > 1 ? "s" : ""}
            </span>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto mt-4 px-2 space-y-2">
          {nav.map((group) => (
            <div key={group.section}>
              {/* Section Header */}
              {group.collapsible ? (
                <motion.button
                  onClick={() => toggleSection(group.section)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    openSections.includes(group.section)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon name={group.icon} className="w-4 h-4 flex-shrink-0" />
                  <motion.div
                    animate={{
                      width: isSidebarExpanded ? "auto" : 0,
                      opacity: isSidebarExpanded ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between flex-1 overflow-hidden"
                  >
                    <span className="text-sm font-medium truncate">
                      {group.section}
                    </span>
                    <motion.div
                      animate={{
                        rotate: openSections.includes(group.section) ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icons.ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </motion.button>
              ) : (
                <motion.div
                  animate={{
                    opacity: isSidebarExpanded ? 1 : 0,
                    height: isSidebarExpanded ? "auto" : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-xs uppercase tracking-wide text-gray-500 font-semibold px-3 py-2 overflow-hidden"
                >
                  {group.section}
                </motion.div>
              )}

              {/* Menu Items */}
              <AnimatePresence>
                {(!group.collapsible ||
                  openSections.includes(group.section)) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {group.items.map((item) => (
                      <motion.button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        whileHover={{ x: 4 }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          activePath === item.path
                            ? "bg-blue-500 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        title={item.name}
                      >
                        <Icon
                          name={item.icon}
                          className={`w-4 h-4 flex-shrink-0 ${
                            activePath === item.path ? "text-white" : ""
                          }`}
                        />
                        <motion.span
                          animate={{
                            width: isSidebarExpanded ? "auto" : 0,
                            opacity: isSidebarExpanded ? 1 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                          className="flex-1 text-left text-sm truncate overflow-hidden"
                        >
                          {item.name}
                        </motion.span>
                        {item.badge && isSidebarExpanded && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              activePath === item.path
                                ? "bg-blue-400 text-white"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <motion.div className="border-t border-gray-100 p-3 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Icons.HelpCircle className="w-4 h-4 flex-shrink-0" />
            <motion.span
              animate={{
                width: isSidebarExpanded ? "auto" : 0,
                opacity: isSidebarExpanded ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="text-sm truncate overflow-hidden"
            >
              Help
            </motion.span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Icons.LogOut className="w-4 h-4 flex-shrink-0" />
            <motion.span
              animate={{
                width: isSidebarExpanded ? "auto" : 0,
                opacity: isSidebarExpanded ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="text-sm truncate overflow-hidden"
            >
              Logout
            </motion.span>
          </button>
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <motion.div
          key={activePath}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Sidebar;



import { Link, useLocation } from "react-router-dom";
import { RoleGuard } from "../../components/common";
import useAuth from "../../hooks/useAuth";
import { useState } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const { user, isHRManager } = useAuth();
  const [openSection, setOpenSection] = useState("");

  const toggle = (section) =>
    setOpenSection(openSection === section ? "" : section);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // Icon Renderer
  const Icon = ({ name, className = "w-5 h-5" }) => {
    const LucideIcon = Icons[name];
    return LucideIcon ? (
      <LucideIcon className={className} />
    ) : (
      <Icons.Circle className={className} />
    );
  };

  // -------------------------------
  // 🔥 MAIN SIDEBAR NAV DATA
  // -------------------------------
  const nav = [
    {
      section: "General",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: "LayoutDashboard",
          roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"],
        },
        {
          name: "Directory",
          path: "/directory",
          icon: "BookOpen",
          roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"],
        },
      ],
    },

    {
      section: "My Self Service",
      items: [
        { name: "My Profile", path: "/profile", icon: "User" },
        { name: "Bank Details", path: "/bank-details", icon: "Banknote" },
        { name: "My Payslips", path: "/payslips", icon: "Receipt" },
        { name: "Leave", path: "/leave", icon: "CalendarDays" },
        { name: "Attendance", path: "/attendance", icon: "Clock" },
        { name: "My Documents", path: "/documents", icon: "FileText" },
        { name: "My Requests", path: "/requests", icon: "FileSignature" },
      ].map((i) => ({
        ...i,
        roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"],
      })),
    },

    {
      section: "Calendar",
      collapsible: true,
      items: [
        { name: "Calendar Overview", path: "/calendar", icon: "CalendarRange" },
        { name: "Daily View", path: "/calendar/daily", icon: "CalendarCheck" },
        { name: "Monthly View", path: "/calendar/monthly", icon: "Calendar" },
      ].map((i) => ({
        ...i,
        roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"],
      })),
    },

    {
      section: "Manager Tools",
      items: [
        {
          name: "Approvals",
          path: "/manager/approvals",
          icon: "CheckSquare",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "My Team",
          path: "/manager/team",
          icon: "Users",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "Reports",
          path: "/manager/reports",
          icon: "BarChart3",
          roles: ["HR Manager", "SuperAdmin"],
        },
      ],
    },

    {
      section: "HR Administration",
      collapsible: true,
      items: [
        {
          name: "Attendance Admin",
          path: "/admin/attendance",
          icon: "Clock4",
          roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
        },
        {
          name: "Leave Approvals",
          path: "/admin/leave-requests",
          icon: "ClipboardCheck",
          roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
        },
        {
          name: "Departments",
          path: "/hr/departments",
          icon: "Building2",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "Designations",
          path: "/hr/designations",
          icon: "Briefcase",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "Policies",
          path: "/hr/policies",
          icon: "ScrollText",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "Holidays",
          path: "/hr/holidays",
          icon: "PartyPopper",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "Company Docs",
          path: "/hr/documents",
          icon: "Folder",
          roles: ["HR Manager", "SuperAdmin"],
        },
      ],
    },

    {
      section: "Payroll",
      collapsible: true,
      items: [
        {
          name: "Payroll Dashboard",
          path: "/payroll",
          icon: "Wallet",
          roles: ["SuperAdmin"],
        },
        {
          name: "Employees",
          path: "/payroll/employees",
          icon: "UserCheck",
          roles: ["SuperAdmin"],
        },
        {
          name: "Structures",
          path: "/payroll/structures",
          icon: "Layers",
          roles: ["SuperAdmin"],
        },
        {
          name: "Payslips",
          path: "/payroll/payslips",
          icon: "FileSpreadsheet",
          roles: ["SuperAdmin"],
        },
      ],
    },

    {
      section: "Admin",
      items: [
        {
          name: "Users",
          path: "/users",
          icon: "Shield",
          roles: ["SuperAdmin"],
        },
        {
          name: "Settings",
          path: "/settings",
          icon: "Settings",
          roles: ["SuperAdmin"],
        },
        {
          name: "Audit Logs",
          path: "/admin/logs",
          icon: "ListChecks",
          roles: ["SuperAdmin"],
        },
      ],
    },
  ];

  // --------------------------------
  // 🌟 Sidebar Render
  // --------------------------------
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="mt-5 px-2">
        {nav.map((group) => (
          <div key={group.section} className="mb-6">
            <h3 className="text-gray-500 text-xs uppercase tracking-wide mb-2 px-3">
              {group.section}
            </h3>

            {group.collapsible ? (
              <>
                {/* Collapsible button */}
                <button
                  onClick={() => toggle(group.section)}
                  className="w-full flex items-center justify-between text-left px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
                >
                  <span>{group.section}</span>

                  <motion.span
                    animate={{ rotate: openSection === group.section ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▶
                  </motion.span>
                </button>

                {/* Animated Dropdown */}
                <AnimatePresence>
                  {openSection === group.section && (
                    <motion.div
                      className="ml-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {group.items.map((item) => (
                        <RoleGuard key={item.path} allowedRoles={item.roles}>
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Link
                              to={item.path}
                              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                                isActive(item.path)
                                  ? "bg-primary-100 text-primary-900"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              <Icon name={item.icon} className="w-5 h-5 mr-3" />
                              {item.name}
                            </Link>
                          </motion.div>
                        </RoleGuard>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              // Non-Collapsible items
              group.items.map((item) => (
                <RoleGuard key={item.path} allowedRoles={item.roles}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      isActive(item.path)
                        ? "bg-primary-100 text-primary-900"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon name={item.icon} className="w-5 h-5 mr-3" />
                    {item.name}

                    {item.path === "/employees" &&
                      isHRManager() &&
                      user?.assignedDepartments?.length > 0 && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Scoped
                        </span>
                      )}
                  </Link>
                </RoleGuard>
              ))
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
