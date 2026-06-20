import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateUserInput, UpdateUserInput } from '@menubit/shared';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista los usuarios del tenant actual. */
  list(tenantId: string) {
    return this.prisma.tenantUser.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.tenantUser.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  /**
   * Crea un usuario dentro del tenant. En Fase 0 se registra en la BD local;
   * el alta en Supabase Auth (invitación) se conecta en una fase posterior.
   */
  create(tenantId: string, dto: CreateUserInput) {
    return this.prisma.tenantUser.create({
      data: {
        tenantId,
        // Placeholder hasta vincular con Supabase Auth (invitación por email).
        supabaseId: `pending:${tenantId}:${dto.email}`,
        email: dto.email,
        name: dto.name,
        role: dto.role,
        pin: dto.pin,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateUserInput) {
    await this.findOne(tenantId, id);
    return this.prisma.tenantUser.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string, currentSupabaseId: string) {
    const user = await this.findOne(tenantId, id);
    if (user.supabaseId === currentSupabaseId) {
      throw new ForbiddenException('No puedes eliminar tu propio usuario');
    }
    // Baja lógica (preserva historial de órdenes futuras).
    return this.prisma.tenantUser.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
