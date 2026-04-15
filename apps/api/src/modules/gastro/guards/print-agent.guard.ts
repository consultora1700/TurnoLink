import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';

export interface PrintAgentJwtPayload {
  sub: string; // printAgentId
  tenantId: string;
  type: 'printer-agent';
  iat?: number;
  exp?: number;
}

export interface PrintAgentRequest {
  id: string;
  tenantId: string;
  token: string;
  name: string;
}

/**
 * Guard that authenticates print-agent HTTP requests via long-lived JWT.
 *
 * Works in combination with the global JwtAuthGuard: routes protected by this
 * guard MUST also be marked `@Public()` so the global JWT guard is skipped,
 * letting this guard handle auth with the dedicated printer-agent token.
 *
 * On success:
 *   - Attaches `req.printAgent` = { id, tenantId, token, name }
 *   - Updates PrintAgent.lastSeenAt / lastIp asynchronously (non-blocking)
 *
 * On failure: throws UnauthorizedException.
 */
@Injectable()
export class PrintAgentGuard implements CanActivate {
  private readonly logger = new Logger(PrintAgentGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers?.authorization;

    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('Empty bearer token');
    }

    let payload: PrintAgentJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<PrintAgentJwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.type !== 'printer-agent' || !payload.sub || !payload.tenantId) {
      throw new UnauthorizedException('Token is not a printer-agent token');
    }

    const agent = await this.prisma.printAgent.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        tenantId: true,
        token: true,
        name: true,
        isActive: true,
      },
    });

    if (!agent || !agent.isActive || agent.tenantId !== payload.tenantId) {
      throw new UnauthorizedException('Print agent not found or inactive');
    }

    // Attach minimal agent context to request
    const printAgent: PrintAgentRequest = {
      id: agent.id,
      tenantId: agent.tenantId,
      token: agent.token,
      name: agent.name,
    };
    req.printAgent = printAgent;

    // Heartbeat: update lastSeenAt / lastIp non-blocking
    const ip = this.extractIp(req);
    this.prisma.printAgent
      .update({
        where: { id: agent.id },
        data: { lastSeenAt: new Date(), ...(ip && { lastIp: ip }) },
      })
      .catch((err) =>
        this.logger.warn(`Failed to update PrintAgent heartbeat: ${err.message}`),
      );

    return true;
  }

  private extractIp(req: any): string | null {
    const xff = req.headers?.['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
      return xff.split(',')[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || null;
  }
}
