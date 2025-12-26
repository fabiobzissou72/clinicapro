import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentsAPI } from '../services/api';
import { Plus, Calendar, Clock, X } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    const patientId = localStorage.getItem('user_id');
    const response = await appointmentsAPI.list({ paciente_id: patientId });

    let filtered = response.data.appointments;
    const now = new Date();

    if (filter === 'upcoming') {
      filtered = filtered.filter((a: any) => new Date(a.start_time) >= now && a.status !== 'cancelled');
    } else if (filter === 'past') {
      filtered = filtered.filter((a: any) => new Date(a.start_time) < now || a.status === 'completed');
    } else if (filter === 'cancelled') {
      filtered = filtered.filter((a: any) => a.status === 'cancelled');
    }

    setAppointments(filtered);
  };

  const handleCancel = async (id: string) => {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      await appointmentsAPI.cancel(id);
      loadAppointments();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meus Agendamentos</h2>
        <Link
          to="/appointments/new"
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        >
          <Plus size={24} />
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {['upcoming', 'past', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            {f === 'upcoming' ? 'Próximos' : f === 'past' ? 'Passados' : 'Cancelados'}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          appointments.map((apt: any) => (
            <div key={apt.id} className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{apt.procedimentos?.name}</h3>
                  <p className="text-sm text-gray-600">{apt.profiles?.full_name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                  {getStatusLabel(apt.status)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span className="text-sm">{new Date(apt.start_time).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm">
                    {new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {apt.status === 'confirmed' && (
                <button
                  onClick={() => handleCancel(apt.id)}
                  className="mt-4 w-full bg-red-50 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancelar
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
