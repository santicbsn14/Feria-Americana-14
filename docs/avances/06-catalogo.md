# 06 — Restyling: Catálogo, cards, filtros y skeleton

Rama: `restyling`.

## Qué se hizo
- **Encabezado del catálogo**: contenedor de 1280px (mismo padding lateral que el hero: 16px / 32px),
  borde superior 1px `--line-strong` y padding 44/56px en mobile, 96/120px desde 768px. A la izquierda,
  eyebrow "Stock actual" + H2 "Catálogo" en Bodoni Moda 500. A la derecha (abajo en mobile),
  "Cada prenda es única. Cuando se vende, desaparece.". Se sacaron el ✦, los divisores y el subtítulo.
- **Filtros**: pastillas de 44px, `border-radius: 999px`, borde 1px `--ink`. La activa va rellena.
  Cada una muestra la cantidad de disponibles ("Calzado 12"). Las categorías con 0 no aparecen (salvo
  "Todos"). Son `<button>` con `aria-pressed`, dentro de un `role="group"`. En desktop hacen wrap; en
  mobile, una fila con scroll horizontal sin scrollbar. Al cambiar de categoría, si el comienzo del
  catálogo quedó arriba del viewport, scrollea suave hasta los filtros, y la grilla nueva entra con un
  fundido (`--dur`).
- **Grilla**: 2 / 3 / 4 columnas (mobile / 768px / 1100px). Gap 28/12px en mobile y 48/24px desde 768px.
- **Card** (reescrita): imagen 4:5 con fondo `--placeholder`. La imagen y el nombre son `<Link>` reales.
  Imágenes recortadas con `imgCrop` (`srcset` 400×500 / 800×1000, `sizes` según la grilla, lazy, async,
  `alt` = nombre). Badge de estado en blanco y negro con modificadores BEM (`--excelente`, `--muy-bueno`,
  `--bueno`). Debajo: categoría, nombre (2 líneas máximo con ellipsis), fila talle / precio con borde
  superior y botón de carrito de ancho completo ("Agregar al carrito" / check + "En el carrito").
  Se sacó la descripción. Se mantiene el estado vendido (overlay blanco translúcido + banda negra).
- **Movimiento**:
  - Fotos con fundido sobre el lqip (`"lqip": image.asset->metadata.lqip`). Se contemplan las imágenes
    que ya vienen de caché.
  - Segunda foto (`gallery[0]`) al pasar el mouse, solo con `(hover: hover)`; la `<img>` se monta en el
    primer `mouseenter`. Sin galería: zoom 1.03 dentro de `overflow: hidden`.
  - Cards que entran al scrollear (fade + 16px, `--dur-slow`, escalonado de 60ms por columna) con el
    hook `useReveal`. También las que llegan con el infinite scroll.
- **Skeleton** con los mismos contenedores que la card, shimmer sutil (solo `transform`). Sentinel del
  infinite scroll invisible. Estado vacío: "No hay prendas en esta categoría por ahora.".
- **Bug de scroll a secciones** (pendiente del brief 05) resuelto con `src/lib/sectionScroll.ts`
  (ver Decisiones).

## Archivos creados y modificados
Creados:
- `src/hooks/useReveal.ts`
- `src/lib/sectionScroll.ts`
- `docs/avances/06-catalogo.md`

Reescritos:
- `src/components/ProductGrid.tsx`, `src/components/ProductCard.tsx`, `src/components/SkeletonCard.tsx`
- `src/styles/catalog.css`

Modificados:
- `src/lib/sanityClient.ts` (nuevo `imgCrop`; `imgUrl` sin cambios)
- `src/lib/queries.ts` (`lqip` en `PRODUCT_QUERY`; las queries del admin sin cambios)
- `src/types/index.ts` (`lqip?: string`)
- `src/components/Header.tsx` (el efecto de scroll al hash usa `scrollToSection`)

## Decisiones tomadas durante la implementación
- **Bug de scroll a secciones**: `scrollToSection(el)` en `src/lib/sectionScroll.ts` hace el
  `scrollIntoView` y marca un flag mientras dura el scroll. El observer del infinite scroll ignora el
  sentinel si el flag está activo. Cuando el scroll se detiene (180ms sin eventos `scroll`; no se usa
  `scrollend` porque Safari no lo soporta bien), se mide la sección: si quedó corrida (el catálogo
  terminó de cargar y cambió de alto), se vuelve a scrollear (hasta 2 correcciones). Si el usuario usa
  la rueda, el touch o el teclado, se cancela. Al terminar, si el sentinel quedó a la vista, el
  catálogo carga la página siguiente (si no, quedaba trabado porque el observer no vuelve a avisar).
  El Header lo usa para `#catalogo`, `#historia` y `#contacto`, y el catálogo para volver a los filtros.
- Como el skeleton tiene el mismo alto que las cards, al pasar de skeleton a productos (si hay 8 o más)
  la página no cambia de alto, que era la otra mitad del problema.
- `scrollToSection` usa `behavior: 'auto'` con reducir movimiento (antes el Header siempre usaba
  `smooth`).
- **Escalonado del reveal por columna con CSS** (`:nth-child(2n+2)`, `(3n+…)`, `(4n+…)` en cada
  breakpoint) en vez de calcularlo en JS: no hace falta saber la cantidad de columnas ni estilos inline.
