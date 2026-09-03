'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Building2, Check, CheckCircle2, CreditCard, LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';

type PaymentSource = 'BANCO_NACION' | 'PAGALO_PE';
type Result = { ok: true; studentName: string; concept: string; accessToken: string } | { ok: false; message: string };

export function PaymentValidator() {
  const [source, setSource] = useState<PaymentSource>('BANCO_NACION');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [form, setForm] = useState({ documentType: 'DNI', documentNumber: '', voucher: '', agency: '', paymentDate: '' });

  const sequenceLabel = useMemo(
    () => (source === 'BANCO_NACION' ? 'Número completo del voucher' : 'Secuencia de Págalo.pe'),
    [source],
  );

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: 'start_payment_validation',
          title: 'Preparar validación de pago',
          description: 'Completa los campos visibles con los datos del comprobante sin consumir el pago. La persona revisa y pulsa Validar pago.',
          inputSchema: {
            type: 'object',
            properties: {
              documentType: { type: 'string', enum: ['DNI', 'CE_CI'] },
              documentNumber: { type: 'string' },
              source: { type: 'string', enum: ['BANCO_NACION', 'PAGALO_PE'] },
              voucher: { type: 'string' },
              agency: { type: 'string' },
              paymentDate: { type: 'string', format: 'date' },
            },
            required: ['documentType', 'documentNumber', 'source', 'voucher', 'paymentDate'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute(input: unknown) {
            const values = input as Record<string, string>;
            const nextSource = values.source as PaymentSource;
            setSource(nextSource);
            setForm({
              documentType: values.documentType,
              documentNumber: values.documentNumber,
              voucher: values.voucher,
              agency: nextSource === 'BANCO_NACION' ? values.agency || '' : '',
              paymentDate: values.paymentDate,
            });
            setResult(null);
            return { status: 'ready_for_review' };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  function update(name: keyof typeof form, value: string) {
    setResult(null);
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/validate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source }),
      });
      const data = (await response.json()) as Result;
      setResult(data);
    } catch {
      setResult({ ok: false, message: 'No pudimos conectarnos con el sistema. Inténtalo nuevamente en unos minutos.' });
    } finally {
      setLoading(false);
    }
  }

  if (result?.ok) {
    return (
      <Card className="success-panel">
        <CardContent className="flex min-h-[490px] flex-col items-center justify-center px-7 text-center sm:px-12">
          <div className="success-icon grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
          </div>
          <p className="mt-7 font-heading text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Pago validado</p>
          <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-slate-950">¡Todo está listo!</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
            El pago de <strong>{result.studentName}</strong> fue validado para <strong>{result.concept}</strong> y quedó registrado como utilizado.
          </p>
          <Button className="primary-action mt-8 h-12 w-full max-w-sm text-base" onClick={() => window.location.assign(`/continue?token=${encodeURIComponent(result.accessToken)}`)}>
            Continuar al formulario <ArrowRight aria-hidden="true" />
          </Button>
          <p className="mt-4 text-xs text-slate-500">No cierres esta página hasta abrir el formulario de inscripción.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="validation-form">
      <CardContent className="p-0">
        <form onSubmit={submit} className="space-y-7">
          <fieldset>
            <legend className="field-label">Medio de pago</legend>
            <div className="payment-method-grid mt-2 grid grid-cols-2 gap-3">
              <button type="button" className={`payment-option ${source === 'BANCO_NACION' ? 'payment-option-active' : ''}`} onClick={() => { setSource('BANCO_NACION'); setResult(null); }} aria-pressed={source === 'BANCO_NACION'}>
                <span className="payment-option-icon"><Building2 aria-hidden="true" /></span>
                <span className="min-w-0 text-left"><strong>Banco de la Nación</strong><small>Voucher y agencia</small></span>
                <span className="payment-option-check"><Check aria-hidden="true" /></span>
              </button>
              <button type="button" className={`payment-option ${source === 'PAGALO_PE' ? 'payment-option-active' : ''}`} onClick={() => { setSource('PAGALO_PE'); setResult(null); }} aria-pressed={source === 'PAGALO_PE'}>
                <span className="payment-option-icon"><CreditCard aria-hidden="true" /></span>
                <span className="min-w-0 text-left"><strong>Págalo.pe</strong><small>Secuencia digital</small></span>
                <span className="payment-option-check"><Check aria-hidden="true" /></span>
              </button>
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-[145px_1fr]">
            <label htmlFor="document-type">
              <span className="field-label">Tipo de documento</span>
              <NativeSelect id="document-type" className="mt-2 w-full" value={form.documentType} onChange={(event) => update('documentType', event.target.value)} aria-label="Tipo de documento">
                <NativeSelectOption value="DNI">DNI</NativeSelectOption>
                <NativeSelectOption value="CE_CI">CE / CI</NativeSelectOption>
              </NativeSelect>
            </label>
            <label htmlFor="document-number">
              <span className="field-label">Número de documento</span>
              <Input id="document-number" className="form-control mt-2" inputMode={form.documentType === 'DNI' ? 'numeric' : 'text'} value={form.documentNumber} onChange={(event) => update('documentNumber', event.target.value)} maxLength={20} placeholder={form.documentType === 'DNI' ? 'Ej. 99000002' : 'Número registrado'} required />
            </label>
          </div>

          <div className={`grid gap-4 ${source === 'BANCO_NACION' ? 'sm:grid-cols-[1fr_145px]' : ''}`}>
            <label htmlFor="voucher-number">
              <span className="field-label">{sequenceLabel}</span>
              <Input id="voucher-number" className="form-control mt-2" value={form.voucher} onChange={(event) => update('voucher', event.target.value)} placeholder={source === 'BANCO_NACION' ? 'Ej. 9310003' : 'Ej. 9310001-1'} required />
              {source === 'PAGALO_PE' && <span className="mt-1.5 block text-xs text-slate-500">Incluye el guion y el dígito final.</span>}
            </label>
            {source === 'BANCO_NACION' && (
              <label htmlFor="agency-number">
                <span className="field-label">Agencia</span>
                <Input id="agency-number" className="form-control mt-2" inputMode="numeric" value={form.agency} onChange={(event) => update('agency', event.target.value)} placeholder="Ej. 0248" required maxLength={10} />
              </label>
            )}
          </div>

          <label className="block" htmlFor="payment-date">
            <span className="field-label">Fecha de pago</span>
            <Input id="payment-date" className="form-control mt-2" type="date" value={form.paymentDate} onChange={(event) => update('paymentDate', event.target.value)} required />
          </label>

          {result && !result.ok && (
            <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50 px-4 py-3">
              <AlertTitle>No se pudo validar el pago</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="primary-action h-12 w-full text-base">
            {loading ? <><LoaderCircle className="animate-spin" aria-hidden="true" /> Validando…</> : <>Validar pago <ArrowRight aria-hidden="true" /></>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
