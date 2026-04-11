import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailNotificationsService } from '../notifications/email-notifications.service';
import { PushService } from '../push/push.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { BrowseJobPostingsDto } from './dto/browse-job-postings.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { RespondJobApplicationDto } from './dto/respond-job-application.dto';

@Injectable()
export class JobPostingsService {
  private readonly logger = new Logger(JobPostingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailNotificationsService,
    private readonly pushService: PushService,
  ) {}

  // ============ BUSINESS: CREATE POSTING ============

  async createPosting(tenantId: string, userId: string, dto: CreateJobPostingDto) {
    // Check max 20 open postings
    const openCount = await this.prisma.jobPosting.count({
      where: { tenantId, status: 'OPEN' },
    });
    if (openCount >= 20) {
      throw new BadRequestException('Máximo 20 ofertas abiertas simultáneamente');
    }

    const posting = await this.prisma.jobPosting.create({
      data: {
        tenantId,
        createdByUserId: userId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        requiredSkills: dto.requiredSkills || '[]',
        availability: dto.availability,
        minExperience: dto.minExperience,
        zone: dto.zone,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        salaryCurrency: dto.salaryCurrency || 'ARS',
        salaryPeriod: dto.salaryPeriod,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        maxApplications: dto.maxApplications,
      },
    });

    // Async: notify matching professionals
    this.notifyMatchingProfessionals(posting).catch((err) => {
      this.logger.error('Error notifying matching professionals', err);
    });

    return posting;
  }

  // ============ BUSINESS: LIST MY POSTINGS ============

