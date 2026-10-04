import { useReveal } from '../hooks/useReveal'

// La foto es opcional: si existe src/assets/about.jpg se muestra debajo del lead.
const aboutImages = import.meta.glob<string>('../assets/about.jpg', {
  eager: true,
  import: 'default',
})
const aboutImage = Object.values(aboutImages)[0]

const revealClass = (base: string, revealed: boolean) =>
  `${base} about__reveal ${revealed ? '' : 'about__reveal--pending'}`

export default function About() {
  const [leadRef, leadRevealed] = useReveal<HTMLDivElement>()
  const [bodyRef, bodyRevealed] = useReveal<HTMLDivElement>()
  const [statsRef, statsRevealed] = useReveal<HTMLDListElement>()

  return (
    <section className="about" id="historia" aria-labelledby="about-title">
      <div className="about__inner">
        <div className="about__grid">
          <div ref={leadRef} className={revealClass('about__intro', leadRevealed)}>
            <h2 id="about-title" className="about__eyebrow">
              Nuestra historia
            </h2>
            <p className="about__lead">
              Todo empezó con un local pequeño que da a la calle, mucha pasión y el ojo certero de "el Tano".
            </p>
            {aboutImage && (
              <img
                src={aboutImage}
                alt="El local de Feria Americana"
                className="about__img"
                loading="lazy"
                decoding="async"
              />
            )}
          </div>

          <div ref={bodyRef} className={revealClass('about__body', bodyRevealed)}>
            <p>
              Valentino Malacalza tiene 22 años y lleva casi tres construyendo algo que hoy es mucho más que un
              negocio. Lo que arrancó como un local en su casa — con ropa usada en buen estado que compraba y
              revendía — fue creciendo de a poco, con trabajo y criterio. Cada pieza seleccionada a mano, nunca
              botes de ropa al azar.
            </p>
            <p>
              Hoy el local creció, el stock se diversificó, y la propuesta se convirtió en un lugar de referencia
              para quienes buscan moda con identidad a precios accesibles. Prendas con historia, con estilo, con
              vida útil por delante.
            </p>
            <p>Esto es lo que pasa cuando alguien joven apuesta en serio a lo que le gusta.</p>
          </div>
        </div>

        <dl ref={statsRef} className={revealClass('about__stats', statsRevealed)}>
          <div className="about__stat">
            <dt className="about__stat-label">años en el mercado</dt>
            <dd className="about__stat-number">+2</dd>
          </div>
          <div className="about__stat">
            <dt className="about__stat-label">ropa seleccionada</dt>
            <dd className="about__stat-number">100%</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
