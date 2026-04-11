/**
 * Creative Studio API Client
 * Communicates with the creative-api microservice via the main API domain
 * Nginx proxies /api/creative → localhost:3005
 */

const CREATIVE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar';

// =============================================================================
// Types
// =============================================================================

export interface Creative {
  id: string;
  tenantId: string;
  templateId: string | null;
  name: string;
  type: 'screenshot' | 'mockup' | 'composition' | 'animation';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputData: string;
  outputPath: string | null;
  outputUrl: string | null;
  format: string;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  errorMsg: string | null;
  jobId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  layers: any;
  thumbnail: string | null;
  isSystem: boolean;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { creatives: number };
}

export interface DeviceFrame {
  id: string;
  name: string;
  category: string;
  framePath: string;
  screenX: number;
  screenY: number;
  screenW: number;
  screenH: number;
  cornerRadius: number;
}

export interface AiCopyVariant {
  title?: string;
  body: string;
  hashtags?: string[];
  cta?: string;
}

export interface AiCopyResult {
  id: string;
  tenantId: string;
  prompt: string;
  context: Record<string, any> | null;
  result: AiCopyVariant[];
  model: string;
  tokens: number | null;
  createdAt: string;
}

export interface AiCopyResponse {
  id: string;
  variants: AiCopyVariant[];
  model: string;
  tokens: number;
}

export interface ExportResult {
  id: string;
  outputPath: string;
  outputUrl: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}

export interface JobStatus {
  jobId: string;
  creativeId?: string;
  status: string;
  type?: string;
  outputUrl?: string;
  errorMsg?: string;
}

export interface AssetInfo {
  filename: string;
  path: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
  mimetype?: string;
  createdAt?: string;
}

export interface TenantBranding {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  tagline: string;
  services: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// API Client
// =============================================================================

class CreativeApiClient {
  private getAdminKey(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('admin_session');
      if (stored) {
        const session = JSON.parse(stored);
        if (session.key && session.expiresAt > Date.now()) {
          return session.key;
        }
      }
    } catch {}
    return null;
  }

