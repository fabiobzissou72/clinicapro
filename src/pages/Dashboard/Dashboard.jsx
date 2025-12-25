import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
    FiUsers,
    FiCalendar,
    FiDollarSign,
    FiTrendingUp
} from 'react-icons/fi'
import './Dashboard.css'

const Dashboard = () => {
    const [stats, setStats] = useState({
        aniversariantes: [],
        saldoEmAberto: 0,
        balancoParcial: 0,
        vendasMes: { total: 0, valor: 0 },
        totalClientes: 0,
        totalAgendamentos: 0,
        totalServicos: 0,
        totalProfissionais: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Buscar aniversariantes de hoje
            const { data: aniversariantes } = await supabase
                .from('aniversariantes_hoje')
                .select('*')

            // Buscar saldo em aberto
            const { data: saldo } = await supabase
                .from('saldo_aberto')
                .select('*')
                .single()

            // Buscar vendas do mês
            const { data: vendas } = await supabase
                .from('vendas_mes_atual')
                .select('*')
                .single()

            // Buscar totais de cadastros
            const { data: cadastros } = await supabase
                .from('total_cadastros')
                .select('*')
                .single()

            setStats({
                aniversariantes: aniversariantes || [],
                saldoEmAberto: saldo?.saldo_em_aberto || 0,
                balancoParcial: saldo?.balanc_parcial || 0,
                vendasMes: {
                    total: vendas?.total_vendas || 0,
                    valor: vendas?.total_geral || 0
                },
                totalClientes: cadastros?.total_clientes || 0,
                totalAgendamentos: cadastros?.total_agendamentos || 0,
                totalServicos: cadastros?.total_servicos || 0,
                totalProfissionais: cadastros?.total_profissionais || 0
            })
        } catch (error) {
            console.error('Erro ao buscar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Carregando dashboard...</p>
            </div>
        )
    }

    return (
        <div className="dashboard">
            {/* Aniversariantes de Hoje */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">🎂 ANIVERSARIANTES DE HOJE</h2>
                </div>
                <div className="card">
                    {stats.aniversariantes.length === 0 ? (
                        <div className="empty-state">
                            <p>Não há aniversariantes de hoje.</p>
                        </div>
                    ) : (
                        <div className="aniversariantes-list">
                            {stats.aniversariantes.map((aniv) => (
                                <div key={aniv.id} className="aniversariante-item">
                                    <div className="aniversariante-info">
                                        <span className="aniversariante-nome">{aniv.nome}</span>
                                        <span className="aniversariante-idade">{aniv.idade} anos</span>
                                    </div>
                                    <div className="aniversariante-contato">
                                        <a
                                            href={`tel:${aniv.telefone}`}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Ligar
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Saldo em Aberto */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">💰 SALDO EM ABERTO</h2>
                </div>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon error">
                            <FiDollarSign />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">SALDO EM ABERTO</p>
                            <h3 className="stat-value error">{formatCurrency(stats.saldoEmAberto)}</h3>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon info">
                            <FiDollarSign />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">BALANÇO PARCIAL</p>
                            <h3 className="stat-value info">{formatCurrency(stats.balancoParcial)}</h3>
                        </div>
                    </div>
                </div>
                <div className="total-display">
                    <span className="total-label">Total:</span>
                    <span className="total-value">{formatCurrency(stats.saldoEmAberto)}</span>
                    <button className="btn btn-error">IMPRIMIR</button>
                </div>
            </section>

            {/* Vendas do Mês */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">📊 VENDAS DO MÊS</h2>
                </div>
                <div className="card">
                    <div className="vendas-filter">
                        <div className="filter-group">
                            <label>Mês</label>
                            <select className="filter-select">
                                <option value="12">Dezembro</option>
                                <option value="11">Novembro</option>
                                <option value="10">Outubro</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Ano</label>
                            <select className="filter-select">
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Total Geral</label>
                            <select className="filter-select">
                                <option>Considerar Valor Bruto</option>
                            </select>
                        </div>
                        <button className="btn btn-primary">VISUALIZAR</button>
                    </div>

                    <div className="vendas-total">
                        <p className="total-label-large">Total Geral</p>
                        <h2 className="total-value-large">{formatCurrency(stats.vendasMes.valor)}</h2>
                    </div>
                </div>
            </section>

            {/* Total de Cadastros */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">📋 TOTAL DE CADASTROS</h2>
                </div>
                <div className="cadastros-grid">
                    <div className="cadastro-card blue">
                        <div className="cadastro-header">
                            <FiUsers className="cadastro-icon" />
                            <h3 className="cadastro-count">{stats.totalClientes}</h3>
                        </div>
                        <p className="cadastro-label">Clientes</p>
                        <button className="cadastro-btn">➕</button>
                    </div>

                    <div className="cadastro-card teal">
                        <div className="cadastro-header">
                            <FiCalendar className="cadastro-icon" />
                            <h3 className="cadastro-count">
                                {stats.totalAgendamentos} / {stats.totalAgendamentos}
                            </h3>
                        </div>
                        <p className="cadastro-label">Agendamento Mês / Qtda</p>
                        <button className="cadastro-btn">➕</button>
                    </div>

                    <div className="cadastro-card dark">
                        <div className="cadastro-header">
                            <FiTrendingUp className="cadastro-icon" />
                            <h3 className="cadastro-count">{stats.totalServicos}</h3>
                        </div>
                        <p className="cadastro-label">Serviços / Produtos</p>
                        <button className="cadastro-btn">➕</button>
                    </div>

                    <div className="cadastro-card orange">
                        <div className="cadastro-header">
                            <FiUsers className="cadastro-icon" />
                            <h3 className="cadastro-count">{stats.totalProfissionais}</h3>
                        </div>
                        <p className="cadastro-label">Profissionais</p>
                        <button className="cadastro-btn">➕</button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Dashboard
