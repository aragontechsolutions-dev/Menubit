import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { verifyAuthSchema } from '@menubit/shared';
import type { JwtClaims } from '@menubit/shared';
import { AllowNoTenant, CurrentUser } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AllowNoTenant()
  @Post('verify')
  @ApiOperation({ summary: 'Verifica el JWT de Supabase y sincroniza el usuario local.' })
  verify(
    @CurrentUser() user: JwtClaims,
    @Body(new ZodValidationPipe(verifyAuthSchema)) body: { name?: string },
  ) {
    return this.authService.verifyAndSync(user, body.name);
  }

  @AllowNoTenant()
  @Get('me')
  @ApiOperation({ summary: 'Devuelve el usuario autenticado y su tenant (o null).' })
  me(@CurrentUser('sub') supabaseId: string) {
    return this.authService.me(supabaseId);
  }
}
