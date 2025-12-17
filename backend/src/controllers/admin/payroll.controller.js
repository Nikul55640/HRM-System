import Payslip from '../../models/sequelize/Payslip.js';
import Employee from '../../models/sequelize/Employee.js';
import SalaryStructure from '../../models/sequelize/SalaryStructure.js';
import AuditLog from '../../models/sequelize/AuditLog.js';
import { generatePayslipPDF } from '../../utils/generatePayslipPDF.js';

// ---------------------------------------------------------
// PAYROLL DASHBOARD
// ---------------------------------------------------------
const getPayrollDashboard = async (req, res) => {
  try {
    console.log('📊 [PAYROLL] Fetching dashboard data');
    console.log('📊 [PAYROLL] User:', req.user);
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    console.log('📊 [PAYROLL] Period:', { currentMonth, currentYear });
    
    // Get payroll statistics
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const processedPayslips = await Payslip.countDocuments({
      month: currentMonth,
      year: currentYear
    });
    const pendingPayslips = totalEmployees - processedPayslips;
    
    // Get total payroll amount for current month
    const payrollSummary = await Payslip.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear
        }
      },
      {
        $group: {
          _id: null,
          totalGrossPay: { $sum: '$grossPay' },
          totalNetPay: { $sum: '$netPay' },
          totalDeductions: { $sum: '$totalDeductions' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get recent payslips
    const recentPayslips = await Payslip.find()
      .populate('employeeId', 'fullName employeeNumber')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Get salary structure statistics
    const salaryStructures = await SalaryStructure.countDocuments({ isActive: true });
    
    const dashboardData = {
      statistics: {
        totalEmployees,
        processedPayslips,
        pendingPayslips,
        salaryStructures,
        payrollSummary: payrollSummary[0] || {
          totalGrossPay: 0,
          totalNetPay: 0,
          totalDeductions: 0,
          count: 0
        }
      },
      recentPayslips,
      currentPeriod: {
        month: currentMonth,
        year: currentYear
      }
    };
    
    console.log('✅ [PAYROLL] Dashboard data prepared');
    
    // Log audit (optional - don't fail if audit logging fails)
    try {
      await AuditLog.logAction({
        action: 'VIEW',
        severity: 'info',
        entityType: 'Payroll',
        entityId: 'dashboard',
        entityDisplayName: 'Payroll Dashboard',
        userId: req.user?.id || req.user?._id,
        userRole: req.user?.role,
        performedByName: req.user?.fullName || 'Unknown',
        performedByEmail: req.user?.email || 'unknown@example.com',
        meta: {
          totalEmployees,
          processedPayslips,
          pendingPayslips
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    } catch (auditError) {
      console.warn('⚠️ [PAYROLL] Audit log failed (non-critical):', auditError.message);
    }
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('❌ [PAYROLL] Dashboard error:', error);
    console.error('❌ [PAYROLL] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching payroll dashboard',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ---------------------------------------------------------
// GET ALL PAYSLIPS (Admin)
// ---------------------------------------------------------
const getAllPayslips = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      month,
      year,
      employeeId,
      status
    } = req.query;
    
    console.log('📋 [PAYROLL] Fetching payslips:', { page, limit, month, year, employeeId, status });
    
    // Build filter
    const filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const payslips = await Payslip.find(filter)
      .populate('employeeId', 'fullName employeeNumber department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Payslip.countDocuments(filter);
    
    console.log('✅ [PAYROLL] Payslips fetched:', payslips.length);
    
    res.status(200).json({
      success: true,
      data: payslips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ [PAYROLL] Get payslips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payslips',
      error: error.message
    });
  }
};

// ---------------------------------------------------------
// GENERATE PAYSLIPS (Bulk)
// ---------------------------------------------------------
const generatePayslips = async (req, res) => {
  try {
    const { month, year, employeeIds } = req.body;
    
    console.log('⚙️ [PAYROLL] Generating payslips:', { month, year, employeeIds: employeeIds?.length });
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }
    
    // Get employees to process
    const filter = { isActive: true };
    if (employeeIds && employeeIds.length > 0) {
      filter._id = { $in: employeeIds };
    }
    
    const employees = await Employee.find(filter)
      .populate('salaryStructure')
      .lean();
    
    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No employees found to process'
      });
    }
    
    const results = {
      success: [],
      errors: [],
      total: employees.length
    };
    
    // Process each employee
    for (const employee of employees) {
      try {
        // Check if payslip already exists
        const existingPayslip = await Payslip.findOne({
          employeeId: employee._id,
          month: parseInt(month),
          year: parseInt(year)
        });
        
        if (existingPayslip) {
          results.errors.push({
            employeeId: employee._id,
            employeeName: employee.fullName,
            error: 'Payslip already exists for this period'
          });
          continue;
        }
        
        // Calculate salary (basic calculation)
        const salaryStructure = employee.salaryStructure || {};
        const basicSalary = salaryStructure.basicSalary || employee.basicSalary || 0;
        const allowances = salaryStructure.allowances || 0;
        const grossPay = basicSalary + allowances;
        
        // Calculate deductions (basic calculation)
        const providentFund = grossPay * 0.12; // 12% PF
        const tax = grossPay > 50000 ? grossPay * 0.1 : 0; // 10% tax if > 50k
        const totalDeductions = providentFund + tax;
        const netPay = grossPay - totalDeductions;
        
        // Create payslip
        const payslip = new Payslip({
          employeeId: employee._id,
          month: parseInt(month),
          year: parseInt(year),
          basicSalary,
          allowances,
          grossPay,
          deductions: {
            providentFund,
            tax,
            other: 0
          },
          totalDeductions,
          netPay,
          status: 'generated',
          generatedBy: req.user.id || req.user._id,
          generatedAt: new Date()
        });
        
        await payslip.save();
        
        results.success.push({
          employeeId: employee._id,
          employeeName: employee.fullName,
          payslipId: payslip._id,
          netPay
        });
        
      } catch (error) {
        results.errors.push({
          employeeId: employee._id,
          employeeName: employee.fullName,
          error: error.message
        });
      }
    }
    
    console.log('✅ [PAYROLL] Payslips generated:', results.success.length, 'success,', results.errors.length, 'errors');
    
    // Log audit
    await AuditLog.logAction({
      action: 'CREATE',
      severity: 'info',
      entityType: 'Payroll',
      entityId: 'bulk-generation',
      entityDisplayName: `Bulk Payslip Generation - ${month}/${year}`,
      userId: req.user.id || req.user._id,
      userRole: req.user.role,
      performedByName: req.user.fullName,
      performedByEmail: req.user.email,
      meta: {
        month,
        year,
        totalEmployees: results.total,
        successCount: results.success.length,
        errorCount: results.errors.length
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      message: `Generated ${results.success.length} payslips successfully`,
      data: results
    });
    
  } catch (error) {
    console.error('❌ [PAYROLL] Generate payslips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating payslips',
      error: error.message
    });
  }
};

// ---------------------------------------------------------
// GET PAYSLIP BY ID
// ---------------------------------------------------------
const getPayslipById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📄 [PAYROLL] Fetching payslip:', id);
    
    const payslip = await Payslip.findById(id)
      .populate('employeeId', 'fullName employeeNumber department email')
      .populate('generatedBy', 'fullName email')
      .lean();
    
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }
    
    console.log('✅ [PAYROLL] Payslip fetched');
    
    res.status(200).json({
      success: true,
      data: payslip
    });
    
  } catch (error) {
    console.error('❌ [PAYROLL] Get payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payslip',
      error: error.message
    });
  }
};

