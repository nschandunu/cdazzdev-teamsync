import Link from 'next/link';
import { createProjectAction } from '@/app/actions/create';

export default function CreateProjectModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-4">
      {/* Click outside to close (removes the ?newProject=true from URL) */}
      <Link href="/dashboard" className="absolute inset-0" />
      
      <div className="relative w-full max-w-md bg-white rounded-card shadow-xl p-6 z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-h2 text-neutral-900">Create New Project</h2>
          <Link href="/dashboard" className="text-neutral-400 hover:text-neutral-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </Link>
        </div>

        <form action={createProjectAction} className="space-y-4">
          <div>
            <label className="block text-caption text-neutral-700 font-medium mb-1">Project Name</label>
            <input type="text" name="name" required className="w-full px-4 py-2 rounded-input border border-neutral-300 text-body focus:ring-primary focus:border-primary" placeholder="e.g. Q3 Marketing Site" />
          </div>
          <div>
            <label className="block text-caption text-neutral-700 font-medium mb-1">Description (Optional)</label>
            <textarea name="description" rows={3} className="w-full px-4 py-2 rounded-input border border-neutral-300 text-body focus:ring-primary focus:border-primary" placeholder="Brief details about this project..." />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-btn transition-colors mt-4">
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
}