# VotaFácil 🗳️

> Crea votaciones rápidas, comparte un enlace y recoge respuestas — **sin que nadie tenga que registrarse.**

Inspirado en Doodle, pensado para clubs de pádel, grupos de amigos, equipos y cualquier situación donde necesitas organizar algo con varias personas.

---

## ✨ Funcionalidades

- **Crear votaciones** de tipo "Opciones simples" o "Fechas y horarios"
- **Compartir enlace** público — nadie necesita cuenta
- **Votar con nombre** — Sí / No / Quizás por cada opción
- **Editar voto** — vuelve a entrar con el mismo nombre
- **Tabla de resultados** tipo Doodle, con resumen automático
- **Panel de administración** privado (token único)
  - Cerrar / reabrir votación
  - Añadir opciones
  - Ver ranking de opciones
  - Eliminar votación
- **PWA instalable** en móvil (Añadir a pantalla de inicio)
- **Diseño responsive** para móvil y escritorio

---

## 🛠 Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| ORM | Prisma |
| Base de datos | SQLite (dev) / PostgreSQL (prod) |
| Validación | Zod |
| Iconos | lucide-react |
| Toasts | sonner |
| PWA | manifest.json + Service Worker |

---

## 🚀 Instalación y puesta en marcha

### 1. Clona o descarga el proyecto

```bash
cd votafacil
```

### 2. Instala dependencias

```bash
npm install
```

### 3. Configura variables de entorno

Crea un fichero `.env` en la raíz (ya incluido en el repo para desarrollo):

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Crea la base de datos

```bash
npx prisma migrate dev --name init
```

> Esto crea el fichero `prisma/dev.db` con todas las tablas.

### 5. (Opcional) Carga datos de ejemplo

```bash
npm run db:seed
```

Crea dos votaciones de ejemplo con participantes y votos. Los enlaces se muestran en la consola.

### 6. Arranca el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🧪 Cómo probar la app

1. **Crear votación**: entra en `/create`, rellena el formulario y haz clic en "Crear votación".
2. **Compartir**: copia el enlace público de la pantalla de éxito.
3. **Votar**: abre el enlace en una pestaña de incógnito, escribe un nombre y vota.
4. **Administrar**: usa el enlace de administración para cerrar/reabrir la votación.
5. **Seed**: si ejecutaste `npm run db:seed`, los URLs aparecen en la consola.

---

## 📂 Estructura del proyecto

```
votafacil/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout + PWA metadata
│   ├── not-found.tsx             # 404 page
│   ├── globals.css               # Tailwind + CSS vars
│   ├── create/
│   │   ├── page.tsx              # Formulario crear votación
│   │   └── success/page.tsx      # Pantalla de éxito post-creación
│   ├── p/[publicId]/
│   │   └── page.tsx              # Votación pública
│   ├── admin/[publicId]/
│   │   └── page.tsx              # Panel de administración
│   └── api/
│       └── polls/
│           ├── route.ts          # POST /api/polls
│           └── [publicId]/
│               ├── route.ts      # GET / PATCH / DELETE
│               ├── vote/route.ts # POST votar
│               └── options/route.ts # POST añadir opción
├── components/
│   ├── ui/                       # Componentes base (shadcn-style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   └── separator.tsx
│   ├── PollForm.tsx              # Formulario creación
│   ├── VoteTable.tsx             # Tabla de resultados
│   ├── VoteForm.tsx              # Formulario de votación
│   ├── AdminPanel.tsx            # Panel admin
│   ├── CopyButton.tsx            # Botón copiar al portapapeles
│   └── ServiceWorkerRegistration.tsx
├── lib/
│   ├── prisma.ts                 # Singleton Prisma client
│   ├── utils.ts                  # Helpers (IDs, URLs, cómputos)
│   └── validations.ts            # Esquemas Zod
├── prisma/
│   ├── schema.prisma             # Modelos de datos
│   └── seed.ts                   # Datos de ejemplo
├── types/
│   └── index.ts                  # TypeScript types compartidos
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/                    # Iconos PWA
└── README.md
```

---

## 🔑 Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Cadena de conexión Prisma | `file:./dev.db` |
| `NEXT_PUBLIC_APP_URL` | URL base pública de la app | `https://votafacil.vercel.app` |

---

## ☁️ Despliegue en Vercel

### Con PostgreSQL (recomendado para producción)

1. Crea un proyecto en [Vercel](https://vercel.com) y conecta tu repositorio.
2. Añade una base de datos PostgreSQL (Vercel Postgres o Supabase).
3. Cambia el `provider` en `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Configura las variables de entorno en Vercel:
   - `DATABASE_URL` → tu cadena de conexión PostgreSQL
   - `NEXT_PUBLIC_APP_URL` → `https://tu-dominio.vercel.app`
5. Añade el comando de build en Vercel:
   ```
   prisma generate && prisma migrate deploy && next build
   ```
6. Despliega.

### Con SQLite (solo para preview rápido en local)

SQLite no funciona en Vercel (filesystem efímero). Usa siempre PostgreSQL en producción.

---

## 🗺 Futuras mejoras

- [ ] **Notificaciones por email** al crear/cerrar votación
- [ ] **Fecha de expiración** automática de la votación
- [ ] **Límite de votos** por participante
- [ ] **Modo anónimo** (sin mostrar nombres)
- [ ] **Comentarios** por opción
- [ ] **Exportar a CSV / PDF**
- [ ] **Autenticación opcional** para mayor control
- [ ] **Modo oscuro**
- [ ] **WebSockets** para resultados en tiempo real
- [ ] **Internacionalización** (i18n)

---

## 📄 Licencia

MIT — úsalo libremente para tus proyectos.
