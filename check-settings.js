const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.tenant.findMany({ select: { slug: true, settings: true }, take: 10 }).then(ts => {
  ts.forEach(t => {
    const s = typeof t.settings === 'string' ? JSON.parse(t.settings) : t.settings;
    if (s && (s.showProfilePhoto !== undefined || s.coverOverlayColor !== undefined || s.coverFadeEnabled !== undefined)) {
      console.log(t.slug, 'HAS cover settings:', JSON.stringify({
        showProfilePhoto: s.showProfilePhoto,
        coverOverlayColor: s.coverOverlayColor,
        coverOverlayOpacity: s.coverOverlayOpacity,
        coverFadeEnabled: s.coverFadeEnabled,
        coverFadeColor: s.coverFadeColor,
        themeMode: s.themeMode,
      }));
    } else {
      console.log(t.slug, '- no cover settings yet');
    }
  });
  p.$disconnect();
});
