import { Employee, AuditLog, Department } from "../../models/sequelize/index.js";
import logger from "../../utils/logger.js";
import { ROLES } from "../../config/rolePermissions.js";

/**
 * Employee Service Layer
 * Handles all business logic for employee management
 */

/**
 * Create a new employee
 * @param {Object} employeeData - Employee data
 * @param {Object} user - User creating the employee
 * @param {Object} metadata - Request metadata (IP, user agent)
 * @returns {Promise<Object>} Created employee
 */
const createEmployee = async (employeeData, user, metadata = {}) => {
  try {
    // -------------------------
    // 1. BASIC REQUIRED FIELDS
    // -------------------------
    if (
      !employeeData.personalInfo?.firstName ||
      !employeeData.personalInfo?.lastName
    ) {
      throw {
        code: "MISSING_NAME",
        message: "First name and last name are required.",
        statusCode: 400,
      };
    }

    if (!employeeData.contactInfo?.email) {
      throw {
        code: "MISSING_EMAIL",
        message: "Contact email is required.",
        statusCode: 400,
      };
    }

    if (!employeeData.jobInfo?.jobTitle) {
      throw {
        code: "MISSING_JOB_TITLE",
        message: "Job title is required.",
        statusCode: 400,
      };
    }

    if (!employeeData.jobInfo?.department) {
      throw {
        code: "MISSING_DEPARTMENT",
        message: "Department is required.",
        statusCode: 400,
      };
    }

    // Set defaults if missing
    employeeData.jobInfo.hireDate = employeeData.jobInfo.hireDate || new Date();
    employeeData.jobInfo.employmentType =
      employeeData.jobInfo.employmentType || "Full-time";

    // -------------------------
    // 2. CHECK EMAIL UNIQUE
    // -------------------------
    const existingEmployee = await Employee.findOne({
      where: Employee.sequelize.literal(`JSON_EXTRACT(contactInfo, '$.email') = '${employeeData.contactInfo.email.toLowerCase()}'`),
    });

    if (existingEmployee) {
      throw {
        code: "DUPLICATE_EMAIL",
        message: "Employee email already exists.",
        statusCode: 409,
      };
    }

    // -------------------------
    // 3. CREATE EMPLOYEE
    // -------------------------
    const employee = await Employee.create({
      ...employeeData,
      createdBy: user.id,
      updatedBy: user.id,
    });

    // -------------------------
    // 4. LOG IN AUDIT
    // -------------------------
    await AuditLog.logAction({
      action: "CREATE",
      entityType: "Employee",
      entityId: employee.id.toString(),
      userId: user.id,
      userRole: user.role,
      changes: [
        {
          field: "employee",
          oldValue: null,
          newValue: employee.toJSON(),
        },
      ],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    logger.info(
      `Employee created: ${employee.employeeId} by user ${user.email}`
    );

    return employee;
  } catch (error) {
    logger.error("Error creating employee:", error);
    throw error;
  }
};

/**
 * Update an existing employee
 * @param {String} employeeId - Employee ID
 * @param {Object} updateData - Data to update
 * @param {Object} user - User updating the employee
 * @param {Object} metadata - Request metadata
 * @returns {Promise<Object>} Updated employee
 */
const updateEmployee = async (employeeId, updateData, user, metadata = {}) => {
  try {
    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
      throw {
        code: "EMPLOYEE_NOT_FOUND",
        message: "Employee not found.",
        statusCode: 404,
      };
    }

    // Check email uniqueness if email is being updated
    if (updateData.contactInfo?.email) {
      const emailLower = updateData.contactInfo.email.toLowerCase();
      const currentEmail = employee.contactInfo?.email?.toLowerCase();
      if (emailLower !== currentEmail) {
        const existingEmployee = await Employee.findOne({
          where: {
            [Employee.sequelize.Sequelize.Op.and]: [
              Employee.sequelize.literal(`JSON_EXTRACT(contactInfo, '$.email') = '${emailLower}'`),
              { id: { [Employee.sequelize.Sequelize.Op.ne]: employeeId } }
            ]
          },
        });

        if (existingEmployee) {
          throw {
            code: "DUPLICATE_EMAIL",
            message: "An employee with this email already exists.",
            statusCode: 409,
          };
        }
      }
    }

    // Track changes for audit log
    const changes = [];
    const trackFieldChanges = (path, oldVal, newVal, fieldName) => {
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: fieldName || path,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    };

    // Track changes in nested objects
    if (updateData.personalInfo) {
      Object.keys(updateData.personalInfo).forEach((key) => {
        if (employee.personalInfo[key] !== updateData.personalInfo[key]) {
          trackFieldChanges(
            `personalInfo.${key}`,
            employee.personalInfo[key],
            updateData.personalInfo[key],
            `Personal Info - ${key}`
          );
        }
      });
      employee.personalInfo = {
        ...employee.personalInfo,
        ...updateData.personalInfo,
      };
    }

    if (updateData.contactInfo) {
      Object.keys(updateData.contactInfo).forEach((key) => {
        if (key === "currentAddress" && updateData.contactInfo.currentAddress) {
          const oldAddr = employee.contactInfo.currentAddress || {};
          const newAddr = updateData.contactInfo.currentAddress;
          if (JSON.stringify(oldAddr) !== JSON.stringify(newAddr)) {
            trackFieldChanges(
              "contactInfo.currentAddress",
              oldAddr,
              newAddr,
              "Current Address"
            );
          }
        } else if (
          key === "emergencyContacts" &&
          updateData.contactInfo.emergencyContacts
        ) {
          trackFieldChanges(
            "contactInfo.emergencyContacts",
            employee.contactInfo.emergencyContacts,
            updateData.contactInfo.emergencyContacts,
            "Emergency Contacts"
          );
        } else if (employee.contactInfo[key] !== updateData.contactInfo[key]) {
          trackFieldChanges(
            `contactInfo.${key}`,
            employee.contactInfo[key],
            updateData.contactInfo[key],
            `Contact Info - ${key}`
          );
        }
      });
      employee.contactInfo = {
        ...employee.contactInfo,
        ...updateData.contactInfo,
      };
    }

    if (updateData.jobInfo) {
      Object.keys(updateData.jobInfo).forEach((key) => {
        if (
          employee.jobInfo[key]?.toString() !==
          updateData.jobInfo[key]?.toString()
        ) {
          trackFieldChanges(
            `jobInfo.${key}`,
            employee.jobInfo[key],
            updateData.jobInfo[key],
            `Job Info - ${key}`
          );
        }
      });
      employee.jobInfo = {
        ...employee.jobInfo,
        ...updateData.jobInfo,
      };
    }

    // Update other fields
    if (updateData.status && employee.status !== updateData.status) {
      trackFieldChanges("status", employee.status, updateData.status, "Status");
      employee.status = updateData.status;
    }

    if (
      updateData.isPrivate !== undefined &&
      employee.isPrivate !== updateData.isPrivate
    ) {
      trackFieldChanges(
        "isPrivate",
        employee.isPrivate,
        updateData.isPrivate,
        "Privacy Setting"
      );
      employee.isPrivate = updateData.isPrivate;
    }

    if (updateData.customFields) {
      trackFieldChanges(
        "customFields",
        employee.customFields,
        updateData.customFields,
        "Custom Fields"
      );
      employee.customFields = updateData.customFields;
    }

    // Update audit fields
    employee.updatedBy = user.id;

    await employee.save();

    // Log update in audit log
    if (changes.length > 0) {
      await AuditLog.logAction({
        action: "UPDATE",
        entityType: "Employee",
        entityId: employee.id.toString(),
        userId: user.id,
        userRole: user.role,
        changes,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });
    }

    logger.info(
      `Employee updated: ${employee.employeeId} by user ${user.email}`
    );

    return employee;
  } catch (error) {
    logger.error("Error updating employee:", error);
    throw error;
  }
};

/**
 * Get employee by ID with role-based filtering
 * @param {String} employeeId - Employee ID
 * @param {Object} user - User requesting the employee
 * @returns {Promise<Object>} Employee data
 */
const getEmployeeById = async (employeeId, user) => {
  try {
    const where = { id: employeeId };

    // Apply role-based filtering
    if (user.role === ROLES.HR_MANAGER) {
      // HR Manager can only access employees in their assigned departments
      if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
        throw {
          code: "NO_DEPARTMENTS_ASSIGNED",
          message: "You do not have any departments assigned.",
          statusCode: 403,
        };
      }
      where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.department')")] = {
        [Employee.sequelize.Sequelize.Op.in]: user.assignedDepartments
      };
    } else if (user.role === ROLES.EMPLOYEE) {
      // Employees can only access their own profile
      if (!user.employeeId || user.employeeId.toString() !== employeeId) {
        throw {
          code: "FORBIDDEN",
          message: "You can only access your own profile.",
          statusCode: 403,
        };
      }
    }

    const employee = await Employee.findOne({
      where,
    });

    if (!employee) {
      throw {
        code: "EMPLOYEE_NOT_FOUND",
        message: "Employee not found or you do not have access.",
        statusCode: 404,
      };
    }

    // Populate department information
    const empData = employee.toJSON();
    if (empData.jobInfo?.department) {
      try {
        const { Department } = await import("../../models/sequelize/index.js");
        const department = await Department.findByPk(empData.jobInfo.department);
        if (department) {
          empData.jobInfo.departmentInfo = {
            id: department.id,
            name: department.name,
            code: department.code
          };
        }
      } catch (error) {
        logger.error("Error fetching department info:", error);
      }
    }

    return empData;
  } catch (error) {
    logger.error("Error getting employee by ID:", error);
    throw error;
  }
};

