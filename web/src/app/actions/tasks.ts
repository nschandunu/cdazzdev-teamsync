'use server'

import { fetchServerAPI } from '@/app/lib/api-server';
import { revalidatePath } from 'next/cache';

export async function updateTaskStatus(taskId: string, formData: FormData) {
  const status = formData.get('status') as string;
  
  try {
    await fetchServerAPI(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    // This tells Next.js to instantly refresh the server data on the dashboard
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Failed to update status', error);
  }
}

export async function addCommentAction(taskId: string, formData: FormData) {
  const body = formData.get('body') as string;
  if (!body) return;

  try {
    await fetchServerAPI(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Failed to add comment', error);
  }
}