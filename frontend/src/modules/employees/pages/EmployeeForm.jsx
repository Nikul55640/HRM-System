import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import useEmployeeStore from "../../../stores/useEmployeeStore";

import { LoadingSpinner } from "../../../shared/components";
import PersonalInfoStep from "../form-steps/PersonalInfoStep";
import ContactInfoStep from "../form-steps/ContactInfoStep";
import JobDetailsStep from "../form-steps/JobDetailsStep";

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
        .oneOf(["Full-time", "Part-time", "Contract", "Intern"]),
      workLocation: Yup.string().max(100, "Maximum 100 characters"),
      workSchedule: Yup.string().max(100, "Maximum 100 characters"),
      probationEndDate: Yup.date()
        .nullable()
        .min(Yup.ref("hireDate"), "Probation end date must be after hire date"),
    }),
  }),
];

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentEmployee, 
    loading, 
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    clearCurrentEmployee,
    fetchDepartments
  } = useEmployeeStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]); // Keep for future use
  const [isLoadingData, setIsLoadingData] = useState(true);

  const isEditMode = Boolean(id);
  const steps = ["Personal Info", "Contact Info", "Job Details"];

  const loadFormData = useCallback(async () => {
    try {
      setIsLoadingData(true);

      // Load departments
      const deptResponse = await fetchDepartments();
      setDepartments(Array.isArray(deptResponse) ? deptResponse : []);
      
      // Load managers (for future use)
      setManagers([]);

      // Load potential managers (employees who can be managers)
      // For now, we'll load this from employees endpoint
      // In production, you might want a specific endpoint for this

      // If editing, load employee data
      if (id && id !== 'undefined') {
        await fetchEmployeeById(id);
      }
    } catch (error) {
      toast.error("Failed to load form data");
    } finally {
      setIsLoadingData(false);
    }
  }, [id, fetchDepartments, fetchEmployeeById]);

  useEffect(() => {
    loadFormData();
    return () => {
      clearCurrentEmployee();
    };
  }, [loadFormData, clearCurrentEmployee]);

  const initialValues = {
    personalInfo: {
      firstName: currentEmployee?.personalInfo?.firstName || "",
      lastName: currentEmployee?.personalInfo?.lastName || "",
      dateOfBirth: currentEmployee?.personalInfo?.dateOfBirth
        ? new Date(currentEmployee.personalInfo.dateOfBirth)
            .toISOString()
            .split("T")[0]
        : "",
      gender: currentEmployee?.personalInfo?.gender || "",
      maritalStatus: currentEmployee?.personalInfo?.maritalStatus || "",
      nationality: currentEmployee?.personalInfo?.nationality || "",
    },
    contactInfo: {
      email: currentEmployee?.contactInfo?.email || "",
      personalEmail: currentEmployee?.contactInfo?.personalEmail || "",
      phoneNumber: currentEmployee?.contactInfo?.phoneNumber || "",
      alternatePhone: currentEmployee?.contactInfo?.alternatePhone || "",
      currentAddress: {
        street: currentEmployee?.contactInfo?.currentAddress?.street || "",
        city: currentEmployee?.contactInfo?.currentAddress?.city || "",
        state: currentEmployee?.contactInfo?.currentAddress?.state || "",
        zipCode: currentEmployee?.contactInfo?.currentAddress?.zipCode || "",
        country: currentEmployee?.contactInfo?.currentAddress?.country || "",
      },
      emergencyContacts: currentEmployee?.contactInfo?.emergencyContacts || [],
    },
    jobInfo: {
      jobTitle: currentEmployee?.jobInfo?.jobTitle || "",
      department:
        currentEmployee?.jobInfo?.department?._id ||
        currentEmployee?.jobInfo?.department ||
        "",
      manager:
        currentEmployee?.jobInfo?.manager?._id ||
        currentEmployee?.jobInfo?.manager ||
        "",
      hireDate: currentEmployee?.jobInfo?.hireDate
        ? new Date(currentEmployee.jobInfo.hireDate).toISOString().split("T")[0]
        : "",
      employmentType: currentEmployee?.jobInfo?.employmentType || "",
      workLocation: currentEmployee?.jobInfo?.workLocation || "",
      workSchedule: currentEmployee?.jobInfo?.workSchedule || "",
      probationEndDate: currentEmployee?.jobInfo?.probationEndDate
        ? new Date(currentEmployee.jobInfo.probationEndDate)
            .toISOString()
            .split("T")[0]
        : "",
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
      default:
        return [];
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditMode) {
        await updateEmployee(id, values);
      } else {
        await createEmployee(values);
      }
      navigate("/employees");
    } catch (error) {
      toast.error(
        error.message ||
          `Failed to ${isEditMode ? "update" : "create"} employee`
      );
    } finally {
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
                  departments={departments}
                  managers={managers}
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
                    onClick={() => navigate("/employees")}
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
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting && <LoadingSpinner />}
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
