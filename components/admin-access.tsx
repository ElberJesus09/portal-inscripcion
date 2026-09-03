'use client';

import { useState } from 'react';
import { LoaderCircle, LockKeyhole } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AdminAccess() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { error?: string };
      if (response.ok) window.location.reload();
      else setError(result.error || 'No se pudo iniciar sesión.');
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-5">
      <Card className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
        <CardHeader className="items-center px-8 pt-8 text-center">
          <Image src="/logo-pre.png" alt="CPU UNPRG" width={96} height={96} className="h-24 w-24 rounded-full object-cover" />
          <div className="mt-4 grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-700"><LockKeyhole className="h-5 w-5" /></div>
          <CardTitle className="mt-3 font-heading text-2xl font-black">Acceso administrativo</CardTitle>
          <p className="text-sm text-slate-500">Área privada para importar y consultar pagos.</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={login} className="space-y-4">
            <label className="block" htmlFor="admin-password"><span className="field-label">Contraseña</span><Input id="admin-password" className="form-control mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <Button className="h-11 w-full bg-sky-700 font-bold hover:bg-sky-800" disabled={loading}>{loading ? <><LoaderCircle className="animate-spin" /> Ingresando…</> : 'Ingresar'}</Button>
          </form>
          <Link href="/" className="mt-5 block text-center text-sm font-semibold text-sky-700 hover:underline">Volver a la validación</Link>
        </CardContent>
      </Card>
    </main>
  );
}
