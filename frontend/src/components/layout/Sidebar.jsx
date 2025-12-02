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
