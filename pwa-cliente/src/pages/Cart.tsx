import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const [cart, setCart] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    const patientId = localStorage.getItem('user_id');

    const orderData = {
      paciente_id: patientId,
      items: cart.map(item => ({
        estoque_id: item.id,
        quantity: item.quantity,
        unit_price: item.sale_price
      })),
      source: 'pwa'
    };

    await ordersAPI.create(orderData);
    localStorage.removeItem('cart');
    alert('Pedido realizado com sucesso!');
    navigate('/history');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Carrinho</h2>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-600">Seu carrinho está vazio</p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Ir para Loja
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item: any) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-blue-600 font-bold mt-1">R$ {item.sale_price?.toFixed(2)}</p>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 hover:bg-gray-200 rounded-l-lg"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 hover:bg-gray-200 rounded-r-lg"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-red-600 p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-blue-600">R$ {getTotal().toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg"
            >
              Finalizar Pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
}
