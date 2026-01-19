import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardThemeWrapper } from '@/components/dashboard/dashboard-theme-wrapper';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardThemeWrapper>
      <DashboardSidebar />
      <div className="lg:pl-64 relative">
        <DashboardHeader user={session.user} />
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>
      </div>
    </DashboardThemeWrapper>
  );
}
