import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts'
import './GraficoGeral.css'

const GraficoGeral = () => {
    const currentDate = new Date()
    const [filters, setFilters] = useState({
        agendamento: {
            mes: currentDate.getMonth() + 1,
            ano: currentDate.getFullYear(),
            servico: 'todos'
        },
        vendas: {
            mes: currentDate.getMonth() + 1,
            ano: currentDate.getFullYear(),
            servico: 'todos'
        },
        profissional: {
            mes: currentDate.getMonth() + 1,
            ano: currentDate.getFullYear(),
            servico: 'todos'
        }
    })

    const [data, setData] = useState({
        agendamentos: { qtde: 0, chart: [] },
        vendas: { qtde: 0, total: 0, chart: [] },
        profissional: { qtde: 0, total: 0, chart: [] }
    })

    const [servicos, setServicos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchServicos()
    }, [])

    useEffect(() => {
        fetchAgendamentos()
        fetchVendas()
        fetchProfissional()
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

    const fetchAgendamentos = async () => {
        try {
            const { mes, ano, servico } = filters.agendamento

            let query = supabase
                .from('agendamentos')
                .select('*, servico_id(nome)')
                .gte('data_hora', `${ano}-${mes.toString().padStart(2, '0')}-01`)
                .lte('data_hora', `${ano}-${mes.toString().padStart(2, '0')}-31`)

            if (servico !== 'todos') {
                query = query.eq('servico_id', servico)
            }

            const { data: agendamentos, error } = await query

            if (error) throw error

            // Agrupar por dia
            const chartData = Array.from({ length: 31 }, (_, i) => ({
                dia: i + 1,
                qtde: 0
            }))

            agendamentos?.forEach(item => {
                const dia = new Date(item.data_hora).getDate()
                chartData[dia - 1].qtde++
            })

            setData(prev => ({
                ...prev,
                agendamentos: {
                    qtde: agendamentos?.length || 0,
                    chart: chartData.filter(d => d.qtde > 0)
                }
            }))
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchVendas = async () => {
        try {
            const { mes, ano, servico } = filters.vendas

            let query = supabase
                .from('vendas')
                .select('*, vendas_itens(*, servico_id(nome))')
                .gte('data_venda', `${ano}-${mes.toString().padStart(2, '0')}-01`)
                .lte('data_venda', `${ano}-${mes.toString().padStart(2, '0')}-31`)

            const { data: vendas, error } = await query

            if (error) throw error

            // Filtrar por serviço se necessário
            let vendasFiltradas = vendas || []
            if (servico !== 'todos') {
                vendasFiltradas = vendas?.filter(v =>
                    v.vendas_itens?.some(item => item.servico_id?.id === servico)
                ) || []
            }

            // Agrupar por dia
            const chartData = Array.from({ length: 31 }, (_, i) => ({
                dia: i + 1,
                qtde: 0,
                valor: 0
            }))

            vendasFiltradas.forEach(item => {
                const dia = new Date(item.data_venda).getDate()
                chartData[dia - 1].qtde++
                chartData[dia - 1].valor += Number(item.valor_total)
            })

            const total = vendasFiltradas.reduce((sum, v) => sum + Number(v.valor_total), 0)

            setData(prev => ({
                ...prev,
                vendas: {
                    qtde: vendasFiltradas.length,
                    total,
                    chart: chartData.filter(d => d.qtde > 0)
                }
            }))
        } catch (error) {
            console.error('Erro ao buscar vendas:', error)
        }
    }

    const fetchProfissional = async () => {
        try {
            const { mes, ano, servico } = filters.profissional

            let query = supabase
                .from('agendamentos')
                .select('*, profissional_id(nome), servico_id(nome)')
                .gte('data_hora', `${ano}-${mes.toString().padStart(2, '0')}-01`)
                .lte('data_hora', `${ano}-${mes.toString().padStart(2, '0')}-31`)

            if (servico !== 'todos') {
                query = query.eq('servico_id', servico)
            }

            const { data: agendamentos, error } = await query

            if (error) throw error

            // Agrupar por profissional
            const profissionaisMap = {}
            agendamentos?.forEach(item => {
                const profNome = item.profissional_id?.nome || 'Sem profissional'
                if (!profissionaisMap[profNome]) {
                    profissionaisMap[profNome] = { nome: profNome, qtde: 0, valor: 0 }
                }
                profissionaisMap[profNome].qtde++
                profissionaisMap[profNome].valor += Number(item.valor || 0)
            })

            const chartData = Object.values(profissionaisMap)
            const total = chartData.reduce((sum, p) => sum + p.valor, 0)

            setData(prev => ({
                ...prev,
                profissional: {
                    qtde: agendamentos?.length || 0,
                    total,
                    chart: chartData
                }
            }))
        } catch (error) {
            console.error('Erro ao buscar dados de profissional:', error)
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
            <div className="grafico-loading">
                <div className="spinner"></div>
                <p>Carregando gráficos...</p>
            </div>
        )
    }

    return (
        <div className="grafico-geral">
            {/* AGENDAMENTO NO MÊS */}
            <section className="chart-section">
                <div className="section-header blue-header">
                    <h2 className="section-title">📅 AGENDAMENTO NO MÊS</h2>
                </div>
                <div className="card chart-card">
                    <div className="chart-filters">
                        <div className="filter-group">
                            <label>Mês</label>
                            <select
                                value={filters.agendamento.mes}
                                onChange={(e) => handleFilterChange('agendamento', 'mes', Number(e.target.value))}
                            >
                                {meses.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Ano</label>
                            <select
                                value={filters.agendamento.ano}
                                onChange={(e) => handleFilterChange('agendamento', 'ano', Number(e.target.value))}
                            >
                                {anos.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn btn-primary">OK</button>
                    </div>

                    <div className="chart-stats">
                        <div className="stat-item">
                            <span className="stat-label">Serviço/Produto</span>
                            <select
                                className="stat-select"
                                value={filters.agendamento.servico}
                                onChange={(e) => handleFilterChange('agendamento', 'servico', e.target.value)}
                            >
                                <option value="todos">Todos</option>
                                {servicos.map(s => (
                                    <option key={s.id} value={s.id}>{s.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Qtde</span>
                            <span className="stat-value">{data.agendamentos.qtde}</span>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.agendamentos.chart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis
                                dataKey="dia"
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
                            <Bar dataKey="qtde" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* VENDAS NO MÊS */}
            <section className="chart-section">
                <div className="section-header teal-header">
                    <h2 className="section-title">💵 VENDAS NO MÊS</h2>
                </div>
                <div className="card chart-card">
                    <div className="chart-filters">
                        <div className="filter-group">
                            <label>Mês</label>
                            <select
                                value={filters.vendas.mes}
                                onChange={(e) => handleFilterChange('vendas', 'mes', Number(e.target.value))}
                            >
                                {meses.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Ano</label>
                            <select
                                value={filters.vendas.ano}
                                onChange={(e) => handleFilterChange('vendas', 'ano', Number(e.target.value))}
                            >
                                {anos.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn btn-primary">OK</button>
                    </div>

                    <div className="chart-stats">
                        <div className="stat-item">
                            <span className="stat-label">Serviço/Produto</span>
                            <select
                                className="stat-select"
                                value={filters.vendas.servico}
                                onChange={(e) => handleFilterChange('vendas', 'servico', e.target.value)}
                            >
                                <option value="todos">Todos</option>
                                {servicos.map(s => (
                                    <option key={s.id} value={s.id}>{s.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Qtde</span>
                            <span className="stat-value">{data.vendas.qtde}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Total</span>
                            <span className="stat-value">{formatCurrency(data.vendas.total)}</span>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.vendas.chart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis
                                dataKey="dia"
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
                                dataKey="valor"
                                stroke="#14B8A6"
                                strokeWidth={3}
                                dot={{ fill: '#14B8A6', r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* PROFISSIONAL NO MÊS */}
            <section className="chart-section">
                <div className="section-header purple-header">
                    <h2 className="section-title">👨‍💼 PROFISSIONAL NO MÊS</h2>
                </div>
                <div className="card chart-card">
                    <div className="chart-filters">
                        <div className="filter-group">
                            <label>Mês</label>
                            <select
                                value={filters.profissional.mes}
                                onChange={(e) => handleFilterChange('profissional', 'mes', Number(e.target.value))}
                            >
                                {meses.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Ano</label>
                            <select
                                value={filters.profissional.ano}
                                onChange={(e) => handleFilterChange('profissional', 'ano', Number(e.target.value))}
                            >
                                {anos.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn btn-primary">OK</button>
                    </div>

                    <div className="chart-stats">
                        <div className="stat-item">
                            <span className="stat-label">Serviço/Produto</span>
                            <select
                                className="stat-select"
                                value={filters.profissional.servico}
                                onChange={(e) => handleFilterChange('profissional', 'servico', e.target.value)}
                            >
                                <option value="todos">Todos</option>
                                {servicos.map(s => (
                                    <option key={s.id} value={s.id}>{s.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Qtde</span>
                            <span className="stat-value">{data.profissional.qtde}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Total</span>
                            <span className="stat-value">{formatCurrency(data.profissional.total)}</span>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.profissional.chart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis
                                dataKey="nome"
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
                            <Bar dataKey="qtde" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    )
}

export default GraficoGeral
