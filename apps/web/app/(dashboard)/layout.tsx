import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardThemeWrapper } from '@/components/dashboard/dashboard-theme-wrapper';
import { OnboardingWrapper } from '@/components/onboarding/onboarding-wrapper';
import { PushNotificationPrompt } from '@/components/dashboard/push-notification-prompt';
import { SmartReminder } from '@/components/dashboard/smart-reminder';

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
      <div className="md:pl-64 lg:pl-64 relative min-h-screen min-h-[100dvh]">
        <DashboardHeader user={session.user} />
        <main className="p-3 sm:p-4 md:p-5 md:pb-6 lg:p-6 pb-28 lg:pb-6">
          <SmartReminder />
          {children}
        </main>
      </div>
      <OnboardingWrapper />
      <PushNotificationPrompt />
    </DashboardThemeWrapper>
  );
}
