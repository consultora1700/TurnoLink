'use client';

import { useState } from 'react';
import { AdminAuthGuard, AdminSidebar, AdminHeader } from '@/components/admin/layout';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div
          className={cn(
            'transition-all duration-300',
            // No padding on mobile, padding on desktop based on sidebar state
            'lg:pl-[260px]',
            sidebarCollapsed && 'lg:pl-[70px]'
          )}
        >
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-3 sm:p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
