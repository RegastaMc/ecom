'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import type { SVGProps } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { signIn } from 'next-auth/react';

// ============================================================
// GOOGLE ICON
// ============================================================
const Google = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 256 262"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    {...props}
  >
    <path
      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      fill="#4285F4"
    />
    <path
      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      fill="#34A853"
    />
    <path
      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
      fill="#FBBC05"
    />
    <path
      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      fill="#EB4335"
    />
  </svg>
);

// ============================================================
// MAIN SIGNIN COMPONENT
// ============================================================
export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errormsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [callbackUrl, setCallbackUrl] = useState<string>('/');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get callbackUrl from URL params
  useEffect(() => {
    const callback = searchParams.get('callbackUrl');
    if (callback) {
      setCallbackUrl(callback);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Clear general error
    if (error) {
      setError(false);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(false);
    setErrorMsg('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        toast.error(result.error || 'Invalid credentials.');
        setLoading(false);
        setError(true);
        setErrorMsg(result.error || 'Invalid email or password');
      } else {
        toast.success('Signed in successfully!');
        setLoading(false);
        // Redirect to callback URL
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An error occurred during sign in.');
      setLoading(false);
      setError(true);
      setErrorMsg('Failed to sign in. Please try again.');
    }
  };

  // ============================================================
  // HANDLE GOOGLE SIGNIN
  // ============================================================
  const handleGoogleSignin = async () => {
    setGoogleLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: callbackUrl,
        redirect: true,
      });
    } catch (error) {
      toast.error('Failed to sign in with Google');
      console.error('Google signin error:', error);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-[#FEFCF3]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl bg-white shadow-xl border border-[#F5EBEO] p-8 space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#3d2c28]">Welcome Back</h2>
            {callbackUrl !== '/' && (
              <p className="text-sm text-[#DBA39A] font-medium">
                Continue to checkout
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && errormsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {errormsg}
            </div>
          )}

          {/* Google Signin Button */}
          <button
            type="button"
            onClick={handleGoogleSignin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-[#F5EBEO] hover:border-[#DBA39A]/40 rounded-xl transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-[#DBA39A] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Google className="w-5 h-5" />
                <span className="font-medium text-[#3d2c28]">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#F5EBEO]" />
            </div>
            <div className="relative flex justify-center text-xs text-[#3d2c28]/40">
              <span className="bg-white px-4">or continue with email</span>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#3d2c28] text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className={`pl-10 border-[#F5EBEO] focus:border-[#DBA39A] focus:ring-[#DBA39A]/20 bg-[#FEFCF3] text-[#3d2c28] placeholder:text-[#b8a69c] placeholder:text-xs ${
                    errors.email ? 'border-red-300 focus:ring-red-200' : ''
                  }`}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8a69c]" />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#3d2c28] text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#DBA39A] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`pl-10 border-[#F5EBEO] focus:border-[#DBA39A] focus:ring-[#DBA39A]/20 bg-[#FEFCF3] text-[#3d2c28] placeholder:text-[#b8a69c] placeholder:text-xs ${
                    errors.password ? 'border-red-300 focus:ring-red-200' : ''
                  }`}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8a69c]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8a69c] hover:text-[#3d2c28] transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }));
                }}
                className="border-[#F5EBEO] text-[#DBA39A] focus:ring-[#DBA39A] focus:ring-offset-0"
              />
              <Label
                htmlFor="rememberMe"
                className="text-xs text-[#3d2c28]/70 cursor-pointer"
              >
                Remember me
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              disabled={loading}
              type="submit"
              className="w-full mt-2 text-sm cursor-pointer bg-[#DBA39A] hover:bg-[#c49087] text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed py-5"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-[#3d2c28]/40">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-[#DBA39A] hover:underline font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#DBA39A] hover:underline font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-[#3d2c28]/60">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#DBA39A] font-medium hover:underline">
                Sign Up Here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}