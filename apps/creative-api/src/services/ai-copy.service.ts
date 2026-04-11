import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '../prisma';
import { config } from '../config';

const prisma = new PrismaClient();

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    if (!config.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    client = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return client;
}

export interface AiCopyRequest {
  tenantId: string;
  businessType: string;
  businessName: string;
  services?: string[];
  targetAudience?: string;
  tone?: string; // "profesional", "casual", "amigable", "formal", "divertido"
  format: string; // "instagram_post", "instagram_story", "facebook_post", "bio", "service_description", "email_subject", "seo_meta"
  language?: string;
  additionalContext?: string;
  variants?: number;
}

export interface AiCopyVariant {
  title?: string;
  body: string;
  hashtags?: string[];
  cta?: string;
}

export interface AiCopyResponse {
  id: string;
  variants: AiCopyVariant[];
  model: string;
  tokens: number;
}

const FORMAT_PROMPTS: Record<string, string> = {
  instagram_post: 'Crea un post de Instagram atractivo con copy persuasivo, emojis apropiados, y hashtags relevantes. Máximo 2200 caracteres.',
  instagram_story: 'Crea texto corto y llamativo para una historia de Instagram. Debe ser conciso e impactante. Máximo 150 caracteres por línea.',
  facebook_post: 'Crea un post de Facebook profesional y atractivo. Incluye un llamado a la acción. Máximo 500 palabras.',
  bio: 'Crea una bio profesional y atractiva. Máximo 150 caracteres.',
  service_description: 'Crea una descripción de servicio atractiva y profesional que destaque beneficios. 100-200 palabras.',
  email_subject: 'Crea líneas de asunto de email que generen apertura. Máximo 60 caracteres cada una.',
  seo_meta: 'Crea meta description SEO optimizada. Máximo 160 caracteres.',
  banner_headline: 'Crea un titular impactante para un banner publicitario. Máximo 10 palabras.',
  whatsapp_message: 'Crea un mensaje de WhatsApp profesional para enviar a clientes. Incluye saludo y CTA.',
};

export async function generateCopy(request: AiCopyRequest): Promise<AiCopyResponse> {
  const anthropic = getClient();
  const formatPrompt = FORMAT_PROMPTS[request.format] || 'Crea copy de marketing atractivo y profesional.';
  const variantCount = Math.min(request.variants || 3, 5);

  const systemPrompt = `Eres un experto en marketing digital y copywriting en español para negocios latinoamericanos.
Tu tarea es generar copy de marketing profesional, creativo y efectivo.
Responde SIEMPRE en formato JSON válido.`;

  const userPrompt = `Genera ${variantCount} variantes de copy para:

**Negocio**: ${request.businessName}
**Tipo**: ${request.businessType}
${request.services?.length ? `**Servicios**: ${request.services.join(', ')}` : ''}
${request.targetAudience ? `**Público objetivo**: ${request.targetAudience}` : ''}
**Tono**: ${request.tone || 'profesional'}
**Idioma**: ${request.language || 'español'}
${request.additionalContext ? `**Contexto adicional**: ${request.additionalContext}` : ''}

**Formato solicitado**: ${request.format}
${formatPrompt}

Responde con un JSON array de ${variantCount} objetos, cada uno con esta estructura:
{
  "title": "Título o encabezado (si aplica)",
  "body": "Cuerpo del texto",
  "hashtags": ["hashtag1", "hashtag2"] (si aplica, sin el símbolo #),
  "cta": "Llamado a la acción (si aplica)"
}

Solo devuelve el JSON array, sin texto adicional.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  let variants: AiCopyVariant[];
  try {
    // Extract JSON from response (may be wrapped in markdown code blocks)
    let jsonText = content.text.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    variants = JSON.parse(jsonText);
  } catch (e) {
    throw new Error('Failed to parse AI response as JSON');
  }

  const tokens = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

  // Save to database
  const record = await prisma.aiCopyResult.create({
    data: {
      tenantId: request.tenantId,
      prompt: userPrompt,
      context: JSON.stringify({
        businessName: request.businessName,
        businessType: request.businessType,
        format: request.format,
        tone: request.tone,
      }),
      result: JSON.stringify(variants),
      model: 'claude-sonnet-4-6',
      tokens,
    },
  });

  return {
    id: record.id,
    variants,
    model: 'claude-sonnet-4-6',
    tokens,
  };
}

export async function getCopyHistory(tenantId: string, limit: number = 20) {
  const results = await prisma.aiCopyResult.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return results.map((r) => ({
    ...r,
    context: r.context ? JSON.parse(r.context) : null,
    result: JSON.parse(r.result),
  }));
}
