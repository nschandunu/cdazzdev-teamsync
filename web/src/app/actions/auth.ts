// web/src/app/actions/auth.ts
'use server'

import { cookies } from 'next/headers';
import { fetchAPI } from '@/app/lib/api';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // 1. Get the cookie store
    const cookieStore = await cookies();

    // 2. Securely set the access token as an httpOnly cookie
    cookieStore.set({
      name: 'access_token',
      value: data.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15, // 15 minutes (matches NestJS expiration)
    });

    // Optionally set refresh token here as well if you have extra time

  } catch (error: any) {
    return { error: error.message || 'Invalid credentials. Please try again.' };
  }

  // 3. Redirect to the dashboard on successful login
  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  redirect('/login');
}