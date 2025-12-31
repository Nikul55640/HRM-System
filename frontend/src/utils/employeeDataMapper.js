/**
 * Employee Data Mapper Utilities
 * Handles mapping between nested API responses and flat frontend expectations
 */

/**
 * Get employee's full name from nested or flat structure
 * @param {Object} employee - Employee object (nested or flat)
 * @returns {string} Full name
 */
export const getEmployeeFullName = (employee) => {
  if (!employee) return 'Unknown';
  
  const firstName = employee.personalInfo?.firstName || employee.firstName || '';
  const lastName = employee.personalInfo?.lastName || employee.lastName || '';
  
  return `${firstName} ${lastName}`.trim() || 'Unknown';
};

/**
 * Get employee's initials from nested or flat structure
 * @param {Object} employee - Employee object (nested or flat)
 * @returns {string} Initials (e.g., "JD")
 */
export const getEmployeeInitials = (employee) => {
  if (!employee) return 'U';
  
  const firstName = employee.personalInfo?.firstName || employee.firstName || '';
  const lastName = employee.personalInfo?.lastName || employee.lastName || '';
  
  const firstInitial = firstName.charAt(0) || '';
  const lastInitial = lastName.charAt(0) || '';
  
  return `${firstInitial}${lastInitial}`.toUpperCase() || 'U';
};

/**
 * Get employee's email from nested or flat structure
 * @param {Object} employee - Employee object (nested or flat)
 * @returns {string} Email address
 */
export const getEmployeeEmail = (employee) => {
  if (!employee) return '';
  
  return employee.contactInfo?.email || employee.email || '';
};

/**
 * Get employee's phone from nested or flat structure
 * @param {Object} employee - Employee object (nested or flat)
 * @returns {string} Phone number
 */
export const getEmployeePhone = (employee) => {
  if (!employee) return '';
  
  return employee.contactInfo?.phoneNumber || employee.phone || '';
};

/**
 * Get employee's job title from nested or flat structure
 * @param {Object} employee - Employee object (nested or flat)
 * @returns {string} Job title
 */
export const getEmployeeJobTitle = (employee) => {
  if (!employee) return '';
  
  return employee.jobInfo?.jobTitle || employee.jobInfo?.designation || employee.designation || '';
};

/**
 * Get employee's department from nested or flat structure
 * @param {Object} employee - Employee object (nested or flat)
 * @returns {string} Department name
 */
export const getEmployeeDepartment = (employee) => {
  if (!employee) return '';
  
  return employee.jobInfo?.departmentInfo?.name || 
         employee.jobInfo?.department?.name || 
         employee.department || '';
};

/**
 * Get employee's profile photo from nested or flat structure
 * @param {Object} employee - Employee object (nested or flat)
 * @returns {string} Profile photo URL
 */
export const getEmployeeProfilePhoto = (employee) => {
  if (!employee) return '';
  
  return employee.personalInfo?.profilePhoto || employee.profilePicture || '';
};

/**
 * Get employee's department ID from nested or flat structure
 * @param {Object} employee - Employee object (nested or flat)
 * @returns {string|number} Department ID
 */
export const getEmployeeDepartmentId = (employee) => {
  if (!employee) return '';
  
  return employee.jobInfo?.departmentId || employee.departmentId || '';
};

/**
 * Normalize employee object to have both nested and flat properties
 * This is useful for components that might expect either structure
 * @param {Object} employee - Employee object
 * @returns {Object} Normalized employee object
 */
export const normalizeEmployeeData = (employee) => {
  if (!employee) return {};
  
  return {
    ...employee,
    // Ensure flat properties exist for backward compatibility
    firstName: getEmployeeFullName(employee).split(' ')[0] || '',
    lastName: getEmployeeFullName(employee).split(' ').slice(1).join(' ') || '',
    email: getEmployeeEmail(employee),
    phone: getEmployeePhone(employee),
    designation: getEmployeeJobTitle(employee),
    department: getEmployeeDepartment(employee),
    profilePicture: getEmployeeProfilePhoto(employee),
    departmentId: getEmployeeDepartmentId(employee),
    
    // Computed properties
    fullName: getEmployeeFullName(employee),
    initials: getEmployeeInitials(employee),
  };
};