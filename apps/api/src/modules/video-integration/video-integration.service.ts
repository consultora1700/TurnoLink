import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

interface VideoMeetingResult {
  provider: string;
  meetingId: string;
  joinUrl: string;
}

@Injectable()
export class VideoIntegrationService {
  private readonly logger = new Logger(VideoIntegrationService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // ==================== ENCRYPTION ====================

  private getEncryptionKey(): Buffer {
    const key = this.configService.get<string>('VIDEO_ENCRYPTION_KEY');
    if (!key) {
      throw new Error('VIDEO_ENCRYPTION_KEY is not configured');
    }
    return Buffer.from(key, 'hex');
  }

  private encrypt(text: string, existingIv?: string): { encrypted: string; iv: string } {
    const iv = existingIv ? Buffer.from(existingIv, 'hex') : crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
      encrypted: encrypted + ':' + authTag.toString('hex'),
      iv: iv.toString('hex'),
    };
  }

  private decrypt(encrypted: string, iv: string): string {
    const [encryptedText, authTag] = encrypted.split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.getEncryptionKey(),
      Buffer.from(iv, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // ==================== OAUTH ====================

  async getOAuthUrl(tenantId: string, provider: string): Promise<string> {
    const state = Buffer.from(
      JSON.stringify({ tenantId, provider, timestamp: Date.now() }),
    ).toString('base64');

    if (provider === 'zoom') {
      const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
      const redirectUri = this.configService.get<string>('ZOOM_REDIRECT_URI');

      if (!clientId || !redirectUri) {
        throw new InternalServerErrorException('Zoom OAuth is not configured');
      }

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
      });

      return `https://zoom.us/oauth/authorize?${params.toString()}`;
    }

    if (provider === 'google_meet') {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

      if (!clientId || !redirectUri) {
        throw new InternalServerErrorException('Google Meet OAuth is not configured');
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/calendar.events',
        access_type: 'offline',
        prompt: 'consent',
        state,
      });

      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    throw new BadRequestException(`Unsupported provider: ${provider}`);
  }

  async handleOAuthCallback(code: string, state: string): Promise<{ tenantId: string; success: boolean }> {
    let stateData: { tenantId: string; provider: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid OAuth state');
    }

    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      throw new BadRequestException('OAuth session expired. Please try again.');
    }

    const { tenantId, provider } = stateData;

    if (provider === 'zoom') {
      await this.handleZoomCallback(tenantId, code);
    } else if (provider === 'google_meet') {
      await this.handleGoogleCallback(tenantId, code);
    } else {
      throw new BadRequestException(`Unsupported provider: ${provider}`);
    }

