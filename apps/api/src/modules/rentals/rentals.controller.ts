import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireAnyFeature } from '../../common/decorators/require-feature.decorator';
import { RentalsService } from './rentals.service';
import {
  CreatePropertyOwnerDto,
  CreateRentalPropertyDto,
  CreateRentalTenantDto,
  CreateRentalContractDto,
  CreateRentalPaymentDto,
  MarkPaymentDto,
  CreateContractAdjustmentDto,
  CreatePropertyExpenseDto,
  CreateOwnerLiquidationDto,
  MarkLiquidationPaidDto,
} from './dto';
import { PartialType } from '@nestjs/swagger';

class UpdatePropertyOwnerDto extends PartialType(CreatePropertyOwnerDto) {}
class UpdateRentalPropertyDto extends PartialType(CreateRentalPropertyDto) {}
class UpdateRentalTenantDto extends PartialType(CreateRentalTenantDto) {}
class UpdateRentalContractDto extends PartialType(CreateRentalContractDto) {}
class UpdatePropertyExpenseDto extends PartialType(CreatePropertyExpenseDto) {}

@ApiTags('rentals')
@ApiBearerAuth()
@RequireAnyFeature('rental_management')
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  // ============ STATS ============

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard stats de alquileres' })
  getStats(@CurrentUser() user: any) {
    return this.rentalsService.getStats(user.tenantId);
  }

  @Get('adjustments/upcoming')
  @ApiOperation({ summary: 'Próximos ajustes de contrato' })
  getUpcomingAdjustments(@CurrentUser() user: any) {
    return this.rentalsService.getUpcomingAdjustments(user.tenantId);
  }

  // ============ PROPERTY OWNERS ============

  @Get('owners')
  @ApiOperation({ summary: 'Listar propietarios' })
  findAllOwners(@CurrentUser() user: any) {
    return this.rentalsService.findAllOwners(user.tenantId);
  }

  @Get('owners/:id')
  @ApiOperation({ summary: 'Detalle de propietario' })
  findOwner(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rentalsService.findOwnerById(user.tenantId, id);
  }

  @Post('owners')
  @ApiOperation({ summary: 'Crear propietario' })
  createOwner(@CurrentUser() user: any, @Body() dto: CreatePropertyOwnerDto) {
    return this.rentalsService.createOwner(user.tenantId, dto);
  }

  @Put('owners/:id')
  @ApiOperation({ summary: 'Actualizar propietario' })
  updateOwner(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdatePropertyOwnerDto) {
    return this.rentalsService.updateOwner(user.tenantId, id, dto);
  }

  @Delete('owners/:id')
  @ApiOperation({ summary: 'Eliminar propietario' })
  deleteOwner(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rentalsService.deleteOwner(user.tenantId, id);
  }

  // ============ RENTAL PROPERTIES ============

  @Get('properties')
  @ApiOperation({ summary: 'Listar propiedades' })
  findAllProperties(@CurrentUser() user: any, @Query('ownerId') ownerId?: string, @Query('status') status?: string) {
    return this.rentalsService.findAllProperties(user.tenantId, { ownerId, status });
  }

  @Get('properties/:id')
  @ApiOperation({ summary: 'Detalle de propiedad' })
  findProperty(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rentalsService.findPropertyById(user.tenantId, id);
  }

  @Post('properties')
  @ApiOperation({ summary: 'Crear propiedad' })
  createProperty(@CurrentUser() user: any, @Body() dto: CreateRentalPropertyDto) {
    return this.rentalsService.createProperty(user.tenantId, dto);
  }

  @Put('properties/:id')
  @ApiOperation({ summary: 'Actualizar propiedad' })
  updateProperty(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateRentalPropertyDto) {
    return this.rentalsService.updateProperty(user.tenantId, id, dto);
  }

  @Delete('properties/:id')
  @ApiOperation({ summary: 'Eliminar propiedad' })
  deleteProperty(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rentalsService.deleteProperty(user.tenantId, id);
  }

  // ============ RENTAL TENANTS ============

  @Get('tenants')
  @ApiOperation({ summary: 'Listar inquilinos' })
  findAllTenants(@CurrentUser() user: any) {
    return this.rentalsService.findAllTenants(user.tenantId);
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Detalle de inquilino' })
  findTenant(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rentalsService.findTenantById(user.tenantId, id);
  }

  @Post('tenants')
  @ApiOperation({ summary: 'Crear inquilino' })
  createTenant(@CurrentUser() user: any, @Body() dto: CreateRentalTenantDto) {
    return this.rentalsService.createTenant(user.tenantId, dto);
  }

  @Put('tenants/:id')
  @ApiOperation({ summary: 'Actualizar inquilino' })
  updateTenant(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateRentalTenantDto) {
    return this.rentalsService.updateTenant(user.tenantId, id, dto);
  }

  @Delete('tenants/:id')
  @ApiOperation({ summary: 'Eliminar inquilino' })
  deleteTenant(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rentalsService.deleteTenant(user.tenantId, id);
  }

  // ============ CONTRACTS ============

  @Get('contracts')
  @ApiOperation({ summary: 'Listar contratos' })
  findAllContracts(@CurrentUser() user: any, @Query('status') status?: string, @Query('propertyId') propertyId?: string) {
    return this.rentalsService.findAllContracts(user.tenantId, { status, propertyId });
  }

  @Get('contracts/:id')
  @ApiOperation({ summary: 'Detalle de contrato' })
  findContract(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rentalsService.findContractById(user.tenantId, id);
  }

  @Post('contracts')
  @ApiOperation({ summary: 'Crear contrato' })
  createContract(@CurrentUser() user: any, @Body() dto: CreateRentalContractDto) {
    return this.rentalsService.createContract(user.tenantId, dto);
  }

  @Put('contracts/:id')
  @ApiOperation({ summary: 'Actualizar contrato' })
  updateContract(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateRentalContractDto) {
    return this.rentalsService.updateContract(user.tenantId, id, dto);
  }

  @Post('contracts/:id/terminate')
  @ApiOperation({ summary: 'Terminar contrato' })
  terminateContract(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rentalsService.terminateContract(user.tenantId, id);
  }

  // ============ PAYMENTS ============

  @Get('payments/dashboard')
  @ApiOperation({ summary: 'Dashboard de pagos del mes' })
  paymentDashboard(@CurrentUser() user: any, @Query('year') year?: string, @Query('month') month?: string) {
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    return this.rentalsService.getPaymentDashboard(user.tenantId, y, m);
  }

  @Get('contracts/:contractId/payments')
  @ApiOperation({ summary: 'Pagos de un contrato' })
  findPayments(@CurrentUser() user: any, @Param('contractId') contractId: string) {
    return this.rentalsService.findPaymentsByContract(user.tenantId, contractId);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Crear pago manual' })
  createPayment(@CurrentUser() user: any, @Body() dto: CreateRentalPaymentDto) {
    return this.rentalsService.createPayment(user.tenantId, dto);
  }

  @Post('payments/:id/mark')
  @ApiOperation({ summary: 'Marcar pago como cobrado' })
  markPayment(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: MarkPaymentDto) {
    return this.rentalsService.markPayment(user.tenantId, id, dto);
  }

  // ============ ADJUSTMENTS ============

  @Get('contracts/:contractId/adjustments')
  @ApiOperation({ summary: 'Historial de ajustes de un contrato' })
  findAdjustments(@CurrentUser() user: any, @Param('contractId') contractId: string) {
    return this.rentalsService.findAdjustmentsByContract(user.tenantId, contractId);
  }

  @Post('adjustments')
  @ApiOperation({ summary: 'Crear ajuste de contrato (ICL/IPC)' })
  createAdjustment(@CurrentUser() user: any, @Body() dto: CreateContractAdjustmentDto) {
    return this.rentalsService.createAdjustment(user.tenantId, dto);
  }

  // ============ EXPENSES ============

  @Get('expenses')
  @ApiOperation({ summary: 'Listar gastos de inmuebles' })
  findAllExpenses(@CurrentUser() user: any, @Query('propertyId') propertyId?: string, @Query('contractId') contractId?: string) {
    return this.rentalsService.findAllExpenses(user.tenantId, { propertyId, contractId });
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Crear gasto de inmueble' })
  createExpense(@CurrentUser() user: any, @Body() dto: CreatePropertyExpenseDto) {
    return this.rentalsService.createExpense(user.tenantId, dto);
  }

  @Put('expenses/:id')
  @ApiOperation({ summary: 'Actualizar gasto' })
  updateExpense(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdatePropertyExpenseDto) {
    return this.rentalsService.updateExpense(user.tenantId, id, dto);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Eliminar gasto' })
  deleteExpense(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rentalsService.deleteExpense(user.tenantId, id);
  }

  // ============ LIQUIDATIONS ============

  @Get('liquidations/owner/:ownerId')
  @ApiOperation({ summary: 'Liquidaciones de un propietario' })
  findLiquidations(@CurrentUser() user: any, @Param('ownerId') ownerId: string) {
    return this.rentalsService.findLiquidationsByOwner(user.tenantId, ownerId);
  }

  @Get('liquidations/:id')
  @ApiOperation({ summary: 'Detalle de liquidación' })
  findLiquidation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rentalsService.findLiquidationById(user.tenantId, id);
  }

  @Post('liquidations')
  @ApiOperation({ summary: 'Generar liquidación mensual' })
  generateLiquidation(@CurrentUser() user: any, @Body() dto: CreateOwnerLiquidationDto) {
    return this.rentalsService.generateLiquidation(user.tenantId, dto);
  }

  @Post('liquidations/:id/paid')
  @ApiOperation({ summary: 'Marcar liquidación como pagada' })
  markLiquidationPaid(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: MarkLiquidationPaidDto) {
    return this.rentalsService.markLiquidationPaid(user.tenantId, id, dto);
  }
}
