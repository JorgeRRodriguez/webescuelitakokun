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
| Administración | `administracion@kokun.mx` |

## Desplegar en Railway

La app usa **SQLite** (un archivo), así que el único punto delicado en Railway es que el
sistema de archivos del contenedor es efímero por defecto: si no se configura un
**Volume**, la base se reinicia (vacía) en cada deploy/reinicio.

1. **Crea el proyecto en Railway** desde este repo de GitHub (`New Project` → `Deploy from GitHub repo` → `webescuelitakokun`). Railway detecta automáticamente que es una app Next.js (Nixpacks) y usará los scripts `build`/`start` de `package.json`.

2. **Agrega un Volume** al servicio (`Settings` → `Volumes` → `New Volume`) montado en `/data`. Esto hace que el archivo SQLite sobreviva a redeploys y reinicios.

3. **Variables de entorno** (`Variables`):

   | Variable | Valor |
   | --- | --- |
   | `DATABASE_URL` | `file:/data/kokun.db` |
   | `AUTH_SECRET` | genera uno nuevo, p. ej. `openssl rand -base64 32` |
   | `SEED_ON_BOOT` | `true` (solo para el primer deploy, ver paso 5) |

4. **Deploy.** En el arranque (`npm start`) el contenedor corre `prisma migrate deploy` automáticamente para crear las tablas en el archivo del Volume.

5. **Siembra los datos de ejemplo una sola vez.** Como es un archivo local al contenedor, no se puede sembrar con `railway run` desde tu máquina — por eso `SEED_ON_BOOT=true` hace que el propio contenedor corra el seed al arrancar (ver `scripts/seed-if-flagged.js`). Una vez que el primer deploy terminó y ves datos en la app, **quita la variable `SEED_ON_BOOT`** (o ponla en `false`) y vuelve a desplegar — si no, cada reinicio del contenedor borraría y regeneraría la base, perdiendo cualquier cambio hecho desde la app.

6. Railway asigna un dominio público (`*.up.railway.app`) o puedes conectar uno propio; no hace falta configurar `AUTH_URL` a mano porque `trustHost: true` ya está activado en `src/auth.ts` para ese dominio dinámico.

> **Alternativa:** si prefieres no lidiar con Volumes, se puede migrar el `datasource` de `prisma/schema.prisma` a Postgres y usar el plugin de Postgres de Railway (persistencia administrada, sin Volume manual). No es necesario para este prototipo, pero es la opción más robusta si el proyecto crece.

## Notas

- Las fechas de los datos de ejemplo están ancladas a una fecha "hoy" fija dentro del seed (6 de octubre de 2026), pero la vista "Hoy" de la app usa la fecha real del servidor (`demoToday()` en `src/lib/dates.ts`). Es decir: la bitácora/asistencia de "hoy" solo se ve poblada si se consulta cerca de esa fecha real; lejos de ella, esas vistas se verán vacías aunque el resto de la app (alumnos, calendario completo, cobranza) funcione normal.
- `prisma/dev.db` no se versiona; se regenera con los comandos de arriba.
