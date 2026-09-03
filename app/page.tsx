import { PaymentValidator } from '@/components/payment-validator';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="brand-header">
        <div className="page-shell flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo-pre.png"
              alt="Escudo del Centro Pre Universitario Juan Francisco Aguinaga Castro"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full bg-white object-cover shadow-sm"
            />
            <div className="min-w-0">
              <p className="font-heading text-xs font-extrabold uppercase tracking-[0.16em] text-white/75">
                Universidad Nacional Pedro Ruiz Gallo
              </p>
              <p className="truncate font-heading text-sm font-bold text-white sm:text-base">
                Centro Pre Universitario
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-white/25 px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Administrador
          </Link>
        </div>
      </header>

      <section className="page-shell grid flex-1 items-start gap-10 py-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(440px,1.15fr)] lg:py-16">
        <div className="pt-3 lg:pt-9">
          <span className="eyebrow">Inscripción CPU</span>
          <h1 className="mt-5 max-w-xl font-heading text-4xl font-black leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-5xl">
            Valida tu pago y continúa tu inscripción
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
            Ten a la mano tu comprobante. Los datos deben coincidir exactamente con el pago registrado.
          </p>

          <div className="mt-9 grid max-w-lg gap-4 sm:grid-cols-3">
            {[
              ['01', 'Ingresa tus datos'],
              ['02', 'Validamos el pago'],
              ['03', 'Completa el formulario'],
            ].map(([number, label]) => (
              <div key={number} className="step-card">
                <span className="font-heading text-xs font-extrabold text-sky-700">{number}</span>
                <p className="mt-2 text-sm font-semibold leading-5 text-slate-700">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-950">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-400 font-heading text-xs font-black">!</span>
            <p>Cada pago permite iniciar la inscripción una sola vez. Verifica la información antes de continuar.</p>
          </div>
        </div>

        <PaymentValidator />
      </section>

      <footer className="border-t border-slate-200/80 bg-white/70">
        <div className="page-shell py-5 text-center text-sm text-slate-500">
          Centro Pre Universitario Juan Francisco Aguinaga Castro · UNPRG
        </div>
      </footer>
    </main>
  );
}
