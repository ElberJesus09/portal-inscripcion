import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSql } from '@/lib/db';
import { parsePaymentsFile, type PaymentSource } from '@/lib/payments';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ message: 'Sesión no autorizada.' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const source = formData.get('source');
    if (!(file instanceof File) || !['BANCO_NACION', 'PAGALO_PE'].includes(String(source))) {
      return NextResponse.json({ message: 'Selecciona un archivo y su origen.' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'El archivo supera el límite de 10 MB.' }, { status: 413 });
    }

    const { payments, errors, totalRows } = parsePaymentsFile(await file.text(), source as PaymentSource);
    if (!payments.length) {
      return NextResponse.json({ message: errors[0] || 'El archivo no contiene pagos válidos.' }, { status: 400 });
    }

    const sql = getSql();
    let imported = 0;
    let existing = 0;
    const queries = payments.map((payment) => sql`
        INSERT INTO payments (
          source_key, document_type, document_number, source, voucher, agency,
          payment_date, payment_time, amount, student_name, concept,
          source_status, source_row, status
        ) VALUES (
          ${payment.sourceKey}, ${payment.documentType}, ${payment.documentNumber}, ${source},
          ${payment.voucher}, ${payment.agency}, ${payment.paymentDate}::date,
          ${payment.paymentTime}, ${payment.amount}, ${payment.studentName}, ${payment.concept},
          ${payment.sourceStatus}, ${payment.sourceRow}::jsonb, 'IMPORTADO'
        )
        ON CONFLICT (source_key) DO NOTHING
        RETURNING id
      `);
    for (let index = 0; index < queries.length; index += 100) {
      const results = await sql.transaction(queries.slice(index, index + 100));
      for (const result of results) {
        if (result.length) imported += 1;
        else existing += 1;
      }
    }

    const rejected = totalRows - payments.length;
    return NextResponse.json({
      message: `${imported} pago${imported === 1 ? '' : 's'} importado${imported === 1 ? '' : 's'}, ${existing} ya existente${existing === 1 ? '' : 's'}${rejected ? ` y ${rejected} fila${rejected === 1 ? '' : 's'} omitida${rejected === 1 ? '' : 's'}` : ''}.`,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    console.error('Payment import failed', error);
    return NextResponse.json({ message: 'No se pudo importar el archivo. Revisa su formato y la conexión con Neon.' }, { status: 500 });
  }
}
