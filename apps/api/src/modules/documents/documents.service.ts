import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentTemplateDto, RenderDocumentDto } from './dto/create-document-template.dto';
import { Decimal } from '@prisma/client/runtime/library';

function toNumber(v: any): number {
  return v instanceof Decimal ? v.toNumber() : Number(v ?? 0);
}

function formatCurrency(n: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: Date | string | null): string {
  if (!d) return '-';
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
}

// Variable definitions by category — what data is available for each document type
const VARIABLE_DEFINITIONS: Record<string, Array<{ key: string; label: string; source: string }>> = {
  contrato: [
    // Property
    { key: 'propiedad_nombre', label: 'Nombre de propiedad', source: 'property' },
    { key: 'propiedad_direccion', label: 'Dirección', source: 'property' },
    { key: 'propiedad_tipo', label: 'Tipo de propiedad', source: 'property' },
    { key: 'propiedad_ciudad', label: 'Ciudad', source: 'property' },
    // Owner
    { key: 'propietario_nombre', label: 'Nombre del propietario', source: 'owner' },
    { key: 'propietario_dni', label: 'CUIT/CUIL del propietario', source: 'owner' },
    { key: 'propietario_direccion', label: 'Dirección del propietario', source: 'owner' },
    { key: 'propietario_telefono', label: 'Teléfono del propietario', source: 'owner' },
    // Tenant (inquilino)
    { key: 'inquilino_nombre', label: 'Nombre del inquilino', source: 'tenant' },
    { key: 'inquilino_dni', label: 'DNI del inquilino', source: 'tenant' },
    { key: 'inquilino_telefono', label: 'Teléfono del inquilino', source: 'tenant' },
    { key: 'inquilino_email', label: 'Email del inquilino', source: 'tenant' },
    { key: 'inquilino_empleador', label: 'Empleador', source: 'tenant' },
    // Contract
    { key: 'contrato_numero', label: 'Número de contrato', source: 'contract' },
    { key: 'contrato_inicio', label: 'Fecha inicio', source: 'contract' },
    { key: 'contrato_fin', label: 'Fecha fin', source: 'contract' },
    { key: 'contrato_monto', label: 'Monto mensual', source: 'contract' },
    { key: 'contrato_monto_letras', label: 'Monto en letras', source: 'contract' },
    { key: 'contrato_moneda', label: 'Moneda', source: 'contract' },
    { key: 'contrato_deposito', label: 'Depósito de garantía', source: 'contract' },
    { key: 'contrato_ajuste_indice', label: 'Índice de ajuste', source: 'contract' },
    { key: 'contrato_ajuste_frecuencia', label: 'Frecuencia de ajuste', source: 'contract' },
    { key: 'contrato_garantia_tipo', label: 'Tipo de garantía', source: 'contract' },
    // Business
    { key: 'inmobiliaria_nombre', label: 'Nombre de la inmobiliaria', source: 'business' },
    { key: 'inmobiliaria_direccion', label: 'Dirección de la inmobiliaria', source: 'business' },
    { key: 'inmobiliaria_telefono', label: 'Teléfono de la inmobiliaria', source: 'business' },
    // Date
    { key: 'fecha_actual', label: 'Fecha actual', source: 'system' },
    { key: 'fecha_actual_corta', label: 'Fecha actual (corta)', source: 'system' },
  ],
  recibo: [
    { key: 'inquilino_nombre', label: 'Nombre del inquilino', source: 'tenant' },
    { key: 'inquilino_dni', label: 'DNI del inquilino', source: 'tenant' },
    { key: 'propiedad_direccion', label: 'Dirección de la propiedad', source: 'property' },
    { key: 'contrato_numero', label: 'Número de contrato', source: 'contract' },
    { key: 'pago_monto', label: 'Monto del pago', source: 'payment' },
    { key: 'pago_periodo', label: 'Período (mes/año)', source: 'payment' },
    { key: 'pago_metodo', label: 'Método de pago', source: 'payment' },
    { key: 'pago_fecha', label: 'Fecha de pago', source: 'payment' },
    { key: 'inmobiliaria_nombre', label: 'Nombre de la inmobiliaria', source: 'business' },
    { key: 'fecha_actual', label: 'Fecha actual', source: 'system' },
  ],
  boleto: [
    { key: 'propiedad_direccion', label: 'Dirección', source: 'property' },
    { key: 'propiedad_tipo', label: 'Tipo', source: 'property' },
    { key: 'propietario_nombre', label: 'Vendedor', source: 'owner' },
    { key: 'propietario_dni', label: 'CUIT/CUIL vendedor', source: 'owner' },
    { key: 'comprador_nombre', label: 'Comprador', source: 'custom' },
    { key: 'comprador_dni', label: 'DNI comprador', source: 'custom' },
    { key: 'precio_venta', label: 'Precio de venta', source: 'custom' },
    { key: 'sena_monto', label: 'Monto de seña', source: 'custom' },
    { key: 'inmobiliaria_nombre', label: 'Inmobiliaria', source: 'business' },
    { key: 'fecha_actual', label: 'Fecha', source: 'system' },
  ],
  autorizacion: [
    { key: 'propiedad_direccion', label: 'Dirección', source: 'property' },
    { key: 'propietario_nombre', label: 'Propietario', source: 'owner' },
    { key: 'propietario_dni', label: 'CUIT/CUIL', source: 'owner' },
    { key: 'inmobiliaria_nombre', label: 'Inmobiliaria', source: 'business' },
    { key: 'fecha_actual', label: 'Fecha', source: 'system' },
  ],
  liquidacion: [
    { key: 'propietario_nombre', label: 'Propietario', source: 'owner' },
    { key: 'propietario_dni', label: 'CUIT/CUIL', source: 'owner' },
    { key: 'propiedad_direccion', label: 'Dirección', source: 'property' },
    { key: 'liquidacion_periodo', label: 'Período', source: 'custom' },
    { key: 'liquidacion_bruto', label: 'Cobrado bruto', source: 'custom' },
    { key: 'liquidacion_comision', label: 'Comisión', source: 'custom' },
    { key: 'liquidacion_gastos', label: 'Gastos', source: 'custom' },
    { key: 'liquidacion_neto', label: 'Neto a pagar', source: 'custom' },
    { key: 'inmobiliaria_nombre', label: 'Inmobiliaria', source: 'business' },
    { key: 'fecha_actual', label: 'Fecha', source: 'system' },
  ],
  otro: [
    { key: 'inmobiliaria_nombre', label: 'Inmobiliaria', source: 'business' },
    { key: 'fecha_actual', label: 'Fecha', source: 'system' },
  ],
};