    this.logger.log(`Video integration (${provider}) connected for tenant ${tenantId}`);
    return { tenantId, success: true };
  }

  private async handleZoomCallback(tenantId: string, code: string): Promise<void> {
    const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
    const clientSecret = this.configService.get<string>('ZOOM_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('ZOOM_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new InternalServerErrorException('Zoom OAuth is not configured');
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Zoom token exchange failed: ${error}`);
      throw new BadRequestException('Failed to connect Zoom. Please try again.');
    }

    const tokens = await response.json();

    // Get user email
    let accountEmail: string | null = null;
    try {
      const userResponse = await fetch('https://api.zoom.us/v2/users/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (userResponse.ok) {
        const user = await userResponse.json();
        accountEmail = user.email || null;
      }
    } catch {
      // Non-critical, continue without email
    }

    await this.storeCredentials(tenantId, 'zoom', tokens.access_token, tokens.refresh_token, tokens.expires_in, accountEmail);
  }

  private async handleGoogleCallback(tenantId: string, code: string): Promise<void> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new InternalServerErrorException('Google OAuth is not configured');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Google token exchange failed: ${error}`);
      throw new BadRequestException('Failed to connect Google Meet. Please try again.');
    }

    const tokens = await response.json();

    // Get user email
    let accountEmail: string | null = null;
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        accountEmail = userInfo.email || null;
      }
    } catch {
      // Non-critical
    }

    await this.storeCredentials(tenantId, 'google_meet', tokens.access_token, tokens.refresh_token, tokens.expires_in, accountEmail);
  }

  private async storeCredentials(
    tenantId: string,
    provider: string,
    accessToken: string,
    refreshToken: string | null,
    expiresIn: number,
    accountEmail: string | null,
  ): Promise<void> {
    const { encrypted: encryptedAccessToken, iv } = this.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? this.encrypt(refreshToken, iv).encrypted : null;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await this.prisma.videoIntegrationCredential.upsert({
      where: { tenantId },
      create: {
        tenantId,
        provider,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        iv,
        accountEmail,
        expiresAt,
        isConnected: true,
        connectedAt: new Date(),
      },
      update: {
        provider,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        iv,
        accountEmail,
        expiresAt,
        isConnected: true,
        connectedAt: new Date(),
        disconnectedAt: null,
      },
    });
  }

  // ==================== STATUS & DISCONNECT ====================

  async getStatus(tenantId: string): Promise<{
    isConnected: boolean;
    provider: string | null;
    connectedAt: Date | null;
    accountEmail: string | null;
  }> {
    const credential = await this.prisma.videoIntegrationCredential.findUnique({
      where: { tenantId },
      select: {
        isConnected: true,
        provider: true,
        connectedAt: true,
        accountEmail: true,
      },
    });

    if (!credential) {
      return { isConnected: false, provider: null, connectedAt: null, accountEmail: null };
    }

    return {
      isConnected: credential.isConnected,
      provider: credential.provider,
      connectedAt: credential.connectedAt,
      accountEmail: credential.accountEmail,
    };
  }

  async disconnect(tenantId: string): Promise<void> {
    const credential = await this.prisma.videoIntegrationCredential.findUnique({
      where: { tenantId },
    });

    if (!credential) {
      throw new NotFoundException('Video integration is not connected');
    }

    await this.prisma.videoIntegrationCredential.update({
      where: { tenantId },
      data: {
        isConnected: false,
        disconnectedAt: new Date(),
        accessToken: '',
        refreshToken: null,
      },
    });

    this.logger.log(`Video integration disconnected for tenant ${tenantId}`);
  }

  // ==================== ACCESS TOKEN (with auto-refresh) ====================

  async getAccessToken(tenantId: string): Promise<string> {
    const credential = await this.prisma.videoIntegrationCredential.findUnique({
      where: { tenantId },
    });

    if (!credential || !credential.isConnected) {
      throw new BadRequestException('Video integration is not connected');
    }

    const now = new Date();
    const bufferTime = 5 * 60 * 1000;

    if (credential.expiresAt && credential.expiresAt.getTime() - bufferTime < now.getTime()) {
      await this.refreshAccessToken(tenantId, credential);
      const updatedCredential = await this.prisma.videoIntegrationCredential.findUnique({
        where: { tenantId },
      });
      if (!updatedCredential) {
        throw new BadRequestException('Failed to refresh video integration credentials');
      }
      return this.decrypt(updatedCredential.accessToken, updatedCredential.iv);
    }

    return this.decrypt(credential.accessToken, credential.iv);
  }

  private async refreshAccessToken(
    tenantId: string,
    credential: { refreshToken: string | null; iv: string; provider: string },
  ): Promise<void> {
    if (!credential.refreshToken) {
      throw new BadRequestException('No refresh token available. Please reconnect video integration.');
    }

    const refreshToken = this.decrypt(credential.refreshToken, credential.iv);

    let tokenUrl: string;
    let body: URLSearchParams;
    const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };

    if (credential.provider === 'zoom') {
      const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
      const clientSecret = this.configService.get<string>('ZOOM_CLIENT_SECRET');
      if (!clientId || !clientSecret) throw new InternalServerErrorException('Zoom is not configured');

      tokenUrl = 'https://zoom.us/oauth/token';
      headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
      body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
    } else {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
      if (!clientId || !clientSecret) throw new InternalServerErrorException('Google is not configured');

      tokenUrl = 'https://oauth2.googleapis.com/token';
      body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      });
    }

    const response = await fetch(tokenUrl, { method: 'POST', headers, body });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Token refresh failed for tenant ${tenantId}: ${error}`);
      await this.prisma.videoIntegrationCredential.update({
        where: { tenantId },
        data: { isConnected: false, disconnectedAt: new Date() },
      });
      throw new BadRequestException('Video integration session expired. Please reconnect.');
    }

    const tokens = await response.json();
    const { encrypted: encryptedAccessToken, iv } = this.encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? this.encrypt(tokens.refresh_token, iv).encrypted
      : credential.refreshToken; // Keep existing if not rotated
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

    await this.prisma.videoIntegrationCredential.update({
      where: { tenantId },
      data: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        iv,
        expiresAt,
      },
    });

    this.logger.log(`Access token refreshed for tenant ${tenantId} (${credential.provider})`);
  }

  // ==================== CREATE MEETING ====================

  async createMeeting(
    tenantId: string,
    options: { topic: string; startTime: string; duration: number; customerEmail?: string },
  ): Promise<VideoMeetingResult | null> {
    const credential = await this.prisma.videoIntegrationCredential.findUnique({
      where: { tenantId },
    });

    if (!credential || !credential.isConnected) {
      return null;
    }

    try {
      const accessToken = await this.getAccessToken(tenantId);

      if (credential.provider === 'zoom') {
        return await this.createZoomMeeting(accessToken, options);
      } else if (credential.provider === 'google_meet') {
        return await this.createGoogleMeetMeeting(accessToken, options);
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to create video meeting for tenant ${tenantId}: ${error.message}`);
      return null;
    }
  }

  private async createZoomMeeting(
    accessToken: string,
    options: { topic: string; startTime: string; duration: number },
  ): Promise<VideoMeetingResult | null> {
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        topic: options.topic,
        type: 2, // Scheduled meeting
        start_time: options.startTime,
        duration: options.duration,
        timezone: 'America/Argentina/Buenos_Aires',
        settings: {
          join_before_host: true,
          waiting_room: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Zoom meeting creation failed: ${error}`);
      return null;
    }

    const meeting = await response.json();
    return {
      provider: 'zoom',
      meetingId: String(meeting.id),
      joinUrl: meeting.join_url,
    };
  }

  private async createGoogleMeetMeeting(
    accessToken: string,
    options: { topic: string; startTime: string; duration: number; customerEmail?: string },
  ): Promise<VideoMeetingResult | null> {
    const startDate = new Date(options.startTime);
    const endDate = new Date(startDate.getTime() + options.duration * 60 * 1000);

    const event: Record<string, any> = {
      summary: options.topic,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    // Add customer as attendee so they can join Meet without requesting access
    if (options.customerEmail) {
      event.attendees = [{ email: options.customerEmail }];
    }

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(event),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Google Meet creation failed: ${error}`);
      return null;
    }

    const calendarEvent = await response.json();
    const meetLink = calendarEvent.hangoutLink || calendarEvent.conferenceData?.entryPoints?.[0]?.uri;

    if (!meetLink) {
      this.logger.error('Google Calendar event created but no Meet link found');
      return null;
    }

    return {
      provider: 'google_meet',
      meetingId: calendarEvent.id,
      joinUrl: meetLink,
    };
  }
}
