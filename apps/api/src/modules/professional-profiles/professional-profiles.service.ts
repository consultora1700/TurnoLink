import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailNotificationsService } from '../notifications/email-notifications.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { BrowseProfilesDto } from './dto/browse-profiles.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { RespondProposalDto } from './dto/respond-proposal.dto';

@Injectable()
export class ProfessionalProfilesService {
  private readonly logger = new Logger(ProfessionalProfilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailNotificationsService: EmailNotificationsService,
  ) {}

  /**
   * Validate a token and return employee data + profile if exists.
   */
  async validateToken(token: string) {
    const employeeToken = await this.prisma.employeeToken.findUnique({
      where: { token },
      include: {
        employee: {
          include: {
            tenant: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!employeeToken) {
      throw new NotFoundException('Token inválido');
    }

    if (employeeToken.expiresAt < new Date()) {
      throw new BadRequestException('El enlace ha expirado. Solicita uno nuevo.');
    }

    // Find profile by employee email
    const profile = employeeToken.employee.email
      ? await this.prisma.professionalProfile.findUnique({
          where: { email: employeeToken.employee.email },
          include: { experiences: { orderBy: { startDate: 'desc' } } },
        })
      : null;

    return {
      employee: {
        id: employeeToken.employee.id,
        name: employeeToken.employee.name,
        email: employeeToken.employee.email,
        image: employeeToken.employee.image,
        specialty: employeeToken.employee.specialty,
        bio: employeeToken.employee.bio,
      },
      tenant: employeeToken.employee.tenant,
      profile,
      tokenUsed: !!employeeToken.usedAt,
    };
  }

  /**
   * Accept consent and create professional profile.
   */
  async acceptConsent(token: string, ip: string, openToWork: boolean) {
    const employeeToken = await this.prisma.employeeToken.findUnique({
      where: { token },
      include: {
        employee: {
          include: {
            tenant: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!employeeToken) {
      throw new NotFoundException('Token inválido');
    }

    if (employeeToken.expiresAt < new Date()) {
      throw new BadRequestException('El enlace ha expirado');
    }

    const employee = employeeToken.employee;

    if (!employee.email) {
      throw new BadRequestException('El empleado no tiene email registrado');
    }

    // Check if profile already exists
    const existingProfile = await this.prisma.professionalProfile.findUnique({
      where: { email: employee.email },
    });

    if (existingProfile) {
      throw new BadRequestException('Ya existe un perfil para este email');
    }

    // Create profile pre-filled with employee data
    const profile = await this.prisma.professionalProfile.create({
      data: {
        employeeId: employee.id,
        email: employee.email,
        name: employee.name,
        image: employee.image,
        specialty: employee.specialty,
        bio: employee.bio,
        openToWork,
        consentedAt: new Date(),
        consentIp: ip,
      },
    });

    // Create auto-experience for current employer
    await this.prisma.professionalExperience.create({
      data: {
        profileId: profile.id,
        businessName: employee.tenant.name,
        role: employee.specialty || 'Profesional',
        startDate: employee.createdAt,
        isCurrent: true,
      },
    });

    // Mark token as used
    await this.prisma.employeeToken.update({
      where: { id: employeeToken.id },
      data: { usedAt: new Date() },
    });

    // Return the full profile
    return this.prisma.professionalProfile.findUnique({
      where: { id: profile.id },
      include: { experiences: { orderBy: { startDate: 'desc' } } },
    });
  }

  /**
   * Get profile by token.
   */
  async getProfile(token: string) {
    const data = await this.validateToken(token);
    if (!data.profile) {
      throw new NotFoundException('Perfil no encontrado. Primero debes aceptar el consentimiento.');
    }

    // Update last active
    await this.prisma.professionalProfile.update({
      where: { id: data.profile.id },
      data: { lastActiveAt: new Date() },
    });

    return data.profile;
  }

  /**
   * Update profile.
   */
  async updateProfile(token: string, dto: UpdateProfileDto) {
    const data = await this.validateToken(token);
    if (!data.profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    if (!data.profile.consentedAt && (dto.openToWork !== undefined)) {
      throw new ForbiddenException('Debes aceptar el consentimiento primero');
    }

    const updateData: any = { ...dto, lastActiveAt: new Date() };

    // Serialize arrays to JSON strings for storage
    if (dto.skills) updateData.skills = JSON.stringify(dto.skills);
    if (dto.certifications) updateData.certifications = JSON.stringify(dto.certifications);
    if (dto.preferredZones) updateData.preferredZones = JSON.stringify(dto.preferredZones);

    return this.prisma.professionalProfile.update({
      where: { id: data.profile.id },
      data: updateData,
      include: { experiences: { orderBy: { startDate: 'desc' } } },
    });
  }

  /**
   * Add experience.
   */
  async addExperience(token: string, dto: CreateExperienceDto) {
    const data = await this.validateToken(token);
    if (!data.profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return this.prisma.professionalExperience.create({
      data: {
        profileId: data.profile.id,
        businessName: dto.businessName,
        role: dto.role,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isCurrent: dto.isCurrent ?? false,
        description: dto.description,
      },
    });
  }

  /**
   * Update experience.
   */
  async updateExperience(token: string, experienceId: string, dto: CreateExperienceDto) {
    const data = await this.validateToken(token);
    if (!data.profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    // Verify experience belongs to this profile
    const experience = await this.prisma.professionalExperience.findFirst({
      where: { id: experienceId, profileId: data.profile.id },
    });

    if (!experience) {
      throw new NotFoundException('Experiencia no encontrada');
    }

    return this.prisma.professionalExperience.update({
      where: { id: experienceId },
      data: {
        businessName: dto.businessName,
        role: dto.role,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isCurrent: dto.isCurrent ?? false,
        description: dto.description,
      },
    });
  }

  /**
   * Delete experience.
   */
  async deleteExperience(token: string, experienceId: string) {
    const data = await this.validateToken(token);
    if (!data.profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const experience = await this.prisma.professionalExperience.findFirst({
      where: { id: experienceId, profileId: data.profile.id },
    });

    if (!experience) {
      throw new NotFoundException('Experiencia no encontrada');
    }

    await this.prisma.professionalExperience.delete({
      where: { id: experienceId },
    });

    return { success: true };
  }

  /**
   * Request new token by email (rate-limited at controller level).
   */
  async requestNewToken(email: string) {
    // Find an employee with this email
    const employee = await this.prisma.employee.findFirst({
      where: { email, isActive: true, deletedAt: null },
      include: { tenant: { select: { name: true } } },
    });

    if (!employee) {
      // Don't reveal if email exists — return generic success
      this.logger.warn(`Token request for unknown email: ${email}`);
      return { success: true, message: 'Si tu email está registrado, recibirás un enlace de acceso.' };
    }

    // Generate new token
    const tokenValue = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.employeeToken.create({
      data: {
        employeeId: employee.id,
        token: tokenValue,
        type: 'PROFILE_ACCESS',
        expiresAt,
      },
    });

    // Send email
    await this.emailNotificationsService.sendProfileAccessEmail(
      employee.email!,
      employee.name,
      tokenValue,
    );

    this.logger.log(`New profile access token sent to ${employee.email}`);

    return { success: true, message: 'Si tu email está registrado, recibirás un enlace de acceso.' };
  }

  /**
   * GDPR: Delete profile and all associated data.
   */
  async deleteProfile(token: string) {
    const data = await this.validateToken(token);
    if (!data.profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    // Delete experiences (cascade) + profile
    await this.prisma.professionalProfile.delete({
      where: { id: data.profile.id },
    });

    // Also delete all tokens for this employee
    await this.prisma.employeeToken.deleteMany({
      where: { employeeId: data.employee.id },
    });

    this.logger.log(`Profile deleted for employee ${data.employee.id} (GDPR request)`);

    return { success: true, message: 'Tu perfil y todos tus datos han sido eliminados.' };
  }

  /**
   * Generate a profile access token for an employee (used by sendWelcomeEmail).
   */
  async generateToken(employeeId: string): Promise<string> {
    const tokenValue = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.employeeToken.create({
      data: {
        employeeId,
        token: tokenValue,
        type: 'PROFILE_ACCESS',
        expiresAt,
      },
    });

    return tokenValue;
  }

  // ============ PUBLIC BROWSE (no auth) ============

  /**
   * Browse visible profiles publicly — reduced data, no tenant exclusion.
   */
  async browsePublicProfiles(filters: BrowseProfilesDto) {
    const { search, specialty, availability, openToWork, category, page = 1 } = filters;
    const limit = Math.min(filters.limit || 30, 30); // Cap at 30

    const where: any = {
      profileVisible: true,
      consentedAt: { not: null },
    };

    if (search) {
      // Split search into individual words and match ANY word in name/headline/specialty
      const words = search.trim().split(/\s+/).filter(Boolean);
      if (words.length === 1) {
        where.OR = [
          { name: { contains: words[0], mode: 'insensitive' } },
          { headline: { contains: words[0], mode: 'insensitive' } },
          { specialty: { contains: words[0], mode: 'insensitive' } },
        ];
      } else if (words.length > 1) {
        // Match any word in any field
        where.OR = words.flatMap((word) => [
          { name: { contains: word, mode: 'insensitive' } },
          { headline: { contains: word, mode: 'insensitive' } },
          { specialty: { contains: word, mode: 'insensitive' } },
        ]);
      }
    }

    if (specialty) {
      where.specialty = { contains: specialty, mode: 'insensitive' };
    }

    if (category) {
      where.category = category;
    }

    if (availability) {
      where.availability = availability;
    }

    if (openToWork !== undefined) {
      where.openToWork = openToWork;
    }

    const [profiles, total] = await Promise.all([
      this.prisma.professionalProfile.findMany({
        where,
        select: {
          id: true,
          name: true,
          image: true,
          category: true,
          specialty: true,
          headline: true,
          bio: true,
          yearsExperience: true,
          skills: true,
          availability: true,
          openToWork: true,
        },
        orderBy: { lastActiveAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.professionalProfile.count({ where }),
    ]);

    // Reduce data for public consumption
    const data = profiles.map((p) => {
      let skills: string[] = [];
      try {
        skills = typeof p.skills === 'string' ? JSON.parse(p.skills) : (p.skills || []);
      } catch { skills = []; }

      return {
        ...p,
        bio: p.bio ? p.bio.slice(0, 200) + (p.bio.length > 200 ? '...' : '') : null,
        skills: skills.slice(0, 3),
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get public profile detail — teaser view with limited data.
   */
  async getPublicProfileDetail(profileId: string) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: {
        id: profileId,
        profileVisible: true,
        consentedAt: { not: null },
      },
      include: {
        experiences: {
          orderBy: { startDate: 'desc' },
          take: 2,
          select: {
            id: true,
            businessName: true,
            role: true,
            startDate: true,
            endDate: true,
            isCurrent: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    // Parse skills (full list as incentive)
    let skills: string[] = [];
    try {
      skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : (profile.skills || []);
    } catch { skills = []; }

    return {
      id: profile.id,
      name: profile.name,
      image: profile.image,
      specialty: profile.specialty,
      headline: profile.headline,
      bio: profile.bio ? profile.bio.slice(0, 300) + (profile.bio.length > 300 ? '...' : '') : null,
      yearsExperience: profile.yearsExperience,
      skills,
      availability: profile.availability,
      openToWork: profile.openToWork,
      experiences: profile.experiences,
    };
  }

  // ============ BROWSE (Fase 3) ============

  /**
   * Browse visible professional profiles, excluding profiles from the requesting tenant's employees.
   */
  async browseProfiles(excludeTenantId: string, filters: BrowseProfilesDto) {
    const {
      search, specialty, availability, openToWork, category,
      zone, minExperience, skills, sortBy,
      page = 1, limit = 20,
    } = filters;

    // Get employee IDs belonging to the requesting tenant (to exclude own employees)
    const ownEmployeeIds = await this.prisma.employee.findMany({
      where: { tenantId: excludeTenantId },
      select: { id: true },
    });
    const excludeEmployeeIds = ownEmployeeIds.map((e) => e.id);

    // Get user IDs belonging to the requesting tenant (to exclude own users)
    const ownUserIds = await this.prisma.user.findMany({
      where: { tenantId: excludeTenantId },
      select: { id: true },
    });
    const excludeUserIds = ownUserIds.map((u) => u.id);

    const where: any = {
      profileVisible: true,
      consentedAt: { not: null },
      AND: [
        {
          OR: [
            { employeeId: { notIn: excludeEmployeeIds } },
            { employeeId: null },
          ],
        },
        {
          OR: [
            { userId: { notIn: excludeUserIds } },
            { userId: null },
          ],
        },
      ],
    };

    if (search) {
      // Split search into words and match ANY word in name/headline/specialty
      const words = search.trim().split(/\s+/).filter(Boolean);
      if (words.length === 1) {
        where.AND.push({
          OR: [
            { name: { contains: words[0], mode: 'insensitive' } },
            { headline: { contains: words[0], mode: 'insensitive' } },
            { specialty: { contains: words[0], mode: 'insensitive' } },
          ],
        });
      } else if (words.length > 1) {
        where.AND.push({
          OR: words.flatMap((word) => [
            { name: { contains: word, mode: 'insensitive' } },
            { headline: { contains: word, mode: 'insensitive' } },
            { specialty: { contains: word, mode: 'insensitive' } },
          ]),
        });
      }
    }

    if (specialty) {
      where.specialty = { contains: specialty, mode: 'insensitive' };
    }

    if (category) {
      where.category = category;
    }

    if (availability) {
      where.availability = availability;
    }

    if (openToWork !== undefined) {
      where.openToWork = openToWork;
    }

    // Zone filter: search inside preferredZones JSON string (case-insensitive)
    if (zone) {
      where.preferredZones = { contains: zone, mode: 'insensitive' };
    }

    // Minimum experience filter
    if (minExperience !== undefined) {
      where.yearsExperience = { gte: minExperience };
    }

    // Skills filter: search inside skills JSON string (case-insensitive)
    if (skills) {
      where.skills = { contains: skills, mode: 'insensitive' };
    }

    // Determine sort order
    let orderBy: any = { lastActiveAt: 'desc' };
    if (sortBy === 'experience') {
      orderBy = [{ yearsExperience: 'desc' }, { lastActiveAt: 'desc' }];
    } else if (sortBy === 'name') {
      orderBy = { name: 'asc' };
    }

    const [profiles, total] = await Promise.all([
      this.prisma.professionalProfile.findMany({
        where,
        include: { experiences: { orderBy: { startDate: 'desc' } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.professionalProfile.count({ where }),
    ]);

    // Parse JSON string fields to arrays
    const data = profiles.map((p) => this.parseProfileJsonFields(p));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single public profile by ID, excluding own tenant's employees.
   */
  async getPublicProfile(profileId: string, excludeTenantId: string) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: {
        id: profileId,
        profileVisible: true,
        consentedAt: { not: null },
      },
      include: { experiences: { orderBy: { startDate: 'desc' } } },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    // Check it's not the requesting tenant's own employee
    if (profile.employeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: { id: profile.employeeId, tenantId: excludeTenantId },
      });
      if (employee) {
        throw new NotFoundException('Perfil no encontrado');
      }
    }

    // Check it's not the requesting tenant's own user (for self-registered profiles)
    if (profile.userId) {
      const user = await this.prisma.user.findFirst({
        where: { id: profile.userId, tenantId: excludeTenantId },
      });
      if (user) {
        throw new NotFoundException('Perfil no encontrado');
      }
    }

    return this.parseProfileJsonFields(profile);
  }

  /**
   * Parse JSON string fields (skills, certifications, preferredZones) to arrays.
   */
  private parseProfileJsonFields(profile: any) {
    const { email, ...rest } = profile;
    try {
      rest.skills = typeof rest.skills === 'string' ? JSON.parse(rest.skills) : rest.skills;
    } catch { rest.skills = []; }
    try {
      rest.certifications = typeof rest.certifications === 'string' ? JSON.parse(rest.certifications) : rest.certifications;
    } catch { rest.certifications = []; }
    try {
      rest.preferredZones = typeof rest.preferredZones === 'string' ? JSON.parse(rest.preferredZones) : rest.preferredZones;
    } catch { rest.preferredZones = []; }
    return rest;
  }

  // ============ PROPOSALS (Fase 4) ============

  /**
   * Send a proposal from a tenant to a professional profile.
   */
  async sendProposal(tenantId: string, profileId: string, dto: CreateProposalDto) {
    // Verify profile exists and is visible
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { id: profileId, profileVisible: true, consentedAt: { not: null } },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    // Verify not own employee
    if (profile.employeeId) {
      const ownEmployee = await this.prisma.employee.findFirst({
        where: { id: profile.employeeId, tenantId },
      });
      if (ownEmployee) {
        throw new BadRequestException('No puedes enviar propuestas a tus propios empleados');
      }
    }

    // Verify not own user (for self-registered profiles)
    if (profile.userId) {
      const ownUser = await this.prisma.user.findFirst({
        where: { id: profile.userId, tenantId },
      });
      if (ownUser) {
        throw new BadRequestException('No puedes enviar propuestas a tus propios usuarios');
      }
    }

    // Rate limit: max 3 proposals to the same profile per tenant
    const existingCount = await this.prisma.talentProposal.count({
      where: { profileId, senderTenantId: tenantId },
    });

    if (existingCount >= 3) {
      throw new BadRequestException('Ya enviaste el máximo de propuestas a este profesional (3)');
    }

    // Create proposal
    const proposal = await this.prisma.talentProposal.create({
      data: {
        profileId,
        senderTenantId: tenantId,
        role: dto.role,
        message: dto.message,
        availability: dto.availability,
      },
      include: {
        profile: { select: { name: true, specialty: true, image: true, email: true } },
        senderTenant: { select: { name: true } },
      },
    });

    // Send email notification to the professional
    try {
      // Find the employee token to build the profile URL (only for employer-created profiles)
      if (profile.employeeId) {
        const employeeToken = await this.prisma.employeeToken.findFirst({
          where: { employeeId: profile.employeeId, type: 'PROFILE_ACCESS' },
          orderBy: { createdAt: 'desc' },
        });

        if (employeeToken && profile.email) {
          await this.emailNotificationsService.sendProposalNotificationEmail(
            profile.email,
            profile.name,
            proposal.senderTenant.name,
            dto.role,
            employeeToken.token,
          );
        }
      }
      // For self-registered profiles (userId), send email to their user account
      if (profile.userId) {
        const user = await this.prisma.user.findUnique({ where: { id: profile.userId } });
        if (user?.email) {
          await this.emailNotificationsService.sendProposalToSelfRegisteredEmail(
            user.email,
            profile.name,
            proposal.senderTenant.name,
            dto.role,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to send proposal notification email: ${error}`);
    }

    // Remove email from response
    const { profile: profileData, ...rest } = proposal;
    const { email: _email, ...profileSafe } = profileData;
    return { ...rest, profile: profileSafe };
  }

  /**
   * Get proposals sent by a tenant.
   */
  async getProposalsSent(tenantId: string) {
    const proposals = await this.prisma.talentProposal.findMany({
      where: { senderTenantId: tenantId },
      include: {
        profile: { select: { name: true, specialty: true, image: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Only expose contact info (email, phone) for ACCEPTED proposals
    return proposals.map((p) => {
      if (p.status === 'ACCEPTED') {
        return p; // Include email + phone
      }
      // Strip contact info for non-accepted proposals
      const { profile, ...rest } = p;
      const { email: _e, phone: _p, ...profileSafe } = profile;
      return { ...rest, profile: profileSafe };
    });
  }

  /**
   * Get proposals received by a professional profile (via token).
   */
  async getProposalsReceived(token: string) {
    const data = await this.validateToken(token);
    if (!data.profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const proposals = await this.prisma.talentProposal.findMany({
      where: { profileId: data.profile.id },
      include: {
        senderTenant: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return proposals;
  }

  /**
   * Respond to a proposal (accept or reject).
   */
  async respondProposal(token: string, proposalId: string, dto: RespondProposalDto) {
    const data = await this.validateToken(token);
    if (!data.profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const proposal = await this.prisma.talentProposal.findFirst({
      where: { id: proposalId, profileId: data.profile.id },
    });

    if (!proposal) {
      throw new NotFoundException('Propuesta no encontrada');
    }

    if (proposal.status !== 'PENDING') {
      throw new BadRequestException('Esta propuesta ya fue respondida');
    }

    const updated = await this.prisma.talentProposal.update({
      where: { id: proposalId },
      data: {
        status: dto.status,
        respondedAt: new Date(),
        responseMessage: dto.responseMessage,
      },
      include: {
        profile: { select: { name: true, email: true, phone: true } },
        senderTenant: { select: { name: true } },
      },
    });

    // Send email notification to the business owner
    try {
      const owner = await this.prisma.user.findFirst({
        where: { tenantId: updated.senderTenantId, role: 'OWNER' },
        select: { email: true, name: true },
      });
      if (owner?.email) {
        const contactInfo = dto.status === 'ACCEPTED'
          ? { email: data.profile.email, phone: data.profile.phone }
          : undefined;
        await this.emailNotificationsService.sendProposalResponseEmail(
          owner.email,
          owner.name,
          updated.profile.name,
          updated.role,
          dto.status as 'ACCEPTED' | 'REJECTED',
          dto.responseMessage,
          contactInfo,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send proposal response email: ${error}`);
    }

    return updated;
  }

  /**
   * Mark a proposal as viewed.
   */
  async markProposalViewed(token: string, proposalId: string) {
    const data = await this.validateToken(token);
    if (!data.profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const proposal = await this.prisma.talentProposal.findFirst({
      where: { id: proposalId, profileId: data.profile.id },
    });

    if (!proposal) {
      throw new NotFoundException('Propuesta no encontrada');
    }

    if (!proposal.viewedAt) {
      await this.prisma.talentProposal.update({
        where: { id: proposalId },
        data: { viewedAt: new Date() },
      });
    }

    return { success: true };
  }

  // ============ SELF-PROFILE (PROFESSIONAL users) ============

  /**
   * Get profile for a PROFESSIONAL user by userId.
   */
  async getMyProfile(userId: string) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
      include: { experiences: { orderBy: { startDate: 'desc' } } },
    });

    if (!profile) {
      return null; // Not created yet
    }

    // Update last active
    await this.prisma.professionalProfile.update({
      where: { id: profile.id },
      data: { lastActiveAt: new Date() },
    });

    return this.parseProfileJsonFields(profile);
  }

  /**
   * Create profile for a PROFESSIONAL user (first time).
   */
  async createMyProfile(userId: string, email: string, name: string, dto: UpdateProfileDto) {
    // Check if profile already exists
    const existing = await this.prisma.professionalProfile.findFirst({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException('Ya tienes un perfil profesional creado');
    }

    // Also check by email
    const existingByEmail = await this.prisma.professionalProfile.findUnique({
      where: { email },
    });
    if (existingByEmail) {
      throw new BadRequestException('Ya existe un perfil con este email');
    }

    const data: any = {
      userId,
      email,
      name: dto.name || name,
      headline: dto.headline,
      bio: dto.bio,
      specialty: dto.specialty,
      category: dto.category,
      yearsExperience: dto.yearsExperience,
      availability: dto.availability,
      openToWork: dto.openToWork ?? false,
      profileVisible: dto.profileVisible ?? false,
      consentedAt: new Date(),
      lastActiveAt: new Date(),
    };

    if (dto.skills) data.skills = JSON.stringify(dto.skills);
    if (dto.certifications) data.certifications = JSON.stringify(dto.certifications);
    if (dto.preferredZones) data.preferredZones = JSON.stringify(dto.preferredZones);
    if (dto.image) data.image = dto.image;
    if (dto.coverImage) data.coverImage = dto.coverImage;
    if (dto.headerTemplate) data.headerTemplate = dto.headerTemplate;

    const profile = await this.prisma.professionalProfile.create({ data });

    return this.prisma.professionalProfile.findUnique({
      where: { id: profile.id },
      include: { experiences: { orderBy: { startDate: 'desc' } } },
    }).then((p) => p ? this.parseProfileJsonFields(p) : profile);
  }

  /**
   * Update profile for a PROFESSIONAL user.
   */
  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado. Primero debes crear tu perfil.');
    }

    const updateData: any = { ...dto, lastActiveAt: new Date() };

    // Serialize arrays to JSON strings for storage
    if (dto.skills) updateData.skills = JSON.stringify(dto.skills);
    if (dto.certifications) updateData.certifications = JSON.stringify(dto.certifications);
    if (dto.preferredZones) updateData.preferredZones = JSON.stringify(dto.preferredZones);

    return this.prisma.professionalProfile.update({
      where: { id: profile.id },
      data: updateData,
      include: { experiences: { orderBy: { startDate: 'desc' } } },
    }).then((p) => this.parseProfileJsonFields(p));
  }

  /**
   * Add experience to own profile.
   */
  async addExperienceToMyProfile(userId: string, dto: CreateExperienceDto) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return this.prisma.professionalExperience.create({
      data: {
        profileId: profile.id,
        businessName: dto.businessName,
        role: dto.role,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isCurrent: dto.isCurrent ?? false,
        description: dto.description,
      },
    });
  }

  /**
   * Update experience on own profile.
   */
  async updateExperienceOnMyProfile(userId: string, experienceId: string, dto: CreateExperienceDto) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const experience = await this.prisma.professionalExperience.findFirst({
      where: { id: experienceId, profileId: profile.id },
    });
    if (!experience) {
      throw new NotFoundException('Experiencia no encontrada');
    }

    return this.prisma.professionalExperience.update({
      where: { id: experienceId },
      data: {
        businessName: dto.businessName,
        role: dto.role,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isCurrent: dto.isCurrent ?? false,
        description: dto.description,
      },
    });
  }

  /**
   * Delete experience from own profile.
   */
  async deleteExperienceFromMyProfile(userId: string, experienceId: string) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const experience = await this.prisma.professionalExperience.findFirst({
      where: { id: experienceId, profileId: profile.id },
    });
    if (!experience) {
      throw new NotFoundException('Experiencia no encontrada');
    }

    await this.prisma.professionalExperience.delete({
      where: { id: experienceId },
    });

    return { success: true };
  }

  /**
   * Get proposals received by own profile.
   */
  async getMyProposals(userId: string) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
    });
    if (!profile) {
      return [];
    }

    return this.prisma.talentProposal.findMany({
      where: { profileId: profile.id },
      include: {
        senderTenant: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Respond to a proposal on own profile.
   */
  async respondToMyProposal(userId: string, proposalId: string, dto: RespondProposalDto) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const proposal = await this.prisma.talentProposal.findFirst({
      where: { id: proposalId, profileId: profile.id },
    });
    if (!proposal) {
      throw new NotFoundException('Propuesta no encontrada');
    }
    if (proposal.status !== 'PENDING') {
      throw new BadRequestException('Esta propuesta ya fue respondida');
    }

    const updated = await this.prisma.talentProposal.update({
      where: { id: proposalId },
      data: {
        status: dto.status,
        respondedAt: new Date(),
        responseMessage: dto.responseMessage,
      },
      include: {
        profile: { select: { name: true, email: true, phone: true } },
        senderTenant: { select: { name: true } },
      },
    });

    // Send email notification to the business owner
    try {
      const owner = await this.prisma.user.findFirst({
        where: { tenantId: updated.senderTenantId, role: 'OWNER' },
        select: { email: true, name: true },
      });
      if (owner?.email) {
        // Include contact info when accepted
        const contactInfo = dto.status === 'ACCEPTED'
          ? { email: profile.email, phone: profile.phone }
          : undefined;
        await this.emailNotificationsService.sendProposalResponseEmail(
          owner.email,
          owner.name,
          updated.profile.name,
          updated.role,
          dto.status as 'ACCEPTED' | 'REJECTED',
          dto.responseMessage,
          contactInfo,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send proposal response email: ${error}`);
    }

    return updated;
  }
}
