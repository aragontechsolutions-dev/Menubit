import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from '@menubit/shared';
import { CurrentTenant, CurrentUser, Roles } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista los usuarios del tenant.' })
  list(@CurrentTenant('id') tenantId: string) {
    return this.usersService.list(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un usuario del tenant.' })
  findOne(@CurrentTenant('id') tenantId: string, @Param('id') id: string) {
    return this.usersService.findOne(tenantId, id);
  }

  @Roles('OWNER', 'MANAGER')
  @Post()
  @ApiOperation({ summary: 'Crea un usuario en el tenant (OWNER/MANAGER).' })
  create(
    @CurrentTenant('id') tenantId: string,
    @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserInput,
  ) {
    return this.usersService.create(tenantId, dto);
  }

  @Roles('OWNER', 'MANAGER')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un usuario del tenant (OWNER/MANAGER).' })
  update(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserInput,
  ) {
    return this.usersService.update(tenantId, id, dto);
  }

  @Roles('OWNER')
  @Delete(':id')
  @ApiOperation({ summary: 'Desactiva un usuario del tenant (OWNER).' })
  remove(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @CurrentUser('sub') currentSupabaseId: string,
  ) {
    return this.usersService.remove(tenantId, id, currentSupabaseId);
  }
}
