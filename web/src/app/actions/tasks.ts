'use server'

import { fetchServerAPI } from '@/app/lib/api-server';
import { revalidatePath } from 'next/cache';

export async function updateTaskAction(taskId: string, formData: FormData) {
  const status = formData.get('status') as string;
  const priority = formData.get('priority') as string;
  const assigneeId = formData.get('assigneeId') as string;
  const dueDate = formData.get('dueDate') as string;
  
  const payload: any = {};
  if (status) payload.status = status;
  if (priority) payload.priority = priority;
  if (assigneeId !== null) payload.assigneeId = assigneeId === '' ? null : assigneeId;
  if (dueDate !== null) payload.dueDate = dueDate ? new Date(dueDate).toISOString() : null;

  try {
    await fetchServerAPI(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
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