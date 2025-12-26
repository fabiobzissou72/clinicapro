import { useState, useEffect } from 'react';
import { MessageSquare, Send, Bot, Plus, Edit, Trash2, X, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AutomacaoWhatsApp = () => {
    const [rules, setRules] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        trigger_type: 'appointment_confirmation',
        trigger_time_minutes: 1440,
        message_template: '',
        is_active: true
    });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        const { data } = await supabase
            .from('automation_rules')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setRules(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await supabase
            .from('automation_rules')
            .insert([formData]);

        if (!error) {
            alert('Automação criada!');
            fetchRules();
            closeModal();
        } else {
            alert('Erro: ' + error.message);
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        await supabase
            .from('automation_rules')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        fetchRules();
    };

    const deleteRule = async (id: string) => {
        if (!confirm('Excluir automação?')) return;

        await supabase
            .from('automation_rules')
            .delete()
            .eq('id', id);

        fetchRules();
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({
            name: '',
            trigger_type: 'appointment_confirmation',
            trigger_time_minutes: 1440,
            message_template: '',
            is_active: true
        });
    };

    const templates = {
        appointment_confirmation: `Olá {{nome}}! 👋

Seu agendamento está confirmado:
📅 Data: {{data}}
🕐 Horário: {{horario}}
💅 Procedimento: {{procedimento}}

Estamos te esperando! ✨`,
        appointment_reminder: `Oi {{nome}}! 👋

Lembrete: Você tem um procedimento amanhã!
📅 {{data}} às {{horario}}
💅 {{procedimento}}

Nos vemos lá! 💖`,
        follow_up: `Oi {{nome}}! 💕

Como você está se sentindo após o procedimento de {{procedimento}}?

Qualquer dúvida, estou aqui! 😊`,
        birthday: `Parabéns, {{nome}}! 🎉🎂

Hoje é seu dia especial!
Temos um presente para você: 20% OFF em qualquer procedimento este mês!

Agende já! 💖`,
        promotion: `Oi {{nome}}! ✨

Promoção especial para você:
{{promocao}}

Válido até {{data_validade}}

Agende já! 💅`
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Automação WhatsApp</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Configure mensagens automáticas para seus pacientes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: '#25D366',
                        color: 'white',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                    <Plus size={20} />
                    Nova Automação
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {rules.map((rule: any) => (
                    <div
                        key={rule.id}
                        className="card"
                        style={{
                            opacity: rule.is_active ? 1 : 0.6,
                            borderLeft: `4px solid ${rule.is_active ? '#25D366' : 'var(--border)'}`
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: '#25D36615',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#25D366'
                                }}>
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{rule.name}</h4>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: rule.is_active ? '#10b98115' : '#6b728015',
                                        color: rule.is_active ? '#10b981' : '#6b7280'
                                    }}>
                                        {rule.is_active ? 'Ativa' : 'Pausada'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <button
                                    onClick={() => toggleActive(rule.id, rule.is_active)}
                                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => deleteRule(rule.id)}
                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            <Clock size={14} />
                            <span>
                                {rule.trigger_time_minutes >= 1440
                                    ? `${rule.trigger_time_minutes / 1440} dia(s) antes`
                                    : rule.trigger_time_minutes >= 60
                                        ? `${rule.trigger_time_minutes / 60} hora(s) antes`
                                        : `${rule.trigger_time_minutes} minuto(s) antes`
                                }
                            </span>
                        </div>

                        <div style={{
                            padding: '0.75rem',
                            background: 'var(--bg-main)',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)',
                            maxHeight: '100px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {rule.message_template}
                        </div>
                    </div>
                ))}

                {rules.length === 0 && (
                    <div className="card" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center' }}>
                        <MessageSquare size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)', opacity: 0.5 }} />
                        <p style={{ color: 'var(--text-muted)' }}>Nenhuma automação configurada ainda</p>
                    </div>
                )}
            </div>

            {/* Modal */}
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
                    <div className="card" style={{ width: '90%', maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Nova Automação WhatsApp</h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Nome da Automação *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Lembrete 24h antes"
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
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Tipo de Gatilho *
                                </label>
                                <select
                                    required
                                    value={formData.trigger_type}
                                    onChange={(e) => {
                                        const type = e.target.value as keyof typeof templates;
                                        setFormData({
                                            ...formData,
                                            trigger_type: type,
                                            message_template: templates[type]
                                        });
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)'
                                    }}
                                >
                                    <option value="appointment_confirmation">Confirmação de Agendamento</option>
                                    <option value="appointment_reminder">Lembrete de Agendamento</option>
                                    <option value="follow_up">Follow-up Pós-Procedimento</option>
                                    <option value="birthday">Aniversário</option>
                                    <option value="promotion">Promoção</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Enviar
                                </label>
                                <select
                                    value={formData.trigger_time_minutes}
                                    onChange={(e) => setFormData({ ...formData, trigger_time_minutes: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)'
                                    }}
                                >
                                    <option value="0">Imediatamente</option>
                                    <option value="60">1 hora antes</option>
                                    <option value="180">3 horas antes</option>
                                    <option value="360">6 horas antes</option>
                                    <option value="720">12 horas antes</option>
                                    <option value="1440">1 dia antes</option>
                                    <option value="2880">2 dias antes</option>
                                    <option value="10080">1 semana antes</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Mensagem (Template) *
                                </label>
                                <textarea
                                    required
                                    value={formData.message_template}
                                    onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                                    rows={8}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px',
                                        color: 'var(--text-main)',
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem',
                                        resize: 'vertical'
                                    }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Variáveis disponíveis: {'{nome}'}, {'{data}'}, {'{horario}'}, {'{procedimento}'}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
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
                                        background: '#25D366',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Criar Automação
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutomacaoWhatsApp;
