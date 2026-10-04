import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { scrollToSection } from '../lib/sectionScroll';
import Cart from './Cart';

const NAV_LINKS = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'historia', label: 'Nuestra historia' },
  { id: 'contacto', label: 'Contacto' },
];

const HIDE_AFTER = 120;
const MOBILE_MENU_ID = 'header-mobile-menu';

export default function Header() {
  const { totalItems } = useCart();
  const { pathname, hash, key } = useLocation();
  const navigate = useNavigate();

  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [popCount, setPopCount] = useState(0);
  const [prevTotal, setPrevTotal] = useState(totalItems);

  const cartBtnRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const keepVisible = menuOpen || cartOpen;

  // Pop del contador solo cuando aumenta (no al cargar). Se ajusta durante el render, sin efecto.
  if (totalItems !== prevTotal) {
    setPrevTotal(totalItems);
    if (totalItems > prevTotal) setPopCount((c) => c + 1);
  }

  // Al abrir el menú o el carrito el header se muestra (y no se esconde mientras sigan abiertos)
  const openCart = () => {
    setHidden(false);
    setCartOpen(true);
  };
  const openMenu = () => {
    setHidden(false);
    setMenuOpen(true);
  };
  // Estable: el carrito la usa en sus efectos
  const closeCart = useCallback(() => setCartOpen(false), []);

  // Esconder al bajar, mostrar al subir
  useEffect(() => {
    if (keepVisible) return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 4) return;
      setHidden(y > HIDE_AFTER && y > lastY);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [keepVisible]);

  // Scroll a la sección del hash (también al llegar desde /producto/:id).
  // scrollToSection frena el infinite scroll en el camino y corrige si el catálogo creció.
  useEffect(() => {
    if (pathname !== '/' || !hash) return;
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById(hash.slice(1));
      if (section) scrollToSection(section);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key]);

  // Menú mobile: bloquear scroll, Escape y foco
  useEffect(() => {
    if (!menuOpen) return;
    const menuBtn = menuBtnRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 768px)');
    const onResize = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
      menuBtn?.focus();
    };
  }, [menuOpen]);

  const goToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMenuOpen(false);
    navigate({ pathname: '/', hash: `#${id}` });
  };

  const navLinks = (className: string) =>
    NAV_LINKS.map(({ id, label }) => (
      <a key={id} href={`/#${id}`} className={className} onClick={(e) => goToSection(e, id)}>
        {label}
      </a>
    ));

  return (
    <>
      <header className={`header ${hidden ? 'header--hidden' : ''}`}>
        <div className="header__inner">
          <Link to="/" className="header__brand">
            <img src="/feria_logo_mark.png" alt="" className="header__mark" width={44} height={44} />
            <span className="header__name">Feria Americana</span>
          </Link>

          <nav className="header__nav" aria-label="Principal">
            {navLinks('header__link')}
          </nav>

          <div className="header__actions">
            <button
              ref={cartBtnRef}
              className="header__cart"
              onClick={openCart}
              aria-haspopup="dialog"
              aria-expanded={cartOpen}
              aria-label={totalItems > 0 ? `Abrir carrito (${totalItems})` : 'Abrir carrito'}
            >
              <svg
                className="header__cart-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <path d="M5 8h14l-1 13H6L5 8z" />
                <path d="M9 8V6a3 3 0 016 0v2" />
              </svg>
              {totalItems > 0 && (
                <span
                  key={popCount}
                  className={`header__cart-count ${popCount > 0 ? 'header__cart-count--pop' : ''}`}
                >
                  {totalItems}
                </span>
              )}
            </button>

            <button
              ref={menuBtnRef}
              className="header__menu-btn"
              onClick={openMenu}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls={MOBILE_MENU_ID}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div id={MOBILE_MENU_ID} className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="mobile-menu__top">
            <span className="header__name">Feria Americana</span>
            <button
              ref={closeBtnRef}
              className="mobile-menu__close"
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>
          <nav className="mobile-menu__nav" aria-label="Principal">
            {navLinks('mobile-menu__link')}
          </nav>
        </div>
      )}

      <Cart isOpen={cartOpen} onClose={closeCart} returnFocusRef={cartBtnRef} />
    </>
  );
}
