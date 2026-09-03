import { Database, FileUp, LogOut, ShieldCheck, type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AdminAccess } from '@/components/admin-access';
import { AdminImporter } from '@/components/admin-importer';
import { isAdmin } from '@/lib/admin-auth';
import { getSql } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Stats = { total: number; available: number; used: number };
type RecentPayment = {
  id: number;
  document_type: string;
  document_number: string;
  voucher: string;
  source: string;
  payment_date: string;
  student_name: string;
  status: string;
};

async function dashboardData() {
  try {
    const sql = getSql();
    const [statsRows, recent] = await Promise.all([
      sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'IMPORTADO' AND used_at IS NULL)::int AS available, COUNT(*) FILTER (WHERE status = 'UTILIZADO')::int AS used FROM payments`,
      sql`SELECT id, document_type, document_number, voucher, source, payment_date::text, student_name, status FROM payments ORDER BY imported_at DESC, id DESC LIMIT 12`,
    ]);
    return { stats: statsRows[0] as Stats, recent: recent as unknown as RecentPayment[], error: '' };
  } catch {
    return { stats: { total: 0, available: 0, used: 0 }, recent: [] as RecentPayment[], error: 'Conecta Neon y ejecuta el archivo db/schema.sql para comenzar.' };
  }
}

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminAccess />;
  const { stats, recent, error } = await dashboardData();
  const statCards: { label: string; value: number; icon: LucideIcon; colors: string }[] = [
    { label: 'Pagos importados', value: stats.total, icon: Database, colors: 'text-sky-700 bg-sky-100' },
    { label: 'Disponibles', value: stats.available, icon: FileUp, colors: 'text-emerald-700 bg-emerald-100' },
    { label: 'Utilizados', value: stats.used, icon: ShieldCheck, colors: 'text-amber-700 bg-amber-100' },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="brand-header">
        <div className="page-shell flex items-center justify-between gap-4 py-4">
          <Link href="/" className="flex items-center gap-3 text-white">
            <Image src="/logo-pre.png" alt="CPU UNPRG" width={48} height={48} className="h-12 w-12 rounded-full bg-white object-cover" />
            <div>
              <p className="font-heading text-xs font-extrabold uppercase tracking-[0.14em] text-white/70">CPU UNPRG</p>
              <p className="font-heading font-bold">Administración de pagos</p>
            </div>
          </Link>
          <form action="/api/admin/logout" method="post">
            <button className="flex items-center gap-2 rounded-lg border border-white/25 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="page-shell py-9">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow"><ShieldCheck className="mr-2 h-4 w-4" /> Acceso privado</p>
            <h1 className="mt-4 font-heading text-3xl font-black tracking-tight text-slate-950">Panel de pagos</h1>
            <p className="mt-2 text-slate-600">Importa archivos y revisa el estado de las validaciones.</p>
          </div>
        </div>

        {error && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{error}</div>}

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {statCards.map(({ label, value, icon: Icon, colors }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${colors}`}><Icon className="h-5 w-5" /></div>
              <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-1 font-heading text-3xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[390px_1fr]">
          <AdminImporter disabled={Boolean(error)} />
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-heading text-lg font-extrabold text-slate-950">Últimos registros</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-5 py-3">Alumno</th><th className="px-4 py-3">Documento</th><th className="px-4 py-3">Voucher</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Estado</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.map((payment) => (
                    <tr key={payment.id}>
                      <td className="max-w-[250px] px-5 py-3 font-semibold text-slate-800">{payment.student_name || 'Sin nombre'}</td>
                      <td className="px-4 py-3 text-slate-600">{payment.document_type} · {payment.document_number}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{payment.voucher}</td>
                      <td className="px-4 py-3 text-slate-600">{payment.payment_date}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${payment.status === 'UTILIZADO' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{payment.status}</span></td>
                    </tr>
                  ))}
                  {!recent.length && <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-500">Aún no hay pagos importados.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
