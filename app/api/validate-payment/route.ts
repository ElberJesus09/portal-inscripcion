import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSql } from '@/lib/db';
import { createEnrollmentToken } from '@/lib/enrollment-access';

const schema = z.object({
  documentType: z.enum(['DNI', 'CE_CI']),
  documentNumber: z.string().trim().min(1).max(20),
  source: z.enum(['BANCO_NACION', 'PAGALO_PE']),
  voucher: z.string().trim().min(1).max(30),
  agency: z.string().trim().max(10).optional(),
  paymentDate: z.iso.date(),
});

const notFoundMessage = 'No se encontró un pago disponible que coincida con el documento, origen, fecha y voucher o secuencia.';

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, message: notFoundMessage }, { status: 400 });

    const input = parsed.data;
    if (!process.env.SESSION_SECRET) {
      throw new Error('SESSION_SECRET no está configurada.');
    }
    if (input.documentType === 'DNI' && !/^\d{8}$/.test(input.documentNumber)) {
      return NextResponse.json({ ok: false, message: notFoundMessage }, { status: 400 });
    }

    const documentNumber = input.documentNumber.toUpperCase();
    let rows;

    if (input.source === 'BANCO_NACION') {
      if (!input.agency) return NextResponse.json({ ok: false, message: notFoundMessage }, { status: 400 });
      const sql = getSql();
      rows = await sql`
        WITH matches AS (
          SELECT id
          FROM payments
          WHERE document_type = ${input.documentType}
            AND document_number = ${documentNumber}
            AND source = 'BANCO_NACION'
            AND payment_date = ${input.paymentDate}::date
            AND voucher = ${input.voucher}
            AND agency = ${input.agency}
            AND status = 'IMPORTADO'
            AND used_at IS NULL
          ORDER BY id
          LIMIT 2
          FOR UPDATE SKIP LOCKED
        ), single_match AS (
          SELECT MIN(id) AS id FROM matches HAVING COUNT(*) = 1
        )
        UPDATE payments AS payment
        SET status = 'UTILIZADO', used_at = NOW()
        FROM single_match
        WHERE payment.id = single_match.id
        RETURNING payment.id, payment.student_name, payment.concept
      `;
    } else {
      const match = input.voucher.match(/^(\d{7})-\d+$/);
      if (!match) return NextResponse.json({ ok: false, message: notFoundMessage }, { status: 400 });
      const sql = getSql();
      rows = await sql`
        WITH matches AS (
          SELECT id
          FROM payments
          WHERE document_type = ${input.documentType}
            AND document_number = ${documentNumber}
            AND source = 'PAGALO_PE'
            AND payment_date = ${input.paymentDate}::date
            AND RIGHT(voucher, 7) = ${match[1]}
            AND status = 'IMPORTADO'
            AND used_at IS NULL
          ORDER BY id
          LIMIT 2
          FOR UPDATE SKIP LOCKED
        ), single_match AS (
          SELECT MIN(id) AS id FROM matches HAVING COUNT(*) = 1
        )
        UPDATE payments AS payment
        SET status = 'UTILIZADO', used_at = NOW()
        FROM single_match
        WHERE payment.id = single_match.id
        RETURNING payment.id, payment.student_name, payment.concept
      `;
    }

    if (rows.length !== 1) return NextResponse.json({ ok: false, message: notFoundMessage }, { status: 404 });
    return NextResponse.json({
      ok: true,
      studentName: rows[0].student_name || 'el alumno',
      concept: rows[0].concept || 'la inscripción',
      accessToken: createEnrollmentToken(rows[0].id),
    });
  } catch (error) {
    console.error('Payment validation failed', error);
    return NextResponse.json({ ok: false, message: 'El servicio no está disponible en este momento. Inténtalo nuevamente.' }, { status: 500 });
  }
}
