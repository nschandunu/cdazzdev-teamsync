import { fetchServerAPI } from '@/app/lib/api-server';
import Link from 'next/link';
import { cookies } from 'next/headers';
import KanbanBoard from '@/components/KanbanBoard';
import TaskModal from '@/components/TaskModal';
import Sidebar from '@/components/Sidebar';
import CreateProjectModal from '@/components/CreateProjectModal';
import CreateTaskModal from '@/components/CreateTaskModal';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; taskId?: string; newTask?: string; newProject?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeProjectId = resolvedParams.projectId;
  const activeTaskId = resolvedParams.taskId;
  const isCreatingTask = resolvedParams.newTask === 'true';
  const isCreatingProject = resolvedParams.newProject === 'true';

  // 1. Get User Role by decoding the JWT
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  let userRole = 'MEMBER';
  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userRole = payload.role;
    } catch (e) {}
  }

  // 2. Fetch data
  let projects = [];
  try { projects = await fetchServerAPI('/projects'); } catch (error) {}

  const currentProjectId = activeProjectId || (projects.length > 0 ? projects[0].id : null);
  const activeProject = projects.find((p: any) => p.id === currentProjectId);

  let tasks = [];
  if (currentProjectId) {
    try {
      const response = await fetchServerAPI(`/projects/${currentProjectId}/tasks?limit=50`);
      tasks = response.data || [];
    } catch (error) {}
  }

  let activeTaskDetails = null;
  if (activeTaskId) {
    try { activeTaskDetails = await fetchServerAPI(`/tasks/${activeTaskId}`); } catch (error) {}
  }

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden relative">
      
      <Sidebar projects={projects} activeProjectId={currentProjectId} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-h2 text-neutral-900">{activeProject ? activeProject.name : 'Select a Project'}</h2>
            {activeProject && <p className="text-caption text-neutral-500">{activeProject.description}</p>}
          </div>
          {/* Change button to a Link that toggles the URL state */}
          {activeProject && (
            <Link 
              href={`/dashboard?projectId=${currentProjectId}&newTask=true`}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-btn text-body font-medium transition-colors"
            >
              + New Task
            </Link>
          )}
        </header>

        <div className="flex-1 overflow-hidden p-8">
          {currentProjectId ? (
            <KanbanBoard tasks={tasks} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500">
              <p className="text-body mb-4">No projects found. You need to be added to a project first.</p>
              {/* Only show the call to action if they have the power to create a project */}
              {userRole === 'MANAGER' && (
                <Link href="?newProject=true" className="text-primary font-medium hover:underline">Create your first project</Link>
              )}
            </div>
          )}
        </div>

        {/* --- MODAL RENDERING --- */}
        {activeTaskDetails && currentProjectId && (
          <TaskModal task={activeTaskDetails} projectId={currentProjectId} members={activeProject?.members || []} />
        )}
        
        {isCreatingTask && currentProjectId && (
          <CreateTaskModal projectId={currentProjectId} members={activeProject?.members || []} />
        )}

        {isCreatingProject && userRole === 'MANAGER' && (
          <CreateProjectModal />
        )}

      </main>
    </div>
  );
}