'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  HardHat, Plus, Pencil, Trash2, X, Loader2, ArrowLeft, ChevronRight, Info,
  Target, Users, Building2, DollarSign, CheckCircle2, Clock, MapPin,
  Layers, TrendingUp, Milestone, PlusCircle, CreditCard, ImagePlus, Camera,
  FileText, Timer, Shield, Calendar, Video, Download, AlertTriangle,
} from 'lucide-react';

function formatCurrency(n: number, currency = 'USD') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  planning: { label: 'Planificación', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
  pre_sale: { label: 'Preventa', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  under_construction: { label: 'En construcción', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  delivered: { label: 'Entregado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
};

const UNIT_STATUS: Record<string, { label: string; color: string }> = {
  available: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  reserved: { label: 'Reservada', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  sold: { label: 'Vendida', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  escriturada: { label: 'Escriturada', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
};

const UNIT_TYPES: Record<string, string> = {
  monoambiente: 'Monoamb.', '1amb': '1 Amb.', '2amb': '2 Amb.', '3amb': '3 Amb.',
  local: 'Local', cochera: 'Cochera', baulera: 'Baulera',
};

const inputClasses = 'w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors dark:text-neutral-100 dark:placeholder:text-neutral-500';

export default function DesarrollosPage() {
  const { api } = useApi();
  const formRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [hideGuide, setHideGuide] = useState(true);
  useEffect(() => { setHideGuide(!!localStorage.getItem('hide-guide-desarrollos')); }, []);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', address: '', city: '', totalUnits: '', status: 'planning', targetFundingAmount: '', reservationDays: '15', adjustmentType: 'fixed_usd', deliveryDate: '', amenities: '', brochureUrl: '', videoUrl: '' });
  const [coverImage, setCoverImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ name: '', description: '', progressPercent: '0', targetDate: '', order: '0' });
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitForm, setUnitForm] = useState({ unitIdentifier: '', unitType: '2amb', floor: '', area: '', price: '', currency: 'USD', supCubierta: '', floorPlanUrl: '' });
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState(false);
  const [viewingFloorPlan, setViewingFloorPlan] = useState<string | null>(null);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [investmentForm, setInvestmentForm] = useState({ unitId: '', investorName: '', investorDni: '', investorPhone: '', investorEmail: '', totalAmount: '', totalInstallments: '12', currency: 'USD', paymentPlanId: '' });

  const [markingPaymentId, setMarkingPaymentId] = useState<string | null>(null);
  const [paymentMarkForm, setPaymentMarkForm] = useState({ paidAmount: '', paymentMethod: 'transferencia' });

  const [reservingUnitId, setReservingUnitId] = useState<string | null>(null);
  const [reserveForm, setReserveForm] = useState({ reservedByName: '', reservedByPhone: '', reservedByEmail: '' });

  const [showPaymentPlanForm, setShowPaymentPlanForm] = useState(false);
  const [paymentPlanForm, setPaymentPlanForm] = useState({ name: '', downPaymentPercent: '30', installments: '12', discountPercent: '0', adjustmentType: 'fixed_usd', description: '', isDefault: false });
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);

  const loadProjects = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try { setProjects(await api.getDevelopmentProjects()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const openProject = async (id: string) => {
    if (!api) return;
    try {
      const proj = await api.getDevelopmentProject(id);
      setSelectedProject(proj);
      setPaymentPlans(proj.paymentPlans || []);
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', address: '', city: '', totalUnits: '', status: 'planning', targetFundingAmount: '', reservationDays: '15', adjustmentType: 'fixed_usd', deliveryDate: '', amenities: '', brochureUrl: '', videoUrl: '' });
    setCoverImage(''); setGalleryImages([]);
    setEditingId(null); setShowForm(false);
  };

  const handleSaveProject = async () => {
    if (!api || !form.name) return;
    setSaving(true);
    try {
      const data: any = { ...form, totalUnits: form.totalUnits ? Number(form.totalUnits) : undefined, targetFundingAmount: form.targetFundingAmount ? Number(form.targetFundingAmount) : undefined };
      if (form.reservationDays) data.reservationDays = Number(form.reservationDays);
      data.adjustmentType = form.adjustmentType;
      if (form.deliveryDate) data.deliveryDate = form.deliveryDate;
      if (form.amenities) data.amenities = JSON.stringify(form.amenities.split(',').map((s: string) => s.trim()).filter(Boolean));
      if (form.brochureUrl) data.brochureUrl = form.brochureUrl;
      if (form.videoUrl) data.videoUrl = form.videoUrl;
      if (coverImage) data.coverImage = coverImage;
      else if (!coverImage && editingId) data.coverImage = null;
      if (galleryImages.length > 0) data.images = galleryImages;
      else if (editingId) data.images = [];
      if (editingId) await api.updateDevelopmentProject(editingId, data);
      else await api.createDevelopmentProject(data);
      resetForm(); loadProjects();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleUploadCover = async (file: File) => {
    if (!api) return;
    setUploadingCover(true);
    try {
      const result = await api.uploadMedia(file, 'developments');
      setCoverImage(result.url);
    } catch (e) { console.error(e); }
    finally { setUploadingCover(false); }
  };

  const handleUploadGallery = async (files: FileList) => {
    if (!api) return;
    setUploadingGallery(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map(f => api.uploadMedia(f, 'developments'))
      );
      setGalleryImages(prev => [...prev, ...uploads.map(u => u.url)]);
    } catch (e) { console.error(e); }
    finally { setUploadingGallery(false); }
  };

  const handleEditProject = (p: any) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description || '', address: p.address || '', city: p.city || '', totalUnits: String(p.totalUnits || ''), status: p.status, targetFundingAmount: p.targetFundingAmount ? String(p.targetFundingAmount) : '', reservationDays: String(p.reservationDays || 15), adjustmentType: p.adjustmentType || 'fixed_usd', deliveryDate: p.deliveryDate ? p.deliveryDate.slice(0, 10) : '', amenities: Array.isArray(JSON.parse(p.amenities || '[]')) ? JSON.parse(p.amenities || '[]').join(', ') : '', brochureUrl: p.brochureUrl || '', videoUrl: p.videoUrl || '' });
    setCoverImage(p.coverImage || '');
    setGalleryImages(Array.isArray(p.images) ? p.images : []);
    setShowForm(true); setSelectedProject(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleSaveMilestone = async () => {
    if (!api || !selectedProject || !milestoneForm.name) return;
    setSaving(true);
    try {
      await api.createMilestone(selectedProject.id, { ...milestoneForm, progressPercent: Number(milestoneForm.progressPercent), order: Number(milestoneForm.order) });
      setShowMilestoneForm(false); setMilestoneForm({ name: '', description: '', progressPercent: '0', targetDate: '', order: '0' });
      openProject(selectedProject.id);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleUpdateMilestoneProgress = async (milestoneId: string, progress: number) => {
    if (!api || !selectedProject) return;
    try {
      await api.updateMilestone(selectedProject.id, milestoneId, { progressPercent: progress });
      openProject(selectedProject.id);
    } catch (e) { console.error(e); }
  };

  const handleSaveUnit = async () => {
    if (!api || !selectedProject || !unitForm.unitIdentifier) return;
    setSaving(true);
    try {
      await api.createProjectUnit(selectedProject.id, { ...unitForm, area: unitForm.area ? Number(unitForm.area) : undefined, price: unitForm.price ? Number(unitForm.price) : undefined, supCubierta: unitForm.supCubierta ? Number(unitForm.supCubierta) : undefined, floorPlanUrl: unitForm.floorPlanUrl || undefined });
      setShowUnitForm(false); setUnitForm({ unitIdentifier: '', unitType: '2amb', floor: '', area: '', price: '', currency: 'USD', supCubierta: '', floorPlanUrl: '' });
      openProject(selectedProject.id);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleSaveInvestment = async () => {
    if (!api || !selectedProject || !investmentForm.investorName || !investmentForm.totalAmount) return;
    setSaving(true);
    try {
      await api.createInvestment(selectedProject.id, { ...investmentForm, totalAmount: Number(investmentForm.totalAmount), totalInstallments: Number(investmentForm.totalInstallments), unitId: investmentForm.unitId || undefined, paymentPlanId: investmentForm.paymentPlanId || undefined });
      setShowInvestmentForm(false); setInvestmentForm({ unitId: '', investorName: '', investorDni: '', investorPhone: '', investorEmail: '', totalAmount: '', totalInstallments: '12', currency: 'USD', paymentPlanId: '' });
      openProject(selectedProject.id);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleMarkPayment = async (paymentId: string) => {
    if (!api || !selectedProject || !paymentMarkForm.paidAmount) return;
    setSaving(true);
    try {
      await api.markInvestmentPayment(selectedProject.id, paymentId, { paidAmount: Number(paymentMarkForm.paidAmount), paymentMethod: paymentMarkForm.paymentMethod });
      setMarkingPaymentId(null); setPaymentMarkForm({ paidAmount: '', paymentMethod: 'transferencia' });
      openProject(selectedProject.id);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleReserveUnit = async (unitId: string) => {
    if (!api || !selectedProject || !reserveForm.reservedByName) return;
    setSaving(true);
    try {
      await api.reserveUnit(selectedProject.id, unitId, reserveForm);
      setReservingUnitId(null);
      setReserveForm({ reservedByName: '', reservedByPhone: '', reservedByEmail: '' });
      openProject(selectedProject.id);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleCancelReservation = async (unitId: string) => {
    if (!api || !selectedProject) return;
    setSaving(true);
    try {
      await api.cancelReservation(selectedProject.id, unitId);
      openProject(selectedProject.id);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const exportPriceListPdf = (project: any) => {
    const units = project.units || [];
    const plans = project.paymentPlans || [];
    const amenities = Array.isArray(project.amenities) ? project.amenities : [];
    const st = STATUS_MAP[project.status] || STATUS_MAP.planning;

    const unitRows = units
      .sort((a: any, b: any) => {
        const fa = a.floor || ''; const fb = b.floor || '';
        if (fa !== fb) return fa.localeCompare(fb, undefined, { numeric: true });
        return a.unitIdentifier.localeCompare(b.unitIdentifier);
      })
      .map((u: any) => {
        const us = UNIT_STATUS[u.status] || UNIT_STATUS.available;
        const pricePerM2 = u.price && u.area ? Math.round(u.price / u.area) : '-';
        return `<tr>
          <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-weight:600;">${u.unitIdentifier}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${UNIT_TYPES[u.unitType] || u.unitType}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${u.floor || '-'}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${u.orientation || '-'}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">${u.area ? u.area + ' m²' : '-'}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">${u.supCubierta ? u.supCubierta + ' m²' : '-'}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${u.price ? formatCurrency(u.price, u.currency) : '-'}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;color:#059669;">${pricePerM2 !== '-' ? 'USD ' + pricePerM2 : '-'}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;"><span style="padding:2px 8px;border-radius:4px;font-size:11px;background:${u.status === 'available' ? '#d1fae5;color:#065f46' : u.status === 'reserved' ? '#fef3c7;color:#92400e' : '#dbeafe;color:#1e40af'}">${us.label}</span></td>
        </tr>`;
      }).join('');

    const planRows = plans.map((p: any) => `
      <div style="display:inline-block;vertical-align:top;width:48%;margin:0 1% 12px;padding:14px;border:1px solid #e5e7eb;border-radius:8px;">
        <strong style="font-size:14px;">${p.name}</strong>
        ${p.description ? `<p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${p.description}</p>` : ''}
        <p style="margin:6px 0 0;font-size:12px;color:#374151;">Anticipo: ${p.downPaymentPercent}% · ${p.installments} cuotas${p.discountPercent > 0 ? ` · ${p.discountPercent}% dto.` : ''} · ${p.adjustmentType === 'fixed_usd' ? 'USD fijo' : p.adjustmentType === 'cac' ? 'CAC' : p.adjustmentType === 'uva' ? 'UVA' : p.adjustmentType === 'dolar_linked' ? 'Dólar linked' : 'ARS fijo'}</p>
      </div>
    `).join('');

    const totalAvailable = units.filter((u: any) => u.status === 'available').length;
    const totalReserved = units.filter((u: any) => u.status === 'reserved').length;
    const totalSold = units.filter((u: any) => u.status === 'sold').length;
    const date = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lista de Precios - ${project.name}</title>
    <style>@page{size:A4 landscape;margin:15mm}body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#111827;font-size:13px;margin:0;padding:0}
    table{width:100%;border-collapse:collapse}th{padding:8px 10px;text-align:left;border-bottom:2px solid #111827;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280}
    @media print{.no-print{display:none}}</style></head>
    <body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
        <div>
          <h1 style="margin:0 0 4px;font-size:22px;">${project.name}</h1>
          <p style="margin:0;color:#6b7280;font-size:13px;">${project.address || ''}${project.city ? ', ' + project.city : ''} · ${st.label} · Entrega: ${project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : 'A confirmar'}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">Lista de precios al ${date}</p>
          <p style="margin:4px 0 0;font-size:12px;"><strong>${totalAvailable}</strong> disp. · <strong>${totalReserved}</strong> res. · <strong>${totalSold}</strong> vend. (${units.length} total)</p>
        </div>
      </div>

      ${amenities.length > 0 ? `<p style="margin:0 0 16px;font-size:12px;color:#6b7280;"><strong>Amenities:</strong> ${amenities.join(' · ')}</p>` : ''}

      <table>
        <thead><tr>
          <th>Unidad</th><th>Tipo</th><th>Piso</th><th>Orient.</th>
          <th style="text-align:right;">Sup. total</th><th style="text-align:right;">Sup. cub.</th>
          <th style="text-align:right;">Precio</th><th style="text-align:right;">USD/m²</th>
          <th style="text-align:center;">Estado</th>
        </tr></thead>
        <tbody>${unitRows}</tbody>
      </table>

      ${plans.length > 0 ? `<h3 style="margin:24px 0 12px;font-size:15px;">Planes de pago</h3><div>${planRows}</div>` : ''}

      <p style="margin:24px 0 0;font-size:10px;color:#9ca3af;text-align:center;">Documento generado por TurnoLink · Los precios pueden variar sin previo aviso · Valores expresados en dólares estadounidenses</p>
    </body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 300);
    }
  };

  const handleSavePaymentPlan = async () => {
    if (!api || !selectedProject || !paymentPlanForm.name) return;
    setSaving(true);
    try {
      await api.createPaymentPlan(selectedProject.id, {
        ...paymentPlanForm,
        downPaymentPercent: Number(paymentPlanForm.downPaymentPercent),
        installments: Number(paymentPlanForm.installments),
        discountPercent: Number(paymentPlanForm.discountPercent),
      });
      setShowPaymentPlanForm(false);
      setPaymentPlanForm({ name: '', downPaymentPercent: '30', installments: '12', discountPercent: '0', adjustmentType: 'fixed_usd', description: '', isDefault: false });
      openProject(selectedProject.id);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDeletePaymentPlan = async (planId: string) => {
    if (!api || !selectedProject) return;
    try {
      await api.deletePaymentPlan(selectedProject.id, planId);
      openProject(selectedProject.id);
    } catch (e) { console.error(e); }
  };

  // ===================== DETAIL VIEW =====================
  if (selectedProject) {
    const p = selectedProject;
    const st = STATUS_MAP[p.status] || STATUS_MAP.planning;
    const fundingPercent = p.targetFundingAmount ? Math.min((p.currentFundedAmount / p.targetFundingAmount) * 100, 100) : 0;
    const unitsAvailable = p.units?.filter((u: any) => u.status === 'available').length || 0;
    const unitsSold = p.units?.filter((u: any) => u.status === 'sold').length || 0;
    const unitsReserved = p.units?.filter((u: any) => u.status === 'reserved').length || 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 mt-1 dark:hover:bg-neutral-700" onClick={() => setSelectedProject(null)}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold dark:text-white">{p.name}</h1>
              <Badge className={st.color}>{st.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground dark:text-neutral-400 mt-0.5">{p.address}{p.city ? `, ${p.city}` : ''}</p>
          </div>
          <Button variant="outline" size="sm" className="dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-200" onClick={() => exportPriceListPdf(p)}><Download className="h-4 w-4 mr-1" /> Lista de precios</Button>
          <Button variant="outline" size="sm" className="dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-200" onClick={() => handleEditProject(p)}><Pencil className="h-4 w-4 mr-1" /> Editar</Button>
        </div>

        {/* Progress */}
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm dark:border-neutral-700 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-neutral-400">Progreso de obra</p>
                <p className="text-3xl font-bold dark:text-white">{p.progressPercent}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground dark:text-neutral-400">Unidades</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs dark:border-neutral-600 dark:text-neutral-300">{unitsAvailable} disp.</Badge>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-xs">{unitsReserved} res.</Badge>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-xs">{unitsSold} vend.</Badge>
                </div>
              </div>
            </div>
            <div className="h-4 rounded-full bg-muted dark:bg-neutral-700 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 transition-all duration-700 relative" style={{ width: `${p.progressPercent}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse" style={{ animationDuration: '2s' }} />
              </div>
            </div>
          </div>
          {p.targetFundingAmount > 0 && (
            <div className="px-5 pb-4 pt-1 border-t dark:border-neutral-700">
              <div className="flex items-center justify-between text-sm mb-1.5 mt-2">
                <span className="text-muted-foreground dark:text-neutral-400">Financiamiento</span>
                <span className="font-semibold dark:text-white">{formatCurrency(p.currentFundedAmount)} / {formatCurrency(p.targetFundingAmount)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted dark:bg-neutral-700 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500" style={{ width: `${fundingPercent}%` }} />
              </div>
              <p className="text-xs text-muted-foreground dark:text-neutral-500 mt-1">{fundingPercent.toFixed(0)}% financiado</p>
            </div>
          )}
        </Card>

        {/* Milestones */}
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm dark:border-neutral-700 overflow-hidden">
          <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-neutral-700/30 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg dark:text-white">Hitos de obra</CardTitle>
              <Button variant="outline" size="sm" className="dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-200" onClick={() => setShowMilestoneForm(!showMilestoneForm)}>
                <PlusCircle className="h-4 w-4 mr-1" /> Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {showMilestoneForm && (
              <div className="rounded-xl border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Nombre *</label><input className={inputClasses} value={milestoneForm.name} onChange={e => setMilestoneForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Progreso (%)</label><input type="number" min="0" max="100" className={inputClasses} value={milestoneForm.progressPercent} onChange={e => setMilestoneForm(f => ({ ...f, progressPercent: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Fecha objetivo</label><input type="date" className={inputClasses} value={milestoneForm.targetDate} onChange={e => setMilestoneForm(f => ({ ...f, targetDate: e.target.value }))} /></div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" className="dark:hover:bg-neutral-700 dark:text-neutral-300" onClick={() => setShowMilestoneForm(false)}>Cancelar</Button>
                  <Button size="sm" disabled={saving || !milestoneForm.name} onClick={handleSaveMilestone}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Agregar hito</Button>
                </div>
              </div>
            )}
            {p.milestones?.length > 0 ? (
              <div className="space-y-2">
                {p.milestones.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border dark:border-neutral-700 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors">
                    <div className={`p-1.5 rounded-lg shrink-0 ${m.progressPercent >= 100 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}>
                      {m.progressPercent >= 100 ? <CheckCircle2 className="h-4 w-4" /> : <Milestone className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dark:text-white">{m.name}</p>
                      {m.targetDate && <p className="text-xs text-muted-foreground dark:text-neutral-500">{formatDate(m.targetDate)}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-24 h-2 rounded-full bg-muted dark:bg-neutral-700 overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${m.progressPercent}%` }} />
                      </div>
                      <span className="text-sm font-semibold w-10 text-right dark:text-white">{m.progressPercent}%</span>
                      <input
                        type="range" min="0" max="100" step="5" value={m.progressPercent}
                        className="w-20 h-1.5 accent-blue-500"
                        onChange={e => handleUpdateMilestoneProgress(m.id, Number(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <Target className="h-8 w-8 text-muted-foreground/30 dark:text-neutral-600 mb-2" />
                <p className="text-sm text-muted-foreground dark:text-neutral-500">No hay hitos definidos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Units Grid */}
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm dark:border-neutral-700 overflow-hidden">
          <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-neutral-700/30 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg dark:text-white">Unidades</CardTitle>
              <Button variant="outline" size="sm" className="dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-200" onClick={() => setShowUnitForm(!showUnitForm)}>
                <PlusCircle className="h-4 w-4 mr-1" /> Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {showUnitForm && (
              <div className="rounded-xl border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">ID *</label><input className={inputClasses} placeholder="3A" value={unitForm.unitIdentifier} onChange={e => setUnitForm(f => ({ ...f, unitIdentifier: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Tipo</label><select className={inputClasses} value={unitForm.unitType} onChange={e => setUnitForm(f => ({ ...f, unitType: e.target.value }))}>{Object.entries(UNIT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Piso</label><input className={inputClasses} value={unitForm.floor} onChange={e => setUnitForm(f => ({ ...f, floor: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">m2</label><input type="number" className={inputClasses} value={unitForm.area} onChange={e => setUnitForm(f => ({ ...f, area: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">m² cubiertos</label><input type="number" className={inputClasses} value={unitForm.supCubierta} onChange={e => setUnitForm(f => ({ ...f, supCubierta: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Precio (USD)</label><input type="number" className={inputClasses} value={unitForm.price} onChange={e => setUnitForm(f => ({ ...f, price: e.target.value }))} /></div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Plano</label>
                    <div className="flex gap-1 mt-1">
                      <label className={`flex-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm cursor-pointer flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors ${uploadingFloorPlan ? 'opacity-50' : ''}`}>
                        {uploadingFloorPlan ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                        <span className="truncate text-xs text-muted-foreground dark:text-neutral-400">{unitForm.floorPlanUrl ? 'Cambiar' : 'Subir plano'}</span>
                        <input type="file" accept="image/*,.pdf" className="hidden" disabled={uploadingFloorPlan} onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !api) return;
                          setUploadingFloorPlan(true);
                          try { const r = await api.uploadMedia(file, 'developments'); setUnitForm(f => ({ ...f, floorPlanUrl: r.url })); } catch {}
                          finally { setUploadingFloorPlan(false); }
                        }} />
                      </label>
                      {unitForm.floorPlanUrl && <button className="h-10 w-10 rounded-md border dark:border-neutral-600 flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setUnitForm(f => ({ ...f, floorPlanUrl: '' }))}><X className="h-3.5 w-3.5" /></button>}
                    </div>
                  </div>
                  <div className="flex items-end"><Button size="sm" disabled={saving || !unitForm.unitIdentifier} onClick={handleSaveUnit} className="w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Agregar'}</Button></div>
                </div>
              </div>
            )}
            {p.units?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {p.units.map((u: any) => {
                  const us = UNIT_STATUS[u.status] || UNIT_STATUS.available;
                  const isReserved = u.status === 'reserved';
                  const isSold = u.status === 'sold' || u.status === 'escriturada';
                  const reservationExpires = u.reservationExpiresAt ? new Date(u.reservationExpiresAt) : null;
                  const now = new Date();
                  const timeLeft = reservationExpires ? Math.max(0, Math.floor((reservationExpires.getTime() - now.getTime()) / 60000)) : 0;
                  const pricePerM2 = u.price && u.area ? u.price / u.area : null;
                  const statusBorder = u.status === 'sold' ? 'border-l-blue-500' : u.status === 'reserved' ? 'border-l-amber-500' : u.status === 'escriturada' ? 'border-l-purple-500' : 'border-l-emerald-500';
                  return (
                    <div key={u.id} className={`group relative rounded-xl border border-l-[3px] ${statusBorder} bg-white dark:bg-neutral-800/90 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isSold ? 'opacity-75' : ''}`}>
                      {/* Header: ID + Badge */}
                      <div className="flex items-center justify-between px-3.5 pt-3 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold tracking-tight dark:text-white">{u.unitIdentifier}</span>
                          <span className="text-[11px] text-muted-foreground dark:text-neutral-500 font-medium">{UNIT_TYPES[u.unitType] || u.unitType}</span>
                        </div>
                        <Badge className={`${us.color} text-[10px] px-2 py-0.5 font-semibold`}>{us.label}</Badge>
                      </div>

                      {/* Price */}
                      {u.price && (
                        <div className="px-3.5 pb-2">
                          <p className="text-lg font-bold tracking-tight dark:text-white leading-none">{formatCurrency(u.price, u.currency)}</p>
                          {pricePerM2 && <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(pricePerM2, u.currency)}/m²</p>}
                        </div>
                      )}

                      {/* Specs row */}
                      <div className="flex items-center gap-px mx-3.5 mb-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50 overflow-hidden text-center">
                        {u.floor && u.floor !== '-' && (
                          <div className="flex-1 py-1.5 border-r border-slate-200/60 dark:border-neutral-600/50">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 dark:text-neutral-500 leading-none">Piso</p>
                            <p className="text-xs font-semibold dark:text-neutral-200 mt-0.5">{u.floor}</p>
                          </div>
                        )}
                        {u.area && (
                          <div className="flex-1 py-1.5 border-r border-slate-200/60 dark:border-neutral-600/50">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 dark:text-neutral-500 leading-none">Total</p>
                            <p className="text-xs font-semibold dark:text-neutral-200 mt-0.5">{u.area}m²</p>
                          </div>
                        )}
                        {u.supCubierta && (
                          <div className="flex-1 py-1.5 border-r border-slate-200/60 dark:border-neutral-600/50">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 dark:text-neutral-500 leading-none">Cub.</p>
                            <p className="text-xs font-semibold dark:text-neutral-200 mt-0.5">{u.supCubierta}m²</p>
                          </div>
                        )}
                        {u.orientation && u.orientation !== '-' && (
                          <div className="flex-1 py-1.5">
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 dark:text-neutral-500 leading-none">Orient.</p>
                            <p className="text-xs font-semibold dark:text-neutral-200 mt-0.5">{u.orientation}</p>
                          </div>
                        )}
                      </div>

                      {/* Floor plan link */}
                      {u.floorPlanUrl && (
                        <div className="px-3.5 pb-2">
                          <button className="w-full flex items-center justify-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" onClick={() => setViewingFloorPlan(u.floorPlanUrl)}>
                            <FileText className="h-3 w-3" /> Ver plano
                          </button>
                        </div>
                      )}

                      {/* Reserved info */}
                      {isReserved && reservationExpires && (
                        <div className="mx-3.5 mb-2 px-2.5 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1"><Timer className="h-3 w-3" />{timeLeft > 0 ? `${Math.floor(timeLeft / 1440)}d ${Math.floor((timeLeft % 1440) / 60)}h` : 'Vencida'}</p>
                            <button className="text-[10px] text-red-500 hover:text-red-600 font-semibold" onClick={() => handleCancelReservation(u.id)}>Cancelar</button>
                          </div>
                          {u.reservedByName && <p className="text-[10px] text-amber-600/80 dark:text-amber-400/70 truncate mt-0.5">{u.reservedByName}</p>}
                        </div>
                      )}

                      {/* Reserve action */}
                      {u.status === 'available' && !reservingUnitId && (
                        <div className="px-3.5 pb-3">
                          <button className="w-full text-[11px] font-semibold text-blue-600 dark:text-blue-400 py-1.5 rounded-lg border border-transparent hover:border-blue-200 dark:hover:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all" onClick={() => setReservingUnitId(u.id)}>Reservar</button>
                        </div>
                      )}
                      {reservingUnitId === u.id && (
                        <div className="mx-3.5 mb-3 p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-700/30 border dark:border-neutral-600/50 space-y-1.5 animate-in fade-in slide-in-from-top-1">
                          <input className="w-full text-xs h-7 rounded-md border dark:border-neutral-600 dark:bg-neutral-800 px-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all" placeholder="Nombre *" value={reserveForm.reservedByName} onChange={e => setReserveForm(f => ({ ...f, reservedByName: e.target.value }))} />
                          <input className="w-full text-xs h-7 rounded-md border dark:border-neutral-600 dark:bg-neutral-800 px-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all" placeholder="Teléfono" value={reserveForm.reservedByPhone} onChange={e => setReserveForm(f => ({ ...f, reservedByPhone: e.target.value }))} />
                          <div className="flex gap-1.5">
                            <button className="flex-1 text-[11px] h-7 rounded-md border dark:border-neutral-600 text-muted-foreground dark:text-neutral-400 font-medium hover:bg-white dark:hover:bg-neutral-700 transition-colors" onClick={() => setReservingUnitId(null)}>Cancelar</button>
                            <button className="flex-1 text-[11px] h-7 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 transition-colors" disabled={saving || !reserveForm.reservedByName} onClick={() => handleReserveUnit(u.id)}>Confirmar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <Layers className="h-8 w-8 text-muted-foreground/30 dark:text-neutral-600 mb-2" />
                <p className="text-sm text-muted-foreground dark:text-neutral-500">No hay unidades</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Plans */}
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm dark:border-neutral-700 overflow-hidden">
          <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-neutral-700/30 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg dark:text-white">Planes de pago</CardTitle>
              <Button variant="outline" size="sm" className="dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-200" onClick={() => setShowPaymentPlanForm(!showPaymentPlanForm)}>
                <PlusCircle className="h-4 w-4 mr-1" /> Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {showPaymentPlanForm && (
              <div className="rounded-xl border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Nombre *</label><input className={inputClasses} placeholder="Plan 12 cuotas" value={paymentPlanForm.name} onChange={e => setPaymentPlanForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Anticipo (%)</label><input type="number" min="0" max="100" className={inputClasses} value={paymentPlanForm.downPaymentPercent} onChange={e => setPaymentPlanForm(f => ({ ...f, downPaymentPercent: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Cuotas</label><input type="number" min="1" className={inputClasses} value={paymentPlanForm.installments} onChange={e => setPaymentPlanForm(f => ({ ...f, installments: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Descuento (%)</label><input type="number" min="0" max="100" className={inputClasses} value={paymentPlanForm.discountPercent} onChange={e => setPaymentPlanForm(f => ({ ...f, discountPercent: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Ajuste</label><select className={inputClasses} value={paymentPlanForm.adjustmentType} onChange={e => setPaymentPlanForm(f => ({ ...f, adjustmentType: e.target.value }))}><option value="fixed_usd">Dólar fijo</option><option value="fixed_ars">Pesos fijo</option><option value="cac">CAC</option><option value="uva">UVA</option><option value="dolar_linked">Dólar linked</option></select></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Descripción</label><input className={inputClasses} value={paymentPlanForm.description} onChange={e => setPaymentPlanForm(f => ({ ...f, description: e.target.value }))} /></div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" className="dark:hover:bg-neutral-700 dark:text-neutral-300" onClick={() => setShowPaymentPlanForm(false)}>Cancelar</Button>
                  <Button size="sm" disabled={saving || !paymentPlanForm.name} onClick={handleSavePaymentPlan}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Agregar plan</Button>
                </div>
              </div>
            )}
            {paymentPlans.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentPlans.map((plan: any) => (
                  <div key={plan.id} className="p-4 rounded-xl border dark:border-neutral-700 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold dark:text-white">{plan.name}</p>
                        {plan.description && <p className="text-xs text-muted-foreground dark:text-neutral-500 mt-0.5">{plan.description}</p>}
                      </div>
                      <button onClick={() => handleDeletePaymentPlan(plan.id)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground dark:text-neutral-400">
                      <span>{plan.downPaymentPercent}% anticipo</span>
                      <span>{plan.installments} cuotas</span>
                      {plan.discountPercent > 0 && <span className="text-emerald-600 dark:text-emerald-400">-{plan.discountPercent}% desc.</span>}
                      <Badge variant="outline" className="text-[9px] dark:border-neutral-600 dark:text-neutral-400">{plan.adjustmentType === 'fixed_usd' ? 'USD fijo' : plan.adjustmentType === 'cac' ? 'CAC' : plan.adjustmentType === 'uva' ? 'UVA' : plan.adjustmentType === 'dolar_linked' ? 'Dólar linked' : 'ARS fijo'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <CreditCard className="h-8 w-8 text-muted-foreground/30 dark:text-neutral-600 mb-2" />
                <p className="text-sm text-muted-foreground dark:text-neutral-500">No hay planes de pago</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investments */}
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm dark:border-neutral-700 overflow-hidden">
          <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-neutral-700/30 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg dark:text-white">Inversiones</CardTitle>
              <Button variant="outline" size="sm" className="dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-200" onClick={() => setShowInvestmentForm(!showInvestmentForm)}>
                <PlusCircle className="h-4 w-4 mr-1" /> Nueva inversión
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {showInvestmentForm && (
              <div className="rounded-xl border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Inversor *</label><input className={inputClasses} value={investmentForm.investorName} onChange={e => setInvestmentForm(f => ({ ...f, investorName: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">DNI</label><input className={inputClasses} value={investmentForm.investorDni} onChange={e => setInvestmentForm(f => ({ ...f, investorDni: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Teléfono</label><input className={inputClasses} value={investmentForm.investorPhone} onChange={e => setInvestmentForm(f => ({ ...f, investorPhone: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Email</label><input type="email" className={inputClasses} value={investmentForm.investorEmail} onChange={e => setInvestmentForm(f => ({ ...f, investorEmail: e.target.value }))} /></div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Unidad</label>
                    <select className={inputClasses} value={investmentForm.unitId} onChange={e => setInvestmentForm(f => ({ ...f, unitId: e.target.value }))}>
                      <option value="">Sin unidad específica</option>
                      {p.units?.filter((u: any) => u.status === 'available').map((u: any) => <option key={u.id} value={u.id}>{u.unitIdentifier} - {UNIT_TYPES[u.unitType]} {u.price ? formatCurrency(u.price) : ''}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Monto total (USD) *</label><input type="number" className={inputClasses} value={investmentForm.totalAmount} onChange={e => setInvestmentForm(f => ({ ...f, totalAmount: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Cuotas</label><input type="number" className={inputClasses} value={investmentForm.totalInstallments} onChange={e => setInvestmentForm(f => ({ ...f, totalInstallments: e.target.value }))} /></div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Plan de pago</label>
                    <select className={inputClasses} value={investmentForm.paymentPlanId} onChange={e => {
                      const planId = e.target.value;
                      setInvestmentForm(f => ({ ...f, paymentPlanId: planId }));
                      const plan = paymentPlans.find((pp: any) => pp.id === planId);
                      if (plan) setInvestmentForm(f => ({ ...f, totalInstallments: String(plan.installments), paymentPlanId: planId }));
                    }}>
                      <option value="">Sin plan</option>
                      {paymentPlans.map((pp: any) => <option key={pp.id} value={pp.id}>{pp.name} ({pp.installments} cuotas)</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button size="sm" disabled={saving || !investmentForm.investorName || !investmentForm.totalAmount} onClick={handleSaveInvestment} className="w-full">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Crear inversión
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {p.investments?.length > 0 ? (
              <div className="space-y-3">
                {p.investments.map((inv: any) => {
                  const paidPercent = inv.totalAmount > 0 ? (inv.paidAmount / inv.totalAmount) * 100 : 0;
                  return (
                    <div key={inv.id} className="rounded-xl border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-900/30 dark:to-emerald-900/20">
                          <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold dark:text-white">{inv.investorName}</p>
                          <p className="text-xs text-muted-foreground dark:text-neutral-500">
                            {inv.unit?.unitIdentifier ? `Unidad ${inv.unit.unitIdentifier}` : 'Sin unidad'} · {inv.totalInstallments} cuotas
                            {inv.payments?.filter((p: any) => p.status === 'overdue').length > 0 && (
                              <span className="text-red-500 dark:text-red-400 flex items-center gap-0.5 ml-2"><AlertTriangle className="h-3 w-3" /> {inv.payments.filter((p: any) => p.status === 'overdue').length} en mora</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold dark:text-white">{formatCurrency(inv.paidAmount)} <span className="text-muted-foreground dark:text-neutral-500 font-normal">/ {formatCurrency(inv.totalAmount)}</span></p>
                          <p className="text-xs text-muted-foreground dark:text-neutral-500">{paidPercent.toFixed(0)}% pagado</p>
                        </div>
                      </div>
                      {/* Installments */}
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5">
                        {inv.payments?.map((pay: any) => {
                          const isPaid = pay.status === 'paid';
                          const isPartial = pay.status === 'partial';
                          const isOverdue = pay.status === 'overdue';
                          const isMarkingThis = markingPaymentId === pay.id;
                          return (
                            <div key={pay.id}>
                              <button
                                className={`w-full aspect-square rounded-lg text-[10px] font-bold flex items-center justify-center transition-all hover:scale-110 ${isPaid ? 'bg-emerald-500 dark:bg-emerald-600 text-white' : isOverdue ? 'bg-red-500 dark:bg-red-600 text-white ring-2 ring-red-300' : isPartial ? 'bg-amber-400 dark:bg-amber-500 text-white' : 'bg-muted dark:bg-neutral-700 text-muted-foreground dark:text-neutral-400 hover:bg-muted/80 dark:hover:bg-neutral-600'}`}
                                onClick={() => {
                                  if (!isPaid) {
                                    setMarkingPaymentId(isMarkingThis ? null : pay.id);
                                    setPaymentMarkForm({ paidAmount: String(pay.amount - pay.paidAmount), paymentMethod: 'transferencia' });
                                  }
                                }}
                                title={`Cuota ${pay.installmentNumber}: ${formatCurrency(pay.amount)} - ${isPaid ? 'Pagada' : isPartial ? 'Parcial' : 'Pendiente'}`}
                              >
                                {pay.installmentNumber}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      {markingPaymentId && inv.payments?.some((pay: any) => pay.id === markingPaymentId) && (
                        <div className="mt-3 p-3 bg-slate-50/50 dark:bg-neutral-700/30 rounded-xl border dark:border-neutral-600 flex flex-col sm:flex-row gap-3 items-end animate-in fade-in">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Monto</label><input type="number" className={inputClasses} value={paymentMarkForm.paidAmount} onChange={e => setPaymentMarkForm(f => ({ ...f, paidAmount: e.target.value }))} /></div>
                            <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Medio</label><select className={inputClasses} value={paymentMarkForm.paymentMethod} onChange={e => setPaymentMarkForm(f => ({ ...f, paymentMethod: e.target.value }))}><option value="transferencia">Transferencia</option><option value="efectivo">Efectivo</option><option value="cheque">Cheque</option></select></div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="dark:hover:bg-neutral-700 dark:text-neutral-300" onClick={() => setMarkingPaymentId(null)}>Cancelar</Button>
                            <Button size="sm" disabled={saving} onClick={() => handleMarkPayment(markingPaymentId!)}>
                              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}Cobrar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <DollarSign className="h-8 w-8 text-muted-foreground/30 dark:text-neutral-600 mb-2" />
                <p className="text-sm text-muted-foreground dark:text-neutral-500">No hay inversiones</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Floor Plan Modal */}
        {viewingFloorPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setViewingFloorPlan(null)}>
            <div className="relative max-w-3xl w-full mx-4 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
                <h3 className="font-semibold dark:text-white">Plano de unidad</h3>
                <div className="flex gap-2">
                  <a href={viewingFloorPlan} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"><Download className="h-4 w-4 dark:text-neutral-300" /></a>
                  <button onClick={() => setViewingFloorPlan(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"><X className="h-4 w-4 dark:text-neutral-300" /></button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center min-h-[400px]">
                {viewingFloorPlan.endsWith('.pdf') ? (
                  <iframe src={viewingFloorPlan} className="w-full h-[70vh] rounded-lg" />
                ) : (
                  <Image src={viewingFloorPlan} alt="Plano" width={800} height={600} className="max-h-[70vh] w-auto object-contain rounded-lg" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===================== LIST VIEW =====================
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">Desarrollos</h1>
          <p className="text-muted-foreground dark:text-neutral-400 text-sm mt-1">Proyectos en pozo, preventa y crowdfunding</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}>
          <Plus className="h-4 w-4 mr-1.5" /> Nuevo proyecto
        </Button>
      </div>

      {/* Info Guide */}
      {hideGuide ? (
        <button onClick={() => { localStorage.removeItem('hide-guide-desarrollos'); setHideGuide(false); }} className="flex items-center gap-1.5 text-[11px] text-blue-500/70 dark:text-blue-400/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Info className="h-3 w-3" /> Ver guía de uso
        </button>
      ) : (
        <div className="relative rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/20 p-4 sm:p-5 shadow-sm">
          <button onClick={() => { localStorage.setItem('hide-guide-desarrollos', '1'); setHideGuide(true); }} className="absolute top-3 right-3 p-1 rounded-full hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors">
            <X className="h-3.5 w-3.5 text-blue-400" />
          </button>
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 h-fit shrink-0">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1.5 text-xs text-blue-800/80 dark:text-blue-200/80">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Proyectos de desarrollo</p>
              <p>Creá proyectos en pozo o preventa. Subí <strong>imagen de portada + galería</strong>, definí estado (planificación, preventa, construcción, entregado).</p>
              <p>Dentro de cada proyecto podés cargar <strong>unidades</strong> (depto, cochera, local) con precio y estado (disponible/reservada/vendida), <strong>hitos</strong> de obra con % de avance, e <strong>inversiones</strong> con plan de cuotas.</p>
              <p>Los proyectos se muestran automáticamente en tu <strong>página pública</strong> con modal detallado.</p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div ref={formRef} className="rounded-xl border dark:border-neutral-700 shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-5 py-3 border-b bg-slate-50/50 dark:bg-neutral-700/50 dark:border-neutral-700">
            <h3 className="text-base font-semibold dark:text-white">{editingId ? 'Editar proyecto' : 'Nuevo proyecto'}</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Nombre *</label><input className={inputClasses} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Dirección</label><input className={inputClasses} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Ciudad</label><input className={inputClasses} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Total unidades</label><input type="number" className={inputClasses} value={form.totalUnits} onChange={e => setForm(f => ({ ...f, totalUnits: e.target.value }))} /></div>
              <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Estado</label><select className={inputClasses} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
              <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Meta financiamiento (USD)</label><input type="number" className={inputClasses} value={form.targetFundingAmount} onChange={e => setForm(f => ({ ...f, targetFundingAmount: e.target.value }))} /></div>
              <div className="sm:col-span-2 lg:col-span-3"><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Descripción</label><textarea className="w-full mt-1 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none dark:text-neutral-100" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Días de reserva</label><input type="number" className={inputClasses} value={form.reservationDays} onChange={e => setForm(f => ({ ...f, reservationDays: e.target.value }))} /></div>
              <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Tipo de ajuste</label><select className={inputClasses} value={form.adjustmentType} onChange={e => setForm(f => ({ ...f, adjustmentType: e.target.value }))}><option value="fixed_usd">Dólar fijo</option><option value="fixed_ars">Pesos fijo</option><option value="cac">CAC</option><option value="uva">UVA</option><option value="dolar_linked">Dólar linked</option></select></div>
              <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Fecha de entrega</label><input type="date" className={inputClasses} value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} /></div>
              <div className="sm:col-span-2 lg:col-span-3"><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Amenities (separados por coma)</label><input className={inputClasses} placeholder="Pileta, SUM, Gimnasio, Laundry" value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} /></div>
              <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">URL Brochure (PDF)</label><input className={inputClasses} placeholder="https://..." value={form.brochureUrl} onChange={e => setForm(f => ({ ...f, brochureUrl: e.target.value }))} /></div>
              <div><label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">URL Video</label><input className={inputClasses} placeholder="https://youtube.com/..." value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} /></div>
            </div>

            {/* ── Imágenes ── */}
            <div className="space-y-4 pt-2">
              {/* Cover Image */}
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400 mb-2 block">Imagen de portada</label>
                {coverImage ? (
                  <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden border dark:border-neutral-700 group/cover">
                    <Image src={coverImage} alt="Portada" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/30 transition-colors flex items-center justify-center">
                      <button onClick={() => setCoverImage('')} className="opacity-0 group-hover/cover:opacity-100 transition-opacity p-2 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-neutral-600 bg-slate-50/50 dark:bg-neutral-800/50 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all">
                    {uploadingCover ? (
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-slate-400 dark:text-neutral-500 mb-2" />
                        <span className="text-sm text-slate-500 dark:text-neutral-400 font-medium">Click para subir portada</span>
                        <span className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">JPG, PNG o WebP</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUploadCover(e.target.files[0]); }} />
                  </label>
                )}
              </div>

              {/* Gallery */}
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400 mb-2 block">Galería de imágenes</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border dark:border-neutral-700 group/gal">
                      <Image src={img} alt={`Imagen ${idx + 1}`} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover/gal:bg-black/30 transition-colors flex items-center justify-center">
                        <button onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))} className="opacity-0 group-hover/gal:opacity-100 transition-opacity p-1.5 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-neutral-600 bg-slate-50/50 dark:bg-neutral-800/50 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all">
                    {uploadingGallery ? (
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    ) : (
                      <>
                        <ImagePlus className="h-6 w-6 text-slate-400 dark:text-neutral-500" />
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 font-medium">Agregar</span>
                      </>
                    )}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files?.length) handleUploadGallery(e.target.files); }} />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" className="dark:hover:bg-neutral-700 dark:text-neutral-300" onClick={resetForm}>Cancelar</Button>
              <Button size="sm" disabled={saving || !form.name} onClick={handleSaveProject}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}{editingId ? 'Guardar' : 'Crear proyecto'}</Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 animate-pulse">{[1,2].map(i => <div key={i} className="h-48 rounded-xl bg-muted dark:bg-neutral-700" />)}</div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500/20 to-blue-500/20 dark:from-amber-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4">
            <HardHat className="h-8 w-8 text-amber-500/50 dark:text-amber-400/50" />
          </div>
          <p className="font-medium text-muted-foreground dark:text-neutral-400">No hay proyectos de desarrollo</p>
          <p className="text-sm text-muted-foreground/70 dark:text-neutral-500 mt-1">Creá tu primer proyecto inmobiliario</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map(p => {
            const st = STATUS_MAP[p.status] || STATUS_MAP.planning;
            return (
              <Card key={p.id} className="group border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm dark:border-neutral-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer overflow-hidden" onClick={() => openProject(p.id)}>
                {p.coverImage && <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${p.coverImage})` }} />}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg dark:text-white">{p.name}</h3>
                      {p.address && <p className="text-sm text-muted-foreground dark:text-neutral-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.address}{p.city ? `, ${p.city}` : ''}</p>}
                    </div>
                    <Badge className={st.color}>{st.label}</Badge>
                  </div>
                  {p.description && <p className="text-sm text-muted-foreground dark:text-neutral-400 mb-3 line-clamp-2">{p.description}</p>}
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground dark:text-neutral-400">Progreso</span>
                      <span className="font-bold dark:text-white">{p.progressPercent}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted dark:bg-neutral-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-700" style={{ width: `${p.progressPercent}%` }} />
                    </div>
                  </div>
                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t dark:border-neutral-700 text-xs text-muted-foreground dark:text-neutral-500">
                    <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {p._count?.units || 0} unidades</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p._count?.investments || 0} inversores</span>
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {p._count?.milestones || 0} hitos</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
