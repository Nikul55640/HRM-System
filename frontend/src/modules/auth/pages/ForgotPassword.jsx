import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Building2, ArrowLeft } from "lucide-react";

import { Button } from "../../../shared/ui/button";
import { Card, CardContent } from "../../../shared/ui/card";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update browser tab title
  useEffect(() => {
    document.title = "Forgot Password | HRM System";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 🔗 Call forgot password API here
      // await authService.forgotPassword(email);

      toast.success("Password reset link sent to your email");
      navigate("/login");
    } catch (err) {
      toast.error("Failed to send reset link");
    } finally {
      setLoading(false);
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
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Forgot Password
              </h1>
              <p className="text-sm text-gray-600">
                Enter your email to receive a reset link
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                      error ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              {/* Back to login */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  className="text-sm font-medium text-indigo-600 hover:underline inline-flex items-center gap-1"
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
