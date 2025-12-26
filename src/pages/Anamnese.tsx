import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, FileText, Edit, Trash2, X } from 'lucide-react';

const Anamnese = () => {
    const [anamneses, setAnamneses] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [formData, setFormData] = useState({
        main_complaint: '',
        current_illness_history: '',
        medical_history: '',
        allergies: '',
        medications: '',
        smoking: false,
        alcohol: false,
        physical_activity: '',
        previous_surgeries: '',
        family_history: '',
        skin_type: '',
        previous_aesthetic_procedures: '',
        cosmetics_used: '',
        sun_exposure: '',
        expectations: '',
        contraindications: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [anamnesisRes, patientsRes] = await Promise.all([
            supabase.from('anamnese').select('*, pacientes(full_name)').order('created_at', { ascending: false }),
            supabase.from('pacientes').select('id, full_name').order('full_name')
        ]);

        if (!anamnesisRes.error) setAnamneses(anamnesisRes.data || []);
        if (!patientsRes.error) setPatients(patientsRes.data || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await supabase
            .from('anamnese')
            .insert([{ ...formData, patient_id: selectedPatient }]);

        if (!error) {
            alert('Anamnese salva com sucesso!');
            fetchData();
            closeModal();
        } else {
            alert('Erro: ' + error.message);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPatient('');
        setFormData({
            main_complaint: '',
            current_illness_history: '',
            medical_history: '',
            allergies: '',
            medications: '',
            smoking: false,
            alcohol: false,
            physical_activity: '',
            previous_surgeries: '',
            family_history: '',
            skin_type: '',
            previous_aesthetic_procedures: '',
            cosmetics_used: '',
            sun_exposure: '',
            expectations: '',
            contraindications: ''
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Anamnese Digital</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Histórico completo de saúde e estética dos pacientes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: 'var(--primary)',
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
                    Nova Anamnese
                </button>
            </div>

            <div className="card" style={{ padding: '0' }}>
                {anamneses.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>Nenhuma anamnese registrada ainda</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>PACIENTE</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>DATA</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>QUEIXA PRINCIPAL</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>ALERGIAS</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {anamneses.map((a: any) => (
                                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                                            {a.pacientes?.full_name || 'N/A'}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            {new Date(a.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {a.main_complaint || '-'}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            {a.allergies ? (
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: '#ef444415',
                                                    color: '#ef4444'
                                                }}>
                                                    Sim
                                                </span>
                                            ) : (
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: '#10b98115',
                                                    color: '#10b981'
                                                }}>
                                                    Não
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <button style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                    zIndex: 1000,
                    overflow: 'auto'
                }}>
                    <div className="card" style={{
                        width: '90%',
                        maxWidth: '900px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        margin: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Nova Anamnese</h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Paciente *
                                </label>
                                <select
                                    required
                                    value={selectedPatient}
                                    onChange={(e) => setSelectedPatient(e.target.value)}
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
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1.5rem' }}>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>
                                    Histórico Clínico
                                </h4>

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                            Queixa Principal
                                        </label>
                                        <textarea
                                            value={formData.main_complaint}
                                            onChange={(e) => setFormData({ ...formData, main_complaint: e.target.value })}
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

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                                Alergias
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.allergies}
                                                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                                placeholder="Ex: Penicilina, Látex..."
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
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                                Medicamentos em Uso
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.medications}
                                                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                                placeholder="Ex: Losartana 50mg..."
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

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.smoking}
                                                    onChange={(e) => setFormData({ ...formData, smoking: e.target.checked })}
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Fumante</span>
                                            </label>
                                        </div>

                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.alcohol}
                                                    onChange={(e) => setFormData({ ...formData, alcohol: e.target.checked })}
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Consome Álcool</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1.5rem' }}>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>
                                    Avaliação Estética
                                </h4>

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                                Tipo de Pele
                                            </label>
                                            <select
                                                value={formData.skin_type}
                                                onChange={(e) => setFormData({ ...formData, skin_type: e.target.value })}
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
                                                <option value="oleosa">Oleosa</option>
                                                <option value="seca">Seca</option>
                                                <option value="mista">Mista</option>
                                                <option value="normal">Normal</option>
                                                <option value="sensivel">Sensível</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                                Exposição Solar
                                            </label>
                                            <select
                                                value={formData.sun_exposure}
                                                onChange={(e) => setFormData({ ...formData, sun_exposure: e.target.value })}
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
                                                <option value="alta">Alta</option>
                                                <option value="moderada">Moderada</option>
                                                <option value="baixa">Baixa</option>
                                                <option value="nenhuma">Nenhuma</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                            Procedimentos Estéticos Anteriores
                                        </label>
                                        <textarea
                                            value={formData.previous_aesthetic_procedures}
                                            onChange={(e) => setFormData({ ...formData, previous_aesthetic_procedures: e.target.value })}
                                            rows={2}
                                            placeholder="Ex: Botox em 2023, Preenchimento labial em 2024..."
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

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                            Expectativas do Paciente
                                        </label>
                                        <textarea
                                            value={formData.expectations}
                                            onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                                            rows={3}
                                            placeholder="O que o paciente espera alcançar com o tratamento..."
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

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#ef4444' }}>
                                            Contraindicações
                                        </label>
                                        <textarea
                                            value={formData.contraindications}
                                            onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
                                            rows={2}
                                            placeholder="Qualquer contraindicação identificada..."
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
                                </div>
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
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Salvar Anamnese
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Anamnese;