/**
 * List employees with pagination and scope filtering
 * @param {Object} filters - Filter criteria
 * @param {Object} user - User requesting the list
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Employees list with pagination info
 */
const listEmployees = async (filters = {}, user, pagination = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const offset = (page - 1) * limit;

    // Build where clause based on filters
    const where = {};

    // Apply role-based scope filtering
    if (user.role === ROLES.HR_MANAGER) {
      if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
        throw {
          code: "NO_DEPARTMENTS_ASSIGNED",
          message: "You do not have any departments assigned.",
          statusCode: 403,
        };
      }
      where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.department')")] = {
        [Employee.sequelize.Sequelize.Op.in]: user.assignedDepartments
      };
    } else if (user.role === ROLES.EMPLOYEE) {
      // Employees can only see their own profile in list
      if (user.employeeId) {
        where.id = user.employeeId;
      } else {
        // No employee profile linked
        return {
          employees: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
      }
    }

    // Apply additional filters
    if (filters.department) {
      where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.department')")] = filters.department;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.employmentType) {
      where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.employmentType')")] = filters.employmentType;
    }

    if (filters.jobTitle) {
      where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.jobTitle')")] = {
        [Employee.sequelize.Sequelize.Op.like]: `%${filters.jobTitle}%`
      };
    }

    if (filters.workLocation) {
      where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.workLocation')")] = {
        [Employee.sequelize.Sequelize.Op.like]: `%${filters.workLocation}%`
      };
    }

    if (filters.search) {
      where[Employee.sequelize.Sequelize.Op.or] = [
        Employee.sequelize.literal(`JSON_EXTRACT(personalInfo, '$.firstName') LIKE '%${filters.search}%'`),
        Employee.sequelize.literal(`JSON_EXTRACT(personalInfo, '$.lastName') LIKE '%${filters.search}%'`),
        Employee.sequelize.literal(`JSON_EXTRACT(contactInfo, '$.email') LIKE '%${filters.search}%'`),
        { employeeId: { [Employee.sequelize.Sequelize.Op.like]: `%${filters.search}%` } },
        Employee.sequelize.literal(`JSON_EXTRACT(contactInfo, '$.phoneNumber') LIKE '%${filters.search}%'`),
      ];
    }

    // Count and fetch employees
    const { count: total, rows: employees } = await Employee.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Populate department information for each employee
    const employeesWithDepartments = await Promise.all(
      employees.map(async (employee) => {
        const empData = employee.toJSON();
        
        // Get department info if department ID exists
        if (empData.jobInfo?.department) {
          try {
            const { Department } = await import("../../models/sequelize/index.js");
            const department = await Department.findByPk(empData.jobInfo.department);
            if (department) {
              empData.jobInfo.departmentInfo = {
                id: department.id,
                name: department.name,
                code: department.code
              };
            }
          } catch (error) {
            logger.error("Error fetching department info:", error);
          }
        }
        
        return empData;
      })
    );

    return {
      employees: employeesWithDepartments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Error listing employees:", error);
    throw error;
  }
};

