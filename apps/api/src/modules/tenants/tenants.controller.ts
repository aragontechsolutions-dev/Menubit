import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createTenantSchema, type CreateTenantInput, type JwtClaims } from '@menubit/shared';
import { AllowNoTenant, CurrentTenant, CurrentUser } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { TenantsService } from './tenants.service';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @AllowNoTenant()
  @Post()
  @ApiOperation({ summary: 'Onboarding: crea un tenant para el usuario actual (OWNER).' })
  create(
    @CurrentUser() user: JwtClaims,
    @Body(new ZodValidationPipe(createTenantSchema)) dto: CreateTenantInput,
  ) {
    return this.tenantsService.createForUser(user, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Tenant actual con sucursales y módulos activos.' })
  findMe(@CurrentTenant('id') tenantId: string) {
    return this.tenantsService.findCurrent(tenantId);
  }
}