- **Al cambiar de categoría** la grilla se remonta (`key={active}`) con el fundido, y las primeras 8
  cards entran sin reveal (si no, había doble animación). Las que llegan después con el infinite
  scroll sí tienen reveal.
- **Medidas fijas en el texto de la card** (categoría 16px, nombre 2 líneas exactas, fila de talle/precio
  37px, botón 44px). El skeleton reutiliza esas mismas clases como contenedores (`product-card__media`,
  `__body`, `__category`, `__name`, `__meta`, `__btn`) con barras adentro, así las dimensiones coinciden
  por construcción. Todas las cards tienen el mismo alto aunque el nombre ocupe una línea.
- **Link de la imagen con `tabIndex={-1}`**: con teclado se llega a la prenda por el nombre (un solo tab
  por card); la imagen sigue siendo un link real para el mouse y conserva el `alt`.
- **lqip con `style={{ backgroundImage }}`**: es el único estilo inline, porque la URL es un dato.
- **Nombre y precio en `--font-ui`** (Archivo): a 17px Bodoni se ve finito en una card chica.
- **Mientras carga**, la barra de filtros muestra solo "Todos" (sin cantidad) y reserva el alto de una fila.
- El sentinel ahora tiene `rootMargin: 300px` abajo, así la página siguiente se pide un poco antes de
  llegar al final. La paginación sigue siendo de a 8.
- Translúcidos con `color-mix(in srgb, var(--paper) 65%, transparent)` para no usar `rgba(` ni hex.
- Hovers (pastillas, botón, nombre, segunda foto, zoom) dentro de `@media (hover: hover)`, para que en
  el celular no queden "pegados" al tocar.
- `imgCrop` usa `&` si la URL ya trae query string (las imágenes mock de Unsplash vienen con `?w=500`).
- `aria-busy` en la grilla de skeletons y `aria-hidden` en cada skeleton.

## Desvíos respecto al brief
- **En mobile, nombre y precio a 15px** (17px desde 768px), talle a 13px y botón a 13px: con cards de
  ~158px de ancho a 360px, 17px dejaba "Agregar al carrito" y precios largos muy justos.
- Mobile: badge a 8px del borde (12px en desktop).

## Pendientes o problemas encontrados
- **Revisión visual pendiente**: verifiqué que el build pase y el grep de `catalog.css`, pero no lo vi
  en el navegador. Revisar especialmente la grilla a 360px, el hover con galería y el scroll a Contacto
  desde `/producto/:id`.
- **Entre 768 y ~900px** las 7 pastillas pueden ocupar dos filas: como mientras carga solo se muestra
  "Todos", la barra crece una fila al cargar. La corrección de `scrollToSection` lo cubre al navegar a
  una sección, pero puede verse un salto si el usuario ya está mirando el catálogo.
- Si hay menos de 8 productos disponibles, el catálogo se achica al cargar (menos cards que skeletons).
  También lo cubre la corrección del scroll.
- **`npm run lint`** marca 2 errores en `Header.tsx` (`react-hooks/set-state-in-effect` en el pop del
  contador y en `setHidden(false)`). Son del brief 05, no de este cambio; los archivos nuevos pasan el lint.
- Los datos mock no tienen lqip ni galería: con mock se ve el fondo `--placeholder` y el zoom.
- Las cards vendidas siguen sin mostrarse (filtro `available` sin cambios).

## Cómo probarlo
1. `npm run dev` y abrir la Home. Bajar al catálogo: encabezado editorial con línea negra arriba,
   pastillas con cantidades y grilla de 4 columnas (3 en tablet, 2 en el celular).
2. Recargar con la red en "Fast 3G" (DevTools): skeletons con shimmer; al cargar, nada salta. Las fotos
   aparecen con fundido sobre el lqip.
3. Scrollear: las cards entran con fade escalonado; al seguir bajando llegan más (infinite scroll), también
   con fade, y sin el texto "Cargando más productos...".
4. Desktop: pasar el mouse por una prenda con galería → segunda foto; sin galería → zoom sutil.
5. Bajar hasta la mitad del catálogo y tocar otra categoría: sube hasta los filtros y la grilla entra
   con fundido. Las categorías vacías no aparecen.
6. DevTools a 360px: pastillas en una fila con scroll horizontal, sin scrollbar. Tocar una card no deja
   la segunda foto ni el zoom "pegados".
7. Agregar y quitar del carrito desde la card: el botón cambia y el contador del header hace pop.
8. Entrar a un producto (`/producto/:id`) y tocar "Contacto" en el header: vuelve a la Home y queda en
   Contacto. Repetir con "Nuestra historia" y desde la Home con el catálogo ya cargado varias páginas.
9. Activar "reducir movimiento": sin reveal, sin shimmer, sin zoom ni fundido de grilla.
10. `grep -nE "var\(--(black|white|cream|gold|charcoal|text-primary|text-secondary|text-muted|border|shadow|font-alt|font-body|radius-sm)|#[0-9a-fA-F]{3,8}|rgba\(" src/styles/catalog.css`
    → sin resultados.
11. `npm run build` pasa.
