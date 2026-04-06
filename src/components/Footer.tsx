export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__ornament">✦ ✦ ✦</div>
      <img src="/feria_logo.jpeg" alt="Feria Americana" className="footer__logo" />
      <p className="footer__copy">
        © {new Date().getFullYear()} Feria Americana — Todos los derechos reservados
      </p>
      <a 
        href="https://santiago-viale-web.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="footer__dev"
      >
        Diseñado y desarrollado por Santiago Viale
      </a>
    </footer>
  )
}