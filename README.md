# Lelita's Photlibrary (Next.js Fullstack)

Aplicación romántica hecha con **Next.js + React + Tailwind + Framer Motion**, pensada para verse hermosa en desktop y móvil.

## Funcionalidades principales

- Login inicial por usuario (`jeicob` / `lelita`) con registro por email + contraseña.
- Recuperación de contraseña por código (local y opcional por webhook de email).
- Contador desde `13/03/2025`:
  - días transcurridos,
  - años/meses/días.
- Cartita editable **Frase de hoy** con abrir/cerrar al click.
- Feed de fotos/videos con **scroll infinito**, estilo collage/diario con tarjetas inclinadas.
- Buscador por descripción en el feed.
- Edición de descripción por autor.
- **Lightbox** con navegación siguiente/anterior para media grande + descripción.
- Cartas secretas separadas para Jeicob y Lelita, con control de edición por autor.
- Chat al final con texto + imagen/video (URL).
- Modo día/noche con estrellas animadas.
- QR para abrir en móvil.
- Mensajes visuales de éxito/error para mejor UX.

## Ejecutar en local

```bash
npm install
npm run dev
```

Abrir: `http://localhost:3000`

## Recuperación de contraseña por correo (Nodemailer)

La API ahora soporta envío real de código de recuperación por SMTP usando Nodemailer desde `app/api/app/route.ts`.

### Variables de entorno para SMTP (`.env.local`)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_cuenta_smtp
SMTP_PASS=tu_password_o_app_password
SMTP_FROM="Lelita Photlibrary <no-reply@tu-dominio.com>"
```

> Si SMTP no está configurado, la API hace fallback a `RESET_EMAIL_WEBHOOK_URL` (si existe). Si tampoco hay webhook, devuelve el código en modo debug para pruebas locales.

### Flujo de funcionamiento

1. Frontend llama `requestReset` con el email.
2. Backend genera código de 6 dígitos con expiración de 10 minutos y lo guarda en `state.resetCodes`.
3. Backend intenta enviar el código en este orden:
   - SMTP con Nodemailer (`delivery: "smtp"`)
   - Webhook (`delivery: "webhook"`)
   - Debug local (`delivery: "debug"`)
4. Frontend llama `confirmReset` con `email`, `code` y `newPassword`.
5. Backend valida código/expiración, cambia contraseña y elimina el reset token.

### Instalar dependencia en tu entorno

```bash
npm install nodemailer
```

> En este entorno de ejecución puede estar bloqueado el acceso al registry; en tu máquina local sí debes instalarlo para usar SMTP real.

### Probar localmente

1. Configura `.env.local` con SMTP.
2. Ejecuta `npm run dev`.
3. Crea/login de usuario con email real.
4. Pulsa **Recuperar contraseña → Enviar código**.
5. Verifica que llegue el correo.
6. Ingresa código + nueva contraseña y confirma.

### Despliegue en producción (Vercel)

1. En **Project Settings → Environment Variables** agrega `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
2. Haz deploy.
3. Revisa logs de la API route `/api/app` para validar envío.
4. Usa proveedor SMTP transaccional (Resend SMTP, SendGrid, Mailgun, Postmark, SES, etc.) para mayor entregabilidad.
5. En producción evita exponer el código de recuperación por UI (la API ya lo oculta cuando `NODE_ENV=production` y el delivery no es debug).

## Conexión recomendada: MongoDB + Cloudinary + Vercel

Para que las fotos y videos **no se pierdan** y siempre carguen de forma confiable:

1. **MongoDB Atlas**: guarda solo metadatos (autor, descripción, fechas, `public_id`, tipo MIME, URLs).
2. **Cloudinary**: guarda el archivo real (imagen/video) y entrega CDN optimizada.
3. **Vercel**: ejecuta el frontend + API routes, leyendo credenciales por variables de entorno.

### 1) Variables de entorno (`.env.local`)

```bash
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB=lelita

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# email recovery por SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_cuenta_smtp
SMTP_PASS=tu_password_o_app_password
SMTP_FROM="Lelita Photlibrary <no-reply@tu-dominio.com>"

# opcional fallback por webhook
RESET_EMAIL_WEBHOOK_URL=https://tu-webhook.com/reset
```

> En Vercel agrega las mismas variables en **Project Settings → Environment Variables** para Preview/Production.

### 2) Modelo de datos recomendado en MongoDB

Colección sugerida `media`:

```json
{
  "_id": "...",
  "owner": "jeicob",
  "description": "Nuestra foto en...",
  "resourceType": "image",
  "mimeType": "image/jpeg",
  "publicId": "lelita/2026/mi-foto",
  "secureUrl": "https://res.cloudinary.com/...",
  "width": 1080,
  "height": 1350,
  "duration": null,
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-01T10:00:00.000Z"
}
```

Índices recomendados:
- `{ createdAt: -1 }` para feed rápido.
- `{ owner: 1, createdAt: -1 }` para historial por usuario.
- `{ description: "text" }` para búsqueda.
- `{ publicId: 1 }` único para evitar duplicados.

### 3) Flujo seguro de subida

