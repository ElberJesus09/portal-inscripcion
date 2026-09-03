'use client';

import { useState } from 'react';
import { FileSpreadsheet, LoaderCircle, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';

export function AdminImporter({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setMessage(''); setIsError(false);
    const data = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/import', { method: 'POST', body: data });
    const result = await response.json();
    setLoading(false);
    setMessage(result.message || 'Importación finalizada.');
    setIsError(!response.ok);
    if (response.ok) router.refresh();
  }

  return (
    <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-700"><UploadCloud className="h-5 w-5" /></div>
        <div><h2 className="font-heading text-lg font-extrabold text-slate-950">Importar pagos</h2><p className="text-sm text-slate-500">Archivo CSV, TXT o TSV</p></div>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-5">
        <label className="block" htmlFor="import-source"><span className="field-label">Origen del archivo</span><NativeSelect id="import-source" className="mt-2 w-full" name="source" disabled={disabled}><NativeSelectOption value="BANCO_NACION">Banco de la Nación</NativeSelectOption><NativeSelectOption value="PAGALO_PE">Págalo.pe</NativeSelectOption></NativeSelect></label>
        <label htmlFor="payment-file" className="block rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-sky-300">
          <FileSpreadsheet className="mx-auto h-8 w-8 text-sky-700" />
          <span className="mt-2 block text-sm font-bold text-slate-700">Seleccionar archivo</span>
          <input id="payment-file" className="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-100 file:px-3 file:py-2 file:font-bold file:text-sky-800" type="file" name="file" accept=".csv,.txt,.tsv,text/csv,text/plain" required disabled={disabled} />
        </label>
        {message && <output className={`block rounded-lg p-3 text-sm font-semibold ${isError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>{message}</output>}
        <Button className="h-11 w-full bg-sky-700 font-bold hover:bg-sky-800" disabled={disabled || loading}>{loading ? <><LoaderCircle className="animate-spin" /> Importando…</> : 'Importar archivo'}</Button>
      </form>
    </section>
  );
}
