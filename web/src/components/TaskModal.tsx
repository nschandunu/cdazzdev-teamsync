'use client';

import Link from 'next/link';
import { updateTaskStatus, addCommentAction } from '@/app/actions/tasks';

export default function TaskModal({ task, projectId }: { task: any, projectId: string }) {
  // Bind the taskId to our server actions
  const updateStatus = updateTaskStatus.bind(null, task.id);
  const addComment = addCommentAction.bind(null, task.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-900/50 backdrop-blur-sm">
      {/* Click outside to close */}
      <Link href={`/dashboard?projectId=${projectId}`} className="absolute inset-0" />
      
      {/* Slide-over panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <span className="text-[11px] font-bold px-2 py-1 uppercase tracking-wider rounded-input bg-neutral-100 text-neutral-600">
            {task.priority} PRIORITY
          </span>
          <Link href={`/dashboard?projectId=${projectId}`} className="text-neutral-400 hover:text-neutral-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-h2 text-neutral-900 mb-2">{task.title}</h2>
            <p className="text-body text-neutral-600 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
            <div>
              <p className="text-caption text-neutral-500 mb-1">Assignee</p>
              <p className="text-body font-medium">{task.assignee?.name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-caption text-neutral-500 mb-1">Due Date</p>
              <p className="text-body font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</p>
            </div>
          </div>

          {/* Status Control */}
          <div className="pt-4 border-t border-neutral-100">
            <p className="text-caption text-neutral-500 mb-2">Status</p>
            <form action={updateStatus}>
              <select 
                name="status" 
                defaultValue={task.status}
                onChange={(e) => e.target.form?.requestSubmit()}
                className="w-full px-3 py-2 rounded-input border border-neutral-300 text-body focus:ring-primary focus:border-primary"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </form>
          </div>

          {/* Comments Section */}
          <div className="pt-6 border-t border-neutral-200">
            <h3 className="text-body font-semibold text-neutral-900 mb-4">Comments</h3>
            
            <div className="space-y-4 mb-6">
              {task.comments?.length === 0 && (
                <p className="text-caption text-neutral-500 italic">No comments yet.</p>
              )}
              {task.comments?.map((comment: any) => (
                <div key={comment.id} className="bg-neutral-50 p-3 rounded-card">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-caption font-semibold text-neutral-900">{comment.author.name}</span>
                    <span className="text-[11px] text-neutral-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-caption text-neutral-700">{comment.body}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <form action={addComment} className="flex gap-2">
              <input 
                type="text" 
                name="body" 
                placeholder="Add a comment..." 
                required
                className="flex-1 px-3 py-2 rounded-input border border-neutral-300 text-caption focus:ring-primary focus:border-primary"
              />
              <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-btn text-caption font-medium transition-colors">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}