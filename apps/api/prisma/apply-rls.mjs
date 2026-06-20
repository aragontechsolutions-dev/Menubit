// Aplica las políticas RLS (prisma/rls.sql) usando la conexión DIRECTA.
// Uso: `node prisma/apply-rls.mjs` (requiere DIRECT_URL en el entorno).
// Se ejecuta después de `prisma migrate deploy`.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const sql = readFileSync(join(__dirname, 'rls.sql'), 'utf8');
  const prisma = new PrismaClient();
  try {
    console.log('[rls] Aplicando políticas RLS...');
    await prisma.$executeRawUnsafe(sql);
    console.log('[rls] Políticas RLS aplicadas correctamente.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[rls] Error aplicando RLS:', err);
  process.exit(1);
});
