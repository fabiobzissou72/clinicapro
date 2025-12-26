import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, History, ShoppingBag, User, LogOut } from 'lucide-react';

export default function Layout({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/appointments', icon: Calendar, label: 'Agenda' },
    { path: '/history', icon: History, label: 'Histórico' },
    { path: '/shop', icon: ShoppingBag, label: 'Loja' },
    { path: '/profile', icon: User, label: 'Perfil' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">Clínica Estética</h1>
          <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around items-center py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-lg transition ${
                  isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                }`
              }
            >
              <item.icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