// ---------------------------------------------------------
// DELETE PAYSLIP
// ---------------------------------------------------------
const deletePayslip = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ [PAYROLL] Deleting payslip:', id);
    
    const payslip = await Payslip.findById(id);
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }
    
    await Payslip.findByIdAndDelete(id);
    
    console.log('✅ [PAYROLL] Payslip deleted');
    
    // Log audit
    await AuditLog.logAction({
      action: 'DELETE',
      severity: 'warning',
      entityType: 'Payroll',
      entityId: id,
      entityDisplayName: `Payslip - ${payslip.month}/${payslip.year}`,
      userId: req.user.id || req.user._id,
      userRole: req.user.role,
      performedByName: req.user.fullName,
      performedByEmail: req.user.email,
      meta: {
        employeeId: payslip.employeeId,
        month: payslip.month,
        year: payslip.year,
        netPay: payslip.netPay
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      message: 'Payslip deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ [PAYROLL] Delete payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payslip',
      error: error.message
    });
  }
};

// ---------------------------------------------------------
// GET EMPLOYEE PAYROLL INFO
// ---------------------------------------------------------
const getEmployeePayroll = async (req, res) => {
  try {
    console.log('👥 [PAYROLL] Fetching employee payroll information');
    
    const employees = await Employee.find({ isActive: true })
      .select('employeeNumber personalInfo jobDetails salaryStructure')
      .populate('salaryStructure')
      .lean();
    
    console.log('✅ [PAYROLL] Employee payroll fetched:', employees.length);
    
    res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('❌ [PAYROLL] Employee payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee payroll',
      error: error.message
    });
  }
};

