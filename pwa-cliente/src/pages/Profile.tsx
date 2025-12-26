import { useEffect, useState } from 'react';
import { User, Phone, Mail, Award, Settings } from 'lucide-react';
import { authAPI } from '../services/api';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const response = await authAPI.me();
    setUser(response.data.user);
    setPoints(Math.floor(Math.random() * 500)); // Mock points
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Meu Perfil</h2>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <User size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{user?.full_name || 'Carregando...'}</h3>
            <p className="opacity-90">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/20 rounded-lg p-3">
          <Award className="text-yellow-300" size={24} />
          <div>
            <p className="text-sm opacity-90">Pontos de Fidelidade</p>
            <p className="text-2xl font-bold">{points}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        <h3 className="font-semibold text-lg">Informações</h3>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Mail size={20} className="text-gray-600" />
          <div>
            <p className="text-xs text-gray-500">E-mail</p>
            <p className="font-medium">{user?.email || 'Não informado'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Phone size={20} className="text-gray-600" />
          <div>
            <p className="text-xs text-gray-500">Telefone</p>
            <p className="font-medium">{user?.phone || 'Não informado'}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-sm">
        <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-xl">
          <Settings size={20} className="text-gray-600" />
          <span className="font-medium">Configurações</span>
        </button>
      </div>
    </div>
  );
}
