import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SorteoService } from './sorteo.service';
import { CreateSorteoDto } from './dto/create-sorteo.dto';

@ApiTags('sorteos')
@Controller('loyalty/sorteos')
@ApiBearerAuth()
export class SorteoController {
  constructor(private readonly sorteoService: SorteoService) {}

  @Get()
  @ApiOperation({ summary: 'List sorteos' })
  async getSorteos(@CurrentUser() user: any) {
    return this.sorteoService.getSorteos(user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create sorteo' })
  async createSorteo(@CurrentUser() user: any, @Body() dto: CreateSorteoDto) {
    return this.sorteoService.createSorteo(user.tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sorteo detail' })
  async getSorteo(@CurrentUser() user: any, @Param('id') id: string) {
    return this.sorteoService.getSorteo(user.tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sorteo' })
  async updateSorteo(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: Partial<CreateSorteoDto>) {
    return this.sorteoService.updateSorteo(user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sorteo (draft only)' })
  async deleteSorteo(@CurrentUser() user: any, @Param('id') id: string) {
    return this.sorteoService.deleteSorteo(user.tenantId, id);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate sorteo' })
  async activateSorteo(@CurrentUser() user: any, @Param('id') id: string) {
    return this.sorteoService.activateSorteo(user.tenantId, id);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Get sorteo participants' })
  async getParticipants(@CurrentUser() user: any, @Param('id') id: string) {
    return this.sorteoService.getParticipants(user.tenantId, id);
  }

  @Get(':id/draw-status')
  @ApiOperation({ summary: 'Get draw status for each prize' })
  async getDrawStatus(@CurrentUser() user: any, @Param('id') id: string) {
    return this.sorteoService.getDrawStatus(user.tenantId, id);
  }

  @Post(':id/draw')
  @ApiOperation({ summary: 'Draw winner for a specific prize' })
  async drawWinner(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { prizeIndex?: number },
  ) {
    return this.sorteoService.drawWinner(user.tenantId, id, body?.prizeIndex);
  }
}
