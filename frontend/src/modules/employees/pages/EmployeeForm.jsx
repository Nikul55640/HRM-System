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
        .max(50, "Maximum 50 characters"),
      lastName: Yup.string()
        .required("Last name is required")
        .max(50, "Maximum 50 characters"),
      dateOfBirth: Yup.date()
        .nullable()
        .max(new Date(), "Date of birth cannot be in the future"),
      gender: Yup.string().oneOf(
        ["Male", "Female", "Other", "Prefer not to say"],
        "Invalid gender"
      ),
      maritalStatus: Yup.string().oneOf(
        ["Single", "Married", "Divorced", "Widowed"],
        "Invalid marital status"
      ),
      nationality: Yup.string().max(50, "Maximum 50 characters"),
    }),
  }),
  // Step 2: Contact Info
  Yup.object({
    contactInfo: Yup.object({
      email: Yup.string()
        .required("Email is required")
        .email("Invalid email format"),
      personalEmail: Yup.string().email("Invalid email format"),
      phoneNumber: Yup.string().matches(
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
        "Invalid phone number"
      ),
      alternatePhone: Yup.string().matches(
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
        "Invalid phone number"
      ),
      currentAddress: Yup.object({
        street: Yup.string().max(100, "Maximum 100 characters"),
        city: Yup.string().max(50, "Maximum 50 characters"),
        state: Yup.string().max(50, "Maximum 50 characters"),
        zipCode: Yup.string().max(20, "Maximum 20 characters"),
        country: Yup.string().max(50, "Maximum 50 characters"),
      }),
    }),
  }),
  // Step 3: Job Details
  Yup.object({
    jobInfo: Yup.object({
      jobTitle: Yup.string()
        .required("Job title is required")
        .max(100, "Maximum 100 characters"),
      department: Yup.string().required("Department is required"),
      manager: Yup.string().nullable(),
      hireDate: Yup.date().required("Hire date is required"),
      employmentType: Yup.string()
        .required("Employment type is required")
        .oneOf(["full_time", "part_time", "contract", "intern"]),
      workLocation: Yup.string().max(100, "Maximum 100 characters"),
      workSchedule: Yup.string().max(100, "Maximum 100 characters"),
      probationEndDate: Yup.date()
        .nullable()
        .min(Yup.ref("hireDate"), "Probation end date must be after hire date"),
    }),
  }),
  // Step 4: System Access
  Yup.object({
    systemAccess: Yup.object({
      systemRole: Yup.string().required("System role selection is required"),
      assignedDepartments: Yup.array().when('systemRole', {
        is: 'HR',
        then: (schema) => schema.min(1, "At least one department must be assigned for HR role"),
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
    const stepErrors = Object.keys(errors).filter((key) =>
      stepFields.includes(key)
    );

    if (stepErrors.length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo(0, 0);
    } else {
      const touchedFields = {};
      stepFields.forEach((field) => {
        touchedFields[field] = true;
      });
      setTouched(touchedFields);
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

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      
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
        navigate("/admin/employees");
      }
    } catch (error) {
      console.error('Submit error:', error);
      // Error toast is handled by the service
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
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditMode ? "Edit Employee" : "Add New Employee"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode
            ? "Update employee information"
            : "Fill in the details to create a new employee"}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-sm mt-2 ${
                    index <= currentStep
                      ? "text-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
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
            <div className="bg-white rounded-lg shadow-md p-6">
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
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <div>
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/employees")}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleNext(values, { setTouched, validateForm })
                      }
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
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
