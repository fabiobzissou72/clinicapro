import { Bell, Moon, Sun, Search } from 'lucide-react';

interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
}

const Header = ({ theme, toggleTheme }: HeaderProps) => {
    return (
        <header style={{
            height: '70px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
        }}>
            <div style={{ position: 'relative', width: '300px' }}>
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
