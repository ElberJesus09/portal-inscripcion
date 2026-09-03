# Validador de pagos CPU UNPRG

Aplicación web para validar pagos de Banco de la Nación y Págalo.pe antes de permitir el acceso al formulario de inscripción.

## Configuración

1. Crea una base de datos PostgreSQL en Neon.
2. Configura `DATABASE_URL_UNPOOLED` y ejecuta `npm run db:migrate` para aplicar las migraciones de Drizzle.
3. Copia `.env.example` como `.env.local` y completa las variables.
4. Ejecuta `npm install` y luego `npm run dev`.

## Despliegue en Vercel

Importa este directorio como proyecto de Vercel y agrega las cuatro variables de `.env.example`. El comando de compilación es `npm run build`.

## Reglas implementadas

- Coincidencia exacta de tipo y número de documento, fecha, origen y comprobante.
- Banco de la Nación exige voucher completo y agencia exacta.
- Págalo.pe acepta `1234567-1` y compara los siete dígitos anteriores al guion con los últimos siete del voucher importado.
- Solo se acepta un único registro en estado `IMPORTADO` y sin uso previo.
- La validación y el cambio a `UTILIZADO` se realizan en una única operación atómica.
- El enlace del formulario permanece en el servidor y se entrega mediante un acceso firmado de 15 minutos.
- La carga de archivos y el listado de pagos requieren la contraseña administrativa.
