import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marca una ruta como pública: omite JwtAuthGuard (ej: /health, /auth/verify). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
