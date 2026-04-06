import type { Product } from '../types';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
}

const conditionColors: Record<string, string> = {
  Excelente: '#5a7a4a',
  'Muy bueno': '#7a6a3a',
  Bueno: '#5a5a7a',
};

export default function ProductCard({ product }: Props) {
  const { addItem, removeItem, isInCart } = useCart();
  const inCart = isInCart(product.id);

  const handleToggle = () => {
    if (!product.available) return;
    if (inCart) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <article className={`product-card ${!product.available ? 'product-card--sold' : ''}`}>
      <div className="product-card__img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-card__img"
          loading="lazy"
        />
        <span
          className="product-card__condition"
          style={{ backgroundColor: conditionColors[product.condition] }}
        >
          {product.condition}
        </span>
        <span className="product-card__category">{product.category}</span>
        {!product.available && (
          <div className="product-card__sold-overlay">
            <span>VENDIDO</span>
          </div>
        )}
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>

        {product.size && (
          <div className="product-card__size-tag">
            <span className="size-label">Talle {product.size}</span>
          </div>
        )}

        <div className="product-card__footer">
          <span className="product-card__price">
            ${product.price.toLocaleString('es-AR')}
          </span>
          <button
            className={`add-btn ${inCart ? 'add-btn--added' : ''} ${!product.available ? 'add-btn--disabled' : ''}`}
            onClick={handleToggle}
            disabled={!product.available}
          >
            {!product.available ? 'Vendido' : inCart ? '✓ En carrito' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
}