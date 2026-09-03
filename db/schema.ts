import { sql } from 'drizzle-orm';
import { bigserial, check, date, index, jsonb, numeric, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const payments = pgTable(
  'payments',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    sourceKey: text('source_key').notNull(),
    documentType: text('document_type').notNull(),
    documentNumber: text('document_number').notNull(),
    source: text('source').notNull(),
    voucher: text('voucher').notNull(),
    agency: text('agency'),
    paymentDate: date('payment_date').notNull(),
    paymentTime: text('payment_time'),
    amount: numeric('amount', { precision: 12, scale: 2 }),
    studentName: text('student_name').notNull().default(''),
    concept: text('concept').notNull().default(''),
    sourceStatus: text('source_status'),
    sourceRow: jsonb('source_row').$type<Record<string, string>>(),
    status: text('status').notNull().default('IMPORTADO'),
    importedAt: timestamp('imported_at', { withTimezone: true }).notNull().defaultNow(),
    usedAt: timestamp('used_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('payments_source_key_unique').on(table.sourceKey),
    check('payments_document_type_check', sql`${table.documentType} IN ('DNI', 'CE_CI')`),
    check('payments_source_check', sql`${table.source} IN ('BANCO_NACION', 'PAGALO_PE')`),
    check('payments_status_check', sql`${table.status} IN ('IMPORTADO', 'UTILIZADO')`),
    check('payments_bank_requires_agency_check', sql`${table.source} <> 'BANCO_NACION' OR ${table.agency} IS NOT NULL`),
    index('payments_bank_validation_idx')
      .on(table.documentType, table.documentNumber, table.paymentDate, table.voucher, table.agency)
      .where(sql`${table.status} = 'IMPORTADO' AND ${table.usedAt} IS NULL AND ${table.source} = 'BANCO_NACION'`),
    index('payments_pagalo_validation_idx')
      .on(table.documentType, table.documentNumber, table.paymentDate, sql`RIGHT(${table.voucher}, 7)`)
      .where(sql`${table.status} = 'IMPORTADO' AND ${table.usedAt} IS NULL AND ${table.source} = 'PAGALO_PE'`),
    index('payments_imported_at_idx').on(table.importedAt),
  ],
);
