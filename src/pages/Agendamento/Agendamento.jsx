import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
    FiChevronLeft,
    FiChevronRight,
    FiPlus,
    FiMinus,
    FiHelpCircle,
    FiX,
    FiCheck
} from 'react-icons/fi'
import './Agendamento.css'

const Agendamento = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTime, setSelectedTime] = useState(null)
    const [activeTab, setActiveTab] = useState('calendario')
    const [viewMode, setViewMode] = useState('semana') // semana, mes, dia

    const [agendamentos, setAgendamentos] = useState([])
    const [clientes, setClientes] = useState([])
    const [servicos, setServicos] = useState([])
    const [profissionais, setProfissionais] = useState([])
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({
        cliente_id: '',
        clienteNome: '',
        nascimento: '',
        servico_id: '',
        data: '',
        hora: '00:00',
        duracao: 60,
        profissional_id: '',
        observacoes: '',
        repetir: 'nunca',
        enviarSMS: false,
        status: 'agendado'
    })

    useEffect(() => {
        fetchData()
    }, [currentDate])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Buscar clientes
            const { data: clientesData } = await supabase
                .from('clientes')
                .select('*')
                .eq('ativo', true)
                .order('nome')

            // Buscar serviços
            const { data: servicosData } = await supabase
                .from('servicos')
                .select('*')
                .eq('ativo', true)
                .order('nome')

            // Buscar profissionais
            const { data: profissionaisData } = await supabase
                .from('profissionais')
                .select('*')
                .eq('ativo', true)
                .order('nome')

            // Buscar agendamentos da semana
            const startOfWeek = getStartOfWeek(currentDate)
            const endOfWeek = getEndOfWeek(currentDate)

            const { data: agendamentosData } = await supabase
                .from('agendamentos')
                .select(`
          *,
          clientes(nome),
          servicos(nome, duracao_minutos),
          profissionais(nome, cor_agenda)
        `)
                .gte('data_hora', startOfWeek.toISOString())
                .lte('data_hora', endOfWeek.toISOString())
                .order('data_hora')

            setClientes(clientesData || [])
            setServicos(servicosData || [])
            setProfissionais(profissionaisData || [])
            setAgendamentos(agendamentosData || [])

        } catch (error) {
            console.error('Erro ao buscar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveAgendamento = async () => {
        try {
            if (!formData.cliente_id || !formData.servico_id || !formData.data || !formData.hora) {
                alert('Preencha todos os campos obrigatórios')
                return
            }

            const dataHora = `${formData.data}T${formData.hora}:00`

            const { data, error } = await supabase
                .from('agendamentos')
                .insert([{
                    cliente_id: formData.cliente_id,
                    servico_id: formData.servico_id,
                    profissional_id: formData.profissional_id || null,
                    data_hora: dataHora,
                    duracao_minutos: formData.duracao,
                    status: formData.status,
                    observacoes: formData.observacoes
                }])

            if (error) throw error

            alert('Agendamento salvo com sucesso!')
            resetForm()
            fetchData()

        } catch (error) {
            console.error('Erro ao salvar agendamento:', error)
            alert('Erro ao salvar agendamento')
        }
    }

    const resetForm = () => {
        setFormData({
            cliente_id: '',
            clienteNome: '',
            nascimento: '',
            servico_id: '',
            data: '',
            hora: '00:00',
            duracao: 60,
            profissional_id: '',
            observacoes: '',
            repetir: 'nunca',
            enviarSMS: false,
            status: 'agendado'
        })
        setSelectedDate(null)
        setSelectedTime(null)
    }

    const getStartOfWeek = (date) => {
        const d = new Date(date)
        const day = d.getDay()
        const diff = d.getDate() - day
        return new Date(d.setDate(diff))
    }

    const getEndOfWeek = (date) => {
        const startOfWeek = getStartOfWeek(date)
        return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
    }

    const changeWeek = (direction) => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + (direction * 7))
        setCurrentDate(newDate)
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const getWeekDays = () => {
        const startOfWeek = getStartOfWeek(currentDate)
        const days = []
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek)
            day.setDate(day.getDate() + i)
            days.push(day)
        }
        return days
    }

    const timeSlots = []
    for (let hour = 8; hour <= 20; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
        if (hour < 20) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
        }
    }

    const handleCellClick = (date, time) => {
        setSelectedDate(date)
        setSelectedTime(time)
        setFormData(prev => ({
            ...prev,
            data: date.toISOString().split('T')[0],
            hora: time
        }))
    }

    const getAgendamentosForSlot = (date, time) => {
        return agendamentos.filter(ag => {
            const agDate = new Date(ag.data_hora)
            const agTime = agDate.toTimeString().slice(0, 5)
            return agDate.toDateString() === date.toDateString() && agTime === time
        })
    }

    const handleClienteChange = (clienteId) => {
        const cliente = clientes.find(c => c.id === clienteId)
        setFormData(prev => ({
            ...prev,
            cliente_id: clienteId,
            clienteNome: cliente?.nome || '',
            nascimento: cliente?.data_nascimento || ''
        }))
    }

    const handleServicoChange = (servicoId) => {
        const servico = servicos.find(s => s.id === servicoId)
        setFormData(prev => ({
            ...prev,
            servico_id: servicoId,
            duracao: servico?.duracao_minutos || 60
        }))
    }

    const weekDays = getWeekDays()
    const weekRange = `${weekDays[0].getDate()} - ${weekDays[6].getDate()} de ${weekDays[0].toLocaleDateString('pt-BR', { month: 'long' })} de ${weekDays[0].getFullYear()}`

    if (loading) {
        return (
            <div className="agendamento-loading">
                <div className="spinner"></div>
                <p>Carregando agendamentos...</p>
            </div>
        )
    }

    return (
        <div className="agendamento">
            {/* Tabs */}
            <div className="agendamento-tabs">
                <button
                    className={`tab ${activeTab === 'calendario' ? 'active' : ''}`}
                    onClick={() => setActiveTab('calendario')}
                >
                    📅 Calendário
                </button>
                <button
                    className={`tab ${activeTab === 'venda' ? 'active' : ''}`}
                    onClick={() => setActiveTab('venda')}
                >
                    💰 Venda
                </button>
                <button
                    className={`tab ${activeTab === 'profissional' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profissional')}
                >
                    👨‍💼 Profissional
                </button>
                <button
                    className={`tab ${activeTab === 'historico' ? 'active' : ''}`}
                    onClick={() => setActiveTab('historico')}
                >
                    📚 Histórico
                </button>
            </div>

            {activeTab === 'calendario' && (
                <div className="agendamento-content">
                    {/* Formulário Lateral */}
                    <div className="agendamento-sidebar">
                        <div className="form-header">
                            <h3>
                                <FiCheck className="icon" /> Agendar
                                <FiHelpCircle className="help-icon" />
                            </h3>
                        </div>

                        <div className="form-group">
                            <label>Cliente</label>
                            <div className="input-with-search">
                                <select
                                    value={formData.cliente_id}
                                    onChange={(e) => handleClienteChange(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>{c.nome}</option>
                                    ))}
                                </select>
                                <button className="btn-icon">🔍</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>[...]</label>
                            <input type="text" placeholder="Campo adicional" />
                        </div>

                        <div className="form-group">
                            <label>Nascimento</label>
                            <input
                                type="date"
                                value={formData.nascimento}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Serviço</label>
                            <div className="input-with-buttons">
                                <select
                                    value={formData.servico_id}
                                    onChange={(e) => handleServicoChange(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {servicos.map(s => (
                                        <option key={s.id} value={s.id}>{s.nome}</option>
                                    ))}
                                </select>
                                <button className="btn-icon"><FiPlus /></button>
                                <button className="btn-icon"><FiMinus /></button>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Data</label>
                                <input
                                    type="date"
                                    value={formData.data}
                                    onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                                />
                            </div>
                            <div className="form-group half">
                                <label>Hora</label>
                                <input
                                    type="time"
                                    value={formData.hora}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Duração</label>
                            <input
                                type="number"
                                value={formData.duracao}
                                onChange={(e) => setFormData(prev => ({ ...prev, duracao: parseInt(e.target.value) }))}
                            />
                        </div>

                        <div className="form-group">
                            <label>Profissional</label>
                            <select
                                value={formData.profissional_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, profissional_id: e.target.value }))}
                            >
                                <option value="">Selecione...</option>
                                {profissionais.map(p => (
                                    <option key={p.id} value={p.id}>{p.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Observações</label>
                            <textarea
                                rows="3"
                                value={formData.observacoes}
                                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Repetir?</label>
                                <select
                                    value={formData.repetir}
                                    onChange={(e) => setFormData(prev => ({ ...prev, repetir: e.target.value }))}
                                >
                                    <option value="nunca">Nunca</option>
                                    <option value="diario">Diário</option>
                                    <option value="semanal">Semanal</option>
                                    <option value="mensal">Mensal</option>
                                </select>
                            </div>
                            <div className="form-group half">
                                <label>Frequência</label>
                                <input type="text" placeholder="Nunca" disabled />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Agendado</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="agendado">Agendado</option>
                                <option value="confirmado">Confirmado</option>
                                <option value="concluido">Concluído</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Enviar SMS</label>
                                <select
                                    value={formData.enviarSMS ? 'sim' : 'nao'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, enviarSMS: e.target.value === 'sim' }))}
                                >
                                    <option value="sim">Sim</option>
                                    <option value="nao">Não</option>
                                </select>
                            </div>
                            <div className="form-group half">
                                <label>MMS</label>
                                <select>
                                    <option value="nao">Não</option>
                                    <option value="sim">Sim</option>
                                </select>
                            </div>
                        </div>

                        <button className="btn btn-save" onClick={handleSaveAgendamento}>
                            ✓ SALVAR
                        </button>
                    </div>

                    {/* Calendário Principal */}
                    <div className="agendamento-calendar">
                        <div className="calendar-header">
                            <div className="calendar-controls">
                                <button className="btn-icon" onClick={() => changeWeek(-1)}>
                                    <FiChevronLeft />
                                </button>
                                <button className="btn-icon" onClick={() => changeWeek(1)}>
                                    <FiChevronRight />
                                </button>
                                <button className="btn btn-secondary" onClick={goToToday}>
                                    Hoje
                                </button>
                                <span className="week-range">{weekRange}</span>
                            </div>
                            <div className="view-controls">
                                <select
                                    value={viewMode}
                                    onChange={(e) => setViewMode(e.target.value)}
                                    className="view-select"
                                >
                                    <option value="semana">Semana</option>
                                    <option value="mes">Mês</option>
                                    <option value="dia">Dia</option>
                                </select>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            <div className="calendar-week-header">
                                <div className="time-column-header"></div>
                                {weekDays.map((day, idx) => (
                                    <div key={idx} className="day-header">
                                        <div className="day-name">
                                            {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                        </div>
                                        <div className="day-number">{day.getDate()}/{day.getMonth() + 1}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="calendar-body">
                                <div className="time-column">
                                    {timeSlots.map((time, idx) => (
                                        <div key={idx} className="time-slot-label">{time}</div>
                                    ))}
                                </div>

                                {weekDays.map((day, dayIdx) => (
                                    <div key={dayIdx} className="day-column">
                                        {timeSlots.map((time, timeIdx) => {
                                            const agendamentosSlot = getAgendamentosForSlot(day, time)
                                            return (
                                                <div
                                                    key={timeIdx}
                                                    className="time-slot"
                                                    onClick={() => handleCellClick(day, time)}
                                                >
                                                    {agendamentosSlot.map((ag, agIdx) => (
                                                        <div
                                                            key={agIdx}
                                                            className="agendamento-item"
                                                            style={{
                                                                background: ag.profissionais?.cor_agenda || '#3B82F6',
                                                                height: `${(ag.duracao_minutos / 30) * 30}px`
                                                            }}
                                                        >
                                                            <div className="ag-cliente">{ag.clientes?.nome}</div>
                                                            <div className="ag-servico">{ag.servicos?.nome}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Painel Lateral Direito */}
                    <div className="agendamento-details">
                        <div className="details-header feriado">
                            <strong>FERIADO: Natal</strong>
                        </div>
                        {agendamentos.slice(0, 3).map((ag) => (
                            <div key={ag.id} className="detail-card">
                                <div className="detail-time">
                                    {new Date(ag.data_hora).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                                <div className="detail-info">
                                    <strong>{ag.clientes?.nome}</strong>
                                    <p>{ag.profissionais?.nome}</p>
                                    <p className="detail-service">{ag.servicos?.nome}</p>
                                    <p className="detail-date">
                                        {new Date(ag.data_hora).toLocaleDateString('pt-BR')} - {ag.duracao_minutos}min
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'venda' && (
                <div className="tab-content">
                    <p>Funcionalidade de Venda - Aguardando implementação</p>
                </div>
            )}

            {activeTab === 'profissional' && (
                <div className="tab-content">
                    <p>Visão por Profissional - Aguardando implementação</p>
                </div>
            )}

            {activeTab === 'historico' && (
                <div className="tab-content">
                    <p>Histórico de Agendamentos - Aguardando implementação</p>
                </div>
            )}
        </div>
    )
}

export default Agendamento
