import { fetchServerAPI } from '@/app/lib/api-server';
import KanbanBoard from '@/components/KanbanBoard';
import Sidebar from '@/components/Sidebar';
import TaskModal from '@/components/TaskModal';

// Next.js 15 requires awaiting searchParams
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; taskId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeProjectIdFromUrl = resolvedParams.projectId;
  const activeTaskId = resolvedParams.taskId;
  
  // 1. Fetch all projects the user belongs to
  let projects = [];
  try {
    projects = await fetchServerAPI('/projects');
  } catch (error) {
    // If unauthorized, the fetcher throws. In a real app, we'd redirect to /login here.
  }

  // 2. Determine the active project (default to the first one if none selected)
  const activeProjectId = activeProjectIdFromUrl || (projects.length > 0 ? projects[0].id : null);
  const activeProject = projects.find((p: any) => p.id === activeProjectId);

  // 3. Fetch tasks for the active project
  let tasks = [];
  if (activeProjectId) {
    try {
      // The API returns { data, meta } because we built pagination in NestJS!
      const response = await fetchServerAPI(`/projects/${activeProjectId}/tasks?limit=50`);
      tasks = response.data || [];
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  }

  let activeTaskDetails = null;
  if (activeTaskId) {
    try {
      // Fetches the specific task including comments and assignee
      activeTaskDetails = await fetchServerAPI(`/tasks/${activeTaskId}`);
    } catch (error) {
      console.error("Failed to fetch task details", error);
    }
  }

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <Sidebar activeProjectId={activeProjectId} projects={projects} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-h2 text-neutral-900">{activeProject ? activeProject.name : 'Select a Project'}</h2>
            {activeProject && <p className="text-caption text-neutral-500">{activeProject.description}</p>}
          </div>
          <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-btn text-body font-medium transition-colors">
            + New Task
          </button>
        </header>

        {/* Kanban Board Container */}
        <div className="flex-1 overflow-hidden p-8">
          {activeProjectId ? (
            <KanbanBoard tasks={tasks} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500">
              <p className="text-body mb-4">No projects found. You need to be added to a project first.</p>
            </div>
          )}
        </div>

        {activeTaskDetails && activeProjectId && (
          <TaskModal task={activeTaskDetails} projectId={activeProjectId} />
        )}
      </main>

    </div>
  );
}