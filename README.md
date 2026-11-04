# Cars Wash

Sitio de Cars Wash, lavadero de autos premium en Zona Norte, Rosario. Hecho con SvelteKit, TypeScript, Tailwind CSS v4, GSAP, Lenis y Zod. Se publica como demo en GitHub Pages y queda listo para pasar a Cloudflare Pages.

## Cómo correrlo

Necesitás Node 24 y pnpm.

```sh
pnpm install
pnpm dev       # desarrollo
pnpm check     # tipos y Svelte
pnpm test      # horarios, validación y mensaje de WhatsApp
pnpm build     # build de producción
```

Para probar el build en el mismo entorno de Cloudflare:

```sh
pnpm exec wrangler pages dev .svelte-kit/cloudflare
```

## Cómo agregar fotos de antes y después

1. Poné las fotos en la carpeta del tipo de vehículo:
   - `static/img/trabajos/autos/`
   - `static/img/trabajos/camionetas/`
2. Usá el mismo nombre para las dos fotos, terminado en `-antes` y `-despues`:
   ```text
   static/img/trabajos/autos/gol-blanco-antes.jpg
   static/img/trabajos/autos/gol-blanco-despues.jpg
   ```
3. Corré:
   ```sh
   pnpm gallery:sync
   ```

El comando genera las versiones AVIF y WebP en `static/img/_opt/` y reescribe `src/lib/data/gallery.ts`. Ese archivo no se edita a mano. El título sale del nombre del archivo: `gol-blanco` se muestra como "Gol blanco".

| Fotos que encuentra | Qué pasa |
| --- | --- |
| `-antes` y `-despues` | Slider completo |
| Solo `-despues` | La foto se ve sola en la galería, sin comparador |
| Solo `-antes` | No se publica y el comando avisa |
| Ninguna | Se muestran 3 placeholders |

Formatos aceptados: JPG, PNG, WebP y AVIF. Para que el slider compare bien, las dos fotos tienen que tener el mismo encuadre. Revisá que no se lean patentes antes de subirlas.

El slider grande muestra `featuredGalleryId` de `src/lib/data/settings.ts` si tiene las dos fotos. Si no, muestra el primer par completo.

### Fotos sucias simuladas

Todavía no hay fotos reales de "antes". Para mostrar el comparador en la demo, `pnpm demo:dirt` ensucia por software las tomas exteriores del Scirocco, el CLA y la Amarok, cada una sobre su propia foto, y crea `<nombre>-antes-simulado.webp`.

- Se ven rotuladas como "Antes (simulación)".
- Aparecen en la demo de GitHub Pages y en `pnpm dev`. En el build de Cloudflare esos trabajos se muestran sin foto de antes.
- Si agregás una foto `-antes` real con el mismo nombre, reemplaza a la simulada al correr `pnpm gallery:sync`.

Cuando estén las fotos reales, borrá los archivos `*-antes-simulado*` de `static/img/trabajos/` y `static/img/_opt/` y corré `pnpm gallery:sync`. Hasta entonces, esos archivos siguen copiándose al build de Cloudflare, aunque ninguna página los use.

## Cómo cambiar precios y datos

| Qué cambiar | Dónde |
| --- | --- |
| Precios, nombres y descripciones de servicios | `src/lib/data/services.ts` (`priceArs`, en pesos enteros) |
| "El más elegido" | `isPopular` en `src/lib/data/services.ts` |
| Dirección, WhatsApp, Instagram y horarios | `src/lib/data/settings.ts` |
| Último turno del día | `lastSlot` en `src/lib/data/settings.ts` |
| Feriados y turnos bloqueados | `src/lib/data/blocked-slots.ts` |

Las tarjetas, el formulario, el mensaje de WhatsApp y los datos para Google toman esos valores, así que no hay que cambiar nada más.

## Cómo publicar la demo en GitHub Pages

1. Creá el repositorio en GitHub y subí el código a la rama `main` o `master`.
2. En el repositorio, entrá a Settings > Pages y elegí GitHub Actions en Source.
3. Si el primer intento falló porque Pages no estaba activado, volvé a correr el workflow "Publicar demo en GitHub Pages" desde la pestaña Actions.

