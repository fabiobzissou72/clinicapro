import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import './GraficoFinanceiro.css'

const GraficoFinanceiro = () => {
    const currentDate = new Date()
    const [filters, setFilters] = useState({
        pagar: {
            mes: currentDate.getMonth() + 1,
            ano: currentDate.getFullYear(),
            tipo: 'todas',
            servico: 'todos'
        },
        receber: {
            mes: currentDate.getMonth() + 1,
            ano: currentDate.getFullYear(),
            tipo: 'todas',
            servico: 'todos'
        }
    })

    const [data, setData] = useState({
        pagar: { total: 0, chart: [] },
        receber: { total: 0, chart: [] }
    })

    const [servicos, setServicos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchServicos()
    }, [])

    useEffect(() => {
        fetchContasPagar()
        fetchContasReceber()
    }, [filters])

    const fetchServicos = async () => {
        try {
            const { data, error } = await supabase
                .from('servicos')
                .select('id, nome')
                .eq('ativo', true)

            if (error) throw error
            setServicos(data || [])
        } catch (error) {
            console.error('Erro ao buscar serviços:', error)
        }
    }

    const fetchContasPagar = async () => {
        try {
            const { mes, ano, tipo, servico } = filters.pagar

            let query = supabase
                .from('caixa')
                .select('*')
                .eq('tipo', 'saida')
                .gte('data_movimento', `${ano}-${mes.toString().padStart(2, '0')}-01`)
                .lte('data_movimento', `${ano}-${mes.toString().padStart(2, '0')}-31`)

            if (servico !== 'todos') {
                query = query.eq('categoria', servico)
            }

            const { data: contas, error } = await query

            if (error) throw error

            // Agrupar por categoria/serviço
            const categoriasMap = {}
            contas?.forEach(item => {
                const categoria = item.categoria || 'Outros'
                if (!categoriasMap[categoria]) {
                    categoriasMap[categoria] = { nome: categoria, total: 0 }
                }
                categoriasMap[categoria].total += Number(item.valor)
            })

            const chartData = Object.values(categoriasMap)
            const total = chartData.reduce((sum, c) => sum + c.total, 0)

            setData(prev => ({
                ...prev,
                pagar: {
                    total,
                    chart: chartData
                }
            }))
        } catch (error) {
            console.error('Erro ao buscar contas a pagar:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchContasReceber = async () => {
        try {
            const { mes, ano, tipo, servico } = filters.receber

            let query = supabase
                .from('vendas')
                .select('*, vendas_itens(*, servico_id(id, nome))')
                .gte('data_venda', `${ano}-${mes.toString().padStart(2, '0')}-01`)
                .lte('data_venda', `${ano}-${mes.toString().padStart(2, '0')}-31`)

            // Filtro por tipo (apenas recebidas ou todas)
            if (tipo === 'recebidas') {
                query = query.eq('status', 'pago')
            }

            const { data: vendas, error } = await query

            if (error) throw error

            // Filtrar por serviço se necessário
            let vendasFiltradas = vendas || []
            if (servico !== 'todos') {
                vendasFiltradas = vendas?.filter(v =>
                    v.vendas_itens?.some(item => item.servico_id?.id === servico)
                ) || []
            }

            // Agrupar por serviço
            const servicosMap = {}
            vendasFiltradas.forEach(venda => {
                venda.vendas_itens?.forEach(item => {
                    const nomeServico = item.servico_id?.nome || 'Outros'
                    if (!servicosMap[nomeServico]) {
                        servicosMap[nomeServico] = { nome: nomeServico, total: 0 }
                    }
                    servicosMap[nomeServico].total += Number(item.subtotal)
                })
            })

            const chartData = Object.values(servicosMap)
            const total = chartData.reduce((sum, s) => sum + s.total, 0)

            setData(prev => ({
                ...prev,
                receber: {
                    total,
                    chart: chartData
                }
            }))
        } catch (error) {
            console.error('Erro ao buscar contas a receber:', error)
        }
    }

    const handleFilterChange = (section, field, value) => {
        setFilters(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const meses = [
        { value: 1, label: 'Janeiro' },
        { value: 2, label: 'Fevereiro' },
        { value: 3, label: 'Março' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Maio' },
        { value: 6, label: 'Junho' },
        { value: 7, label: 'Julho' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Setembro' },
        { value: 10, label: 'Outubro' },
        { value: 11, label: 'Novembro' },
        { value: 12, label: 'Dezembro' }
    ]

    const anos = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

    if (loading) {
        return (
            <div className="grafico-financeiro-loading">
                <div className="spinner"></div>
                <p>Carregando gráficos financeiros...</p>
            </div>
        )
    }

    return (
        <div className="grafico-financeiro">
            {/* CONTAS A PAGAR NO MÊS */}
            <section className="finance-chart-section">
                <div className="section-header blue-header">
                    <h2 className="section-title">📊 CONTAS A PAGAR NO MÊS</h2>
                </div>
                <div className="card chart-card">
                    <div className="finance-chart-filters">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label>Mês</label>
                                <select
                                    value={filters.pagar.mes}
                                    onChange={(e) => handleFilterChange('pagar', 'mes', Number(e.target.value))}
                                >
                                    {meses.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Ano</label>
                                <select
                                    value={filters.pagar.ano}
                                    onChange={(e) => handleFilterChange('pagar', 'ano', Number(e.target.value))}
                                >
                                    {anos.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group wide">
                                <label>Filtro</label>
                                <select
                                    value={filters.pagar.tipo}
                                    onChange={(e) => handleFilterChange('pagar', 'tipo', e.target.value)}
                                >
                                    <option value="todas">Todas</option>
                                    <option value="pagas">Cadastrar apenas Pagas</option>
                                </select>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => fetchContasPagar()}
                            >
                                OK
                            </button>
                        </div>
                    </div>

                    <div className="chart-summary">
                        <div className="summary-item">
                            <span className="summary-label">Serviço/Produto</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Total</span>
                            <span className="summary-value">{formatCurrency(data.pagar.total)}</span>
                        </div>
                    </div>

                    {data.pagar.chart.length === 0 ? (
                        <div className="empty-chart">
                            <p>Nenhum dado para exibir</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.pagar.chart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis
                                    dataKey="nome"
                                    stroke="var(--text-tertiary)"
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    stroke="var(--text-tertiary)"
                                    tick={{ fill: 'var(--text-secondary)' }}
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-primary)'
                                    }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Bar dataKey="total" fill="#EF4444" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </section>

            {/* CONTAS A RECEBER NO MÊS */}
            <section className="finance-chart-section">
                <div className="section-header green-header">
                    <h2 className="section-title">📊 CONTAS A RECEBER NO MÊS</h2>
                </div>
                <div className="card chart-card">
                    <div className="finance-chart-filters">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label>Mês</label>
                                <select
                                    value={filters.receber.mes}
                                    onChange={(e) => handleFilterChange('receber', 'mes', Number(e.target.value))}
                                >
                                    {meses.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Ano</label>
                                <select
                                    value={filters.receber.ano}
                                    onChange={(e) => handleFilterChange('receber', 'ano', Number(e.target.value))}
                                >
                                    {anos.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group wide">
                                <label>Filtro</label>
                                <select
                                    value={filters.receber.tipo}
                                    onChange={(e) => handleFilterChange('receber', 'tipo', e.target.value)}
                                >
                                    <option value="todas">Todas</option>
                                    <option value="recebidas">Cadastrar apenas Recebidas</option>
                                </select>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={() => fetchContasReceber()}
                            >
                                OK
                            </button>
                        </div>
                    </div>

                    <div className="chart-summary">
                        <div className="summary-item">
                            <span className="summary-label">Serviço/Produto</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Total</span>
                            <span className="summary-value">{formatCurrency(data.receber.total)}</span>
                        </div>
                    </div>

                    {data.receber.chart.length === 0 ? (
                        <div className="empty-chart">
                            <p>Nenhum dado para exibir</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.receber.chart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis
                                    dataKey="nome"
                                    stroke="var(--text-tertiary)"
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    stroke="var(--text-tertiary)"
                                    tick={{ fill: 'var(--text-secondary)' }}
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-primary)'
                                    }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Bar dataKey="total" fill="#10B981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </section>
        </div>
    )
}

export default GraficoFinanceiro