/**
 * Soft delete an employee
 * @param {String} employeeId - Employee ID
 * @param {Object} user - User deleting the employee
 * @param {Object} metadata - Request metadata
 * @returns {Promise<Object>} Deleted employee
 */
const softDeleteEmployee = async (employeeId, user, metadata = {}) => {
  try {
    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
      throw {
        code: "EMPLOYEE_NOT_FOUND",
        message: "Employee not found.",
        statusCode: 404,
      };
    }

    // Check if already deactivated
    if (employee.status === "Terminated") {
      throw {
        code: "ALREADY_TERMINATED",
        message: "Employee is already terminated.",
        statusCode: 400,
      };
    }

    // Store old status for audit
    const oldStatus = employee.status;

    // Soft delete by updating status and deactivation fields
    employee.status = "Terminated";
    employee.deactivatedAt = new Date();
    employee.deactivatedBy = user.id;
    employee.updatedBy = user.id;

    await employee.save();

    // Log deletion in audit log
    await AuditLog.logAction({
      action: "DELETE",
      entityType: "Employee",
      entityId: employee.id.toString(),
      userId: user.id,
      userRole: user.role,
      changes: [
        {
          field: "status",
          oldValue: oldStatus,
          newValue: "Terminated",
        },
        {
          field: "deactivatedAt",
          oldValue: null,
          newValue: employee.deactivatedAt,
        },
      ],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    logger.info(
      `Employee soft deleted: ${employee.employeeId} by user ${user.email}`
    );

    return employee;
  } catch (error) {
    logger.error("Error soft deleting employee:", error);
    throw error;
  }
};

/**
 * Check if email is unique
 * @param {String} email - Email to check
 * @param {String} excludeEmployeeId - Employee ID to exclude from check (for updates)
 * @returns {Promise<Boolean>} True if email is unique
 */
const isEmailUnique = async (email, excludeEmployeeId = null) => {
  try {
    const where = {
      [Employee.sequelize.literal(`JSON_EXTRACT(contactInfo, '$.email') = '${email.toLowerCase()}'`)]: true
    };
    
    if (excludeEmployeeId) {
      where.id = { [Employee.sequelize.Sequelize.Op.ne]: excludeEmployeeId };
    }

    const existingEmployee = await Employee.findOne({ where });
    return !existingEmployee;
  } catch (error) {
    logger.error("Error checking email uniqueness:", error);
    throw error;
  }
};

/**
 * Search employees with fuzzy matching and role-based filtering
 * @param {String} searchTerm - Search term (name, email, phone, employee ID)
 * @param {Object} user - User performing the search
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Search results with pagination
 */
const searchEmployees = async (searchTerm, user, pagination = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const offset = (page - 1) * limit;

    // Build where clause with role-based filtering
    const where = {};

    // Apply role-based scope filtering
    if (user.role === "HR Manager") {
      if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
        throw {
          code: "NO_DEPARTMENTS_ASSIGNED",
          message: "You do not have any departments assigned.",
          statusCode: 403,
        };
      }
      where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.department')")] = {
        [Employee.sequelize.Sequelize.Op.in]: user.assignedDepartments
      };
    } else if (user.role === "Employee") {
      // Employees can only search within active employees (directory access)
      where.status = "Active";
    }

    // Add search criteria
    if (searchTerm && searchTerm.trim()) {
      const searchPattern = `%${searchTerm.trim()}%`;
      
      where[Employee.sequelize.Sequelize.Op.or] = [
        Employee.sequelize.literal(`JSON_EXTRACT(personalInfo, '$.firstName') LIKE '${searchPattern}'`),
        Employee.sequelize.literal(`JSON_EXTRACT(personalInfo, '$.lastName') LIKE '${searchPattern}'`),
        Employee.sequelize.literal(`JSON_EXTRACT(contactInfo, '$.email') LIKE '${searchPattern}'`),
        { employeeId: { [Employee.sequelize.Sequelize.Op.like]: searchPattern } },
        Employee.sequelize.literal(`JSON_EXTRACT(contactInfo, '$.phoneNumber') LIKE '${searchPattern}'`),
      ];
    }

    // Count and fetch employees
    const { count: total, rows: employees } = await Employee.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    logger.info(
      `Search performed by user ${user.email} with term: ${searchTerm}`
    );

    return {
      employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      searchTerm,
    };
  } catch (error) {
    logger.error("Error searching employees:", error);
    throw error;
  }
};

