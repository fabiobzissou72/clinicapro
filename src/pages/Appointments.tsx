import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../lib/supabase';
import { Plus, X, Calendar, Clock, User, Sparkles, Video, MapPin } from 'lucide-react';

const locales = { 'pt-BR': ptBR };

const localizer = dateFnsLocalizer({
    format: (date: Date, formatStr: string, options?: any) =>
        format(date, formatStr, { ...options, locale: ptBR }),
    parse,
    startOfWeek: () => 0,
    getDay,
    locales,
});

const Appointments = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [view, setView] = useState<View>('week');
    const [date, setDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
    const [patientSearch, setPatientSearch] = useState('');
    const [showNewPatientModal, setShowNewPatientModal] = useState(false);
    const [procedures, setProcedures] = useState<any[]>([]);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [newPatientData, setNewPatientData] = useState({
        full_name: '',
        cpf: '',
        phone: '',
        email: ''
    });
    const [formData, setFormData] = useState({
        paciente_id: '',
        professional_id: '',
        procedimento_id: '',
        start_time: '',
        end_time: '',
        notes: '',
        status: 'pending',
        source: 'manual'
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (patientSearch) {
            const filtered = patients.filter(p =>
                p.full_name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
                p.phone?.includes(patientSearch) ||
                p.cpf?.includes(patientSearch)
            );
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients(patients);
        }
    }, [patientSearch, patients]);

    const fetchData = async () => {
        const [appointmentsRes, patientsRes, proceduresRes, professionalsRes] = await Promise.all([
            supabase.from('agendamentos').select(`
                *,
                pacientes(full_name),
                procedimentos(name, price),
                profiles(full_name)
            `).order('start_time'),
            supabase.from('pacientes').select('id, full_name, phone, cpf').order('full_name'),
            supabase.from('procedimentos').select('id, name, price').order('name'),
            supabase.from('profiles').select('id, full_name').order('full_name')
        ]);

        if (!appointmentsRes.error && appointmentsRes.data) {
            const formattedEvents = appointmentsRes.data.map((apt: any) => ({
                id: apt.id,
                title: `${apt.pacientes?.full_name || 'Sem nome'} - ${apt.procedimentos?.name || 'Procedimento'}`,
                start: new Date(apt.start_time),
                end: new Date(apt.end_time),
                resource: apt
            }));
            setEvents(formattedEvents);
        }

        if (!patientsRes.error) setPatients(patientsRes.data || []);
        if (!proceduresRes.error) setProcedures(proceduresRes.data || []);
        if (!professionalsRes.error) setProfessionals(professionalsRes.data || []);
    };

    const handleSelectSlot = ({ start }: any) => {
        const endTime = addHours(start, 1);

        setFormData({
            paciente_id: '',
            professional_id: '',
            procedimento_id: '',
            start_time: start.toISOString(),
            end_time: endTime.toISOString(),
            notes: '',
            status: 'pending',
            source: 'manual'
        });
        setSelectedEvent(null);
        setShowModal(true);
    };

    const handleSelectEvent = (event: any) => {
        const apt = event.resource;
        setFormData({
            paciente_id: apt.paciente_id,
            professional_id: apt.professional_id || '',
            procedimento_id: apt.procedimento_id || '',
            start_time: apt.start_time,
            end_time: apt.end_time,
            notes: apt.notes || '',
            status: apt.status,
            source: apt.source || 'manual'
        });
        setSelectedEvent(event.resource);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.paciente_id) {
            alert('Selecione um paciente!');
            return;
        }

        if (selectedEvent) {
            const { error } = await supabase
                .from('agendamentos')
                .update(formData)
                .eq('id', selectedEvent.id);

            if (!error) {
                alert('Agendamento atualizado!');
                fetchData();
                closeModal();
            } else {
                alert('Erro: ' + error.message);
            }
        } else {
            const { error } = await supabase
                .from('agendamentos')
                .insert([formData]);

            if (!error) {
                alert('Agendamento criado!');
                fetchData();
                closeModal();
            } else {
                alert('Erro: ' + error.message);
            }
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent || !confirm('Excluir?')) return;

        const { error } = await supabase
            .from('agendamentos')
            .delete()
            .eq('id', selectedEvent.id);

        if (!error) {
            alert('Excluído!');
            fetchData();
            closeModal();
        }
    };

    const handleProcedureChange = (procedureId: string) => {
        const procedure = procedures.find(p => p.id === procedureId);
        if (procedure && formData.start_time) {
            const start = new Date(formData.start_time);
            // Padrão: 1 hora se não tiver duration_minutes
            const durationHours = (procedure as any).duration_minutes ? (procedure as any).duration_minutes / 60 : 1;
            const end = addHours(start, durationHours);
            setFormData({
                ...formData,
                procedimento_id: procedureId,
                end_time: end.toISOString()
            });
        } else {
            setFormData({ ...formData, procedimento_id: procedureId });
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedEvent(null);
        setPatientSearch('');
    };

    const handleCreateNewPatient = async (e: React.FormEvent) => {
        e.preventDefault();

        const { data, error } = await supabase
            .from('pacientes')
            .insert([newPatientData])
            .select()
            .single();

        if (!error && data) {
            alert('Paciente criado com sucesso!');
            setPatients([...patients, data]);
            setFormData({ ...formData, paciente_id: data.id });
            setShowNewPatientModal(false);
            setNewPatientData({ full_name: '', cpf: '', phone: '', email: '' });
        } else {
            alert('Erro ao criar paciente: ' + error?.message);
        }
    };

    const eventStyleGetter = (event: any) => {
        const colors: any = {
            pending: { backgroundColor: '#3b82f6' },
            confirmed: { backgroundColor: '#10b981' },
            in_progress: { backgroundColor: '#f59e0b' },
            completed: { backgroundColor: '#8b5cf6' },
            cancelled: { backgroundColor: '#ef4444' },
            no_show: { backgroundColor: '#6b7280' }
        };

        return {
            style: {
                ...(colors[event.resource?.status] || colors.pending),
                color: 'white',
                borderRadius: '6px',
                border: 'none'
            }
        };
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Agenda</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Visualização: Dia | Semana | Mês</p>
                </div>
                <button
                    onClick={() => {
                        const now = new Date();
                        const later = addHours(now, 1);
                        setFormData({
                            paciente_id: '',
                            professional_id: '',
                            procedimento_id: '',
                            start_time: now.toISOString(),
                            end_time: later.toISOString(),
                            notes: '',
                            status: 'pending',
                            source: 'manual'
                        });
                        setShowModal(true);
                    }}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Plus size={20} />
                    Novo Agendamento
                </button>
            </div>

            <div className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                    {[
                        { status: 'pending', label: 'Pendente', color: '#3b82f6' },
                        { status: 'confirmed', label: 'Confirmado', color: '#10b981' },
                        { status: 'in_progress', label: 'Em Andamento', color: '#f59e0b' },
                        { status: 'completed', label: 'Concluído', color: '#8b5cf6' },
                        { status: 'cancelled', label: 'Cancelado', color: '#ef4444' }
                    ].map(({ label, color }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }}></div>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', height: '700px' }}>
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    eventPropGetter={eventStyleGetter}
                    step={30}
                    min={new Date(2024, 0, 1, 7, 0)}
                    max={new Date(2024, 0, 1, 22, 0)}
                    culture="pt-BR"
                    formats={{
                        monthHeaderFormat: (date: Date) => format(date, 'MMMM yyyy', { locale: ptBR }),
                        dayHeaderFormat: (date: Date) => format(date, 'cccc, dd MMM', { locale: ptBR }),
                        dayRangeHeaderFormat: ({ start, end }: any) =>
                            `${format(start, 'dd MMM', { locale: ptBR })} - ${format(end, 'dd MMM yyyy', { locale: ptBR })}`,
                        agendaHeaderFormat: ({ start, end }: any) =>
                            `${format(start, 'dd MMM', { locale: ptBR })} - ${format(end, 'dd MMM yyyy', { locale: ptBR })}`,
                        dateFormat: (date: Date) => format(date, 'dd', { locale: ptBR }),
                        timeGutterFormat: (date: Date) => format(date, 'HH:mm', { locale: ptBR }),
                        eventTimeRangeFormat: ({ start, end }: any) =>
                            `${format(start, 'HH:mm', { locale: ptBR })} - ${format(end, 'HH:mm', { locale: ptBR })}`
                    }}
                    messages={{
                        allDay: 'Dia todo',
                        previous: '◀',
                        next: '▶',
                        today: 'Hoje',
                        month: 'Mês',
                        week: 'Semana',
                        day: 'Dia',
                        agenda: 'Agenda',
                        date: 'Data',
                        time: 'Hora',
                        event: 'Evento',
                        noEventsInRange: 'Sem agendamentos neste período',
                        showMore: (total: number) => `+${total} mais`
                    }}
                />
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {selectedEvent ? 'Editar' : 'Novo'} Agendamento
                            </h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    Paciente *
                                </label>

                                {/* Campo de Busca */}
                                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome, telefone ou CPF..."
                                        value={patientSearch}
                                        onChange={(e) => setPatientSearch(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)',
                                            outline: 'none'
                                        }}
                                    />
                                    <User size={18} style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)'
                                    }} />
                                </div>

                                {/* Lista de Pacientes */}
                                <div style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    border: '1px solid var(--border)',
                                    borderRadius: '10px',
                                    background: 'var(--bg-main)'
                                }}>
                                    {filteredPatients.length === 0 ? (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Nenhum paciente encontrado
                                        </div>
                                    ) : (
                                        filteredPatients.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setFormData({ ...formData, paciente_id: p.id });
                                                    setPatientSearch(p.full_name);
                                                }}
                                                style={{
                                                    padding: '0.75rem',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid var(--border)',
                                                    background: formData.paciente_id === p.id ? 'var(--primary)15' : 'transparent',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (formData.paciente_id !== p.id) {
                                                        e.currentTarget.style.background = 'var(--bg-card)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (formData.paciente_id !== p.id) {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }
                                                }}
                                            >
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{p.full_name}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                                                    <span>📱 {p.phone}</span>
                                                    {p.cpf && <span>🆔 {p.cpf}</span>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Botão Criar Novo Paciente */}
                                <button
                                    type="button"
                                    onClick={() => setShowNewPatientModal(true)}
                                    style={{
                                        width: '100%',
                                        marginTop: '0.5rem',
                                        padding: '0.75rem',
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Plus size={18} />
                                    Criar Novo Paciente
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Procedimento *</label>
                                    <select
                                        required
                                        value={formData.procedimento_id}
                                        onChange={(e) => handleProcedureChange(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)'
                                        }}
                                    >
                                        <option value="">Selecione</option>
                                        {procedures.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}{(p as any).duration_minutes ? ` - ${(p as any).duration_minutes}min` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Profissional</label>
                                    <select
                                        value={formData.professional_id}
                                        onChange={(e) => setFormData({ ...formData, professional_id: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)'
                                        }}
                                    >
                                        <option value="">Selecione</option>
                                        {professionals.map(p => (
                                            <option key={p.id} value={p.id}>{p.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Início *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.start_time ? format(new Date(formData.start_time), "yyyy-MM-dd'T'HH:mm") : ''}
                                        onChange={(e) => setFormData({ ...formData, start_time: new Date(e.target.value).toISOString() })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Fim *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.end_time ? format(new Date(formData.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
                                        onChange={(e) => setFormData({ ...formData, end_time: new Date(e.target.value).toISOString() })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Status *</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)'
                                    }}
                                >
                                    <option value="pending">Pendente</option>
                                    <option value="confirmed">Confirmado</option>
                                    <option value="in_progress">Em Andamento</option>
                                    <option value="completed">Concluído</option>
                                    <option value="cancelled">Cancelado</option>
                                    <option value="no_show">Não Compareceu</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Observações</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {selectedEvent && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        style={{
                                            padding: '0.75rem',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Excluir
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {selectedEvent ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Criar Novo Paciente Rápido */}
            {showNewPatientModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Criar Novo Paciente</h3>
                            <button onClick={() => setShowNewPatientModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateNewPatient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nome Completo *</label>
                                <input
                                    type="text"
                                    required
                                    value={newPatientData.full_name}
                                    onChange={(e) => setNewPatientData({ ...newPatientData, full_name: e.target.value })}
                                    placeholder="Ex: Maria Silva Santos"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Telefone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newPatientData.phone}
                                        onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                                        placeholder="(11) 99999-9999"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>CPF</label>
                                    <input
                                        type="text"
                                        value={newPatientData.cpf}
                                        onChange={(e) => setNewPatientData({ ...newPatientData, cpf: e.target.value })}
                                        placeholder="000.000.000-00"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '10px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email</label>
                                <input
                                    type="email"
                                    value={newPatientData.email}
                                    onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                                    placeholder="email@exemplo.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowNewPatientModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Criar e Selecionar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
