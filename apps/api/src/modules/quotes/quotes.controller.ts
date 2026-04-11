import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequireAnyFeature } from '../../common/decorators/require-feature.decorator';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteStatusDto, PublicQuoteResponseDto } from './dto/update-quote.dto';

@ApiTags('quotes')
@Controller('quotes')
@ApiBearerAuth()
@RequireAnyFeature('quotes', 'advanced_reports', 'complete_reports', 'finance_module')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar presupuestos del tenant' })
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.quotesService.getQuotes(user.tenantId, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas de presupuestos' })
  async getStats(@CurrentUser() user: any) {
    return this.quotesService.getStats(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de presupuesto' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.quotesService.getQuote(user.tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear presupuesto' })
  async create(@CurrentUser() user: any, @Body() dto: CreateQuoteDto) {
    return this.quotesService.createQuote(user.tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar presupuesto (solo borrador)' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateQuoteDto,
  ) {
    return this.quotesService.updateQuote(user.tenantId, id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Cambiar estado del presupuesto' })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateQuoteStatusDto,
  ) {
    return this.quotesService.updateStatus(user.tenantId, id, dto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar presupuesto (solo borrador)' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.quotesService.deleteQuote(user.tenantId, id);
  }
}

// ─── Public controller (no auth) ─────────────────────────

@ApiTags('quotes-public')
@Controller('public/quotes')
@Public()
export class PublicQuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Ver presupuesto público' })
  async getPublicQuote(@Param('token') token: string) {
    return this.quotesService.getPublicQuote(token);
  }

  @Post(':token/respond')
  @ApiOperation({ summary: 'Responder a presupuesto (aceptar/rechazar)' })
  async respond(
    @Param('token') token: string,
    @Body() dto: PublicQuoteResponseDto,
  ) {
    return this.quotesService.respondToQuote(token, dto.action as 'ACCEPTED' | 'REJECTED');
  }
}
