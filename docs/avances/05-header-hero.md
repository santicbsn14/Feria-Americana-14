# 05 — Restyling: Header, franja y Hero

Rama: `restyling`.

## Qué se hizo
- **Header** (reescrito): fondo `--paper`, borde inferior 1px `--line-strong`, sticky.
  - Marca: círculo FA (`/feria_logo_mark.png`, 44px) + "FERIA AMERICANA" (Archivo 600, 0.22em,
    12px mobile / 14px desktop). Todo es un `Link` a `/`. Sin tagline.
  - Desktop (≥ 768px): links "Catálogo", "Nuestra historia", "Contacto" y botón de carrito negro
    de 44px con ícono de bolsa en trazo fino + cantidad (solo si es > 0).
  - Mobile (< 768px): marca + carrito + botón de menú (dos líneas, 44×44, `aria-label`,
    `aria-expanded`, `aria-controls`). El menú es un panel a pantalla completa con los 3 links
    en Bodoni Moda 40px. Cierra con la X, al tocar un link, con Escape y si la ventana pasa a
    desktop. Bloquea el scroll del body mientras está abierto.
  - Links a `#catalogo`, `#historia`, `#contacto`: navegan a `/` con el hash y un efecto scrollea
    suave a la sección, así que funcionan igual desde la Home y desde `/producto/:id`.
  - Se esconde al bajar pasados 120px y reaparece al subir (`translateY(-100%)`, `--dur`, `--ease-out`).
    No se esconde con el menú mobile o el carrito abiertos.
  - Pop del contador (1 → 1.25 → 1, 300ms) solo cuando `totalItems` aumenta.
- **Franja** (nueva, solo en la Home entre Header y Hero): fondo `--ink`, 44px, texto 12px 600
  mayúsculas 0.2em, los 4 textos separados por "/". Loop infinito a la izquierda en 35s, se pausa
  con hover. Con reducir movimiento queda quieta, una sola vuelta del texto, centrada.
- **Hero** (reescrito): fondo `--paper`, contenedor de 1280px, dos columnas (texto | foto) desde
  900px, apilado abajo de eso. Eyebrow, H1 en dos líneas, bajada, CTA "Ver catálogo" con flecha
  y link "Nuestra historia". Foto (o placeholder) con tarjeta "Nos encontrás en / Santiago del
  Estero y Garibaldi". Animación de entrada de una sola vez (termina a los 1.1s).
  Se eliminaron logo grande, ✦, marcos de esquina, `.hero__texture`, scroll hint, `fadeUp`,
  `bounce` y todos los dorados.
- `id="historia"` en `About.tsx` y `id="contacto"` en `Contact.tsx`.

## Archivos creados y modificados
Creados:
- `src/components/Marquee.tsx`
- `src/styles/marquee.css`
- `docs/avances/05-header-hero.md`

Reescritos:
- `src/components/Header.tsx`, `src/styles/header.css`
- `src/components/Hero.tsx`, `src/styles/hero.css`

Modificados:
- `src/App.tsx` (import + `<Marquee />` en Home + import de `marquee.css`)
- `src/components/About.tsx`, `src/components/Contact.tsx` (solo el `id`)

## Decisiones tomadas durante la implementación
- **Foto del hero opcional sin tocar código:** se carga con `import.meta.glob('../assets/hero.jpg')`.
  Si el archivo no existe el build no falla y se muestra el placeholder; cuando se agregue
  `src/assets/hero.jpg`, aparece sola.
- **Navegación a secciones:** los links hacen `navigate({ pathname: '/', hash })` y un `useEffect`
  en el Header (dependiente de `location.key`) hace `scrollIntoView({ behavior: 'smooth' })`.
  Funciona igual desde la Home (repetir el mismo link vuelve a scrollear) y desde `/producto/:id`.
  Los `href` reales son `/#…`, así que abrir en pestaña nueva también funciona.
- **`scroll-margin-top`** para `#catalogo`, `#historia` y `#contacto` (64px / 72px) en `header.css`,
  para que el header no tape el título de la sección al subir hacia ella. Está en `header.css`
  porque depende de la altura del header y así no se tocan los CSS de esas secciones.
- **Menú mobile fuera del `<header>`:** el header tiene `transform` (para esconderse) y eso rompe
  el `position: fixed` de un hijo; por eso el panel se renderiza como hermano. Al abrir, el foco va
  a la X; al cerrar, vuelve al botón de menú. Tiene `role="dialog"` y `aria-modal`. Entra con un
  fade de opacidad (`--dur`).
