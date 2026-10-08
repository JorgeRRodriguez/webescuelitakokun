# Kokun Daycare & Preschool — Plataforma escolar

Prototipo funcional de una plataforma escolar para **Kokun Daycare & Preschool**, con tres experiencias independientes dentro de la misma app:

- **Papás** (`/papas`) — resumen del día, ficha del hijo, calendario de eventos, avisos y pagos.
- **Docentes** (`/docentes`) — pase de lista, bitácora diaria (comidas, siesta, pañal, actividades), resúmenes para padres.
- **Administración** (`/admin`) — avisos, eventos, cobranza y conciliación de pagos.

Construido con **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma 6 + SQLite + NextAuth v5**.

## Requisitos

- Node.js 20+
- npm

## Puesta en marcha

```bash
npm install

# genera el cliente de Prisma y aplica las migraciones
npx prisma migrate deploy

# carga datos de ejemplo (alumnos, grupos, eventos, cobranza, etc.)
npm run db:seed

# arranca el servidor de desarrollo
npm run dev
```

Abre la URL que imprime `next dev` (por defecto [http://localhost:3000](http://localhost:3000)).

Crea un archivo `.env` en la raíz (no se versiona) con:

```
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="<valor aleatorio, p. ej. salida de `openssl rand -base64 32`>"
```

## Cuentas de demostración

Contraseña para todas: **`kokun2026`**

| Rol | Correo |
| --- | --- |
| Tutora (varios hijos) | `mariana.lopez@example.com` |
| Docente | `ana.torres@kokun.mx` |
| Dirección | `direccion@kokun.mx` |
| Administración | `administracion@kokun.mx` |

## Notas

- Las fechas de los datos de ejemplo están ancladas a una fecha "hoy" fija dentro del seed, para que el calendario y la bitácora diaria siempre muestren contenido relevante.
- `prisma/dev.db` no se versiona; se regenera con los comandos de arriba.
