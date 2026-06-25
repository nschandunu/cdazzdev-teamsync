export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-neutral-50 p-8">
      {/* Skeleton Sidebar */}
      <div className="hidden tablet:block w-64 mr-8 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded-md w-3/4 mb-12"></div>
        <div className="space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-full"></div>
          <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
          <div className="h-4 bg-neutral-200 rounded w-4/6"></div>
        </div>
      </div>
      
      {/* Skeleton Main Content */}
      <div className="flex-1 animate-pulse">
        <div className="h-10 bg-neutral-200 rounded-md w-1/3 mb-8"></div>
        <div className="flex gap-6 h-full">
          <div className="flex-1 bg-neutral-200 rounded-card h-3/4"></div>
          <div className="flex-1 bg-neutral-200 rounded-card h-1/2"></div>
          <div className="flex-1 bg-neutral-200 rounded-card h-2/3"></div>
        </div>
      </div>
    </div>
  );
}