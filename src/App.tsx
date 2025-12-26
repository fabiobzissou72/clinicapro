import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Financeiro from './pages/Financeiro';
import Prontuarios from './pages/Prontuarios';
import Telemedicina from './pages/Telemedicina';
import Anamnese from './pages/Anamnese';
import AutomacaoWhatsApp from './pages/AutomacaoWhatsApp';

// Placeholders para páginas que virão
const Placeholder = ({ title }: { title: string }) => (
    <div style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)' }}>Página em desenvolvimento...</p>
        <div className="card" style={{ marginTop: '2rem', padding: '4rem', textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</p>
            <p style={{ color: 'var(--text-muted)' }}>
                Esta funcionalidade está sendo implementada.
                <br />
                Em breve estará disponível!
            </p>
        </div>
    </div>
);

function App() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState('light');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const demoSession = window.localStorage.getItem('sb-demo-session');
        if (demoSession) {
            setSession({ user: { email: 'demo@fbz.com' } });
            setLoading(false);
            return;
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--bg-main)',
                color: 'var(--text-main)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid var(--border)',
                        borderTop: '4px solid var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p>Carregando...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Header
                    theme={theme}
                    toggleTheme={toggleTheme}
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                />
                <main style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
                    <Routes>
                        {/* Principal */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/agendamentos" element={<Appointments />} />
                        <Route path="/pacientes" element={<Patients />} />

                        {/* Atendimento */}
                        <Route path="/anamnese" element={<Anamnese />} />
                        <Route path="/prontuarios" element={<Prontuarios />} />
                        <Route path="/telemedicina" element={<Telemedicina />} />

                        {/* Automação */}
                        <Route path="/whatsapp" element={<Placeholder title="WhatsApp Bot" />} />
                        <Route path="/automacoes" element={<AutomacaoWhatsApp />} />
                        <Route path="/config-ia" element={<Placeholder title="Configurações de IA" />} />

                        {/* Gestão */}
                        <Route path="/procedimentos" element={<Placeholder title="Catálogo de Procedimentos" />} />
                        <Route path="/estoque" element={<Placeholder title="Controle de Estoque" />} />
                        <Route path="/loja" element={<Placeholder title="Loja Virtual" />} />
                        <Route path="/financeiro" element={<Financeiro />} />

                        {/* Análises */}
                        <Route path="/relatorios" element={<Placeholder title="Relatórios Gerenciais" />} />
                        <Route path="/campanhas" element={<Placeholder title="Campanhas e Fidelização" />} />

                        {/* Sistema */}
                        <Route path="/integracoes" element={<Placeholder title="Gestão de Integrações" />} />
                        <Route path="/seguranca" element={<Placeholder title="Segurança e LGPD" />} />
                        <Route path="/configuracoes" element={<Placeholder title="Configurações do Sistema" />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default App;
