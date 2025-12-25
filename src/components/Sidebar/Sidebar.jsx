import { NavLink } from 'react-router-dom'
import {
    FiHome,
    FiCalendar,
    FiDollarSign,
    FiBarChart2,
    FiUsers,
    FiPackage,
    FiSettings,
    FiHelpCircle,
    FiLogOut,
    FiChevronDown
} from 'react-icons/fi'
import './Sidebar.css'

const Sidebar = () => {
    const menuItems = [
        { path: '/', icon: FiHome, label: 'Dashboard' },
        { path: '/financeiro', icon: FiDollarSign, label: 'Financeiro' },
        { path: '/grafico-geral', icon: FiBarChart2, label: 'Gráfico Geral' },
        { path: '/grafico-agenda-vendas', icon: FiBarChart2, label: 'Gráfico Agenda e Vendas' },
        { path: '/grafico-financeiro', icon: FiBarChart2, label: 'Gráfico do Financeiro' },
        { path: '/agendamento', icon: FiCalendar, label: 'Agendamento' },
        { path: '/caixa', icon: FiDollarSign, label: 'Caixa' },
        { path: '/clientes', icon: FiUsers, label: 'Clientes' },
        { path: '/profissional', icon: FiUsers, label: 'Profissional' },
        { path: '/produtos-servicos', icon: FiPackage, label: 'Produtos e Serviços' },
        { path: '/analise', icon: FiBarChart2, label: 'Análise' },
        { path: '/compras', icon: FiPackage, label: 'Compras' },
        { path: '/cadastros-gerais', icon: FiSettings, label: 'Cadastros Gerais' },
        { path: '/consulta', icon: FiHelpCircle, label: 'Consulta' },
        { path: '/permissoes', icon: FiSettings, label: 'Permissões' },
        { path: '/configuracoes', icon: FiSettings, label: 'Configurações' },
        { path: '/misc', icon: FiSettings, label: 'Misc' },
        { path: '/ajuda', icon: FiHelpCircle, label: 'Ajuda' },
        { path: '/sair', icon: FiLogOut, label: 'Sair' }
    ]

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="sidebar-logo">
                    <span className="logo-icon">🤖</span>
                    Fbz Sistemas IA
                </h1>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon className="sidebar-icon" />
                        <span className="sidebar-label">{item.label}</span>
                        {item.hasSubmenu && <FiChevronDown className="sidebar-chevron" />}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar
