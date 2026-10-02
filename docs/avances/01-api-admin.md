# 01 — API de administración (Vercel Functions)

## Qué se hizo
- Funciones serverless en `/api` para el futuro panel `/admin`:
  - `POST /api/admin-login`: valida la contraseña del admin (`x-admin-password`). 200 `{ ok: true }` / 401.
  - `POST /api/toggle-available`: body `{ id, available }`. Valida auth (401), tipos (400), que el
    documento exista y sea `_type == "product"` (404), y hace `set({ available })`. Si existe
    `drafts.<id>` lo patchea también, en la misma transacción. Devuelve `{ id, available }`.
  - Cualquier método distinto de POST → 405 (con header `Allow: POST`).
- El token de escritura y la contraseña viven solo en variables de entorno del servidor (sin `VITE_`).
- `vercel.json` con rewrite SPA que excluye `/api` (arregla también el 404 al refrescar `/producto/:id`).
- `.env` y `.env*.local` agregados al `.gitignore`.

## Archivos creados y modificados
Creados:
- `vercel.json`
- `api/_lib/auth.ts`
- `api/_lib/sanityWrite.ts`
- `api/admin-login.ts`
- `api/toggle-available.ts`
- `.env.example`
- `docs/avances/01-api-admin.md`

Modificados:
- `package.json` / `package-lock.json` (`@vercel/node` como devDependency)
- `.gitignore`

## Decisiones tomadas durante la implementación
- `auth.ts` expone `requireAdmin(req, res)`: si falla, ya responde (500 si falta `ADMIN_PASSWORD`,
  401 si la contraseña falta o es incorrecta) y devuelve `false`. Así cada endpoint queda en una línea.
- Comparación con `timingSafeEqual`: si los largos difieren, se hace igual una comparación
  (de la esperada contra sí misma) antes de devolver `false`, para no cortar antes ni lanzar excepción.
- `toggle-available` devuelve 500 si falta `SANITY_WRITE_TOKEN`, en vez de dejar que Sanity falle con un error opaco.
- La existencia se verifica con una sola query GROQ que trae el publicado y el draft
  (`_id in [$id, $draftId] && _type == "product"`). Se exige que exista el documento publicado:
  un producto que solo existe como draft devuelve 404.
- Se rechaza con 400 un `id` que empiece con `drafts.` (el panel siempre manda el id publicado).
- Los patches del publicado y del draft van en una única `transaction()`: o se aplican los dos o ninguno.
- Se tolera `req.body` como string (por si llega sin `Content-Type: application/json`).
- `npm run build` (`tsc -b`) no incluye `/api` en ningún tsconfig. Vercel compila las funciones por su
  cuenta. Para validar los tipos se corrió aparte:
  `npx tsc --noEmit --strict --module nodenext --moduleResolution nodenext --target ES2022 --skipLibCheck --types node api/*.ts api/_lib/*.ts`

## Desvíos respecto al brief
Ninguno.

## Pendientes o problemas encontrados
- **Probar con `vercel dev` y `curl`**: no se probaron los endpoints de punta a punta porque falta definir
  `ADMIN_PASSWORD`. Tampoco se hizo un toggle real, para no tocar datos de producción sin confirmación.
  El token sí se verificó con una query de solo lectura: `users/me` → 200, 149 productos, 0 drafts.
- **Cargar las variables en Vercel**: `ADMIN_PASSWORD` y `SANITY_WRITE_TOKEN` en Project Settings →
  Environment Variables (Production y Preview). Sin eso, las funciones en producción devuelven 500.
- **Rotar el token**: se compartió por chat. Conviene generar uno nuevo en sanity.io/manage → API → Tokens
  (permiso Editor) y revocar el actual.
- No hay rate limiting en `admin-login`. Para un solo usuario alcanza con una contraseña larga.
  Si hiciera falta, se puede sumar más adelante.

## Cómo probarlo
1. Copiar `.env.example` a `.env` y completar `ADMIN_PASSWORD` y `SANITY_WRITE_TOKEN`.
2. `vercel dev` (la primera vez pide linkear el proyecto).
3. Login:
   ```bash
   curl -i -X POST localhost:3000/api/admin-login -H "x-admin-password: mala"       # 401
   curl -i -X POST localhost:3000/api/admin-login -H "x-admin-password: <la-buena>" # 200
   curl -i localhost:3000/api/admin-login                                            # 405
   ```
4. Toggle (usar un id real del Studio):
   ```bash
   curl -i -X POST localhost:3000/api/toggle-available \
     -H "Content-Type: application/json" -H "x-admin-password: <la-buena>" \
     -d '{"id":"<id>","available":false}'        # 200 { id, available: false }
   ```
   Verificar el cambio en el Studio y volver a ponerlo en `true`.
   - Sin header o con contraseña mala → 401.
   - `{"id":"x","available":"no"}` → 400.
   - `{"id":"no-existe","available":true}` → 404.
5. `npm run build` y luego buscar en `dist/` los primeros caracteres del token, la contraseña y los nombres
   `ADMIN_PASSWORD` / `SANITY_WRITE_TOKEN` con `grep -r`. No debe aparecer ninguno.
6. Refrescar el navegador en `/producto/<id>`: ya no debe dar 404.
