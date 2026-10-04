const ITEMS = [
  'Prendas únicas',
  'Una sola unidad',
  'Pedidos por WhatsApp',
  'San Nicolás de los Arroyos',
];

// Cada grupo repite la lista dos veces para que sea más ancho que pantallas grandes.
// El track tiene dos grupos idénticos y anima translateX(0 → -50%): el loop no salta.
function Group({ hidden }: { hidden?: boolean }) {
  return (
    <div className="marquee__group" aria-hidden={hidden || undefined}>
      {[...ITEMS, ...ITEMS].map((text, i) => (
        <span
          key={i}
          className="marquee__item"
          aria-hidden={!hidden && i >= ITEMS.length ? true : undefined}
        >
          {text}
          <span className="marquee__sep" aria-hidden="true">/</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee__track">
        <Group />
        <Group hidden />
      </div>
    </div>
  );
}