1. Cliente solicita firma o URL de subida al backend.
2. Backend valida sesión/usuario.
3. Cliente sube archivo a Cloudinary (direct upload o vía API route).
4. Backend guarda metadatos en MongoDB con `publicId` y `secureUrl`.
5. Frontend pinta el feed desde MongoDB (no desde estado en archivo local).

### 4) Buenas prácticas para que nunca “desaparezcan”

- Usa siempre `secure_url` HTTPS de Cloudinary, no URLs temporales.
- Nunca borres de Cloudinary sin borrar/archivar en MongoDB (y viceversa).
- Activa backups de MongoDB Atlas (Point-in-Time si plan lo permite).
- Define carpeta fija en Cloudinary, por ejemplo: `lelita/<año>/<mes>/...`.
- Guarda `public_id` + `resource_type` para poder regenerar URLs optimizadas.
- En la UI usa fallback visual si una media falla (`onError`) y registra el evento.
- Implementa soft-delete (`deletedAt`) antes de borrar definitivamente.
- Crea un job de reconciliación periódico (cron): compara MongoDB vs Cloudinary y corrige inconsistencias.

### 5) Despliegue en Vercel

1. Conecta repo en Vercel.
2. Configura variables de entorno.
3. Deploy automático por branch.
4. Verifica en logs de Vercel las API routes de subida/listado.
5. Ejecuta prueba final: subir imagen + subir video + recargar + abrir desde otro dispositivo.

### 6) Migración desde estado local actual

Actualmente el proyecto guarda estado en `data/state.json` (MVP). Para producción:
- mover lecturas/escrituras de `app/api/app/route.ts` a MongoDB,
- reemplazar URLs manuales por subida real a Cloudinary,
- mantener este JSON solo para desarrollo o eliminarlo al terminar la migración.


## Conexión recomendada: MongoDB + Cloudinary + Vercel

Para que las fotos y videos **no se pierdan** y siempre carguen de forma confiable:

1. **MongoDB Atlas**: guarda solo metadatos (autor, descripción, fechas, `public_id`, tipo MIME, URLs).
2. **Cloudinary**: guarda el archivo real (imagen/video) y entrega CDN optimizada.
3. **Vercel**: ejecuta el frontend + API routes, leyendo credenciales por variables de entorno.

### 1) Variables de entorno (`.env.local`)

```bash
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB=lelita

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# opcional para recovery por email
RESET_EMAIL_WEBHOOK_URL=https://tu-webhook.com/reset
```

> En Vercel agrega las mismas variables en **Project Settings → Environment Variables** para Preview/Production.

### 2) Modelo de datos recomendado en MongoDB

Colección sugerida `media`:

```json
{
  "_id": "...",
  "owner": "jeicob",
  "description": "Nuestra foto en...",
  "resourceType": "image",
  "mimeType": "image/jpeg",
  "publicId": "lelita/2026/mi-foto",
  "secureUrl": "https://res.cloudinary.com/...",
  "width": 1080,
  "height": 1350,
  "duration": null,
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-01T10:00:00.000Z"
}
```

Índices recomendados:
- `{ createdAt: -1 }` para feed rápido.
- `{ owner: 1, createdAt: -1 }` para historial por usuario.
- `{ description: "text" }` para búsqueda.
- `{ publicId: 1 }` único para evitar duplicados.

### 3) Flujo seguro de subida

1. Cliente solicita firma o URL de subida al backend.
2. Backend valida sesión/usuario.
3. Cliente sube archivo a Cloudinary (direct upload o vía API route).
4. Backend guarda metadatos en MongoDB con `publicId` y `secureUrl`.
5. Frontend pinta el feed desde MongoDB (no desde estado en archivo local).

### 4) Buenas prácticas para que nunca “desaparezcan”

- Usa siempre `secure_url` HTTPS de Cloudinary, no URLs temporales.
- Nunca borres de Cloudinary sin borrar/archivar en MongoDB (y viceversa).
- Activa backups de MongoDB Atlas (Point-in-Time si plan lo permite).
- Define carpeta fija en Cloudinary, por ejemplo: `lelita/<año>/<mes>/...`.
- Guarda `public_id` + `resource_type` para poder regenerar URLs optimizadas.
- En la UI usa fallback visual si una media falla (`onError`) y registra el evento.
- Implementa soft-delete (`deletedAt`) antes de borrar definitivamente.
- Crea un job de reconciliación periódico (cron): compara MongoDB vs Cloudinary y corrige inconsistencias.

### 5) Despliegue en Vercel

1. Conecta repo en Vercel.
2. Configura variables de entorno.
3. Deploy automático por branch.
4. Verifica en logs de Vercel las API routes de subida/listado.
5. Ejecuta prueba final: subir imagen + subir video + recargar + abrir desde otro dispositivo.

### 6) Migración desde estado local actual

Actualmente el proyecto guarda estado en `data/state.json` (MVP). Para producción:
- mover lecturas/escrituras de `app/api/app/route.ts` a MongoDB,
- reemplazar URLs manuales por subida real a Cloudinary,
- mantener este JSON solo para desarrollo o eliminarlo al terminar la migración.

## Producción

```bash
npm run build
npm run start
```

> Persistencia actual: `data/state.json` (MVP). Para producción real multiusuario, migrar a DB + auth/sesiones robustas.
