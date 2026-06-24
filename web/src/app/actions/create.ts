'use server'

import { fetchServerAPI } from '@/app/lib/api-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProjectAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) return;

  try {
    const newProject = await fetchServerAPI('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    revalidatePath('/dashboard');
    // Instantly redirect them to their new project board
    redirect(`/dashboard?projectId=${newProject.id}`);
  } catch (error) {
    console.error('Failed to create project', error);
  }
}

export async function createTaskAction(projectId: string, formData: FormData) {
  const title = formData.get('title') as string;
  const priority = formData.get('priority') as string;

  if (!title) return;

  try {
    await fetchServerAPI(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title, priority }),
    });
    // Refresh the board and close the modal by routing back to the base project URL
    revalidatePath('/dashboard');
    redirect(`/dashboard?projectId=${projectId}`);
  } catch (error) {
    console.error('Failed to create task', error);
  }
}