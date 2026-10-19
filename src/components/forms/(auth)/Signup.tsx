'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { SVGProps } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { signIn } from 'next-auth/react';

export interface SignupProps {
  formtype: string;
}

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
// MAIN SIGNUP COMPONENT
// ============================================================
export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState(false);
  const [errormsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  // ============================================================
  // VALIDATION
  // ============================================================
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================
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
  };

  // ============================================================
  // HANDLE FORM SUBMISSION
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'confirmPassword' && key !== 'acceptTerms') {
        submitFormData.append(key, String(value));
      }
    });
    submitFormData.append('acceptTerms', String(formData.acceptTerms));

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: submitFormData,
      });

      const data = await res.json();
      if (res.ok) {
        setMsg(data.message);
        toast.success(data.message);
        setError(false);
        setErrorMsg('');
        setTimeout(() => {
          router.push('/signin');
        }, 3500);
      } else {
        toast.error(data.message);
        setError(true);
        setErrorMsg(data.message);
      }
    } catch (error) {
      toast.error('An error occurred during registration.');
      setError(true);
      console.error('Error during form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HANDLE GOOGLE SIGNUP
  // ============================================================
  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
      toast.success('Redirecting to Google for signup...');
    } catch (error) {
      toast.error('Failed to sign up with Google');
      console.error('Google signup error:', error);
    } finally {
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
            <h2 className="text-2xl font-bold text-[#3d2c28]">Create Account</h2>
            {/* <p className="text-sm text-[#3d2c28]/60">
              Join our community and start shopping
            </p> */}
          </div>

          {/* Success Message */}
          {msg && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              {msg}
            </div>
          )}

          {/* Error Message */}
          {error && errormsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {errormsg}
            </div>
          )}

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
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

          {/* Registration Form */}
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
              <Label htmlFor="password" className="text-[#3d2c28] text-sm font-medium">
                Password
              </Label>
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
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
              <p className="text-xs text-[#b8a69c]">
                Minimum 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[#3d2c28] text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`pl-10 border-[#F5EBEO] focus:border-[#DBA39A] focus:ring-[#DBA39A]/20 bg-[#FEFCF3] text-[#3d2c28] placeholder:text-[#b8a69c] placeholder:text-xs ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : ''
                  }`}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8a69c]" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8a69c] hover:text-[#3d2c28] transition-colors"
                >
                  {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({ ...prev, acceptTerms: checked as boolean }));
                  if (errors.acceptTerms) {
                    setErrors((prev) => ({ ...prev, acceptTerms: '' }));
                  }
                }}
                className="border-[#F5EBEO] text-[#DBA39A] focus:ring-[#DBA39A] focus:ring-offset-0"
              />
              <Label
                htmlFor="acceptTerms"
                className="text-xs text-[#3d2c28]/70 cursor-pointer"
              >
                I agree to the{' '}
                <Link href="/terms" className="text-[#DBA39A] hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#DBA39A] hover:underline font-medium">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-xs text-red-500">{errors.acceptTerms}</p>
            )}

            {/* Submit Button */}
            <Button
              disabled={loading}
              type="submit"
              className="w-full mt-2 bg-[#DBA39A] hover:bg-[#c49087] text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed py-5 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-[#3d2c28]/40">
              Already have an account?{' '}
              <Link href="/signin" className="text-[#DBA39A] font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}