  // Keep for backwards compat but no longer needed
  setAdminKey(_key: string) {}

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const key = this.getAdminKey();
    if (key) {
      headers['X-Admin-Key'] = key;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${CREATIVE_API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Error de conexión',
      }));
      throw new Error(error.error || error.message || 'Error de conexión');
    }

    return response.json();
  }

  // ==================== HEALTH ====================

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${CREATIVE_API_URL}/api/creative/health`);
    return response.json();
  }

  // ==================== SCREENSHOTS ====================

  async createScreenshot(data: {
    tenantId: string;
    url: string;
    name?: string;
    viewport?: { width: number; height: number };
    fullPage?: boolean;
    selector?: string;
    waitTime?: number;
    format?: string;
    quality?: number;
    deviceScaleFactor?: number;
  }): Promise<{ id: string; jobId: string; status: string }> {
    return this.request('/api/creative/screenshots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listScreenshots(params: Record<string, string> = {}): Promise<PaginatedResponse<Creative>> {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/creative/screenshots?${qs}`);
  }

  async getScreenshot(id: string): Promise<Creative> {
    return this.request(`/api/creative/screenshots/${id}`);
  }

  // ==================== MOCKUPS ====================

  async createMockup(data: {
    tenantId: string;
    screenshotId?: string;
    deviceFrameId: string;
    name?: string;
    background?: { type: string; color?: string };
    shadow?: boolean;
    scale?: number;
    format?: string;
    quality?: number;
  }): Promise<{ id: string; jobId: string; status: string }> {
    return this.request('/api/creative/mockups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listMockups(params: Record<string, string> = {}): Promise<PaginatedResponse<Creative>> {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/creative/mockups?${qs}`);
  }

  async getDeviceFrames(): Promise<DeviceFrame[]> {
    return this.request('/api/creative/mockups/device-frames');
  }

  // ==================== COMPOSITIONS ====================

  async createComposition(data: {
    tenantId: string;
    templateId?: string;
    name?: string;
    data: { width: number; height: number; backgroundColor?: string; layers: any[] };
    format?: string;
    quality?: number;
    async?: boolean;
  }): Promise<Creative | { id: string; jobId: string; status: string }> {
    return this.request('/api/creative/compositions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComposition(id: string, data: { data?: any; name?: string }): Promise<Creative> {
    return this.request(`/api/creative/compositions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async listCompositions(params: Record<string, string> = {}): Promise<PaginatedResponse<Creative>> {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/creative/compositions?${qs}`);
  }

  async getComposition(id: string): Promise<Creative & { inputData: any }> {
    return this.request(`/api/creative/compositions/${id}`);
  }

  // ==================== TEMPLATES ====================

  async listTemplates(tenantId?: string, category?: string): Promise<Template[]> {
    const params = new URLSearchParams();
    if (tenantId) params.set('tenantId', tenantId);
    if (category) params.set('category', category);
    return this.request(`/api/creative/templates?${params}`);
  }

  async getTemplate(id: string): Promise<Template> {
    return this.request(`/api/creative/templates/${id}`);
  }

  async createTemplate(data: {
    name: string;
    category: string;
    width: number;
    height: number;
    layers: any;
    thumbnail?: string;
    isSystem?: boolean;
    tenantId?: string;
  }): Promise<Template> {
    return this.request('/api/creative/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: string, data: Partial<{
    name: string;
    category: string;
    width: number;
    height: number;
    layers: any;
  }>): Promise<Template> {
    return this.request(`/api/creative/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.request(`/api/creative/templates/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateTemplate(id: string, tenantId?: string): Promise<Template> {
    return this.request(`/api/creative/templates/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ tenantId }),
    });
  }

  // ==================== AI COPY ====================

  async generateCopy(data: {
    tenantId: string;
    businessType: string;
    businessName: string;
    services?: string[];
    targetAudience?: string;
    tone?: string;
    format: string;
    language?: string;
    additionalContext?: string;
    variants?: number;
  }): Promise<AiCopyResponse> {
    return this.request('/api/creative/ai-copy/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCopyHistory(tenantId: string, limit?: number): Promise<AiCopyResult[]> {
    const params = new URLSearchParams({ tenantId });
    if (limit) params.set('limit', String(limit));
    return this.request(`/api/creative/ai-copy/history?${params}`);
  }

  // ==================== ANIMATIONS ====================

  async createAnimation(data: {
    tenantId: string;
    type: 'slideshow' | 'kenburns' | 'fade';
    imageIds?: string[];
    imagePaths?: string[];
    duration?: number;
    transition?: number;
    outputFormat?: string;
    width?: number;
    height?: number;
    fps?: number;
    name?: string;
  }): Promise<{ id: string; jobId: string; status: string }> {
    return this.request('/api/creative/animations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listAnimations(params: Record<string, string> = {}): Promise<PaginatedResponse<Creative>> {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/creative/animations?${qs}`);
  }

  // ==================== EXPORTS ====================

  async exportCreative(data: {
    creativeId: string;
    format: string;
    width?: number;
    height?: number;
    quality?: number;
  }): Promise<ExportResult> {
    return this.request('/api/creative/exports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async batchExport(creativeId: string, formats: Array<{
    format: string;
    width?: number;
    height?: number;
    quality?: number;
  }>): Promise<{ zipPath: string; zipUrl: string; exports: ExportResult[] }> {
    return this.request('/api/creative/exports', {
      method: 'POST',
      body: JSON.stringify({ creativeId, batch: formats }),
    });
  }

  async getExport(id: string): Promise<any> {
    return this.request(`/api/creative/exports/${id}`);
  }

  getExportDownloadUrl(id: string): string {
    return `${CREATIVE_API_URL}/api/creative/exports/${id}/download`;
  }

  // ==================== ASSETS ====================

  async uploadAsset(tenantId: string, file: File): Promise<AssetInfo> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenantId', tenantId);

    const response = await fetch(`${CREATIVE_API_URL}/api/creative/assets/upload`, {
      method: 'POST',
      headers: {
        'X-Admin-Key': this.getAdminKey() || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async listAssets(tenantId: string): Promise<AssetInfo[]> {
    return this.request(`/api/creative/assets?tenantId=${tenantId}`);
  }

  // ==================== JOBS ====================

  async getJobStatus(jobId: string): Promise<JobStatus> {
    return this.request(`/api/creative/jobs/${jobId}`);
  }

  // ==================== TENANTS / BRANDING ====================

  async getTenantBranding(tenantId: string): Promise<TenantBranding> {
    return this.request(`/api/creative/tenants/${tenantId}/branding`);
  }

  // ==================== TEMPLATE PREVIEWS ====================

  getTemplatePreviewUrl(templateId: string, tenantId: string, width: number = 400): Promise<string> {
    const key = this.getAdminKey();
    const params = new URLSearchParams({ tenantId, width: String(width) });
    if (key) params.set('admin_key', key);
    // Return a direct URL for <img src>
    return Promise.resolve(
      `${CREATIVE_API_URL}/api/creative/templates/${templateId}/preview?${params}`
    );
  }

  // ==================== RENDER ====================

  async renderTemplate(data: {
    templateId: string;
    tenantId: string;
    customizations: Record<string, any>;
    format: string;
    quality?: number;
  }): Promise<{ outputUrl: string; width: number; height: number; fileSize: number }> {
    return this.request('/api/creative/compositions/render', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async renderPreview(data: {
    templateId: string;
    tenantId: string;
    customizations: Record<string, any>;
    format: string;
    quality?: number;
  }): Promise<string> {
    const result = await this.renderTemplate(data);
    return result.outputUrl;
  }

  // ==================== MARKETING SCENES ====================

  async listMarketingScenes(): Promise<SceneInfo[]> {
    return this.request('/api/creative/marketing/scenes');
  }

  getScenePreviewUrl(sceneId: string, tenantId: string, width: number = 400): string {
    const key = this.getAdminKey();
    const params = new URLSearchParams({ tenantId, width: String(width) });
    if (key) params.set('admin_key', key);
    return `${CREATIVE_API_URL}/api/creative/marketing/scenes/${sceneId}/preview?${params}`;
  }

  async renderScene(data: {
    sceneId: string;
    tenantId: string;
    customizations: Record<string, any>;
    format: string;
    quality?: number;
  }): Promise<{ outputUrl: string; width: number; height: number; fileSize: number; format: string }> {
    return this.request('/api/creative/marketing/render', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== FILE URL ====================

  getFileUrl(relativePath: string): string {
    return `${CREATIVE_API_URL}/files/${relativePath}`;
  }
}

export interface SceneInfo {
  id: string;
  name: string;
  description: string;
  category: 'product' | 'promo';
  format: 'post' | 'story' | 'banner';
  width: number;
  height: number;
}

export const creativeApi = new CreativeApiClient();
