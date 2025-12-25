import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi'
import './Financeiro.css'

const Financeiro = () => {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [stats, setStats] = useState({
        aReceber: { recebidos: 0, aReceber: 0, vencidas: 0 },
        aPagar: { pagas: 0, aPagar: 0, vencidas: 0 }
    })
    const [contasReceber, setContasReceber] = useState([])
    const [contasPagar, setContasPagar] = useState([])
    const [fluxoCaixa, setFluxoCaixa] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFinanceiroData()
    }, [selectedDate])

    const fetchFinanceiroData = async () => {
        try {
            setLoading(true)
            const month = selectedDate.getMonth() + 1
            const year = selectedDate.getFullYear()

            // Buscar vendas do mês
            const { data: vendas, error: vendasError } = await supabase
                .from('vendas')
                .select('*')
                .gte('data_venda', `${year}-${month.toString().padStart(2, '0')}-01`)
                .lte('data_venda', `${year}-${month.toString().padStart(2, '0')}-31`)

            if (vendasError) throw vendasError

            // Calcular estatísticas A RECEBER
            const recebidos = vendas
                ?.filter(v => v.status === 'pago')
                .reduce((sum, v) => sum + Number(v.valor_pago), 0) || 0

            const aReceber = vendas
                ?.filter(v => v.status === 'pendente')
                .reduce((sum, v) => sum + Number(v.valor_total - v.valor_pago), 0) || 0

            const vendasVencidas = vendas
                ?.filter(v => v.status === 'pendente' && new Date(v.data_venda) < new Date())
                .reduce((sum, v) => sum + Number(v.valor_total - v.valor_pago), 0) || 0

            // Buscar movimentações de caixa (despesas - A PAGAR)
            const { data: caixa, error: caixaError } = await supabase
                .from('caixa')
                .select('*')
                .eq('tipo', 'saida')
                .gte('data_movimento', `${year}-${month.toString().padStart(2, '0')}-01`)
                .lte('data_movimento', `${year}-${month.toString().padStart(2, '0')}-31`)

            if (caixaError) throw caixaError

            const totalDespesas = caixa?.reduce((sum, c) => sum + Number(c.valor), 0) || 0

            // Buscar fluxo de caixa por dia
            const { data: fluxoData, error: fluxoError } = await supabase
                .from('caixa')
                .select('*')
                .gte('data_movimento', `${year}-${month.toString().padStart(2, '0')}-01`)
                .lte('data_movimento', `${year}-${month.toString().padStart(2, '0')}-31`)
                .order('data_movimento', { ascending: true })

            if (fluxoError) throw fluxoError

            // Agrupar fluxo por dia
            const fluxoPorDia = {}
            fluxoData?.forEach(item => {
                const day = new Date(item.data_movimento).getDate()
                if (!fluxoPorDia[day]) {
                    fluxoPorDia[day] = { day, entradas: 0, saidas: 0 }
                }
                if (item.tipo === 'entrada') {
                    fluxoPorDia[day].entradas += Number(item.valor)
                } else {
                    fluxoPorDia[day].saidas += Number(item.valor)
                }
            })

            const fluxoArray = Object.values(fluxoPorDia)

            setStats({
                aReceber: {
                    recebidos,
                    aReceber,
                    vencidas: vendasVencidas
                },
                aPagar: {
                    pagas: 0,
                    aPagar: totalDespesas,
                    vencidas: 0
                }
            })

            setContasReceber(vendas?.filter(v => v.status !== 'pago') || [])
            setContasPagar(caixa || [])
            setFluxoCaixa(fluxoArray)

        } catch (error) {
            console.error('Erro ao buscar dados financeiros:', error)
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

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(date))
    }

    const changeMonth = (direction) => {
        const newDate = new Date(selectedDate)
        newDate.setMonth(newDate.getMonth() + direction)
        setSelectedDate(newDate)
    }

    const monthYear = selectedDate.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    }).toUpperCase()

    const totalAReceber = stats.aReceber.recebidos + stats.aReceber.aReceber + stats.aReceber.vencidas
    const totalAPagar = stats.aPagar.pagas + stats.aPagar.aPagar + stats.aPagar.vencidas

    if (loading) {
        return (
            <div className="financeiro-loading">
                <div className="spinner"></div>
                <p>Carregando dados financeiros...</p>
            </div>
        )
    }

    return (
        <div className="financeiro">
            {/* Cabeçalho com Filtro de Data */}
            <div className="financeiro-header">
                <div className="date-selector">
                    <button className="date-nav-btn" onClick={() => changeMonth(-1)}>
                        <FiChevronLeft />
                    </button>
                    <span className="date-display">{monthYear}</span>
                    <button className="date-nav-btn" onClick={() => changeMonth(1)}>
                        <FiChevronRight />
                    </button>
                </div>
                <button className="btn btn-primary">
                    <FiDownload /> Extrato
                </button>
            </div>

            {/* A Receber no Mês */}
            <section className="finance-section green-section">
                <h2 className="finance-section-title">A receber no mês</h2>
                <div className="finance-cards">
                    <div className="finance-card green">
                        <p className="finance-value">{formatCurrency(stats.aReceber.recebidos)}</p>
                        <p className="finance-label">Recebidos</p>
                    </div>
                    <div className="finance-card gray">
                        <p className="finance-value">{formatCurrency(stats.aReceber.aReceber)}</p>
                        <p className="finance-label">A Receber</p>
                    </div>
                    <div className="finance-card red">
                        <p className="finance-value">{formatCurrency(stats.aReceber.vencidas)}</p>
                        <p className="finance-label">Vencidas</p>
                    </div>
                </div>
                <div className="finance-total">
                    <span className="total-label">R$ {formatCurrency(totalAReceber)}</span>
                    <span className="total-text">Total Geral</span>
                </div>
            </section>

            {/* A Pagar no Mês */}
            <section className="finance-section red-section">
                <h2 className="finance-section-title">A pagar no mês</h2>
                <div className="finance-cards">
                    <div className="finance-card green">
                        <p className="finance-value">{formatCurrency(stats.aPagar.pagas)}</p>
                        <p className="finance-label">Pagas</p>
                    </div>
                    <div className="finance-card gray">
                        <p className="finance-value">{formatCurrency(stats.aPagar.aPagar)}</p>
                        <p className="finance-label">A Pagar</p>
                    </div>
                    <div className="finance-card red">
                        <p className="finance-value">{formatCurrency(stats.aPagar.vencidas)}</p>
                        <p className="finance-label">Vencidas</p>
                    </div>
                </div>
                <div className="finance-total">
                    <span className="total-label">{formatCurrency(totalAPagar)}</span>
                    <span className="total-text">Total Geral</span>
                </div>
            </section>

            {/* Fluxo de Caixa Diário */}
            <section className="chart-section">
                <h2 className="section-title">Fluxo de Caixa diário</h2>
                <div className="card">
                    <div className="chart-legend">
                        <span className="legend-item recebimentos">
                            <span className="legend-color"></span>
                            RECEBIMENTOS
                        </span>
                        <span className="legend-item pagamentos">
                            <span className="legend-color"></span>
                            PAGAMENTOS
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={fluxoCaixa}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis
                                dataKey="day"
                                stroke="var(--text-tertiary)"
                                tick={{ fill: 'var(--text-secondary)' }}
                            />
                            <YAxis
                                stroke="var(--text-tertiary)"
                                tick={{ fill: 'var(--text-secondary)' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="entradas"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{ fill: '#10B981' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="saidas"
                                stroke="#EF4444"
                                strokeWidth={2}
                                dot={{ fill: '#EF4444' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Tabelas de Contas */}
            <div className="tables-grid">
                {/* Contas a Receber */}
                <section className="table-section">
                    <div className="table-header green-header">
                        <h3>Contas a Receber</h3>
                    </div>
                    <div className="card table-card">
                        {contasReceber.length === 0 ? (
                            <p className="empty-message">Nenhum resultado foi encontrado.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Descrição</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contasReceber.slice(0, 5).map((conta) => (
                                        <tr key={conta.id}>
                                            <td>{formatDate(conta.data_venda)}</td>
                                            <td>Venda #{conta.id.slice(0, 8)}</td>
                                            <td>{formatCurrency(conta.valor_total - conta.valor_pago)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <button className="btn btn-success btn-block">VER MAIS</button>
                    </div>
                </section>

                {/* Contas a Pagar */}
                <section className="table-section">
                    <div className="table-header red-header">
                        <h3>Contas a Pagar</h3>
                    </div>
                    <div className="card table-card">
                        {contasPagar.length === 0 ? (
                            <p className="empty-message">Nenhum resultado foi encontrado.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Descrição</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contasPagar.slice(0, 5).map((conta) => (
                                        <tr key={conta.id}>
                                            <td>{formatDate(conta.data_movimento)}</td>
                                            <td>{conta.descricao || 'Despesa'}</td>
                                            <td>{formatCurrency(conta.valor)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <button className="btn btn-error btn-block">VER MAIS</button>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Financeiro
