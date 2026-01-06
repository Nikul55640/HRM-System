import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import employeeManagementService from "../../../services/employeeManagementService";

import { LoadingSpinner } from "../../../shared/components";
import PersonalInfoStep from "../form-steps/PersonalInfoStep";
import ContactInfoStep from "../form-steps/ContactInfoStep";
import JobDetailsStep from "../form-steps/JobDetailsStep";
import SystemAccessStep from "../form-steps/SystemAccessStep";

const validationSchemas = [
  // Step 1: Personal Info
  Yup.object({
    personalInfo: Yup.object({
      firstName: Yup.string()
        .required("First name is required")
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name cannot exceed 50 characters")
        .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
      lastName: Yup.string()
        .required("Last name is required")
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name cannot exceed 50 characters")
        .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
      dateOfBirth: Yup.date()
        .nullable()
        .max(new Date(), "Date of birth cannot be in the future")
        .test('age', 'Employee must be at least 16 years old', function(value) {
          if (!value) return true; // Allow empty
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 16;
        }),
      gender: Yup.string().oneOf(
        ["Male", "Female", "Other", "Prefer not to say"],
        "Please select a valid gender option"
      ),
      maritalStatus: Yup.string().oneOf(
        ["Single", "Married", "Divorced", "Widowed"],
        "Please select a valid marital status"
      ),
      nationality: Yup.string().max(50, "Nationality cannot exceed 50 characters"),
    }),
  }),
  // Step 2: Contact Info
  Yup.object({
    contactInfo: Yup.object({
      email: Yup.string()
        .required("Work email is required")
        .email("Please enter a valid email address")
        .max(100, "Email cannot exceed 100 characters"),
      personalEmail: Yup.string()
        .email("Please enter a valid personal email address")
        .max(100, "Personal email cannot exceed 100 characters"),
      phoneNumber: Yup.string()
        .required("Phone number is required")
        .matches(
          /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
          "Please enter a valid phone number (e.g., +1-234-567-8900)"
        ),
      alternatePhone: Yup.string().matches(
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
        "Please enter a valid alternate phone number"
      ),
      currentAddress: Yup.object({
        street: Yup.string().max(100, "Street address cannot exceed 100 characters"),
        city: Yup.string().max(50, "City cannot exceed 50 characters"),
        state: Yup.string().max(50, "State cannot exceed 50 characters"),
        zipCode: Yup.string()
          .max(20, "ZIP code cannot exceed 20 characters")
          .matches(/^[0-9A-Za-z\s-]+$/, "Please enter a valid ZIP code"),
        country: Yup.string().max(50, "Country cannot exceed 50 characters"),
      }),
    }),
  }),
  // Step 3: Job Details
  Yup.object({
    jobInfo: Yup.object({
      jobTitle: Yup.string()
        .required("Job title is required")
        .min(2, "Job title must be at least 2 characters")
        .max(100, "Job title cannot exceed 100 characters"),
      department: Yup.string()
        .required("Please select a department"),
      designation: Yup.string()
        .required("Please select a designation"),
      manager: Yup.string().nullable(),
      hireDate: Yup.date()
        .required("Hire date is required")
        .max(new Date(), "Hire date cannot be in the future"),
      employmentType: Yup.string()
        .required("Please select an employment type")
        .oneOf(["full_time", "part_time", "contract", "intern"], "Please select a valid employment type"),
      workLocation: Yup.string().max(100, "Work location cannot exceed 100 characters"),
      workSchedule: Yup.string().max(100, "Work schedule cannot exceed 100 characters"),
      probationEndDate: Yup.date()
        .nullable()
        .min(Yup.ref("hireDate"), "Probation end date must be after hire date"),
    }),
  }),
  // Step 4: System Access
  Yup.object({
    systemAccess: Yup.object({
      systemRole: Yup.string()
        .required("Please select a system role")
        .notOneOf(["none"], "Please select a valid system role"),
      assignedDepartments: Yup.array().when('systemRole', {
        is: 'HR_Manager',
        then: (schema) => schema.min(1, "HR Managers must be assigned to at least one department"),
        otherwise: (schema) => schema
      }),
    }),
  }),
];

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    departments: [],
    designations: [],
    managers: [],
    systemRoles: []
  });
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const isEditMode = Boolean(id);
  const steps = ["Personal Info", "Contact Info", "Job Details", "System Access"];

  const loadFormData = useCallback(async () => {
    try {
      setIsLoadingData(true);

      // Load form data (departments, designations, managers, roles)
      const formDataResponse = await employeeManagementService.getFormData();
      if (formDataResponse.success) {
        console.log('📋 [EmployeeForm] Form data loaded:', formDataResponse.data);
        setFormData(formDataResponse.data);
      }

      // If editing, load employee data
      if (id && id !== 'undefined') {
        const employeeResponse = await employeeManagementService.getEmployeeWithRole(id);
        if (employeeResponse.success) {
          console.log('👤 [EmployeeForm] Employee data loaded:', employeeResponse.data.employee);
          setCurrentEmployee(employeeResponse.data.employee);
        }
      }
    } catch (error) {
      toast.error("Failed to load form data");
      console.error('Form data loading error:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [id]);

  useEffect(() => {
    loadFormData();
    return () => {
      setCurrentEmployee(null);
    };
  }, [loadFormData]);

  const initialValues = {
    personalInfo: {
      firstName: currentEmployee?.personalInfo?.firstName || currentEmployee?.firstName || "",
      lastName: currentEmployee?.personalInfo?.lastName || currentEmployee?.lastName || "",
      dateOfBirth: currentEmployee?.personalInfo?.dateOfBirth || currentEmployee?.dateOfBirth
        ? new Date(currentEmployee?.personalInfo?.dateOfBirth || currentEmployee.dateOfBirth)
            .toISOString()
            .split("T")[0]
        : "",
      gender: currentEmployee?.personalInfo?.gender || currentEmployee?.gender || "",
      maritalStatus: currentEmployee?.personalInfo?.maritalStatus || currentEmployee?.maritalStatus || "",
      nationality: currentEmployee?.personalInfo?.nationality || currentEmployee?.nationality || "",
    },
    contactInfo: {
      email: currentEmployee?.contactInfo?.email || currentEmployee?.email || "",
      personalEmail: currentEmployee?.contactInfo?.personalEmail || currentEmployee?.personalEmail || "",
      phoneNumber: currentEmployee?.contactInfo?.phoneNumber || currentEmployee?.phone || "",
      alternatePhone: currentEmployee?.contactInfo?.alternatePhone || currentEmployee?.alternatePhone || "",
      currentAddress: {
        street: currentEmployee?.contactInfo?.currentAddress?.street || currentEmployee?.address?.street || "",
        city: currentEmployee?.contactInfo?.currentAddress?.city || currentEmployee?.address?.city || "",
        state: currentEmployee?.contactInfo?.currentAddress?.state || currentEmployee?.address?.state || "",
        zipCode: currentEmployee?.contactInfo?.currentAddress?.zipCode || currentEmployee?.address?.zipCode || "",
        country: currentEmployee?.contactInfo?.currentAddress?.country || currentEmployee?.address?.country || "",
      },
      emergencyContacts: currentEmployee?.contactInfo?.emergencyContacts || (currentEmployee?.emergencyContact ? [currentEmployee.emergencyContact] : []),
    },
    jobInfo: {
      jobTitle: currentEmployee?.jobInfo?.jobTitle || currentEmployee?.designation || "", // This is the free text job title
      department: currentEmployee?.jobInfo?.departmentId || currentEmployee?.departmentId || "",
      designation: currentEmployee?.jobInfo?.designationId || currentEmployee?.designationId || "", // This is the structured designation ID
      manager: currentEmployee?.jobInfo?.reportingManager || currentEmployee?.reportingManager || "",
      hireDate: currentEmployee?.jobInfo?.hireDate || currentEmployee?.joiningDate
        ? new Date(currentEmployee?.jobInfo?.hireDate || currentEmployee.joiningDate).toISOString().split("T")[0]
        : "",
      employmentType: currentEmployee?.jobInfo?.employmentType || currentEmployee?.employmentType || "",
      workLocation: currentEmployee?.jobInfo?.workLocation || currentEmployee?.workLocation || "",
      workSchedule: currentEmployee?.jobInfo?.workSchedule || currentEmployee?.workSchedule || "",
      probationEndDate: currentEmployee?.jobInfo?.probationEndDate || currentEmployee?.probationEndDate
        ? new Date(currentEmployee?.jobInfo?.probationEndDate || currentEmployee.probationEndDate)
            .toISOString()
            .split("T")[0]
        : "",
    },
    systemAccess: {
      systemRole: currentEmployee?.user?.role || "none",
      assignedDepartments: currentEmployee?.user?.assignedDepartments || [],
    },
  };

  const handleNext = async (values, { setTouched, validateForm }) => {
    const errors = await validateForm();
    const stepFields = getStepFields(currentStep);
    
    // Check for errors in current step
    const hasStepErrors = stepFields.some(field => {
      if (field in errors) {
        if (typeof errors[field] === 'object') {
          return Object.keys(errors[field]).length > 0;
        }
        return true;
      }
      return false;
    });

    if (!hasStepErrors) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo(0, 0);
    } else {
      // Mark all fields in current step as touched to show validation errors
      const touchedFields = {};
      stepFields.forEach((field) => {
        if (field === 'personalInfo' || field === 'contactInfo' || field === 'jobInfo' || field === 'systemAccess') {
          touchedFields[field] = {};
          if (values[field]) {
            Object.keys(values[field]).forEach(subField => {
              touchedFields[field][subField] = true;
            });
          }
        } else {
          touchedFields[field] = true;
        }
      });
      setTouched(touchedFields);
      
      // Show error message
      toast.error("Please fill in all required fields before proceeding to the next step.");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const getStepFields = (step) => {
    switch (step) {
      case 0:
        return ["personalInfo"];
      case 1:
        return ["contactInfo"];
      case 2:
        return ["jobInfo"];
      case 3:
        return ["systemAccess"];
      default:
        return [];
    }
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setLoading(true);
      
      // Validate all required fields before submission
      const allErrors = await validationSchemas.reduce(async (acc, schema, index) => {
        const errors = await acc;
        try {
          await schema.validate(values, { abortEarly: false });
        } catch (validationError) {
          validationError.inner.forEach(error => {
            errors[error.path] = error.message;
          });
        }
        return errors;
      }, Promise.resolve({}));

      if (Object.keys(allErrors).length > 0) {
        toast.error("Please fix all validation errors before submitting");
        Object.entries(allErrors).forEach(([field, message]) => {
          setFieldError(field, message);
        });
        setLoading(false);
        setSubmitting(false);
        return;
      }
      
      // Transform data to match backend expectations
      const transformedValues = {
        personalInfo: values.personalInfo,
        contactInfo: values.contactInfo,
        jobInfo: {
          ...values.jobInfo,
          // Convert department and manager to integers if they exist
          department: values.jobInfo.department ? parseInt(values.jobInfo.department, 10) : null,
          manager: values.jobInfo.manager ? parseInt(values.jobInfo.manager, 10) : null,
          designation: values.jobInfo.designation ? parseInt(values.jobInfo.designation, 10) : null,
        },
        systemRole: values.systemAccess.systemRole,
        assignedDepartments: values.systemAccess.assignedDepartments || []
      };

      let result;
      if (isEditMode) {
        result = await employeeManagementService.updateEmployeeWithRole(id, transformedValues);
      } else {
        result = await employeeManagementService.createEmployeeWithRole(transformedValues);
      }

      if (result.success) {
        toast.success(isEditMode ? "Employee updated successfully!" : "Employee created successfully!");
        navigate("/admin/employees");
      } else {
        toast.error(result.message || "Failed to save employee");
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("An error occurred while saving the employee. Please try again.");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (isLoadingData || (isEditMode && loading)) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-5xl">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {isEditMode ? "Edit Employee" : "Add New Employee"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {isEditMode
            ? "Update employee information"
            : "Fill in the details to create a new employee"}
        </p>
        <div className="mt-2 text-xs sm:text-sm text-gray-500">
          <span className="text-red-500">*</span> indicates required fields
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
                    index <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-xs sm:text-sm mt-1 sm:mt-2 text-center ${
                    index <= currentStep
                      ? "text-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  <span className="hidden sm:inline">{step}</span>
                  <span className="sm:hidden">
                    {step === "Personal Info" ? "Personal" :
                     step === "Contact Info" ? "Contact" :
                     step === "Job Details" ? "Job" :
                     step === "System Access" ? "Access" : step}
                  </span>
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 sm:h-1 flex-1 mx-1 sm:mx-2 ${
                    index < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchemas[currentStep]}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          isSubmitting,
          validateForm,
          setTouched,
        }) => (
          <Form>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              {/* Step Header */}
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  Step {currentStep + 1}: {steps[currentStep]}
                </h2>
                <div className="text-xs sm:text-sm text-gray-600">
                  {currentStep === 0 && "Enter the employee's personal information"}
                  {currentStep === 1 && "Provide contact details and address information"}
                  {currentStep === 2 && "Set up job details and work information"}
                  {currentStep === 3 && "Configure system access and permissions"}
                </div>
              </div>

              {/* Validation Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Please fix the following errors:
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {Object.entries(errors).map(([key, error]) => {
                            if (typeof error === 'object') {
                              return Object.entries(error).map(([subKey, subError]) => (
                                <li key={`${key}.${subKey}`}>
                                  {typeof subError === 'string' ? subError : JSON.stringify(subError)}
                                </li>
                              ));
                            }
                            return <li key={key}>{error}</li>;
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Content */}
              {currentStep === 0 && (
                <PersonalInfoStep
                  values={values}
                  errors={errors}
                  touched={touched}
                />
              )}
              {currentStep === 1 && (
                <ContactInfoStep
                  values={values}
                  errors={errors}
                  touched={touched}
                />
              )}
              {currentStep === 2 && (
                <JobDetailsStep
                  values={values}
                  errors={errors}
                  touched={touched}
                  departments={formData.departments}
                  managers={formData.managers}
                  designations={formData.designations}
                />
              )}
              {currentStep === 3 && (
                <SystemAccessStep
                  values={values}
                  errors={errors}
                  touched={touched}
                  departments={formData.departments}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3 sm:gap-0">
                <div>
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    >
                      ← Back
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/employees")}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleNext(values, { setTouched, validateForm })
                      }
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base order-1 sm:order-2"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
                    >
                      {(isSubmitting || loading) && <LoadingSpinner />}
                      {isEditMode ? "Update Employee" : "Create Employee"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EmployeeForm;
