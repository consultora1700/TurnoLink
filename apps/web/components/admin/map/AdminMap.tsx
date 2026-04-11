'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapBusiness, MapProfessional } from '@/lib/admin-api';

// Fix Leaflet default icon issue with webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Modern SVG markers ---
function createMarkerIcon(type: 'business' | 'professional') {
  const color = type === 'business' ? '#3b82f6' : '#10b981';
  const bgLight = type === 'business' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)';
  const icon = type === 'business'
    ? `<path d="M3 21V7l8-4 8 4v14" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M9 21V13h4v8" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M1 21h20" stroke="white" stroke-width="1.8" stroke-linecap="round"/>`
    : `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="9" cy="7" r="4" stroke="white" stroke-width="1.8" fill="none"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

  return L.divIcon({
    className: 'turnolink-marker',
    html: `
      <div style="position:relative;width:40px;height:40px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:${bgLight};animation:marker-pulse 2s ease-out infinite;"></div>
        <div style="
          position:absolute;inset:4px;
          border-radius:50%;
          background:${color};
          box-shadow:0 4px 14px ${color}66, 0 0 0 3px white, 0 2px 8px rgba(0,0,0,0.15);
          display:flex;align-items:center;justify-content:center;
        ">
          <svg viewBox="0 0 24 24" width="16" height="16" style="margin-top:-1px">${icon}</svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });
}

const businessIcon = createMarkerIcon('business');
const professionalIcon = createMarkerIcon('professional');

// --- FitBounds helper ---
function FitBounds({ businesses, professionals }: { businesses: MapBusiness[]; professionals: MapProfessional[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    const allPoints: L.LatLngTuple[] = [
      ...businesses.map((b) => [b.lat, b.lng] as L.LatLngTuple),
      ...professionals.map((p) => [p.lat, p.lng] as L.LatLngTuple),
    ];
    if (allPoints.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      fitted.current = true;
    }
  }, [businesses, professionals, map]);

  return null;
}

// --- Popup components ---
function BusinessPopup({ b }: { b: MapBusiness }) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    ACTIVE: { bg: '#dcfce7', text: '#15803d', label: 'Activo' },
    SUSPENDED: { bg: '#fef9c3', text: '#a16207', label: 'Suspendido' },
    INACTIVE: { bg: '#f3f4f6', text: '#6b7280', label: 'Inactivo' },
  };
  const st = statusConfig[b.status] || statusConfig.INACTIVE;

  return (
    <div style={{ minWidth: 220, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
        }}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M3 21V7l8-4 8 4v14" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M9 21V13h4v8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: '#1e293b' }}>{b.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>/{b.slug}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#64748b', marginBottom: 8 }}>
        {b.city && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" width="13" height="13" style={{ flexShrink: 0, opacity: 0.6 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#64748b" strokeWidth="2" fill="none"/>
              <circle cx="12" cy="10" r="3" stroke="#64748b" strokeWidth="2" fill="none"/>
            </svg>
            <span>{b.city}</span>
          </div>
        )}
        {b.address && (
          <div style={{ paddingLeft: 19, color: '#94a3b8', fontSize: 11 }}>{b.address}</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          background: st.bg, color: st.text,
          padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
        }}>{st.label}</span>
        {b.plan && (
          <span style={{
            background: '#ede9fe', color: '#7c3aed',
            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          }}>{b.plan}</span>
        )}
      </div>
    </div>
  );
}

