export default function About() {
  return (
    <section className="about">
      <div className="about__inner">
        <div className="about__text">
          <div className="about__divider">
            <span className="about__divider-ornament">✦</span>
          </div>
          <h2 className="about__title">Nuestra Historia</h2>
          <p className="about__lead">
            Todo empezó con un local pequeño que da a la calle, mucha pasión y el ojo certero de "el Tano".
          </p>
          <p className="about__body">
            Valentino Malacalza tiene 22 años y lleva casi tres construyendo algo que hoy es mucho más que un negocio. 
            Lo que arrancó como un local en su casa — con ropa usada en buen estado que compraba y revendía — fue creciendo 
            de a poco, con trabajo y criterio. Cada pieza seleccionada a mano, nunca botes de ropa al azar.
          </p>
<p className="about__body">
  Hoy el local creció, el stock se diversificó, y la propuesta se convirtió 
  en un lugar de referencia para quienes buscan moda con identidad a precios accesibles. 
  Prendas con historia, con estilo, con vida útil por delante.
</p>
          <p className="about__body">
            Esto es lo que pasa cuando alguien joven apuesta en serio a lo que le gusta.
          </p>
        </div>

        <div className="about__stats">
          <div className="about__stat">
            <span className="about__stat-number">+2</span>
            <span className="about__stat-label">años en el mercado</span>
          </div>
          <div className="about__stat">
            <span className="about__stat-number">100%</span>
            <span className="about__stat-label">ropa seleccionada</span>
          </div>
          <div className="about__stat">
            <span className="about__stat-number">ARG</span>
          </div>
        </div>
      </div>
    </section>
  )
}