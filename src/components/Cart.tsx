import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWhatsAppOrder } from '../hooks/useWhatsAppOrder';
import { imgCrop } from '../lib/sanityClient';
import { BagIcon, CloseIcon, WhatsAppIcon } from './Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Botón que abrió el panel: recibe el foco al cerrar. */
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

const CONFIRM_MS = 3000;
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Cart({ isOpen, onClose, returnFocusRef }: Props) {
  const { items, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const { sendOrder } = useWhatsAppOrder();
  const navigate = useNavigate();

  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const confirmTimer = useRef(0);
  const [confirmClear, setConfirmClear] = useState(false);

  // Escape cierra; Tab queda dentro del panel
  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    const panel = panelRef.current;
    if (e.key !== 'Tab' || !panel) return;
    const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Abierto: bloquear scroll, foco al botón de cerrar. Al cerrar, el foco vuelve al header.
  useEffect(() => {
    if (!isOpen) return;
    const returnTo = returnFocusRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => onKeyDown(e);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKey);
      returnTo?.focus({ preventScroll: true });
    };
  }, [isOpen, returnFocusRef]);

  useEffect(() => () => window.clearTimeout(confirmTimer.current), []);

  const handleRemove = (index: number, productId: string) => {
    removeItem(productId);
    // Que el foco no se pierda: al "Quitar" siguiente, o al botón de cerrar si no quedan
    requestAnimationFrame(() => {
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('.cart-item__remove');
      const next = buttons && buttons.length > 0 ? buttons[Math.min(index, buttons.length - 1)] : null;
      (next ?? closeRef.current)?.focus();
    });
  };

  const handleClear = () => {
    window.clearTimeout(confirmTimer.current);
    if (!confirmClear) {
      setConfirmClear(true);
      confirmTimer.current = window.setTimeout(() => setConfirmClear(false), CONFIRM_MS);
      return;
    }
    setConfirmClear(false);
    clearCart();
    closeRef.current?.focus();
  };

  // El Header scrollea al hash con scrollToSection (también llegando desde /producto/:id)
  const goToCatalog = () => {
    onClose();
    navigate({ pathname: '/', hash: '#catalogo' });
  };

  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'cart-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        className={`cart ${isOpen ? 'cart--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="cart__header">
          <div className="cart__heading">
            <h2 id="cart-title" className="cart__title">
              Tu pedido
            </h2>
            {totalItems > 0 && (
              <span className="cart__count">
                {totalItems} {totalItems === 1 ? 'prenda' : 'prendas'}
              </span>
            )}
          </div>
          <button ref={closeRef} type="button" className="cart__close" onClick={onClose} aria-label="Cerrar pedido">
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart__empty">
            <BagIcon className="cart__empty-icon" />
            <p className="cart__empty-title">Tu pedido está vacío</p>
            <button type="button" className="cart__empty-btn" onClick={goToCatalog}>
              Ver catálogo
            </button>
          </div>
        ) : (
          <>
            <ul ref={listRef} className="cart__items">
              {items.map(({ product }, index) => (
                <li key={product.id} className="cart-item">
                  <span
                    className="cart-item__media"
                    style={product.lqip ? { backgroundImage: `url(${product.lqip})` } : undefined}
                  >
                    <img
                      src={imgCrop(product.image, 144, 180)}
                      alt=""
                      width={72}
                      height={90}
                      loading="lazy"
                      decoding="async"
                      className="cart-item__img"
                    />
                  </span>
                  <div className="cart-item__info">
                    <p className="cart-item__name">{product.name}</p>
                    {product.size && <span className="cart-item__size">Talle {product.size}</span>}
                    <span className="cart-item__price">${product.price.toLocaleString('es-AR')}</span>
                  </div>
                  <button
                    type="button"
                    className="cart-item__remove"
                    onClick={() => handleRemove(index, product.id)}
                    aria-label={`Quitar ${product.name}`}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart__footer">
              <div className="cart__total">
                <span>Total</span>
                <strong>${totalPrice.toLocaleString('es-AR')}</strong>
              </div>
              <button type="button" className="cart__order" onClick={() => sendOrder(items, totalPrice)}>
                <WhatsAppIcon />
                Enviar pedido por WhatsApp
              </button>
              <button
                type="button"
                className={`cart__clear ${confirmClear ? 'cart__clear--confirm' : ''}`}
                onClick={handleClear}
              >
                <span aria-live="polite">
                  {confirmClear ? '¿Seguro? Tocá de nuevo para vaciar' : 'Vaciar pedido'}
                </span>
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
