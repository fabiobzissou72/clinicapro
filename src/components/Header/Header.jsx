import { useTheme } from '../../contexts/ThemeContext'
import { FiSun, FiMoon, FiBell, FiUser, FiSearch } from 'react-icons/fi'
import './Header.css'

const Header = ({ title, subtitle }) => {
    const { theme, toggleTheme } = useTheme()

    return (
        <header className="header">
            <div className="header-breadcrumb">
                <h1 className="header-title">{title}</h1>
                {subtitle && <p className="header-subtitle">{subtitle}</p>}
            </div>

            <div className="header-actions">
                <div className="header-search">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="search-input"
                    />
                </div>

                <button className="header-btn" aria-label="Notificações">
                    <FiBell />
                    <span className="notification-badge">3</span>
                </button>

                <button
                    className="header-btn theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Alternar tema"
                >
                    {theme === 'light' ? <FiMoon /> : <FiSun />}
                </button>

                <button className="header-btn user-btn">
                    <FiUser />
                </button>
            </div>
        </header>
    )
}

export default Header
