import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  User,
  ArrowBigRight,
  Lock,
  Building2,
} from "lucide-react";

import { Button } from "../../../shared/ui/button";
import { Card, CardContent } from "../../../shared/ui/card";
import useAuth from "../../../core/hooks/useAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(formData.email, formData.password);
      toast.success("Admin login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.log('🔑 [ADMIN LOGIN] Error caught:', error);
      
      // Extract user-friendly error message
      let errorMessage = "Invalid email or password";
      
      if (error.message && !error.message.includes('status code')) {
        errorMessage = error.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Handle specific cases
      if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      console.log('🔑 [ADMIN LOGIN] Showing error toast:', errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <Card className="border-none shadow-xl rounded-2xl bg-white">
          <CardContent className="px-6 py-5">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-11 h-11 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">
                Admin Login
              </h1>
              <p className="text-sm text-gray-600">
                Login to manage the system
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                      errors.email ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    disabled={loading}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                      errors.password ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-indigo-600 hover:underline"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>

              {/* Login button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    LOGIN <ArrowBigRight className="ml-1" size={16} />
                  </div>
                )}
              </Button>

              {/* Back to employee login */}
              <div className="text-center pt-0">
                <p className="text-sm text-gray-600">
                  Not an admin?
                </p>
                <button
                  type="button"
                  className="text-sm font-medium text-indigo-600 hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Login as Employee
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
