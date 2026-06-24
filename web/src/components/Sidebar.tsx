'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar({ projects, activeProjectId }: { projects: any[], activeProjectId: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button (Only visible on mobile) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="tablet:hidden fixed bottom-6 right-6 z-40 bg-primary text-white p-4 rounded-full shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>

      {/* Backdrop for Mobile Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/50 z-40 tablet:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar / Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-in-out
        tablet:relative tablet:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200">
          <h1 className="text-h2 text-primary font-bold tracking-tight">TeamSync</h1>
          {/* Close button for mobile */}
          <button onClick={() => setIsOpen(false)} className="tablet:hidden text-neutral-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <h2 className="text-caption font-semibold text-neutral-400 uppercase tracking-wider mb-4 px-2">Projects</h2>
          <nav className="space-y-1">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                href={`/dashboard?projectId=${project.id}`}
                onClick={() => setIsOpen(false)} // Auto-close drawer on mobile click
                className={`block px-3 py-2 rounded-btn text-body transition-colors ${
                  project.id === activeProjectId 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {project.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-neutral-200">
          <form action="/api/logout" method="POST">
            <button type="submit" className="w-full text-left px-3 py-2 text-danger hover:bg-danger/10 rounded-btn text-body transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}