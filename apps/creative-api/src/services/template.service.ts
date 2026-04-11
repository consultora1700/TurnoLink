import { PrismaClient } from '../prisma';

const prisma = new PrismaClient();

export interface CreateTemplateInput {
  name: string;
  category: string;
  width: number;
  height: number;
  layers: any;
  thumbnail?: string;
  isSystem?: boolean;
  tenantId?: string;
}

export async function listTemplates(tenantId?: string) {
  return prisma.template.findMany({
    where: {
      OR: [
        { isSystem: true },
        ...(tenantId ? [{ tenantId }] : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { creatives: true } } },
  });
}

export async function getTemplate(id: string) {
  return prisma.template.findUnique({
    where: { id },
    include: { _count: { select: { creatives: true } } },
  });
}

export async function createTemplate(data: CreateTemplateInput) {
  return prisma.template.create({
    data: {
      name: data.name,
      category: data.category,
      width: data.width,
      height: data.height,
      layers: JSON.stringify(data.layers),
      thumbnail: data.thumbnail,
      isSystem: data.isSystem || false,
      tenantId: data.tenantId || null,
    },
  });
}

export async function updateTemplate(id: string, data: Partial<CreateTemplateInput>) {
  const updateData: any = { ...data };
  if (data.layers) {
    updateData.layers = JSON.stringify(data.layers);
  }
  return prisma.template.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteTemplate(id: string) {
  const template = await prisma.template.findUnique({ where: { id } });
  if (!template) throw new Error('Template not found');
  if (template.isSystem) throw new Error('Cannot delete system templates');

  return prisma.template.delete({ where: { id } });
}

export async function duplicateTemplate(id: string, tenantId?: string) {
  const template = await prisma.template.findUnique({ where: { id } });
  if (!template) throw new Error('Template not found');

  return prisma.template.create({
    data: {
      name: `${template.name} (copy)`,
      category: template.category,
      width: template.width,
      height: template.height,
      layers: template.layers,
      thumbnail: template.thumbnail,
      isSystem: false,
      tenantId: tenantId || template.tenantId,
    },
  });
}