  async getMyPostings(tenantId: string) {
    const postings = await this.prisma.jobPosting.findMany({
      where: { tenantId },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return postings.map((p) => ({
      ...p,
      requiredSkills: this.parseJsonField(p.requiredSkills),
      applicationCount: p._count.applications,
      _count: undefined,
    }));
  }

  // ============ BUSINESS: GET POSTING DETAIL ============

  async getMyPosting(tenantId: string, postingId: string) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id: postingId, tenantId },
      include: {
        _count: { select: { applications: true } },
      },
    });

    if (!posting) {
      throw new NotFoundException('Oferta no encontrada');
    }

    return {
      ...posting,
      requiredSkills: this.parseJsonField(posting.requiredSkills),
      applicationCount: posting._count.applications,
      _count: undefined,
    };
  }

  // ============ BUSINESS: UPDATE POSTING ============

  async updatePosting(tenantId: string, postingId: string, dto: UpdateJobPostingDto) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id: postingId, tenantId },
    });

    if (!posting) {
      throw new NotFoundException('Oferta no encontrada');
    }

    if (posting.status === 'CLOSED') {
      throw new BadRequestException('No se puede editar una oferta cerrada');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.requiredSkills !== undefined) data.requiredSkills = dto.requiredSkills;
    if (dto.availability !== undefined) data.availability = dto.availability;
    if (dto.minExperience !== undefined) data.minExperience = dto.minExperience;
    if (dto.zone !== undefined) data.zone = dto.zone;
    if (dto.salaryMin !== undefined) data.salaryMin = dto.salaryMin;
    if (dto.salaryMax !== undefined) data.salaryMax = dto.salaryMax;
    if (dto.salaryCurrency !== undefined) data.salaryCurrency = dto.salaryCurrency;
    if (dto.salaryPeriod !== undefined) data.salaryPeriod = dto.salaryPeriod;
    if (dto.deadline !== undefined) data.deadline = dto.deadline ? new Date(dto.deadline) : null;
    if (dto.maxApplications !== undefined) data.maxApplications = dto.maxApplications;

    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'CLOSED') {
        data.closedAt = new Date();
      }
    }

    return this.prisma.jobPosting.update({
      where: { id: postingId },
      data,
    });
  }

  // ============ BUSINESS: DELETE (CLOSE) POSTING ============

  async deletePosting(tenantId: string, postingId: string) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id: postingId, tenantId },
    });

    if (!posting) {
      throw new NotFoundException('Oferta no encontrada');
    }

    return this.prisma.jobPosting.update({
      where: { id: postingId },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  // ============ BUSINESS: GET APPLICATIONS FOR POSTING ============

  async getApplications(tenantId: string, postingId: string) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id: postingId, tenantId },
    });

    if (!posting) {
      throw new NotFoundException('Oferta no encontrada');
    }

    const applications = await this.prisma.jobApplication.findMany({
      where: { postingId },
      include: {
        profile: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            specialty: true,
            category: true,
            headline: true,
            yearsExperience: true,
            skills: true,
            availability: true,
            preferredZones: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((app) => ({
      ...app,
      profile: {
        ...app.profile,
        skills: this.parseJsonField(app.profile.skills),
        preferredZones: this.parseJsonField(app.profile.preferredZones),
        // Only show contact info if ACCEPTED
        email: app.status === 'ACCEPTED' ? app.profile.email : undefined,
        phone: app.status === 'ACCEPTED' ? app.profile.phone : undefined,
      },
    }));
  }

  // ============ BUSINESS: RESPOND TO APPLICATION ============

  async respondToApplication(
    tenantId: string,
    postingId: string,
    applicationId: string,
    dto: RespondJobApplicationDto,
  ) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id: postingId, tenantId },
      include: { tenant: { select: { name: true, email: true, phone: true } } },
    });

    if (!posting) {
      throw new NotFoundException('Oferta no encontrada');
    }

    const application = await this.prisma.jobApplication.findFirst({
      where: { id: applicationId, postingId },
      include: {
        profile: { select: { id: true, name: true, email: true, phone: true, userId: true } },
      },
    });

    if (!application) {
      throw new NotFoundException('Postulación no encontrada');
    }

    if (application.status !== 'PENDING' && application.status !== 'REVIEWED') {
      throw new BadRequestException('Esta postulación ya fue respondida');
    }

    const updated = await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
        respondedAt: new Date(),
        responseMessage: dto.responseMessage,
      },
    });

    // Send email + push to professional
    const contactInfo = dto.status === 'ACCEPTED'
      ? { email: posting.tenant.email || '', phone: posting.tenant.phone }
      : undefined;

    this.emailService.sendJobApplicationResponseEmail(
      application.profile.email,
      application.profile.name,
      posting.tenant.name,
      posting.title,
      dto.status,
      dto.responseMessage,
      contactInfo,
    ).catch((err) => this.logger.error('Error sending application response email', err));

    // Push to professional's tenant (if self-registered)
    if (application.profile.userId) {
      const profUser = await this.prisma.user.findUnique({
        where: { id: application.profile.userId },
        select: { tenantId: true },
      });
      if (profUser?.tenantId) {
        this.pushService.sendToTenant(profUser.tenantId, {
          title: dto.status === 'ACCEPTED' ? 'Postulación aceptada' : 'Respuesta a tu postulación',
          body: `${posting.tenant.name} respondió a tu postulación para "${posting.title}"`,
          url: '/mi-perfil/postulaciones',
          tag: `job-app-response-${applicationId}`,
        }).catch(() => {});
      }
    }

    return updated;
  }

  // ============ BUSINESS: MARK APPLICATION AS VIEWED ============

  async markApplicationViewed(tenantId: string, postingId: string, applicationId: string) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id: postingId, tenantId },
    });

    if (!posting) {
      throw new NotFoundException('Oferta no encontrada');
    }

    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        viewedAt: new Date(),
        status: 'REVIEWED',
      },
    });
  }

  // ============ PROFESSIONAL: BROWSE POSTINGS ============

  async browsePostings(userId: string, filters: BrowseJobPostingsDto) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'OPEN',
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } },
      ],
    };

    if (filters.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.availability) {
      where.availability = filters.availability;
    }

    if (filters.zone) {
      where.zone = { contains: filters.zone, mode: 'insensitive' };
    }

    if (filters.maxExperienceRequired !== undefined) {
      where.OR = [
        { minExperience: null },
        { minExperience: { lte: filters.maxExperienceRequired } },
      ];
    }

    if (filters.skills) {
      where.requiredSkills = { contains: filters.skills, mode: 'insensitive' };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filters.sortBy === 'salary') {
      orderBy = { salaryMax: 'desc' };
    } else if (filters.sortBy === 'deadline') {
      orderBy = { deadline: 'asc' };
    }

    // Get professional's profile to check hasApplied
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
      select: { id: true },
    });

    const [postings, total] = await Promise.all([
      this.prisma.jobPosting.findMany({
        where,
        include: {
          tenant: { select: { id: true, name: true, logo: true, city: true } },
          _count: { select: { applications: true } },
          ...(profile ? {
            applications: {
              where: { profileId: profile.id },
              select: { id: true },
              take: 1,
            },
          } : {}),
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.jobPosting.count({ where }),
    ]);

    return {
      data: postings.map((p) => ({
        id: p.id,
        tenantId: p.tenantId,
        tenant: p.tenant,
        title: p.title,
        description: p.description,
        category: p.category,
        requiredSkills: this.parseJsonField(p.requiredSkills),
        availability: p.availability,
        minExperience: p.minExperience,
        zone: p.zone,
        salaryMin: p.salaryMin,
        salaryMax: p.salaryMax,
        salaryCurrency: p.salaryCurrency,
        salaryPeriod: p.salaryPeriod,
        deadline: p.deadline,
        maxApplications: p.maxApplications,
        status: p.status,
        applicationCount: p._count.applications,
        hasApplied: profile ? (p as any).applications?.length > 0 : false,
        createdAt: p.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============ PROFESSIONAL: GET POSTING DETAIL ============

  async getPostingDetail(userId: string, postingId: string) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id: postingId, status: 'OPEN' },
      include: {
        tenant: { select: { id: true, name: true, logo: true, city: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!posting) {
      throw new NotFoundException('Oferta no encontrada');
    }

    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
      select: { id: true },
    });

    let hasApplied = false;
    if (profile) {
      const existingApp = await this.prisma.jobApplication.findUnique({
        where: { postingId_profileId: { postingId, profileId: profile.id } },
      });
      hasApplied = !!existingApp;
    }

    return {
      ...posting,
      requiredSkills: this.parseJsonField(posting.requiredSkills),
      applicationCount: posting._count.applications,
      hasApplied,
      _count: undefined,
    };
  }

  // ============ PROFESSIONAL: APPLY ============

  async applyToPosting(userId: string, postingId: string, dto: CreateJobApplicationDto) {
    // Find professional's profile
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
    });

    if (!profile) {
      throw new BadRequestException('Debés crear tu perfil profesional antes de postularte');
    }

    // Find posting
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id: postingId },
      include: {
        tenant: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!posting) {
      throw new NotFoundException('Oferta no encontrada');
    }

    if (posting.status !== 'OPEN') {
      throw new BadRequestException('Esta oferta ya no está disponible');
    }

    if (posting.deadline && posting.deadline < new Date()) {
      throw new BadRequestException('El plazo de esta oferta ha vencido');
    }

    if (posting.maxApplications && posting._count.applications >= posting.maxApplications) {
      throw new BadRequestException('Esta oferta alcanzó el máximo de postulaciones');
    }

    // Check unique constraint (1 per posting per profile)
    const existing = await this.prisma.jobApplication.findUnique({
      where: { postingId_profileId: { postingId, profileId: profile.id } },
    });

    if (existing) {
      throw new ConflictException('Ya te postulaste a esta oferta');
    }

    // Check daily limit (10 per day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayApps = await this.prisma.jobApplication.count({
      where: {
        profileId: profile.id,
        createdAt: { gte: todayStart },
      },
    });

    if (todayApps >= 10) {
      throw new BadRequestException('Máximo 10 postulaciones por día');
    }

    const application = await this.prisma.jobApplication.create({
      data: {
        postingId,
        profileId: profile.id,
        message: dto.message,
        availability: dto.availability,
      },
    });

    // Notify business: email + push
    const tenantOwner = await this.prisma.user.findFirst({
      where: { tenantId: posting.tenantId, role: 'OWNER' },
      select: { email: true, name: true },
    });

    if (tenantOwner) {
      this.emailService.sendJobApplicationReceivedEmail(
        tenantOwner.email,
        tenantOwner.name,
        profile.name,
        posting.title,
        posting.id,
      ).catch((err) => this.logger.error('Error sending application received email', err));
    }

    this.pushService.sendToTenant(posting.tenantId, {
      title: 'Nueva postulación',
      body: `${profile.name} se postuló a "${posting.title}"`,
      url: `/talento/ofertas/${posting.id}`,
      tag: `job-app-${application.id}`,
    }).catch(() => {});

    return application;
  }

  // ============ PROFESSIONAL: MY APPLICATIONS ============

  async getMyApplications(userId: string) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return [];
    }

    const applications = await this.prisma.jobApplication.findMany({
      where: { profileId: profile.id },
      include: {
        posting: {
          include: {
            tenant: { select: { id: true, name: true, logo: true, city: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((app) => ({
      ...app,
      posting: {
        ...app.posting,
        requiredSkills: this.parseJsonField(app.posting.requiredSkills),
        tenant: {
          id: app.posting.tenant.id,
          name: app.posting.tenant.name,
          logo: app.posting.tenant.logo,
          city: app.posting.tenant.city,
          // Only show contact info if accepted
          email: app.status === 'ACCEPTED' ? app.posting.tenant.email : undefined,
          phone: app.status === 'ACCEPTED' ? app.posting.tenant.phone : undefined,
        },
      },
    }));
  }

  // ============ PROFESSIONAL: WITHDRAW APPLICATION ============

  async withdrawApplication(userId: string, applicationId: string) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const application = await this.prisma.jobApplication.findFirst({
      where: { id: applicationId, profileId: profile.id },
    });

    if (!application) {
      throw new NotFoundException('Postulación no encontrada');
    }

    if (application.status !== 'PENDING' && application.status !== 'REVIEWED') {
      throw new BadRequestException('No se puede retirar una postulación ya respondida');
    }

    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' },
    });
  }

  // ============ SMART MATCHING: NOTIFY PROFESSIONALS ============

  private async notifyMatchingProfessionals(posting: any) {
    const where: any = {
      profileVisible: true,
      openToWork: true,
      category: posting.category,
    };

    // Filter by zone if specified
    if (posting.zone) {
      // Include professionals whose preferredZones contain the posting zone, or who have no zones
      where.OR = [
        { preferredZones: { contains: posting.zone } },
        { preferredZones: '[]' },
      ];
    }

    const professionals = await this.prisma.professionalProfile.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        userId: true,
      },
      take: 100,
    });

    if (professionals.length === 0) return;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: posting.tenantId },
      select: { name: true },
    });

    const businessName = tenant?.name || 'Un negocio';

    for (const prof of professionals) {
      // Send email
      this.emailService.sendNewJobPostingMatchEmail(
        prof.email,
        prof.name,
        businessName,
        posting.title,
        posting.id,
      ).catch((err) => this.logger.error(`Error sending match email to ${prof.email}`, err));

      // Send push to self-registered professionals
      if (prof.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: prof.userId },
          select: { tenantId: true },
        });
        if (user?.tenantId) {
          this.pushService.sendToTenant(user.tenantId, {
            title: `${businessName} busca:`,
            body: posting.title,
            url: '/mi-perfil/ofertas',
            tag: `job-match-${posting.id}`,
          }).catch(() => {});
        }
      }
    }

    this.logger.log(`Notified ${professionals.length} matching professionals for posting ${posting.id}`);
  }

  // ============ HELPERS ============

  private parseJsonField(value: string): string[] {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
