import { createHash } from 'node:crypto';
import { parse } from 'csv-parse/sync';

export type PaymentSource = 'BANCO_NACION' | 'PAGALO_PE';

export type ImportedPayment = {
  sourceKey: string;
  documentType: 'DNI' | 'CE_CI';
  documentNumber: string;
  voucher: string;
  agency: string | null;
  paymentDate: string;
  paymentTime: string | null;
  amount: string | null;
  studentName: string;
  concept: string;
  sourceStatus: string | null;
  sourceRow: string;
};

function cell(record: Record<string, string>, ...names: string[]) {
  for (const name of names) {
    const key = Object.keys(record).find((candidate) => candidate.trim().toUpperCase() === name.toUpperCase());
    if (key && record[key] != null) return String(record[key]).trim();
  }
  return '';
}

function delimiterFor(text: string) {
  const first = text.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0] || '';
  const options = ['\t', ';', ','];
  return options.sort((a, b) => first.split(b).length - first.split(a).length)[0];
}

function isoDate(value: string) {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return '';
  return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

export function parsePaymentsFile(text: string, source: PaymentSource) {
  const rows = parse(text, {
    bom: true,
    columns: true,
    delimiter: delimiterFor(text),
    skip_empty_lines: true,
    relax_column_count: true,
    trim: false,
  }) as Record<string, string>[];

  const payments: ImportedPayment[] = [];
  const errors: string[] = [];

  rows.forEach((record, index) => {
    const typeName = cell(record, 'NOMBRE_TDOC', 'TIPO_DOCUMENTO', 'TIPO DOC');
    const documentType = typeName.toUpperCase().includes('DNI') ? 'DNI' : 'CE_CI';
    const rawDocument = cell(record, 'DOCUMENTO', 'NUMERO_DOCUMENTO', 'NRO_DOCUMENTO');
    const digits = rawDocument.replace(/\D/g, '');
    const documentNumber = documentType === 'DNI' ? digits.slice(0, 8) : rawDocument.trim().toUpperCase();
    const voucher = cell(record, 'VOUCHER', 'SECUENCIA', 'NRO_VOUCHER');
    const paymentDate = isoDate(cell(record, 'FECHA_PAGO', 'FECHA'));
    const agency = source === 'BANCO_NACION' ? cell(record, 'AGE.', 'AGENCIA', 'AGE') : null;
    const studentName = cell(record, 'APELLIDOS_NOMBRES', 'NOMBRES', 'ALUMNO');
    const concept = cell(record, 'CONCEPTO_PAGO', 'CONCEPTO');

    const missing = [
      !documentNumber && 'documento',
      !voucher && 'voucher',
      !paymentDate && 'fecha',
      source === 'BANCO_NACION' && !agency && 'agencia',
    ].filter(Boolean);

    if (missing.length) {
      errors.push(`Fila ${index + 2}: falta ${missing.join(', ')}.`);
      return;
    }

    const identity = [source, documentType, documentNumber, voucher, agency || '', paymentDate].join('|');
    payments.push({
      sourceKey: createHash('sha256').update(identity).digest('hex'),
      documentType,
      documentNumber,
      voucher,
      agency,
      paymentDate,
      paymentTime: cell(record, 'HORA') || null,
      amount: cell(record, 'IMPORTE_S/.', 'IMPORTE', 'MONTO') || null,
      studentName,
      concept,
      sourceStatus: cell(record, 'SITUACION', 'ESTADO') || null,
      sourceRow: JSON.stringify(record),
    });
  });

  return { payments, errors, totalRows: rows.length };
}