- **Pop del contador:** el `<span>` de la cantidad usa `key={popCount}`, así cada aumento lo vuelve a
  montar y la animación arranca de nuevo aunque se agreguen dos productos seguidos. `popCount`
  arranca en 0 y solo sube cuando `totalItems` crece.
- **Franja:** cada grupo repite la lista dos veces (≈ 2000px) para que sea más ancho que pantallas
  grandes y no se vea un hueco; el track tiene dos grupos idénticos y anima a `-50%`. El segundo
  grupo y la repetición interna del primero llevan `aria-hidden`, así un lector de pantalla lee los
  4 textos una sola vez. Con reducir movimiento puede pasar a dos líneas en mobile en vez de cortarse.
- **Breakpoint del hero en 900px** (no 768px): entre 768 y 900 las columnas quedan de ~330px y
  "oportunidad." en Bodoni a ~55px no entra cómodo. El header sí usa 768px.
- **Máscara del H1:** cada línea tiene `padding-bottom: 0.08em` + `margin-bottom: -0.08em` para que
  `overflow: hidden` no corte los descendentes (p, g) sin cambiar el `line-height: 0.98`.
- **Animación de entrada:** eyebrow 0ms, líneas del H1 100/180ms (700ms), bajada 380ms, botones
  460ms, foto 100ms (`clip-path`, 1s), tarjeta 600ms. Termina a los ~1.1s. Con reducir movimiento
  se pone `animation: none` en `hero.css` (el bloque global acorta la duración pero no los delays,
  que dejarían los elementos ocultos un momento).
- **Header en mobile:** gaps más chicos (12px entre bloques, 10px logo-texto, padding del carrito
  10px) para que a 360px entren marca + carrito con cantidad + menú.
- Hover de los links del header: subrayado de 1px con `text-underline-offset: 6px`, sin transición.
- El `alt` de la foto es genérico: "Prendas seleccionadas de Feria Americana".

## Desvíos respecto al brief
- Hero en dos columnas desde 900px en vez de 768px (ver Decisiones).
- `scroll-margin-top` de las secciones vive en `header.css` (agrega selectores por id que no son
  BEM). No se tocaron los CSS de esas secciones.

## Pendientes o problemas encontrados
- **No hay `src/assets/hero.jpg`:** el hero muestra el placeholder gris (`--placeholder`). Cuando se
  agregue la foto, revisar que el `alt` la describa bien.
- **Scroll a `#contacto` desde `/producto/:id`:** el catálogo carga los productos de forma
  asíncrona y con scroll infinito, así que el alto de la página cambia después del scroll. Puede
  pasar que se llegue a "Contacto" y el catálogo crezca por encima (o que al pasar por el catálogo
  se dispare la carga de más productos). Revisar en el navegador; si molesta, se puede resolver en
  el brief 07 (Catálogo).
- A menos de ~350px de ancho, "FERIA AMERICANA" + carrito con 2 dígitos + menú puede no entrar.
  360px entra justo.
- La revisión visual la tiene que hacer alguien en el navegador: verifiqué que el build pase y el
  grep de variables viejas / colores en los tres CSS (sin resultados), pero no lo vi renderizado.
- About, Contacto y Footer siguen con el estilo viejo vía aliases (ver brief 04).

## Cómo probarlo
1. `npm run dev` y abrir la Home.
2. Arriba: header blanco con borde negro fino, franja negra corriendo y hero blanco de dos columnas.
   Recargar y ver la entrada del hero (termina en ~1s).
3. Pasar el mouse sobre la franja: se pausa. Dejarla correr: no hay salto en el loop.
4. Scrollear para abajo: el header se esconde pasados ~120px; subir un poco: aparece.
5. Agregar un producto: el contador del carrito hace pop. Recargar: no hace pop.
6. Abrir el carrito y scrollear: el header no se esconde. El carrito funciona igual.
7. Links del header: scrollean a Catálogo, Nuestra historia y Contacto. Repetir desde
   `/producto/:id`: vuelve a la Home y scrollea.
8. DevTools a 360px: marca + carrito + menú. Abrir el menú, navegar con un link, abrir y cerrar
   con la X y con Escape. Con el menú abierto el fondo no scrollea.
9. Activar "reducir movimiento" en el sistema (Windows: Configuración → Accesibilidad → Efectos
   visuales → Efectos de animación desactivado): sin entrada del hero, franja quieta y centrada.
10. `grep -nE "gold|cream|rgba\(184" src/styles/header.css src/styles/hero.css src/styles/marquee.css`
    → sin resultados.
11. `npm run build` pasa.
