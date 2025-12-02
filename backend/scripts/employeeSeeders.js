import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../src/models/User.js";
import Employee from "../src/models/Employee.js";
import AttendanceRecord from "../src/models/AttendanceRecord.js";
import LeaveRequest from "../src/models/LeaveRequest.js";
import Payslip from "../src/models/Payslip.js";
import Notification from "../src/models/Notification.js";
import AuditLog from "../src/models/AuditLog.js";

dotenv.config({ path: "./.env" });

// ---------------------------------------------------
// 1. CONNECT DB
// ---------------------------------------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✔ MongoDB connected");
  } catch (err) {
    console.error("❌ DB Connection Failed", err);
    process.exit(1);
  }
};

// ---------------------------------------------------
// HELPERS
// ---------------------------------------------------
const createUser = async (email, password, role, employeeId = null, assignedDepartments = []) => {
  const exists = await User.findOne({ email });
  if (exists) return exists;

  const user = new User({
    email,
    password,
    role,
    employeeId,
    assignedDepartments,
    isActive: true,
  });

  await user.save();
  console.log(`✔ User created → ${email}`);
  return user;
};

const createEmployee = async (data, userId) => {
  const exists = await Employee.findOne({ "contactInfo.email": data.contactInfo.email });
  if (exists) return exists;

  const employee = new Employee({
    ...data,
    userId,
    createdBy: userId,
    updatedBy: userId,
  });

  await employee.save();
  console.log(`✔ Employee created → ${employee.employeeId}`);
  return employee;
};

// ---------------------------------------------------
// 2. SEED DATA
// ---------------------------------------------------
const runSeeder = async () => {
  try {
    console.log("🔄 Clearing old data...");
    await User.deleteMany({});
    await Employee.deleteMany({});
    await AttendanceRecord.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Payslip.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    console.log("✔ Old data removed\n");

    // --------------------------
    // 1️⃣ SUPER ADMIN
    // --------------------------
    const superAdmin = await createUser(
      "superadmin@hrm.com",
      "Password123!",
      "SuperAdmin",
      null,
      []
    );

    console.log("");

    // --------------------------
    // 2️⃣ HR MANAGER (Employee + User)
    // --------------------------
    const hrManagerUser = await createUser(
      "hrmanager@hrm.com",
      "Password123!",
      "HR Manager",
      null,
      ["674000000000000000000002"] // HR Department
    );

    const hrManagerEmployee = await createEmployee({
      personalInfo: { firstName: "Priya", lastName: "Sharma", gender: "Female" },
      contactInfo: { email: "hrmanager@hrm.com", phoneNumber: "9998887777" },
      jobInfo: {
        jobTitle: "HR Manager",
        department: new mongoose.Types.ObjectId("674000000000000000000002"),
        hireDate: new Date(),
        employmentType: "full-time",
      },
      status: "active",
      isPrivate: false,
    }, hrManagerUser._id);

    hrManagerUser.employeeId = hrManagerEmployee._id;
    await hrManagerUser.save();

    console.log("");

    // --------------------------
    // 3️⃣ HR ADMIN
    // --------------------------
    const hrAdminUser = await createUser(
      "hradmin@hrm.com",
      "Password123!",
      "HR Administrator"
    );

    const hrAdminEmployee = await createEmployee({
      personalInfo: { firstName: "Raj", lastName: "Kapoor", gender: "Male" },
      contactInfo: { email: "hradmin@hrm.com", phoneNumber: "8887776666" },
      jobInfo: {
        jobTitle: "HR Administrator",
        department: new mongoose.Types.ObjectId("674000000000000000000002"),
        hireDate: new Date(),
        employmentType: "full-time",
      },
      status: "active",
      isPrivate: false,
    }, hrAdminUser._id);

    hrAdminUser.employeeId = hrAdminEmployee._id;
    await hrAdminUser.save();

    console.log("");

    // --------------------------
    // 4️⃣ 5 Employees
    // --------------------------
    const departments = [
      "674000000000000000000001", // Engineering
      "674000000000000000000003", // Finance
      "674000000000000000000004", // Marketing
      "69282079e9a8096219c2b5c2", // IT Support
      "674000000000000000000002", // HR
    ];

    for (let i = 0; i < 5; i++) {
      const email = `employee${i + 1}@hrm.com`;

      const user = await createUser(email, "Password123!", "Employee");

      const emp = await createEmployee({
        personalInfo: { firstName: "Employee", lastName: `${i + 1}`, gender: "Male" },
        contactInfo: { email, phoneNumber: `90000000${i}${i}` },
        jobInfo: {
          jobTitle: "Staff",
          department: new mongoose.Types.ObjectId(departments[i]),
          hireDate: new Date(),
          employmentType: "full-time",
        },
        status: "active",
        isPrivate: false,
      }, user._id);

      user.employeeId = emp._id;
      await user.save();
    }

    console.log("\n🎉 SEEDING COMPLETED SUCCESSFULLY!\n");
  } catch (err) {
    console.error("❌ Seeder error:", err);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(runSeeder);