const NUMBER_WORDS_ES = [
  'cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez',
  'once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte',
];

function numberToWords(n: number): string {
  if (n <= 20) return NUMBER_WORDS_ES[n] || String(n);
  // Simplified — for larger amounts just return formatted number
  return new Intl.NumberFormat('es-AR').format(n);
}

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============ TEMPLATE CRUD ============

  async findAllTemplates(tenantId: string, category?: string) {
    const where: any = { tenantId, isActive: true };
    if (category) where.category = category;
    return this.prisma.documentTemplate.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      select: {
        id: true, name: true, category: true, description: true,
        isDefault: true, createdAt: true, updatedAt: true,
        variables: true,
      },
    });
  }

  async findTemplateById(tenantId: string, id: string) {
    const tpl = await this.prisma.documentTemplate.findFirst({ where: { id, tenantId } });
    if (!tpl) throw new NotFoundException('Plantilla no encontrada');
    return tpl;
  }

  async createTemplate(tenantId: string, dto: CreateDocumentTemplateDto) {
    if (dto.isDefault) {
      // Unset other defaults in same category
      await this.prisma.documentTemplate.updateMany({
        where: { tenantId, category: dto.category || 'contrato', isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.documentTemplate.create({
      data: { tenantId, ...dto },
    });
  }

  async updateTemplate(tenantId: string, id: string, dto: Partial<CreateDocumentTemplateDto>) {
    await this.findTemplateById(tenantId, id);
    if (dto.isDefault) {
      const current = await this.prisma.documentTemplate.findUnique({ where: { id } });
      if (current) {
        await this.prisma.documentTemplate.updateMany({
          where: { tenantId, category: current.category, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }
    }
    return this.prisma.documentTemplate.update({ where: { id }, data: dto });
  }

  async deleteTemplate(tenantId: string, id: string) {
    await this.findTemplateById(tenantId, id);
    return this.prisma.documentTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============ VARIABLE DEFINITIONS ============

  getVariableDefinitions(category: string) {
    return VARIABLE_DEFINITIONS[category] || VARIABLE_DEFINITIONS['otro'];
  }

  // ============ RENDER DOCUMENT ============

  async renderDocument(tenantId: string, templateId: string, dto: RenderDocumentDto) {
    const template = await this.findTemplateById(tenantId, templateId);
    const values = await this.resolveVariables(tenantId, template.category, dto);
    const html = this.substituteVariables(template.htmlContent, values);
    return { html };
  }

  private async resolveVariables(
    tenantId: string,
    category: string,
    dto: RenderDocumentDto,
  ): Promise<Record<string, string>> {
    const values: Record<string, string> = {};

    // System values
    const now = new Date();
    values['fecha_actual'] = formatDate(now);
    values['fecha_actual_corta'] = now.toLocaleDateString('es-AR');

    // Business info
    const business = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, address: true, phone: true, city: true },
    });
    if (business) {
      values['inmobiliaria_nombre'] = business.name || '';
      values['inmobiliaria_direccion'] = [business.address, business.city].filter(Boolean).join(', ');
      values['inmobiliaria_telefono'] = business.phone || '';
    }

    // Contract + related data
    if (dto.contractId) {
      const contract = await this.prisma.rentalContract.findFirst({
        where: { id: dto.contractId, tenantId },
        include: {
          property: { include: { owner: true } },
          rentalTenant: true,
        },
      });
      if (contract) {
        values['contrato_numero'] = contract.contractNumber || '-';
        values['contrato_inicio'] = formatDate(contract.startDate);
        values['contrato_fin'] = formatDate(contract.endDate);
        values['contrato_monto'] = formatCurrency(toNumber(contract.monthlyRent), contract.currency);
        values['contrato_monto_letras'] = numberToWords(Math.round(toNumber(contract.monthlyRent)));
        values['contrato_moneda'] = contract.currency;
        values['contrato_deposito'] = contract.securityDeposit ? formatCurrency(toNumber(contract.securityDeposit), contract.currency) : '-';
        values['contrato_ajuste_indice'] = contract.adjustmentIndex || '-';
        values['contrato_ajuste_frecuencia'] = contract.adjustmentFrequency ? `${contract.adjustmentFrequency} meses` : '-';
        values['contrato_garantia_tipo'] = contract.guaranteeType || '-';

        // Property from contract
        if (contract.property) {
          values['propiedad_nombre'] = contract.property.name || '';
          values['propiedad_direccion'] = [contract.property.address, contract.property.city].filter(Boolean).join(', ');
          values['propiedad_tipo'] = contract.property.propertyType || '';
          values['propiedad_ciudad'] = contract.property.city || '';

          // Owner from property
          if (contract.property.owner) {
            values['propietario_nombre'] = contract.property.owner.name || '';
            values['propietario_dni'] = contract.property.owner.cuitCuil || '';
            values['propietario_direccion'] = contract.property.owner.address || '';
            values['propietario_telefono'] = contract.property.owner.phone || '';
          }
        }

        // Tenant (inquilino)
        if (contract.rentalTenant) {
          values['inquilino_nombre'] = contract.rentalTenant.name || '';
          values['inquilino_dni'] = contract.rentalTenant.dni || '';
          values['inquilino_telefono'] = contract.rentalTenant.phone || '';
          values['inquilino_email'] = contract.rentalTenant.email || '';
          values['inquilino_empleador'] = contract.rentalTenant.employer || '';
        }
      }
    }

    // Standalone property lookup
    if (dto.propertyId && !values['propiedad_nombre']) {
      const prop = await this.prisma.rentalProperty.findFirst({
        where: { id: dto.propertyId, tenantId },
        include: { owner: true },
      });
      if (prop) {
        values['propiedad_nombre'] = prop.name || '';
        values['propiedad_direccion'] = [prop.address, prop.city].filter(Boolean).join(', ');
        values['propiedad_tipo'] = prop.propertyType || '';
        values['propiedad_ciudad'] = prop.city || '';
        if (prop.owner) {
          values['propietario_nombre'] = prop.owner.name || '';
          values['propietario_dni'] = prop.owner.cuitCuil || '';
          values['propietario_direccion'] = prop.owner.address || '';
          values['propietario_telefono'] = prop.owner.phone || '';
        }
      }
    }

    // Standalone owner lookup
    if (dto.ownerId && !values['propietario_nombre']) {
      const owner = await this.prisma.propertyOwner.findFirst({ where: { id: dto.ownerId, tenantId } });
      if (owner) {
        values['propietario_nombre'] = owner.name || '';
        values['propietario_dni'] = owner.cuitCuil || '';
        values['propietario_direccion'] = owner.address || '';
        values['propietario_telefono'] = owner.phone || '';
      }
    }

    // Standalone rental tenant lookup
    if (dto.tenantId && !values['inquilino_nombre']) {
      const rt = await this.prisma.rentalTenant.findFirst({ where: { id: dto.tenantId, tenantId } });
      if (rt) {
        values['inquilino_nombre'] = rt.name || '';
        values['inquilino_dni'] = rt.dni || '';
        values['inquilino_telefono'] = rt.phone || '';
        values['inquilino_email'] = rt.email || '';
        values['inquilino_empleador'] = rt.employer || '';
      }
    }

    // Custom overrides (always win)
    if (dto.customValues) {
      Object.entries(dto.customValues).forEach(([k, v]) => {
        values[k] = v;
      });
    }

    return values;
  }

  private substituteVariables(html: string, values: Record<string, string>): string {
    return html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] !== undefined ? values[key] : match;
    });
  }
}
