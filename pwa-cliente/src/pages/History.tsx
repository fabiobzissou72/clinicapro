import { useEffect, useState } from 'react';
import { appointmentsAPI, ordersAPI } from '../services/api';
import { Calendar, ShoppingBag } from 'lucide-react';

export default function History() {
  const [tab, setTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const patientId = localStorage.getItem('user_id');

    const aptsResponse = await appointmentsAPI.list({ paciente_id: patientId });
    setAppointments(aptsResponse.data.appointments.filter((a: any) => a.status === 'completed'));

    const ordersResponse = await ordersAPI.list(patientId!);
    setOrders(ordersResponse.data.orders);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Histórico</h2>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('appointments')}
          className={`flex-1 py-3 rounded-lg font-semibold ${
            tab === 'appointments' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
        >
          Procedimentos
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`flex-1 py-3 rounded-lg font-semibold ${
            tab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
        >
          Compras
        </button>
      </div>

      {tab === 'appointments' && (
        <div className="space-y-4">
          {appointments.map((apt: any) => (
            <div key={apt.id} className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{apt.procedimentos?.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{apt.profiles?.full_name}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(apt.start_time).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <ShoppingBag className="text-purple-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Pedido #{order.id.slice(0, 8)}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.order_items?.length} {order.order_items?.length === 1 ? 'item' : 'itens'}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="font-bold text-blue-600">
                      R$ {order.total_amount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
