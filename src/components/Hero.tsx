// Foto del hero en public/. Si se vacía esta constante, se muestra el placeholder.
const heroImage = '/imgHero.jpeg';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__text">
          <p className="hero__eyebrow">Ropa usada seleccionada</p>
          <h1 className="hero__title">
            <span className="hero__line">
              <span className="hero__line-inner">Cada pieza,</span>
            </span>
            <span className="hero__line">
              <span className="hero__line-inner">una segunda oportunidad.</span>
            </span>
          </h1>
          <p className="hero__lead">
            Ropa, calzado y accesorios únicos con historia. Elegís, armás tu pedido y lo
            coordinamos por WhatsApp.
          </p>
          <div className="hero__actions">
            <a href="#catalogo" className="hero__cta">
              Ver catálogo
              <svg
                className="hero__cta-arrow"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <line x1="4" y1="12" x2="20" y2="12" />
                <polyline points="14 6 20 12 14 18" />
              </svg>
            </a>
            <a href="#historia" className="hero__link">
              Nuestra historia
            </a>
          </div>
        </div>

        <figure className="hero__media">
          {heroImage ? (
            <img
              src={heroImage}
              alt="Prendas seleccionadas de Feria Americana"
              className="hero__img"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div className="hero__img hero__img--placeholder" aria-hidden="true" />
          )}
          <figcaption className="hero__location">
            <span className="hero__location-label">Nos encontrás en</span>
            <span className="hero__location-place">Santiago del Estero y Garibaldi</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