Cada push vuelve a publicar la demo en `https://<usuario>.github.io/<repo>/`. El workflow (`.github/workflows/deploy-pages.yml`) detecta solo la subcarpeta. Un repositorio llamado `<usuario>.github.io` se publica en la raíz.

Para generarla en tu computadora:

```sh
pnpm build:demo   # deja el sitio en build/
```

Con `BASE_PATH=/<repo>` y `SITE_URL=https://<usuario>.github.io` el resultado es igual al publicado. Sin esas variables, sirve para probarlo en la raíz de un servidor local.

### En qué se diferencia de Cloudflare

| | GitHub Pages (demo) | Cloudflare Pages |
| --- | --- | --- |
| Turnos y validación de la reserva | En el navegador | En el servidor |
| Reserva sin JavaScript | No: muestra un aviso con link a WhatsApp | Sí |
| Fotos simuladas | Visibles y rotuladas | No se muestran |
| Buscadores | `noindex`, para que no indexen la demo | Indexable |

La demo tampoco guardaría reservas aunque exista el panel de admin, porque no tiene servidor. El `noindex` hace que Lighthouse baje el puntaje de SEO de la demo. Es esperable.

## Cómo deployar en Cloudflare Pages

### Conectando el repositorio

En Workers & Pages, creá un proyecto de Pages conectado al repositorio con esta configuración:

| Opción | Valor |
| --- | --- |
| Build command | `pnpm build` |
| Build output directory | `.svelte-kit/cloudflare` |
| Variable `NODE_VERSION` | `24` |
| Variable `PNPM_VERSION` | `12.10.1` |

### Desde tu computadora

```sh
pnpm build
pnpm exec wrangler login
pnpm exec wrangler pages deploy .svelte-kit/cloudflare --project-name carswash-web
```

`sitemap.xml`, `robots.txt`, las URLs canónicas y Open Graph usan el dominio desde el que se sirve el sitio, así que no hace falta configurarlo.

## Arquitectura

```text
Componentes  <-  +page.server.ts  <-  src/lib/server/repositories/  <-  src/lib/data/*.ts
                                                                        (mañana: Supabase)
```

- Los componentes reciben todo por props y nunca importan `src/lib/data`.
- Los repositorios exponen `getServices()`, `getVehicleTypes()`, `getGallery()`, `getSettings()`, `getAvailableSlots(date)` y `getBookableDates()`.
- La reserva se envía al form action `?/reservar` (`src/lib/server/booking/action.ts`), que usa el mismo esquema Zod que el cliente (`src/lib/schemas/booking.ts`).
- Las reglas de turnos (`src/lib/utils/availability.ts`) y de reserva (`src/lib/booking/process.ts`) no dependen del servidor. Las usa también la demo estática, a través de `src/lib/booking/static-demo.ts`. Ese es el único módulo del navegador que lee `src/lib/data` directamente, y queda fuera del bundle de Cloudflare.
- `__STATIC_DEMO__` indica si el build es la demo. Las rutas y archivos estáticos pasan por `withBase()` (`src/lib/utils/paths.ts`), porque en GitHub Pages el sitio vive en una subcarpeta.
- El servidor siempre revalida fecha, hora, vehículo y servicio, y calcula el precio.
- Las fechas se calculan con la hora de Rosario (`timezone` en `settings.ts`), porque Cloudflare corre en UTC.
- `src/lib/utils/images.ts` es el único lugar que sabe dónde están las variantes de cada imagen.
- SvelteKit 3 reemplazó `$lib` por `#lib` y su configuración vive en `vite.config.ts`.

## Plan para el panel de admin

### Tablas propuestas

Los tipos de `src/lib/types.ts` ya tienen esta forma. La base usa `snake_case` y los repositorios hacen la conversión.

