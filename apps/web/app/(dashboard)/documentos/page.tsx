'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText, Plus, X, Pencil, Trash2, Eye, Printer, Star,
  FileSignature, Receipt, ClipboardList, CheckCircle2,
  Building2, User, Loader2, ChevronDown, Info, MousePointerClick,
  Type, ArrowLeft,
} from 'lucide-react';

// Rich text editor — loaded client-side only (uses browser APIs)
const DocumentEditor = dynamic(() => import('@/components/document-editor').then(m => ({ default: m.DocumentEditor })), {
  ssr: false,
  loading: () => <div className="h-[400px] rounded-xl border bg-muted dark:bg-neutral-700 animate-pulse" />,
});

// ── Categories ──
const CATEGORIES = [
  { key: 'contrato', label: 'Contrato de alquiler', icon: FileSignature, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'recibo', label: 'Recibo de pago', icon: Receipt, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { key: 'boleto', label: 'Boleto de reserva', icon: ClipboardList, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { key: 'autorizacion', label: 'Autorización', icon: CheckCircle2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { key: 'liquidacion', label: 'Liquidación', icon: Building2, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  { key: 'otro', label: 'Otro', icon: FileText, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/20' },
];

// ── Friendly variable labels grouped by section ──
const VARIABLE_SECTIONS: Record<string, { title: string; icon: typeof User; vars: { key: string; label: string }[] }[]> = {
  contrato: [
    {
      title: 'Datos del inquilino', icon: User,
      vars: [
        { key: 'inquilino_nombre', label: 'Nombre completo' },
        { key: 'inquilino_dni', label: 'DNI' },
        { key: 'inquilino_telefono', label: 'Teléfono' },
        { key: 'inquilino_email', label: 'Email' },
        { key: 'inquilino_empleador', label: 'Empleador' },
      ],
    },
    {
      title: 'Datos del propietario', icon: Building2,
      vars: [
        { key: 'propietario_nombre', label: 'Nombre completo' },
        { key: 'propietario_dni', label: 'CUIT / CUIL' },
        { key: 'propietario_direccion', label: 'Domicilio' },
        { key: 'propietario_telefono', label: 'Teléfono' },
      ],
    },
    {
      title: 'Datos de la propiedad', icon: Building2,
      vars: [
        { key: 'propiedad_nombre', label: 'Nombre' },
        { key: 'propiedad_direccion', label: 'Dirección' },
        { key: 'propiedad_tipo', label: 'Tipo (depto, casa...)' },
        { key: 'propiedad_ciudad', label: 'Ciudad' },
      ],
    },
    {
      title: 'Datos del contrato', icon: FileSignature,
      vars: [
        { key: 'contrato_numero', label: 'Número de contrato' },
        { key: 'contrato_inicio', label: 'Fecha de inicio' },
        { key: 'contrato_fin', label: 'Fecha de fin' },
        { key: 'contrato_monto', label: 'Monto mensual' },
        { key: 'contrato_monto_letras', label: 'Monto en letras' },
        { key: 'contrato_moneda', label: 'Moneda' },
        { key: 'contrato_deposito', label: 'Depósito de garantía' },
        { key: 'contrato_ajuste_indice', label: 'Índice de ajuste' },
        { key: 'contrato_ajuste_frecuencia', label: 'Frecuencia de ajuste' },
        { key: 'contrato_garantia_tipo', label: 'Tipo de garantía' },
      ],
    },
    {
      title: 'Inmobiliaria y fecha', icon: Star,
      vars: [
        { key: 'inmobiliaria_nombre', label: 'Nombre de la inmobiliaria' },
        { key: 'inmobiliaria_direccion', label: 'Dirección' },
        { key: 'inmobiliaria_telefono', label: 'Teléfono' },
        { key: 'fecha_actual', label: 'Fecha de hoy' },
      ],
    },
  ],
  recibo: [
    {
      title: 'Datos del pago', icon: Receipt,
      vars: [
        { key: 'inquilino_nombre', label: 'Nombre del inquilino' },
        { key: 'inquilino_dni', label: 'DNI del inquilino' },
        { key: 'propiedad_direccion', label: 'Dirección de la propiedad' },
        { key: 'contrato_numero', label: 'Número de contrato' },
        { key: 'pago_monto', label: 'Monto pagado' },
        { key: 'pago_periodo', label: 'Período (mes/año)' },
        { key: 'pago_metodo', label: 'Método de pago' },
        { key: 'pago_fecha', label: 'Fecha de pago' },
        { key: 'inmobiliaria_nombre', label: 'Nombre de la inmobiliaria' },
        { key: 'fecha_actual', label: 'Fecha de hoy' },
      ],
    },
  ],
  boleto: [
    {
      title: 'Datos de la operación', icon: ClipboardList,
      vars: [
        { key: 'propiedad_direccion', label: 'Dirección de la propiedad' },
        { key: 'propiedad_tipo', label: 'Tipo de propiedad' },
        { key: 'propietario_nombre', label: 'Nombre del vendedor' },
        { key: 'propietario_dni', label: 'CUIT/CUIL del vendedor' },
        { key: 'comprador_nombre', label: 'Nombre del comprador' },
        { key: 'comprador_dni', label: 'DNI del comprador' },
        { key: 'precio_venta', label: 'Precio de venta' },
        { key: 'sena_monto', label: 'Monto de la seña' },
        { key: 'inmobiliaria_nombre', label: 'Nombre de la inmobiliaria' },
        { key: 'fecha_actual', label: 'Fecha de hoy' },
      ],
    },
  ],
  autorizacion: [
    {
      title: 'Datos', icon: CheckCircle2,
      vars: [
        { key: 'propiedad_direccion', label: 'Dirección de la propiedad' },
        { key: 'propietario_nombre', label: 'Nombre del propietario' },
        { key: 'propietario_dni', label: 'CUIT/CUIL del propietario' },
        { key: 'inmobiliaria_nombre', label: 'Nombre de la inmobiliaria' },
        { key: 'fecha_actual', label: 'Fecha de hoy' },
      ],
    },
  ],
  liquidacion: [
    {
      title: 'Datos de la liquidación', icon: Building2,
      vars: [
        { key: 'propietario_nombre', label: 'Nombre del propietario' },
        { key: 'propietario_dni', label: 'CUIT/CUIL del propietario' },
        { key: 'propiedad_direccion', label: 'Dirección de la propiedad' },
        { key: 'liquidacion_periodo', label: 'Período' },
        { key: 'liquidacion_bruto', label: 'Monto bruto cobrado' },
        { key: 'liquidacion_comision', label: 'Comisión' },
        { key: 'liquidacion_gastos', label: 'Gastos' },
        { key: 'liquidacion_neto', label: 'Neto a pagar' },
        { key: 'inmobiliaria_nombre', label: 'Nombre de la inmobiliaria' },
        { key: 'fecha_actual', label: 'Fecha de hoy' },
      ],
    },
  ],
  otro: [
    {
      title: 'Datos generales', icon: FileText,
      vars: [
        { key: 'inmobiliaria_nombre', label: 'Nombre de la inmobiliaria' },
        { key: 'fecha_actual', label: 'Fecha de hoy' },
      ],
    },
  ],
};

// ── Default templates ──
const DEFAULT_TEMPLATES: Record<string, { name: string; html: string }> = {
  contrato: {
    name: 'Contrato de Alquiler — Modelo estándar',
    html: `<div style="line-height:1.9;font-size:14px;">

<div style="text-align:center;margin-bottom:40px;">
<h1 style="font-size:20px;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px;">Contrato de Locación</h1>
<div style="width:80px;height:2px;background:#333;margin:0 auto;"></div>
</div>

<p style="text-align:justify;">En la ciudad de __________, a los <strong>{{fecha_actual}}</strong>, entre:</p>

<p style="text-align:justify;"><strong>LOCADOR:</strong> {{propietario_nombre}}, CUIT/CUIL N° {{propietario_dni}}, con domicilio real en {{propietario_direccion}}, en adelante <em>"EL LOCADOR"</em>;</p>

<p style="text-align:justify;"><strong>LOCATARIO:</strong> {{inquilino_nombre}}, DNI N° {{inquilino_dni}}, teléfono {{inquilino_telefono}}, email {{inquilino_email}}, en adelante <em>"EL LOCATARIO"</em>;</p>

<p style="text-align:justify;">Quienes convienen en celebrar el presente contrato de locación, sujeto a las siguientes cláusulas y condiciones:</p>

<p style="margin-top:28px;"><strong>PRIMERA — OBJETO:</strong></p>
<p style="text-align:justify;">El LOCADOR da en locación al LOCATARIO el inmueble sito en <strong>{{propiedad_direccion}}</strong> ({{propiedad_tipo}}), en la ciudad de {{propiedad_ciudad}}, para uso exclusivo de vivienda.</p>

<p style="margin-top:28px;"><strong>SEGUNDA — PLAZO:</strong></p>
<p style="text-align:justify;">El presente contrato tendrá vigencia desde el <strong>{{contrato_inicio}}</strong> hasta el <strong>{{contrato_fin}}</strong>, fecha en que el LOCATARIO deberá restituir el inmueble libre de ocupantes y en las mismas condiciones en que lo recibió.</p>

<p style="margin-top:28px;"><strong>TERCERA — PRECIO:</strong></p>
<p style="text-align:justify;">El canon locativo se fija en la suma de <strong>{{contrato_monto}}</strong> ({{contrato_moneda}}) mensuales, pagaderos por adelantado del 1 al 10 de cada mes.</p>

<p style="margin-top:28px;"><strong>CUARTA — AJUSTE:</strong></p>
<p style="text-align:justify;">El precio se ajustará cada <strong>{{contrato_ajuste_frecuencia}}</strong> según el índice <strong>{{contrato_ajuste_indice}}</strong>, conforme la normativa vigente.</p>

<p style="margin-top:28px;"><strong>QUINTA — DEPÓSITO EN GARANTÍA:</strong></p>
<p style="text-align:justify;">El LOCATARIO entrega en este acto la suma de <strong>{{contrato_deposito}}</strong> ({{contrato_moneda}}) en concepto de depósito de garantía, que será devuelto al finalizar la locación, previa verificación del estado del inmueble.</p>

<p style="margin-top:28px;"><strong>SEXTA — GARANTÍA:</strong></p>
<p style="text-align:justify;">El LOCATARIO presenta garantía de tipo: <strong>{{contrato_garantia_tipo}}</strong>.</p>

<p style="margin-top:28px;"><strong>SÉPTIMA — INTERMEDIACIÓN:</strong></p>
<p style="text-align:justify;">Interviene en la presente operación <strong>{{inmobiliaria_nombre}}</strong>, con domicilio en {{inmobiliaria_direccion}}, teléfono {{inmobiliaria_telefono}}.</p>

<p style="text-align:justify;margin-top:20px;">En prueba de conformidad, se firman dos ejemplares de un mismo tenor y a un solo efecto, en el lugar y fecha indicados.</p>

<div style="display:flex;justify-content:space-between;margin-top:80px;">
<div style="text-align:center;width:38%;">
<div style="border-top:1px solid #333;padding-top:10px;">
<p style="margin:0;font-size:13px;font-weight:bold;">EL LOCADOR</p>
<p style="margin:4px 0 0;font-size:11px;color:#666;">Firma y aclaración</p>
</div>
</div>
<div style="text-align:center;width:38%;">
<div style="border-top:1px solid #333;padding-top:10px;">
<p style="margin:0;font-size:13px;font-weight:bold;">EL LOCATARIO</p>
<p style="margin:4px 0 0;font-size:11px;color:#666;">Firma y aclaración</p>
</div>
</div>
</div>

</div>`,
  },
  recibo: {
    name: 'Recibo de Pago de Alquiler',
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;font-size:14px;">

<div style="border:2px solid #222;border-radius:8px;overflow:hidden;">

<div style="background:#222;color:#fff;padding:20px 24px;text-align:center;">
<h1 style="font-size:18px;margin:0;letter-spacing:1px;">{{inmobiliaria_nombre}}</h1>
<p style="font-size:11px;margin:6px 0 0;opacity:0.7;text-transform:uppercase;letter-spacing:2px;">Recibo de Pago</p>
</div>

<div style="padding:24px;">
<table style="width:100%;font-size:14px;border-collapse:collapse;">
<tr>
<td style="padding:10px 0;color:#888;width:140px;border-bottom:1px solid #f0f0f0;">Inquilino</td>
<td style="padding:10px 0;font-weight:600;border-bottom:1px solid #f0f0f0;">{{inquilino_nombre}}</td>
</tr>
<tr>
<td style="padding:10px 0;color:#888;border-bottom:1px solid #f0f0f0;">DNI</td>
<td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">{{inquilino_dni}}</td>
</tr>
<tr>
<td style="padding:10px 0;color:#888;border-bottom:1px solid #f0f0f0;">Propiedad</td>
<td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">{{propiedad_direccion}}</td>
</tr>
<tr>
<td style="padding:10px 0;color:#888;border-bottom:1px solid #f0f0f0;">Contrato N°</td>
<td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">{{contrato_numero}}</td>
</tr>
<tr>
<td style="padding:10px 0;color:#888;border-bottom:1px solid #f0f0f0;">Período</td>
<td style="padding:10px 0;font-weight:600;border-bottom:1px solid #f0f0f0;">{{pago_periodo}}</td>
</tr>
<tr>
<td style="padding:14px 0;color:#888;">Monto</td>
<td style="padding:14px 0;font-size:22px;font-weight:700;color:#16a34a;">{{pago_monto}}</td>
</tr>
<tr>
<td style="padding:10px 0;color:#888;border-top:1px solid #f0f0f0;">Método de pago</td>
<td style="padding:10px 0;border-top:1px solid #f0f0f0;">{{pago_metodo}}</td>
</tr>
<tr>
<td style="padding:10px 0;color:#888;">Fecha de pago</td>
<td style="padding:10px 0;">{{pago_fecha}}</td>
</tr>
</table>
</div>

<div style="background:#f8f8f8;padding:14px 24px;text-align:center;border-top:1px solid #eee;">
<p style="font-size:11px;color:#999;margin:0;">Emitido el {{fecha_actual}} · {{inmobiliaria_nombre}}</p>
</div>

</div>

</div>`,
  },
};

const inputClasses = 'w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground dark:placeholder:text-neutral-500 dark:text-neutral-100';

export default function DocumentosPage() {
  const { api } = useApi();

  const [templates, setTemplates] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: 'contrato', description: '', htmlContent: '', isDefault: false });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  // Render (generate document)
  const [showRender, setShowRender] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [generating, setGenerating] = useState(false);

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [t, c] = await Promise.all([
        api.getDocumentTemplates(filterCategory || undefined),
        api.getRentalContracts({ status: 'active' }),
      ]);
      setTemplates(t);
      setContracts(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api, filterCategory]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Insert variable at cursor position in the rich text editor ──
  const insertVariable = (key: string) => {
    const inserter = (window as any).__docEditorInsert;
    if (inserter) {
      inserter(`{{${key}}}`);
    } else {
      setForm(f => ({ ...f, htmlContent: f.htmlContent + `{{${key}}}` }));
    }
  };

  const handleNewTemplate = (category?: string) => {
    const cat = category || 'contrato';
    const preset = DEFAULT_TEMPLATES[cat];
    setForm({
      name: preset?.name || '',
      category: cat,
      description: '',
      htmlContent: preset?.html || `<div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;">\n  <h1>{{inmobiliaria_nombre}}</h1>\n  <p>Fecha: {{fecha_actual}}</p>\n  <!-- Escribí tu documento aquí -->\n</div>`,
      isDefault: false,
    });
    setEditingId(null);
    setExpandedSection(null);
    setShowEditor(true);
  };

  const handleEditTemplate = async (id: string) => {
    if (!api) return;
    try {
      const tpl = await api.getDocumentTemplate(id);
      setForm({
        name: tpl.name,
        category: tpl.category,
        description: tpl.description || '',
        htmlContent: tpl.htmlContent,
        isDefault: tpl.isDefault,
      });
      setEditingId(id);
      setExpandedSection(null);
      setShowEditor(true);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!api || !form.name.trim() || !form.htmlContent.trim()) return;
    setSaving(true);
    try {
      if (editingId) await api.updateDocumentTemplate(editingId, form);
      else await api.createDocumentTemplate(form);
      setShowEditor(false);
      setEditingId(null);
      loadData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!api || !confirm('¿Eliminar esta plantilla?')) return;
    await api.deleteDocumentTemplate(id);
    loadData();
  };

  const handleGenerate = async () => {
    if (!api || !showRender) return;
    setGenerating(true);
    try {
      const data: any = {};
      if (selectedContractId) data.contractId = selectedContractId;
      const result = await api.renderDocument(showRender, data);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Documento</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; padding: 40px; font-family: 'Times New Roman', Georgia, serif; color: #1a1a1a; background: #fff; }
  @media screen {
    body { max-width: 900px; margin: 0 auto; padding: 40px 60px; min-height: 100vh; box-shadow: 0 0 30px rgba(0,0,0,0.08); }
  }
  @media print {
    body { padding: 0; }
    @page { size: A4; margin: 2cm 2.5cm; }
  }
  table { border-collapse: collapse; }
  img { max-width: 100%; }
  h1, h2, h3 { page-break-after: avoid; }
  p { orphans: 3; widows: 3; }
</style></head><body>${result.html}</body></html>`);
        win.document.close();
      }
      setShowRender(null);
      setSelectedContractId('');
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  const sections = VARIABLE_SECTIONS[form.category] || VARIABLE_SECTIONS.otro;

  // ===================== EDITOR VIEW =====================
  if (showEditor) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 dark:hover:bg-neutral-700" onClick={() => setShowEditor(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold dark:text-white">{editingId ? 'Editar plantilla' : 'Nueva plantilla'}</h1>
            <p className="text-xs text-muted-foreground dark:text-neutral-400">Armá tu documento y usá los botones para insertar datos automáticos</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setPreviewHtml(form.htmlContent); setShowPreview(true); }}>
            <Eye className="h-4 w-4 mr-1" /> Vista previa
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !form.name.trim() || !form.htmlContent.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            {editingId ? 'Guardar' : 'Crear plantilla'}
          </Button>
        </div>

        {/* Name + Category */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Nombre de la plantilla</label>
            <input className={inputClasses} placeholder="Ej: Contrato de alquiler vivienda" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Tipo de documento</label>
            <select className={inputClasses} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Contenido del documento</label>
              <span className="text-[10px] text-muted-foreground dark:text-neutral-500">Podés pegar texto desde Word</span>
            </div>
            <DocumentEditor
              content={form.htmlContent}
              onChange={(html) => setForm(f => ({ ...f, htmlContent: html }))}
            />
          </div>

          {/* Variable insertion panel */}
          <div className="space-y-2">
            <div className="rounded-xl border dark:border-neutral-700 bg-slate-50/80 dark:bg-neutral-800/80 p-3">
              <div className="flex items-center gap-2 mb-3">
                <MousePointerClick className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold dark:text-white">Insertar datos</p>
              </div>
              <p className="text-[11px] text-muted-foreground dark:text-neutral-400 mb-3">
                Tocá un botón para insertar un dato que se completará automáticamente cuando generes el documento.
              </p>

              {sections.map(section => {
                const isExpanded = expandedSection === section.title;
                return (
                  <div key={section.title} className="mb-1">
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : section.title)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-neutral-700 transition-colors text-left"
                    >
                      <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300">{section.title}</span>
                      <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="px-1 pb-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        {section.vars.map(v => (
                          <button
                            key={v.key}
                            onClick={() => insertVariable(v.key)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 transition-colors group"
                          >
                            <Plus className="h-3 w-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-xs">{v.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 px-3 py-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault as boolean}
                onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isDefault" className="text-xs text-muted-foreground dark:text-neutral-400">Plantilla predeterminada</label>
            </div>
          </div>
        </div>

        {/* Preview modal */}
        {showPreview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPreview(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold text-sm text-slate-900">Vista previa</span>
                <button onClick={() => setShowPreview(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 doc-preview-sheet" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===================== LIST VIEW =====================
  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-xl bg-muted dark:bg-neutral-700" />
      <div className="grid gap-3 md:grid-cols-2"><div className="h-40 rounded-xl bg-muted dark:bg-neutral-700" /><div className="h-40 rounded-xl bg-muted dark:bg-neutral-700" /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-700 via-slate-600 to-zinc-600 p-4 sm:p-6 text-white shadow-lg">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Documentos</h1>
              <p className="text-sm text-white/70">{templates.length} plantilla{templates.length !== 1 ? 's' : ''} · Contratos, recibos y más</p>
            </div>
          </div>
          <Button onClick={() => handleNewTemplate()} className="bg-white/20 hover:bg-white/30 text-white border-0">
            <Plus className="h-4 w-4 mr-1" /> Nueva plantilla
          </Button>
        </div>
      </div>

      {/* How it works */}
      <Card className="border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">¿Cómo funciona?</p>
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <p><strong>1.</strong> Creá una plantilla (o usá los modelos que ya vienen listos)</p>
              <p><strong>2.</strong> Cuando necesites un documento, tocá <strong>"Generar"</strong>, elegí el contrato y listo</p>
              <p><strong>3.</strong> El sistema completa todos los datos automáticamente (nombre, DNI, monto, fechas...)</p>
              <p>También podés generar documentos directamente desde la pantalla de un contrato.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty state with quick create */}
      {templates.length === 0 && (
        <Card className="border-dashed dark:border-neutral-600">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 dark:from-blue-900/30 dark:to-violet-900/30 flex items-center justify-center mb-4">
              <FileSignature className="h-8 w-8 text-blue-500/50 dark:text-blue-400/50" />
            </div>
            <p className="font-medium text-muted-foreground dark:text-neutral-400 mb-1">No hay plantillas creadas</p>
            <p className="text-sm text-muted-foreground/70 dark:text-neutral-500 mb-6">Empezá con un modelo listo para usar:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              {CATEGORIES.filter(c => DEFAULT_TEMPLATES[c.key]).map(cat => (
                <button
                  key={cat.key}
                  onClick={() => handleNewTemplate(cat.key)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border dark:border-neutral-600 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all text-left bg-white dark:bg-neutral-800"
                >
                  <div className={`p-2 rounded-lg ${cat.bg}`}>
                    <cat.icon className={`h-4 w-4 ${cat.color}`} />
                  </div>
                  <div>
                    <span className="text-sm font-medium dark:text-white">{cat.label}</span>
                    <p className="text-[11px] text-muted-foreground dark:text-neutral-500">Modelo listo para usar</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      {templates.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={filterCategory === '' ? 'default' : 'outline'} className={filterCategory !== '' ? 'dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700' : ''} onClick={() => setFilterCategory('')}>
            Todas
          </Button>
          {CATEGORIES.map(c => (
            <Button key={c.key} size="sm" variant={filterCategory === c.key ? 'default' : 'outline'} className={filterCategory !== c.key ? 'dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700' : ''} onClick={() => setFilterCategory(c.key)}>
              {c.label}
            </Button>
          ))}
        </div>
      )}

      {/* Template grid */}
      {templates.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {templates.map(tpl => {
            const cat = CATEGORIES.find(c => c.key === tpl.category);
            const CatIcon = cat?.icon || FileText;
            return (
              <Card key={tpl.id} className="hover:shadow-md transition-shadow dark:border-neutral-700 dark:bg-neutral-800/80">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${cat?.bg || 'bg-slate-50 dark:bg-slate-900/20'} shrink-0`}>
                      <CatIcon className={`h-5 w-5 ${cat?.color || 'text-slate-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate dark:text-white">{tpl.name}</p>
                        {tpl.isDefault && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] shrink-0">Predeterminada</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-neutral-500 capitalize">{cat?.label || tpl.category}</p>
                    </div>
                  </div>
                  {tpl.description && <p className="text-xs text-muted-foreground dark:text-neutral-500 mb-3">{tpl.description}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" className="text-xs h-8 flex-1" onClick={() => { setShowRender(tpl.id); setSelectedContractId(''); }}>
                      <Printer className="h-3.5 w-3.5 mr-1.5" /> Generar documento
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8 dark:border-neutral-600 dark:hover:bg-neutral-700" onClick={() => handleEditTemplate(tpl.id)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8 text-red-500 hover:text-red-600 dark:border-neutral-600" onClick={() => handleDelete(tpl.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Generate document modal ── */}
      {showRender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowRender(null)}>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b dark:border-neutral-700">
              <div>
                <h2 className="text-lg font-bold dark:text-white">Generar documento</h2>
                <p className="text-xs text-muted-foreground dark:text-neutral-400">Elegí el contrato y se completan todos los datos solos</p>
              </div>
              <button onClick={() => setShowRender(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700"><X className="h-5 w-5 dark:text-neutral-300" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400 mb-1 block">Seleccioná un contrato</label>
                <select
                  className={inputClasses}
                  value={selectedContractId}
                  onChange={e => setSelectedContractId(e.target.value)}
                >
                  <option value="">— Sin contrato (datos en blanco) —</option>
                  {contracts.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.property?.name || 'Propiedad'} — {c.rentalTenant?.name || 'Inquilino'} {c.contractNumber ? `(#${c.contractNumber})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {selectedContractId && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 p-3">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Se van a completar automáticamente: nombre del inquilino, DNI, dirección, monto, fechas, propietario y más.
                  </p>
                </div>
              )}
              {!selectedContractId && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Sin contrato seleccionado, el documento se genera con los espacios en blanco para completar a mano.
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2 p-5 border-t dark:border-neutral-700">
              <Button variant="outline" className="flex-1 dark:border-neutral-600 dark:hover:bg-neutral-700" onClick={() => setShowRender(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Printer className="h-4 w-4 mr-1" />}
                Generar e imprimir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
