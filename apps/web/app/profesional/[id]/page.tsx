import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { publicTalentApi, PublicTalentFullProfile, TalentProfile } from '@/lib/api';
import { ProfileHeader } from '@/components/profile/profile-header';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

async function getProfile(id: string): Promise<PublicTalentFullProfile | null> {
  try {
    return await publicTalentApi.getFullProfile(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfile(params.id);

  if (!profile) {
    return { title: 'Perfil no encontrado' };
  }

  const title = `${profile.name} — ${profile.specialty || 'Profesional'}`;
  const description =
    profile.headline || profile.bio?.slice(0, 160) || 'Perfil profesional en TurnoLink';

  return {
    title,
    description,
    openGraph: {
      title: `${profile.name} — ${profile.specialty || 'Profesional'}`,
      description,
      type: 'profile',
      images: profile.image ? [{ url: profile.image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.name} — ${profile.specialty || 'Profesional'}`,
      description,
    },
  };
}

function PersonJsonLd({ profile }: { profile: PublicTalentFullProfile }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.specialty || undefined,
    description: profile.headline || profile.bio || undefined,
    image: profile.image || undefined,
    knowsAbout: profile.skills.length > 0 ? profile.skills : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProfesionalPage({ params }: Props) {
  const profile = await getProfile(params.id);

  if (!profile) {
    notFound();
  }

  // Cast to TalentProfile for ProfileHeader (phone is not used by the component)
  const profileForHeader = {
    ...profile,
    phone: null,
  } as TalentProfile;

  return (
    <>
      <PersonJsonLd profile={profile} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <ProfileHeader profile={profileForHeader} />

          {/* Footer CTA */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Perfil en{' '}
              <Link href="/" className="font-semibold text-teal-600 hover:underline dark:text-teal-400">
                TurnoLink
              </Link>
            </p>
            <Link
              href="/explorar-talento"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
            >
              ¿Buscás talento? Explorá profesionales
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
