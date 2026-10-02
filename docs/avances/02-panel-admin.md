# 02 — Panel /admin: login y activar/desactivar productos

## Qué se hizo
- Ruta `/admin` (sin Header, Footer ni carrito; sin links desde el sitio público).
- Login con contraseña contra `POST /api/admin-login`. Si es correcta, se guarda en `sessionStorage`
  (sobrevive al refresh, se borra al cerrar la pestaña). Botón "Salir" limpia la sesión.
- Listado de todos los productos (lectura sin CDN, sin token), ordenados por `_createdAt desc`:
  miniatura, nombre, precio, categoría y switch Disponible/Vendido.
- Buscador por nombre (sin distinguir mayúsculas ni tildes), filtro por categoría y por estado.
- Contador "X disponibles · Y vendidos" (sobre el total, no sobre lo filtrado).
- Toggle optimista con rollback y mensaje de error si falla. El switch queda deshabilitado mientras
  el request está en curso.
- Cualquier 401 borra la sesión y vuelve al login.
- Si falla la carga de productos, se muestra error + "Reintentar". Nunca se usan los datos mock.
- Mobile-first: CSS pensado desde 360px, con todos los controles de 44px de alto mínimo
  (falta verificarlo en un navegador, ver Pendientes).

## Archivos creados y modificados
Creados:
- `src/components/admin/AdminPage.tsx`
- `src/components/admin/AdminLogin.tsx`
- `src/components/admin/AdminProductRow.tsx`
- `src/lib/adminApi.ts`
- `src/styles/admin.css`
- `docs/avances/02-panel-admin.md`

Modificados:
- `src/App.tsx`: ruta `/admin`, Header/Footer condicionales, import de `admin.css`.
- `src/lib/sanityClient.ts`: nuevo export `sanityAdminClient` (`useCdn: false`, sin token). El cliente público no cambió.
- `src/lib/queries.ts`: tipo `AdminProduct` y `getAdminProducts()`. `getProducts()` no cambió.

## Decisiones tomadas durante la implementación
- `adminApi.ts` exporta `UnauthorizedError` (lanzada ante cualquier 401). Los demás errores usan el
  mensaje `error` que devuelve la API, o "No se pudo conectar con el servidor" si falla la red.
- `AdminPage.tsx` contiene dos componentes: `AdminPage` (maneja la sesión y decide login vs. listado) y
  `AdminProducts` (listado, filtros, toggles). Al desloguear se desmonta el listado y se pierde su estado.
- El carrito vive dentro de `Header`, así que ocultar `Header` alcanza para ocultar el carrito.
  `CartProvider` sigue envolviendo todo (no molesta y evita condicionar el árbol).
- `isAdmin` cubre `/admin` y `/admin/*`, pensando en sub-rutas futuras.
- Las categorías del filtro se arman a partir de los productos cargados (no de una lista fija), así
  no aparecen categorías vacías.
- El switch es un `<button role="switch" aria-checked>` con el texto "Disponible"/"Vendido" debajo,
  para que el estado se entienda sin depender solo del color.
- El rollback vuelve al valor que tenía el producto antes del click.
- El error de toggle aparece como un aviso sticky debajo de la barra superior, con botón para cerrarlo.
- Los accesos a `sessionStorage` están en try/catch: si el navegador lo bloquea, la sesión dura
  hasta recargar en vez de romper el panel.
- Inputs con `font-size: 16px` para que iOS no haga zoom al enfocarlos.

## Desvíos respecto al brief
Ninguno. No se tocó `/api`.

## Pendientes o problemas encontrados
- **No se probó de punta a punta**: `ADMIN_PASSWORD` sigue vacía en `.env` y el proyecto no está
  linkeado con `vercel link`, así que no se levantó `vercel dev`. Sí se verificó: `npm run build` y
  `eslint` pasan, y en `dist/` no aparece ni el token ni los nombres de las variables.
- **`npm run dev` (Vite solo) no sirve para el admin**: no levanta `/api`, así que el login falla con
  error de servidor. Hay que usar `vercel dev`.
- **Delay en el catálogo público**: el sitio público lee con `useCdn: true`. Después de un toggle, el
  cambio puede tardar unos segundos en verse ahí. En el admin y en el Studio se ve al instante.
- La contraseña queda en `sessionStorage` en texto plano (lo pide el brief). Es aceptable para un solo
  admin, pero cualquier script que corra en el sitio podría leerla. A futuro se puede reemplazar por
  un token de sesión firmado.

## Cómo probarlo
1. Completar `ADMIN_PASSWORD` en `.env`, correr `vercel link` (una vez) y después `vercel dev`.
2. Abrir `localhost:3000/admin`:
   - Contraseña mala → "Contraseña incorrecta". Buena → listado.
   - F5 → sigue logueado. Cerrar la pestaña y abrir `/admin` de nuevo → pide contraseña.
3. Destildar un producto → pasa a "Vendido". Verificar en el Studio y en el catálogo público
   (puede tardar unos segundos por el CDN). Volver a tildarlo.
4. Forzar un error: en DevTools → Network → "Offline", tocar un switch → vuelve atrás y aparece el aviso.
5. Forzar 401: cambiar `ADMIN_PASSWORD` en `.env`, reiniciar `vercel dev`, tocar un switch → vuelve al login.
6. Probar buscador, categoría y estado. El contador debe sumar ~149.
7. DevTools → modo responsive a 360px: sin scroll horizontal y todo se puede tocar cómodo.
8. Ir a `/` y a `/producto/<id>`: Header, Footer y carrito igual que antes.
9. `npm run build` y buscar en `dist/` el token, la contraseña y los nombres de las variables: no debe aparecer ninguno.
