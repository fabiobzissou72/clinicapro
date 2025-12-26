import { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';
import { ShoppingCart, Plus } from 'lucide-react';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  const loadProducts = async () => {
    const response = await productsAPI.list();
    setProducts(response.data.products);
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Loja Virtual</h2>
        <a href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product: any) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-square bg-gray-200 relative">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-4xl">📦</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-bold text-blue-600">R$ {product.sale_price?.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