// ---------------------------------------------------------
// GET SALARY STRUCTURES
// ---------------------------------------------------------
const getSalaryStructures = async (req, res) => {
  try {
    console.log('💰 [PAYROLL] Fetching salary structures');
    
    const structures = await SalaryStructure.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log('✅ [PAYROLL] Salary structures fetched:', structures.length);
    
    res.status(200).json({
      success: true,
      data: structures
    });
  } catch (error) {
    console.error('❌ [PAYROLL] Salary structures error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching salary structures',
      error: error.message
    });
  }
};

// ---------------------------------------------------------
// CREATE SALARY STRUCTURE
// ---------------------------------------------------------
const createSalaryStructure = async (req, res) => {
  try {
    console.log('➕ [PAYROLL] Creating salary structure');
    
    const structure = new SalaryStructure(req.body);
    await structure.save();
    
    console.log('✅ [PAYROLL] Salary structure created:', structure._id);
    
    res.status(201).json({
      success: true,
      data: structure,
      message: 'Salary structure created successfully'
    });
  } catch (error) {
    console.error('❌ [PAYROLL] Create salary structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating salary structure',
      error: error.message
    });
  }
};

// ---------------------------------------------------------
// UPDATE SALARY STRUCTURE
// ---------------------------------------------------------
const updateSalaryStructure = async (req, res) => {
  try {
    console.log('✏️ [PAYROLL] Updating salary structure:', req.params.id);
    
    const structure = await SalaryStructure.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!structure) {
      return res.status(404).json({
        success: false,
        message: 'Salary structure not found'
      });
    }
    
    console.log('✅ [PAYROLL] Salary structure updated');
    
    res.status(200).json({
      success: true,
      data: structure,
      message: 'Salary structure updated successfully'
    });
  } catch (error) {
    console.error('❌ [PAYROLL] Update salary structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating salary structure',
      error: error.message
    });
  }
};

// ---------------------------------------------------------
// DELETE SALARY STRUCTURE
// ---------------------------------------------------------
const deleteSalaryStructure = async (req, res) => {
  try {
    console.log('🗑️ [PAYROLL] Deleting salary structure:', req.params.id);
    
    const structure = await SalaryStructure.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!structure) {
      return res.status(404).json({
        success: false,
        message: 'Salary structure not found'
      });
    }
    
    console.log('✅ [PAYROLL] Salary structure deleted');
    
    res.status(200).json({
      success: true,
      message: 'Salary structure deleted successfully'
    });
  } catch (error) {
    console.error('❌ [PAYROLL] Delete salary structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting salary structure',
      error: error.message
    });
  }
};

export {
  getPayrollDashboard,
  getAllPayslips,
  generatePayslips,
  getPayslipById,
  deletePayslip,
  getEmployeePayroll,
  getSalaryStructures,
  createSalaryStructure,
  updateSalaryStructure,
  deleteSalaryStructure
};
