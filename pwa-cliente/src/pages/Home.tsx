import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ShoppingBag, Wallet, Clock } from 'lucide-react';
import { appointmentsAPI } from '../services/api';

export default function Home() {
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.full_name || 'Cliente');

    // Carregar próximo agendamento
    const patientId = localStorage.getItem('user_id');
    const response = await appointmentsAPI.list({ paciente_id: patientId, status: 'confirmed' });
    if (response.data.appointments?.length > 0) {
      setNextAppointment(response.data.appointments[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Olá, {userName}!</h2>
        <p className="text-gray-600">Seja bem-vindo de volta</p>
      </div>

      {/* Next Appointment */}
      {nextAppointment && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-90">Próxima Consulta</p>
              <h3 className="text-xl font-bold mt-1">{nextAppointment.procedimentos?.name}</h3>
              <div className="flex items-center gap-2 mt-3">
                <Calendar size={16} />
                <span className="text-sm">{new Date(nextAppointment.start_time).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={16} />
                <span className="text-sm">{new Date(nextAppointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            <Link
              to="/appointments"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50"
            >
              Ver Detalhes
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Acesso Rápido</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/appointments/new"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3"
          >
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <span className="font-semibold text-gray-900">Agendar</span>
          </Link>

          <Link
            to="/shop"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3"
          >
            <div className="bg-purple-100 p-3 rounded-full">
              <ShoppingBag className="text-purple-600" size={24} />
            </div>
            <span className="font-semibold text-gray-900">Loja</span>
          </Link>

          <Link
            to="/history"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3"
          >
            <div className="bg-green-100 p-3 rounded-full">
              <Clock className="text-green-600" size={24} />
            </div>
            <span className="font-semibold text-gray-900">Histórico</span>
          </Link>

          <Link
            to="/profile"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3"
          >
            <div className="bg-orange-100 p-3 rounded-full">
              <Wallet className="text-orange-600" size={24} />
            </div>
            <span className="font-semibold text-gray-900">Pontos</span>
          </Link>
        </div>
      </div>

      {/* Special Offers */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Ofertas Especiais</h3>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Limpeza de Pele com 20% OFF</h4>
              <p className="text-sm text-gray-600">Válido até o final do mês</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
