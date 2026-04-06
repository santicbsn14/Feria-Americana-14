import type { CartItem } from '../types';
import { WHATSAPP_NUMBER } from '../data/products';

export function useWhatsAppOrder() {
  const sendOrder = (items: CartItem[], totalPrice: number) => {
    if (items.length === 0) return;

    const lines = items.map((item) => {
      const size = item.product.size ? ` — Talle ${item.product.size}` : '';
      return `• ${item.product.name}${size} — $${item.product.price.toLocaleString('es-AR')}`;
    });

    const message = [
      '🛍️ *Nuevo Pedido - Feria Americana*',
      '─────────────────────',
      ...lines,
      '─────────────────────',
      `💰 *Total: $${totalPrice.toLocaleString('es-AR')}*`,
      '',
      '¡Hola! Me gustaría hacer este pedido 😊',
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return { sendOrder };
}