/**
 * Filter employees by multiple criteria
 * @param {Object} filters - Filter criteria
 * @param {Object} user - User performing the filter
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Filtered results with pagination
 */
const filterEmployees = async (filters = {}, user, pagination = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const offset = (page - 1) * limit;

    // Build where clause based on filters
    const where = {};

    // Apply role-based scope filtering
    if (user.role === "HR Manager") {
      if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
        throw {
          code: "NO_DEPARTMENTS_ASSIGNED",
          message: "You do not have any departments assigned.",
          statusCode: 403,
        };
      }
      where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.department')")] = {
        [Employee.sequelize.Sequelize.Op.in]: user.assignedDepartments
      };
    } else if (user.role === "Employee") {
      // Employees can only filter active employees (directory access)
      where.status = "Active";
    }

    // Apply department filter
    if (filters.department) {
      // Support multiple departments
      if (Array.isArray(filters.department)) {
        where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.department')")] = {
          [Employee.sequelize.Sequelize.Op.in]: filters.department
        };
      } else {
        where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.department')")] = filters.department;
      }
    }

    // Apply job title filter
    if (filters.jobTitle) {
      // Support multiple job titles
      if (Array.isArray(filters.jobTitle)) {
        where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.jobTitle')")] = {
          [Employee.sequelize.Sequelize.Op.in]: filters.jobTitle
        };
      } else {
        where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.jobTitle')")] = {
          [Employee.sequelize.Sequelize.Op.like]: `%${filters.jobTitle}%`
        };
      }
    }

    // Apply employment type filter
    if (filters.employmentType) {
      // Support multiple employment types
      if (Array.isArray(filters.employmentType)) {
        where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.employmentType')")] = {
          [Employee.sequelize.Sequelize.Op.in]: filters.employmentType
        };
      } else {
        where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.employmentType')")] = filters.employmentType;
      }
    }

    // Apply work location filter
    if (filters.workLocation) {
      // Support multiple work locations
      if (Array.isArray(filters.workLocation)) {
        where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.workLocation')")] = {
          [Employee.sequelize.Sequelize.Op.in]: filters.workLocation
        };
      } else {
        where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.workLocation')")] = {
          [Employee.sequelize.Sequelize.Op.like]: `%${filters.workLocation}%`
        };
      }
    }

    // Apply employment status filter
    if (filters.status) {
      // Support multiple statuses
      if (Array.isArray(filters.status)) {
        where.status = { [Employee.sequelize.Sequelize.Op.in]: filters.status };
      } else {
        where.status = filters.status;
      }
    }

    // Count and fetch employees
    const { count: total, rows: employees } = await Employee.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    logger.info(
      `Filter performed by user ${user.email} with filters: ${JSON.stringify(
        filters
      )}`
    );

    return {
      employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      appliedFilters: filters,
    };
  } catch (error) {
    logger.error("Error filtering employees:", error);
    throw error;
  }
};

