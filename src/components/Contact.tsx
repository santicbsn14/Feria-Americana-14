import { WHATSAPP_NUMBER } from '../data/products'
import { ChatIcon, ClockIcon, PinIcon, WhatsAppIcon } from './Icons'

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Santiago+del+Estero+y+Garibaldi,+San+Nicolás+de+los+Arroyos'

export default function Contact() {
  const chatLink = `https://wa.me/${WHATSAPP_NUMBER}`
  const waLink = `${chatLink}?text=${encodeURIComponent('¡Hola! Quería consultarte algo sobre la feria 😊')}`

  return (
    <section className="contact" id="contacto" aria-labelledby="contact-title">
      <div className="contact__inner">
        <div className="contact__head">
          <div>
            <p className="contact__eyebrow">Contacto</p>
            <h2 id="contact-title" className="contact__title">
              Encontranos
            </h2>
          </div>
          <p className="contact__note">Pasá por el local o escribinos por WhatsApp</p>
        </div>

        <div className="contact__cols">
          <div className="contact__col">
            <PinIcon className="contact__icon" />
            <h3 className="contact__col-title">Dirección</h3>
            <p className="contact__text">Santiago del Estero y Garibaldi</p>
            <p className="contact__sub">San Nicolás de los Arroyos, Buenos Aires</p>
            <a className="contact__link" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
              Cómo llegar <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="contact__col">
            <ClockIcon className="contact__icon" />
            <h3 className="contact__col-title">Horarios</h3>
            <p className="contact__text">Lunes a Sábados</p>
            <p className="contact__sub">Consultá disponibilidad por WhatsApp</p>
          </div>

          <div className="contact__col">
            <ChatIcon className="contact__icon" />
            <h3 className="contact__col-title">WhatsApp</h3>
            <p className="contact__text">
              <a className="contact__phone" href={chatLink} target="_blank" rel="noopener noreferrer">
                +54 9 336 403-4045
              </a>
            </p>
            <p className="contact__sub">Respondemos a la brevedad</p>
          </div>
        </div>

        <a href={waLink} target="_blank" rel="noopener noreferrer" className="contact__cta">
          <WhatsAppIcon />
          Escribinos por WhatsApp
        </a>
      </div>
    </section>
  )
}
