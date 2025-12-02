import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { login } from '../../store/thunks/authThunks';
import { Button }  from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    console.log('🔍 [LOGIN] Auth state changed:', { isAuthenticated, from });
    if (isAuthenticated) {
      console.log('✅ [LOGIN] User is authenticated, navigating to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log('📝 [LOGIN] Form submitted with email:', values.email);
    const result = await dispatch(login(values.email, values.password));
    console.log('📊 [LOGIN] Login result:', result);
    
    if (result.success) {
      console.log('✅ [LOGIN] Login successful, navigating to:', from);
      navigate(from, { replace: true });
    } else {
      console.log('❌ [LOGIN] Login failed:', result.error);
    }
    
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            HR Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ email: '', password: '', rememberMe: false }}
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                <FormikForm className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={values.email}
                      onChange={(e) => setFieldValue('email', e.target.value)}
                      className={errors.email && touched.email ? 'border-destructive' : ''}
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-sm text-destructive"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={values.password}
                        onChange={(e) => setFieldValue('password', e.target.value)}
                        className={errors.password && touched.password ? 'border-destructive pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="text-sm text-destructive"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={values.rememberMe}
                        onCheckedChange={(checked) => setFieldValue('rememberMe', checked)}
                      />
                      <Label
                        htmlFor="remember-me"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Remember me
                      </Label>
                    </div>

                    <a
                      href="#"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </FormikForm>
              )}
            </Formik>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 HRMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
