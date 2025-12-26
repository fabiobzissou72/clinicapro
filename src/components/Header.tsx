import { Bell, Moon, Sun, Search, Menu } from 'lucide-react';

interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
    onMenuClick: () => void;
}

const Header = ({ theme, toggleTheme, onMenuClick }: HeaderProps) => {
    return (
        <header style={{
            height: '70px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem',
            gap: '1rem'
        }}>
            {/* Botão Menu Mobile */}
            <button
                onClick={onMenuClick}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: window.innerWidth > 768 ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    cursor: 'pointer'
                }}
            >
                <Menu size={20} />
            </button>

            <div style={{ position: 'relative', flex: 1, maxWidth: '400px', display: window.innerWidth < 640 ? 'none' : 'block' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    placeholder="Pesquisar..."
                    style={{
                        width: '100%',
                        padding: '0.6rem 1rem 0.6rem 2.5rem',
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        color: 'var(--text-main)',
                        fontSize: '0.875rem',
                        outline: 'none'
                    }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <button
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        position: 'relative'
                    }}
                >
                    <Bell size={20} />
                    <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '8px',
                        height: '8px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        border: '2px solid var(--bg-card)'
                    }}></span>
                </button>
            </div>
        </header>
    );
};

export default Header;