/**
 * Get employee directory (public listing for all employees)
 * @param {Object} filters - Optional filter criteria
 * @param {Object} user - User requesting the directory
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Directory listing with pagination
 */
const getEmployeeDirectory = async (filters = {}, user, pagination = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const offset = (page - 1) * limit;

    // Build where clause for directory
    const where = {
      status: "Active", // Only show active employees in directory
    };

    // Apply role-based scope filtering
    if (user.role === "HR Manager") {
      if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
        throw {
          code: "NO_DEPARTMENTS_ASSIGNED",
          message: "You do not have any departments assigned.",
          statusCode: 403,
        };
      }
      where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.department')")] = {
        [Employee.sequelize.Sequelize.Op.in]: user.assignedDepartments
      };
    }

    // Apply optional filters
    if (filters.department) {
      if (Array.isArray(filters.department)) {
        where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.department')")] = {
          [Employee.sequelize.Sequelize.Op.in]: filters.department
        };
      } else {
        where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.department')")] = filters.department;
      }
    }

    if (filters.jobTitle) {
      where[Employee.sequelize.literal("JSON_EXTRACT(jobInfo, '$.jobTitle')")] = {
        [Employee.sequelize.Sequelize.Op.like]: `%${filters.jobTitle}%`
      };
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      where[Employee.sequelize.Sequelize.Op.or] = [
        Employee.sequelize.literal(`JSON_EXTRACT(personalInfo, '$.firstName') LIKE '${searchPattern}'`),
        Employee.sequelize.literal(`JSON_EXTRACT(personalInfo, '$.lastName') LIKE '${searchPattern}'`),
        Employee.sequelize.literal(`JSON_EXTRACT(jobInfo, '$.jobTitle') LIKE '${searchPattern}'`),
      ];
    }

    // Count and fetch employees
    const { count: total, rows: employees } = await Employee.findAndCountAll({
      where,
      attributes: [
        'id',
        'employeeId',
        'personalInfo',
        'jobInfo',
        'contactInfo',
        'isPrivate'
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Filter out private information for private profiles
    const directoryEmployees = employees.map((emp) => {
      const empData = emp.toJSON();
      if (empData.isPrivate && user.role === "Employee") {
        // For private profiles, only show basic info to regular employees
        return {
          id: empData.id,
          employeeId: empData.employeeId,
          personalInfo: {
            firstName: empData.personalInfo?.firstName,
            lastName: empData.personalInfo?.lastName,
            profilePhoto: empData.personalInfo?.profilePhoto,
          },
          jobInfo: {
            jobTitle: empData.jobInfo?.jobTitle,
            department: empData.department,
          },
          isPrivate: true,
        };
      }
      return empData;
    });

    logger.info(`Directory accessed by user ${user.email}`);

    return {
      employees: directoryEmployees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Error getting employee directory:", error);
    throw error;
  }
};

/**
 * Get current employee profile for logged-in user
 * @param {Object} user - User requesting their profile
 * @returns {Promise<Object>} Employee profile
 */
const getCurrentEmployee = async (user) => {
  try {
    if (!user.employeeId) {
      throw {
        code: "NO_EMPLOYEE_PROFILE",
        message: "No employee profile is linked to this user account.",
        statusCode: 404,
      };
    }

    const employee = await Employee.findByPk(user.employeeId);

    if (!employee) {
      throw {
        code: "EMPLOYEE_NOT_FOUND",
        message: "Employee profile not found.",
        statusCode: 404,
      };
    }

    logger.info(`Current employee profile accessed by user ${user.email}`);

    return employee;
  } catch (error) {
    logger.error("Error getting current employee:", error);
    throw error;
  }
};

/**
 * Self-update employee profile (limited fields)
 * @param {Object} updateData - Data to update (only allowed fields)
 * @param {Object} user - User updating their own profile
 * @param {Object} metadata - Request metadata
 * @returns {Promise<Object>} Updated employee
 */
const selfUpdateEmployee = async (updateData, user, metadata = {}) => {
  try {
    if (!user.employeeId) {
      throw {
        code: "NO_EMPLOYEE_PROFILE",
        message: "No employee profile is linked to this user account.",
        statusCode: 404,
      };
    }

    const employee = await Employee.findByPk(user.employeeId);

    if (!employee) {
      throw {
        code: "EMPLOYEE_NOT_FOUND",
        message: "Employee profile not found.",
        statusCode: 404,
      };
    }

    // Define allowed fields for self-update
    const allowedFields = {
      "contactInfo.phoneNumber": true,
      "contactInfo.alternatePhone": true,
      "contactInfo.personalEmail": true,
      "contactInfo.currentAddress": true,
      "contactInfo.emergencyContacts": true,
    };

    // Track changes for audit log
    const changes = [];

    // Update only allowed fields
    if (updateData.contactInfo) {
      // Phone number
      if (updateData.contactInfo.phoneNumber !== undefined) {
        if (
          employee.contactInfo.phoneNumber !==
          updateData.contactInfo.phoneNumber
        ) {
          changes.push({
            field: "Phone Number",
            oldValue: employee.contactInfo.phoneNumber,
            newValue: updateData.contactInfo.phoneNumber,
          });
          employee.contactInfo.phoneNumber = updateData.contactInfo.phoneNumber;
        }
      }

      // Alternate phone
      if (updateData.contactInfo.alternatePhone !== undefined) {
        if (
          employee.contactInfo.alternatePhone !==
          updateData.contactInfo.alternatePhone
        ) {
          changes.push({
            field: "Alternate Phone",
            oldValue: employee.contactInfo.alternatePhone,
            newValue: updateData.contactInfo.alternatePhone,
          });
          employee.contactInfo.alternatePhone =
            updateData.contactInfo.alternatePhone;
        }
      }

      // Personal email
      if (updateData.contactInfo.personalEmail !== undefined) {
        if (
          employee.contactInfo.personalEmail !==
          updateData.contactInfo.personalEmail
        ) {
          changes.push({
            field: "Personal Email",
            oldValue: employee.contactInfo.personalEmail,
            newValue: updateData.contactInfo.personalEmail,
          });
          employee.contactInfo.personalEmail =
            updateData.contactInfo.personalEmail;
        }
      }

      // Current address
      if (updateData.contactInfo.currentAddress !== undefined) {
        const oldAddr = employee.contactInfo.currentAddress || {};
        const newAddr = updateData.contactInfo.currentAddress;
        if (JSON.stringify(oldAddr) !== JSON.stringify(newAddr)) {
          changes.push({
            field: "Current Address",
            oldValue: oldAddr,
            newValue: newAddr,
          });
          employee.contactInfo.currentAddress = newAddr;
        }
      }

      // Emergency contacts
      if (updateData.contactInfo.emergencyContacts !== undefined) {
        if (
          JSON.stringify(employee.contactInfo.emergencyContacts) !==
          JSON.stringify(updateData.contactInfo.emergencyContacts)
        ) {
          changes.push({
            field: "Emergency Contacts",
            oldValue: employee.contactInfo.emergencyContacts,
            newValue: updateData.contactInfo.emergencyContacts,
          });
          employee.contactInfo.emergencyContacts =
            updateData.contactInfo.emergencyContacts;
        }
      }
    }

    // Update audit fields
    employee.updatedBy = user.id;

    await employee.save();

    // Log self-update in audit log
    if (changes.length > 0) {
      await AuditLog.logAction({
        action: "UPDATE",
        entityType: "Employee",
        entityId: employee.id.toString(),
        userId: user.id,
        userRole: user.role,
        changes,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });
    }

    logger.info(
      `Employee self-updated: ${employee.employeeId} by user ${user.email}`
    );

    return employee;
  } catch (error) {
    logger.error("Error in self-update employee:", error);
    throw error;
  }
};

export default {
  createEmployee,
  updateEmployee,
  getEmployeeById,
  listEmployees,
  softDeleteEmployee,
  isEmailUnique,
  searchEmployees,
  filterEmployees,
  getEmployeeDirectory,
  getCurrentEmployee,
  selfUpdateEmployee,
};