function ProfessionalPopup({ p }: { p: MapProfessional }) {
  return (
    <div style={{ minWidth: 220, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
        }}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="8" r="5" stroke="white" strokeWidth="1.8" fill="none"/>
            <path d="M20 21a8 8 0 1 0-16 0" stroke="white" strokeWidth="1.8" fill="none"/>
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: '#1e293b' }}>{p.name}</div>
          {p.specialty && <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{p.specialty}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#64748b', marginBottom: 8 }}>
        {p.category && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" width="13" height="13" style={{ flexShrink: 0, opacity: 0.6 }}>
              <rect x="3" y="3" width="7" height="7" stroke="#64748b" strokeWidth="2" fill="none" rx="1"/>
              <rect x="14" y="3" width="7" height="7" stroke="#64748b" strokeWidth="2" fill="none" rx="1"/>
              <rect x="3" y="14" width="7" height="7" stroke="#64748b" strokeWidth="2" fill="none" rx="1"/>
              <rect x="14" y="14" width="7" height="7" stroke="#64748b" strokeWidth="2" fill="none" rx="1"/>
            </svg>
            <span style={{ textTransform: 'capitalize' }}>{p.category.replace(/-/g, ' ')}</span>
          </div>
        )}
        {p.zone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" width="13" height="13" style={{ flexShrink: 0, opacity: 0.6 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#64748b" strokeWidth="2" fill="none"/>
              <circle cx="12" cy="10" r="3" stroke="#64748b" strokeWidth="2" fill="none"/>
            </svg>
            <span>{p.zone}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {p.openToWork && (
          <span style={{
            background: '#dcfce7', color: '#15803d',
            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          }}>Open to Work</span>
        )}
        {p.profileVisible && (
          <span style={{
            background: '#dbeafe', color: '#1d4ed8',
            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          }}>Perfil visible</span>
        )}
      </div>
    </div>
  );
}

// --- Inject global marker styles ---
const MARKER_STYLES = `
  @keyframes marker-pulse {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  .turnolink-marker { background: none !important; border: none !important; }
  .leaflet-popup-content-wrapper {
    border-radius: 14px !important;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06) !important;
    padding: 0 !important;
    border: 1px solid rgba(0,0,0,0.06) !important;
  }
  .leaflet-popup-content { margin: 14px 16px !important; }
  .leaflet-popup-tip {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    border: 1px solid rgba(0,0,0,0.04) !important;
  }
  .leaflet-container {
    font-family: system-ui, -apple-system, sans-serif !important;
  }
  .leaflet-control-zoom {
    border: none !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1) !important;
    border-radius: 12px !important;
    overflow: hidden !important;
  }
  .leaflet-control-zoom a {
    width: 36px !important;
    height: 36px !important;
    line-height: 36px !important;
    font-size: 16px !important;
    color: #334155 !important;
    border-bottom: 1px solid #e2e8f0 !important;
    background: rgba(255,255,255,0.95) !important;
    backdrop-filter: blur(8px) !important;
  }
  .leaflet-control-zoom a:hover {
    background: #f1f5f9 !important;
    color: #0f172a !important;
  }
  .leaflet-control-zoom a:last-child { border-bottom: none !important; }
  .leaflet-control-attribution {
    background: rgba(255,255,255,0.7) !important;
    backdrop-filter: blur(4px) !important;
    font-size: 10px !important;
    border-radius: 6px 0 0 0 !important;
    padding: 2px 6px !important;
  }
`;

function InjectStyles() {
  useEffect(() => {
    const id = 'turnolink-map-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = MARKER_STYLES;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);
  return null;
}

// --- Main component ---
interface AdminMapProps {
  businesses: MapBusiness[];
  professionals: MapProfessional[];
}

export default function AdminMap({ businesses, professionals }: AdminMapProps) {
  return (
    <MapContainer
      center={[-34.60, -58.38]}
      zoom={5}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <InjectStyles />

      {/* CartoDB Voyager — modern, clean, free */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />

      <FitBounds businesses={businesses} professionals={professionals} />

      {businesses.map((b) => (
        <Marker key={`b-${b.id}`} position={[b.lat, b.lng]} icon={businessIcon}>
          <Popup><BusinessPopup b={b} /></Popup>
        </Marker>
      ))}

      {professionals.map((p) => (
        <Marker key={`p-${p.id}`} position={[p.lat, p.lng]} icon={professionalIcon}>
          <Popup><ProfessionalPopup p={p} /></Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
