'use client';

import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';

// 1. Define the exact Zod Schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  // 2. Initialize React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      
      const result = await loginAction(null, formData);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md bg-white rounded-card shadow-sm border border-neutral-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-h1 text-neutral-900 mb-2">TeamSync</h1>
          <p className="text-body text-neutral-500">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Server Error */}
          {serverError && (
            <div className="p-3 bg-danger/10 border border-danger rounded-input text-danger text-caption">
              {serverError}
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-caption text-neutral-700 font-medium">Email</label>
            <input
              {...register('email')}
              placeholder="manager@teamsync.com"
              className={`w-full px-4 py-3 rounded-input border text-body focus:outline-none focus:ring-2 transition-colors ${errors.email ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-neutral-300 focus:ring-primary/20 focus:border-primary'}`}
            />
            {errors.email && <p className="text-danger text-caption">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-caption text-neutral-700 font-medium">Password</label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-input border text-body focus:outline-none focus:ring-2 transition-colors ${errors.password ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-neutral-300 focus:ring-primary/20 focus:border-primary'}`}
            />
            {errors.password && <p className="text-danger text-caption">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary-dark text-white text-body font-medium py-3 rounded-btn transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {isPending ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-caption text-neutral-600">
          Don't have an account? <Link href="/register" className="text-primary hover:text-primary-dark font-medium">Register here</Link>
        </p>
      </div>
    </div>
  );
}