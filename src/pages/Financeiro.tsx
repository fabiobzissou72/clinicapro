import { Plus, Search, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const Financeiro = () => {
    const transactions = [
        { id: 1, type: 'income', category: 'Procedimento', amount: 350.00, date: '2025-12-26', patient: 'Maria Silva', desc: 'Limpeza de Pele' },
        { id: 2, type: 'expense', category: 'Aluguel', amount: 2500.00, date: '2025-12-25', desc: 'Sala Comercial' },
        { id: 3, type: 'income', category: 'Produtos', amount: 120.00, date: '2025-12-24', patient: 'João Costa', desc: 'Creme Hidratante' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Financeiro</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Controle de entradas, saídas e fluxo de caixa.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ background: '#ef4444', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: 600 }}>Nova Despesa</button>
                    <button style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: 600 }}>Nova Receita</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Recebido (Mês)</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>R$ 45.200,00</h3>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Despesas (Mês)</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>R$ 12.000,00</h3>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Saldo em Caixa</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>R$ 33.200,00</h3>
                </div>
            </div>

            <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontWeight: 600 }}>Movimentações Recentes</h4>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Buscar transação..." style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', outline: 'none' }} />
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>DATA</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>CATEGORIA</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>DESCRIÇÃO</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>VALOR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>{t.date}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-main)', fontSize: '0.75rem' }}>{t.category}</span></td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600 }}>{t.desc}</div>
                                        {t.patient && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paciente: {t.patient}</div>}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Financeiro;
