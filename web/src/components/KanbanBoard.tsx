import React from 'react';
import Link from 'next/link';

const priorityColors = {
  LOW: 'bg-neutral-100 text-neutral-600',
  MEDIUM: 'bg-warning/10 text-warning',
  HIGH: 'bg-danger/10 text-danger',
};

export default function KanbanBoard({ tasks }: { tasks: any[] }) {
  const columns = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  };

  return (
    <div className="flex flex-col tablet:flex-row gap-6 h-full overflow-x-auto pb-4">
      {Object.entries(columns).map(([status, columnTasks]) => (
        <div key={status} className="flex-1 min-w-[300px] bg-neutral-100 rounded-card p-4 flex flex-col max-h-full">
          
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-body font-semibold text-neutral-800 capitalize">
              {status.replace('_', ' ')}
            </h2>
            <span className="text-caption bg-neutral-200 text-neutral-600 px-2 py-1 rounded-full">
              {columnTasks.length}
            </span>
          </div>

          {/* Task List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {columnTasks.map((task) => (
              <Link
                key={task.id} 
                href={`/dashboard?projectId=${task.projectId}&taskId=${task.id}`}
                className="block bg-white p-4 rounded-card shadow-sm border border-neutral-200 cursor-pointer hover:border-primary transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[11px] font-bold px-2 py-1 uppercase tracking-wider rounded-input ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                    {task.priority}
                  </span>
                  {/* Assignee */}
                  <div className="flex items-center gap-2">
                    {task.assignee?.name ? (
                      <>
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold uppercase" title={task.assignee.name}>
                          {task.assignee.name.substring(0, 2)}
                        </div>
                        <span className="text-caption text-neutral-600 truncate max-w-[80px]" title={task.assignee.name}>
                          {task.assignee.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-caption text-neutral-400 italic">Unassigned</span>
                    )}
                  </div>
                </div>
                <h3 className="text-body font-medium text-neutral-900 group-hover:text-primary transition-colors line-clamp-2">
                  {task.title}
                </h3>
                
                {/* Due Date */}
                <div className="mt-3 flex items-center">
                  <p className={`text-caption flex items-center gap-1 ${task.dueDate ? 'text-neutral-500' : 'text-neutral-400 italic'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
                  </p>
                </div>
              </Link>
            ))}
            
            {columnTasks.length === 0 && (
              <div className="text-center p-6 border-2 border-dashed border-neutral-300 rounded-card text-neutral-400 text-caption">
                No tasks yet
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}