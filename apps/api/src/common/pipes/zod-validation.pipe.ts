import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

/**
 * Valida y parsea el payload con un schema de Zod (los de @menubit/shared).
 * Uso: `@Body(new ZodValidationPipe(createTenantSchema)) dto: CreateTenantInput`.
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new BadRequestException({
          message: err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`),
          error: 'Validation failed',
          statusCode: 400,
        });
      }
      throw err;
    }
  }
}
