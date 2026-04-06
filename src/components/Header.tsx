import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Cart from './Cart';
import logoFeria from '../assets/feria_logo.jpeg'
export default function Header() {
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <div className="header__logo">
            <img src={logoFeria} alt="Feria Americana" className="header__logo-img" />
          </div>
          <nav className="header__nav">
            <span className="header__tagline">Moda · Estilo · Historia</span>
          </nav>
          <button
            className="header__cart-btn"
            onClick={() => setCartOpen(true)}
            aria-label="Abrir carrito"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className="header__cart-badge">{totalItems}</span>
            )}
          </button>
        </div>
      </header>
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
