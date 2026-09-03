import { ArrowRight, Check, Headphones, LockKeyhole } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PaymentValidator } from '@/components/payment-validator';

const steps = [
  { number: '01', title: 'Identifícate', detail: 'Selecciona tu documento y medio de pago.' },
  { number: '02', title: 'Verifica el comprobante', detail: 'Ingresa los datos exactamente como aparecen.' },
  { number: '03', title: 'Continúa tu inscripción', detail: 'Accede al formulario después de validar.' },
];

export default function Home() {
  return (
    <main className="site-canvas flex min-h-screen flex-col">
      <header className="relative z-10">
        <div className="page-shell flex h-[82px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white bg-white shadow-sm">
              <Image src="/logo-pre.png" alt="CPU UNPRG" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" priority />
            </div>
            <div className="min-w-0">
              <p className="font-heading truncate text-[11px] font-extrabold uppercase tracking-[0.17em] text-sky-700">Universidad Nacional Pedro Ruiz Gallo</p>
              <p className="font-heading truncate text-sm font-extrabold text-slate-900 sm:text-base">Centro Pre Universitario</p>
            </div>
          </div>
          <Link href="/admin" className="admin-link">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Acceso administrativo</span>
            <span className="sm:hidden">Administrar</span>
          </Link>
        </div>
      </header>

      <section className="page-shell flex flex-1 items-center py-5 pb-10 lg:py-10">
        <div className="enrollment-shell grid w-full overflow-hidden lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="brand-panel relative overflow-hidden p-7 text-white sm:p-10 lg:p-12">
            <div className="brand-orb brand-orb-one" aria-hidden="true" />
            <div className="brand-orb brand-orb-two" aria-hidden="true" />
            <div className="relative z-10 flex h-full flex-col">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-sky-50 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_0_4px_rgb(252_211_77/12%)]" />
                  Proceso de inscripción
                </span>
                <h1 className="mt-6 max-w-md font-heading text-4xl font-black leading-[1.06] tracking-[-0.04em] sm:text-5xl lg:text-[3.35rem]">
                  Valida tu pago con seguridad
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-sky-100/85">
                  Confirma tu comprobante y continúa al formulario oficial de inscripción del Centro Pre Universitario.
                </p>
              </div>

              <ol className="mt-9 space-y-5 lg:mt-12">
                {steps.map((step, index) => (
                  <li key={step.number} className="relative flex gap-4">
                    {index < steps.length - 1 && <span className="absolute left-[17px] top-10 h-[calc(100%+4px)] w-px bg-white/15" aria-hidden="true" />}
                    <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 font-heading text-[11px] font-black text-amber-300">{step.number}</span>
                    <div className="pt-0.5">
                      <p className="font-heading text-sm font-extrabold text-white">{step.title}</p>
                      <p className="mt-1 text-sm leading-5 text-sky-100/65">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-9 border-t border-white/10 pt-6 lg:mt-auto">
                <div className="flex items-center gap-3 text-sm text-sky-100/75">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10"><Headphones className="h-4 w-4" aria-hidden="true" /></div>
                  <div><p className="font-bold text-white">¿Necesitas ayuda?</p><p className="text-xs">Comunícate con el Centro Pre Universitario.</p></div>
                </div>
              </div>
            </div>
          </aside>

          <div className="relative bg-white p-5 sm:p-8 lg:p-10 xl:p-12">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <span className="section-kicker">Verificación de pago</span>
                <h2 className="mt-2 font-heading text-2xl font-black tracking-[-0.025em] text-slate-950 sm:text-3xl">Datos del comprobante</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Todos los campos son obligatorios.</p>
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:flex">
                <Check className="h-4 w-4" /> Conexión segura
              </div>
            </div>

            <PaymentValidator />

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <p>Tu información solo se usa para comprobar el pago. Cada comprobante permite iniciar la inscripción una sola vez.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="page-shell flex flex-col items-center justify-between gap-2 border-t border-slate-200/70 py-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
        <p>© 2026 Centro Pre Universitario Juan Francisco Aguinaga Castro</p>
        <p className="flex items-center gap-1.5 font-semibold text-slate-600">UNPRG <ArrowRight className="h-3.5 w-3.5" /> Inscripción segura</p>
      </footer>
    </main>
  );
}
