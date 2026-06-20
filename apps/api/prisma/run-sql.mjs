// Ejecuta un archivo .sql contra la BD usando Prisma.
// Uso: `node prisma/run-sql.mjs <archivo.sql>` (relativo a prisma/).
//
// Por qué un splitter: prisma.$executeRawUnsafe no admite múltiples sentencias
// en una sola llamada. Dividimos el script en sentencias respetando el
// dollar-quoting de Postgres ($$ ... $$ y $tag$ ... $tag$), donde los `;`
// internos NO son separadores.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Divide SQL en sentencias, ignorando `;` dentro de strings/comentarios/$$. */
export function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let i = 0;
  const n = sql.length;
  let inSingle = false; // '...'
  let inLineComment = false; // -- ...
  let inBlockComment = false; // /* ... */
  let dollarTag = null; // p.ej. '$$' o '$func$'

  while (i < n) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      current += ch;
      if (ch === '\n') inLineComment = false;
      i++;
      continue;
    }
    if (inBlockComment) {
      current += ch;
      if (ch === '*' && next === '/') {
        current += next;
        i += 2;
        inBlockComment = false;
        continue;
      }
      i++;
      continue;
    }
    if (inSingle) {
      current += ch;
      if (ch === "'") inSingle = false;
      i++;
      continue;
    }
    if (dollarTag) {
      if (sql.startsWith(dollarTag, i)) {
        current += dollarTag;
        i += dollarTag.length;
        dollarTag = null;
        continue;
      }
      current += ch;
      i++;
      continue;
    }

    // Fuera de cualquier contexto especial.
    if (ch === '-' && next === '-') {
      inLineComment = true;
      current += ch;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      current += ch;
      i++;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      current += ch;
      i++;
      continue;
    }
    if (ch === '$') {
      // ¿Apertura de dollar-quote? $tag$ donde tag es [A-Za-z0-9_]*
      const match = /^\$[A-Za-z0-9_]*\$/.exec(sql.slice(i));
      if (match) {
        dollarTag = match[0];
        current += dollarTag;
        i += dollarTag.length;
        continue;
      }
    }
    if (ch === ';') {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      i++;
      continue;
    }
    current += ch;
    i++;
  }
  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node prisma/run-sql.mjs <archivo.sql>');
    process.exit(1);
  }
  const path = isAbsolute(file) ? file : join(__dirname, file);
  const sql = readFileSync(path, 'utf8');
  const statements = splitSqlStatements(sql);

  const prisma = new PrismaClient();
  try {
    console.log(`[sql] Ejecutando ${statements.length} sentencias de ${file}...`);
    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt);
    }
    console.log(`[sql] OK: ${file} aplicado.`);
  } finally {
    await prisma.$disconnect();
  }
}

// Solo ejecuta si se invoca directamente (no al importar para tests).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error('[sql] Error:', err);
    process.exit(1);
  });
}
