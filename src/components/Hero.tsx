import logoFeria from '../assets/feria_logo.jpeg'
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__texture" />
      <div className="hero__content">
        <p className="hero__eyebrow">✦ Bienvenidos a ✦</p>
        <img
          src={logoFeria}
          alt="Feria Americana"
          className="hero__logo"
        />
        <p className="hero__copy">
          Ropa, calzado y accesorios únicos con historia.<br />
          Cada pieza, una segunda oportunidad.
        </p>
        <a href="#catalogo" className="hero__cta">
          Ver catálogo
        </a>
      </div>
      <div className="hero__scroll-hint">
        <span>↓</span>
      </div>
    </section>
  );
}
