import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Sparkles,
    DollarSign,
    BarChart3,
    Settings,
    LogOut,
    User,
    FileText,
    Video,
    MessageSquare,
    Package,
    ShoppingBag,
    Bot,
    ClipboardList,
    Zap,
    Shield,
    TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Sidebar = () => {
    const location = useLocation();

    const menuSections = [
        {
            title: 'Principal',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
                { name: 'Agendamentos', icon: Calendar, path: '/agendamentos' },
                { name: 'Pacientes', icon: Users, path: '/pacientes' }
            ]
        },
        {
            title: 'Atendimento',
            items: [
                { name: 'Anamnese', icon: ClipboardList, path: '/anamnese' },
                { name: 'Prontuários IA', icon: FileText, path: '/prontuarios' },
                { name: 'Telemedicina', icon: Video, path: '/telemedicina' }
            ]
        },
        {
            title: 'Automação',
            items: [
                { name: 'WhatsApp Bot', icon: MessageSquare, path: '/whatsapp' },
                { name: 'Automações', icon: Bot, path: '/automacoes' },
                { name: 'Config IA', icon: Zap, path: '/config-ia' }
            ]
        },
        {
            title: 'Gestão',
            items: [
                { name: 'Procedimentos', icon: Sparkles, path: '/procedimentos' },
                { name: 'Estoque', icon: Package, path: '/estoque' },
                { name: 'Loja Virtual', icon: ShoppingBag, path: '/loja' },
                { name: 'Financeiro', icon: DollarSign, path: '/financeiro' }
            ]
        },
        {
            title: 'Análises',
            items: [
                { name: 'Relatórios', icon: BarChart3, path: '/relatorios' },
                { name: 'Campanhas', icon: TrendingUp, path: '/campanhas' }
            ]
        },
        {
            title: 'Sistema',
            items: [
                { name: 'Integrações', icon: Zap, path: '/integracoes' },
                { name: 'Segurança', icon: Shield, path: '/seguranca' },
                { name: 'Configurações', icon: Settings, path: '/configuracoes' }
            ]
        }
    ];

    const handleLogout = async () => {
        window.localStorage.removeItem('sb-demo-session');
        await supabase.auth.signOut();
    };

    return (
        <aside style={{
            width: 'var(--sidebar-w)',
            borderRight: '1px solid var(--border)',
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 0.75rem',
            overflowY: 'auto',
            height: '100vh',
            position: 'sticky',
            top: 0
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingLeft: '0.75rem' }}>
                <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '10px' }}>
                    <Sparkles size={20} color="white" />
                </div>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Clínica Pro</h1>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {menuSections.map((section, idx) => (
                    <div key={idx}>
                        <h3 style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '0 0.75rem',
                            marginBottom: '0.5rem'
                        }}>
                            {section.title}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {section.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.625rem 0.75rem',
                                            borderRadius: '8px',
                                            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                            background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                            transition: 'all 0.2s ease',
                                            fontWeight: isActive ? 600 : 400,
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <item.icon size={18} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Admin</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conta Master</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem 0.75rem',
                        borderRadius: '8px',
                        color: '#ef4444',
                        width: '100%',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
