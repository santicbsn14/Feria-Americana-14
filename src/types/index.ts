export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  size?: string;
  condition: 'Excelente' | 'Muy bueno' | 'Bueno';
  available: boolean;
}

export type Category =
  | 'Ropa Mujer'
  | 'Ropa Hombre'
  | 'Ropa Niños'
  | 'Calzado'
  | 'Accesorios'
  | 'Hogar';

export interface CartItem {
  product: Product;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isInCart: (productId: string) => boolean;
}