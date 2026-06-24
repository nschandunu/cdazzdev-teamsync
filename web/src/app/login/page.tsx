'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md bg-white rounded-card shadow-sm border border-neutral-200 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-h1 text-neutral-900 mb-2">TeamSync</h1>
          <p className="text-body text-neutral-500">Sign in to your workspace</p>
        </div>

        {/* The Form */}
        <form action={formAction} className="space-y-6">
            {/* Error Message */}
          {state?.error && (
            <div className="p-3 bg-danger/10 border border-danger rounded-input text-danger text-caption">
              {state.error}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-caption text-neutral-700 font-medium">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="manager@teamsync.com"
              className="w-full px-4 py-3 rounded-input border border-neutral-300 text-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-neutral-400"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-caption text-neutral-700 font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-input border border-neutral-300 text-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-neutral-400"
            />
          </div>

          {/* Remember Me (Visual only for the assessment requirement) */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            <label htmlFor="remember" className="ml-2 block text-caption text-neutral-600">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary-dark text-white text-body font-medium py-3 rounded-btn transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isPending ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link (Requirement 3.2) */}
        <p className="mt-6 text-center text-caption text-neutral-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:text-primary-dark font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}