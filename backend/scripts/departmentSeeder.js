import mongoose from "mongoose";
import dotenv from "dotenv";
import Department from "../src/models/Department.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

//
// 1. Connect to DB
//
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✔ Database connected");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
};

//
// 2. Default Departments
//
const departments = [
  {
    name: "Engineering",
    code: "ENG",
    description: "Software engineering & development",
    location: "Head Office",
    isActive: true,
  },
  {
    name: "Human Resources",
    code: "HR",
    description: "Employee management & HR operations",
    location: "Corporate Block A",
    isActive: true,
  },
  {
    name: "Finance",
    code: "FIN",
    description: "Finance, payroll & accounting",
    location: "Corporate Block B",
    isActive: true,
  },
  {
    name: "Marketing",
    code: "MKT",
    description: "Marketing & brand strategy",
    location: "HQ Floor 3",
    isActive: true,
  },
  {
    name: "IT Support",
    code: "ITS",
    description: "Technical support & IT operations",
    location: "HQ Floor 2",
    isActive: true,
  },
];

//
// 3. Create Departments
//
const seedDepartments = async () => {
  try {
    console.log("\n🔍 Checking existing departments...");

    for (const dept of departments) {
      const exists = await Department.findOne({ code: dept.code });

      if (exists) {
        console.log(`⚠ Skipped (already exists): ${dept.name} → ${exists._id}`);
        continue;
      }

      const created = await Department.create(dept);
      console.log(`✔ Created: ${dept.name} → ${created._id}`);
    }

    console.log("\n🎉 Department seeding complete!");
  } catch (err) {
    console.error("❌ Error inserting departments:", err);
  } finally {
    mongoose.connection.close();
  }
};

//
// RUN SEEDER
//
connectDB().then(seedDepartments);