```sql
create table vehicle_types (
  id text primary key,
  label text not null,
  short_label text not null,
  plural_label text not null,
  sort_order int not null default 0
);

create table services (
  id text primary key,
  vehicle_type_id text not null references vehicle_types (id),
  name text not null,
  description text not null,
  price_ars int not null check (price_ars >= 0),
  is_popular boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  vehicle_type_id text not null references vehicle_types (id),
  service_id text not null references services (id),
  date date not null,
  time time not null,
  price_ars int not null, -- copia del precio al reservar
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

-- Evita dos turnos activos en el mismo horario.
create unique index bookings_active_slot
  on bookings (date, time)
  where status in ('pending', 'confirmed');

create table gallery_items (
  id text primary key,
  title text not null,
  vehicle_type text not null references vehicle_types (id),
  before text, -- null: todavía no hay foto de antes
  after text not null,
  is_published boolean not null default false,
  sort_order int not null default 0
);

create table business_settings (
  id int primary key default 1 check (id = 1), -- una sola fila
  settings jsonb not null -- forma de BusinessSettings
);

create table blocked_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time time, -- null: todo el día
  reason text
);
```

El índice único supone un auto por horario. Si el lavadero atiende varios a la vez, hay que reemplazarlo por un cupo por horario en `business_settings`.

### Rutas futuras

| Ruta | Para qué |
| --- | --- |
| `/admin` | Resumen del día y acceso a las secciones |
| `/admin/turnos` | Ver, confirmar y cancelar turnos, y bloquear horarios |
| `/admin/servicios` | Editar servicios y precios |
| `/admin/galeria` | Subir pares de fotos, ordenarlos y publicarlos |

### Autenticación con Supabase Auth

- Login con email y contraseña en `/admin/login`, con `@supabase/ssr` y la sesión en cookies.
- `src/hooks.server.ts` crea el cliente de Supabase por request y redirige a `/admin/login` cualquier ruta de `/admin` sin sesión válida.
- Row Level Security activado en todas las tablas:
  - Público: leer `services`, `vehicle_types`, `gallery_items` publicados, `business_settings` y `blocked_slots`.
  - Solo autenticados: leer y modificar `bookings`, y escribir en el resto.
- Los turnos públicos se crean desde el servidor, con la clave `service_role` como secreto de Cloudflare. Esa clave nunca llega al navegador.

### Pasos de la migración

1. Crear las tablas y cargar los datos de `src/lib/data/`.
2. Reescribir por dentro las funciones de `src/lib/server/repositories/`. Sus firmas no cambian, así que componentes y páginas tampoco.
3. En `availability.ts`, excluir los turnos ya reservados (`TODO(admin)`).
4. En `src/lib/server/booking/action.ts`, guardar el turno y avisar por WhatsApp (`TODO(admin): guardar en Supabase`).
5. Mover las fotos a Supabase Storage y adaptar `pictureSources()` en `src/lib/utils/images.ts`.
6. Sumar `hooks.server.ts` y las rutas de `/admin`.

## Pendientes para confirmar con el dueño

- [ ] Dirección exacta: Instagram dice "Pasaje Fernández 962" y la web "Coronel Néstor Fernández 962".
- [ ] Código postal.
- [ ] Si se toman autos a las 17:00, que es la hora de cierre.
- [ ] Si "Lavado completo" es realmente "El más elegido".
- [ ] Si el lavado completo de camioneta incluye encerado: la tabla actual solo lo menciona en autos.
- [ ] Con cuánta anticipación se puede reservar (hoy, 60 días).
- [ ] Feriados y días de cierre.
- [ ] Fotos de "antes" tomadas desde el mismo ángulo que las de "después".
- [ ] Razón social y CUIT para `/privacidad` y `/terminos`.
- [ ] Anticipación para cancelar, tolerancia por llegadas tarde y si hay cargos.
- [ ] Medios de pago y responsabilidad sobre el vehículo y los objetos dejados en él.
- [ ] Cuánto tiempo se conservan las conversaciones de WhatsApp.
- [ ] Revisión de un abogado de la política de privacidad y los términos, antes de publicar el sitio definitivo.
