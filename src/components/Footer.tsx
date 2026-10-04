import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import logoFeria from '../assets/feria_logo.png'

const NAV_LINKS = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'historia', label: 'Nuestra historia' },
  { id: 'contacto', label: 'Contacto' },
]

export default function Footer() {
  const navigate = useNavigate()

  // Igual que el Header: navega a /#id y el Header scrollea con scrollToSection (desde cualquier página)
  const goToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    navigate({ pathname: '/', hash: `#${id}` })
  }

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <img src={logoFeria} alt="Feria Americana" className="footer__logo" height={96} />

          <div className="footer__info">
            <nav className="footer__nav" aria-label="Pie de página">
              {NAV_LINKS.map(({ id, label }) => (
                <a key={id} href={`/#${id}`} className="footer__link" onClick={(e) => goToSection(e, id)}>
                  {label}
                </a>
              ))}
            </nav>
            <p className="footer__address">
              <span className="footer__address-item">Santiago del Estero y Garibaldi</span>{' '}
              <span aria-hidden="true">·</span>{' '}
              <span className="footer__address-item">WhatsApp +54 9 336 403-4045</span>
            </p>
          </div>
        </div>

        <p className="footer__wordmark" aria-hidden="true">
          Feria Americana
        </p>

        <div className="footer__bottom">
          <p className="footer__copy">© {new Date().getFullYear()} Feria Americana</p>
          <a
            href="https://santiago-viale-web.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__dev"
          >
            Diseñado y desarrollado por Santiago Viale
          </a>
        </div>
      </div>
    </footer>
  )
}
