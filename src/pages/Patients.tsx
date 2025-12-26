import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, Edit, Trash2, X, Phone, Mail, MapPin, FileText } from 'lucide-react';

const Patients = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        cpf: '',
        phone: '',
        email: '',
        birth_date: '',
        address: '',
        medical_notes: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = patients.filter(p =>
                p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.cpf?.includes(searchTerm) ||
                p.phone?.includes(searchTerm) ||
                p.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients(patients);
        }
    }, [searchTerm, patients]);

    const fetchPatients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .order('full_name');

        if (!error && data) {
            setPatients(data);
            setFilteredPatients(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingPatient) {
            // Update
            const { error } = await supabase
                .from('pacientes')
                .update(formData)
                .eq('id', editingPatient.id);

            if (!error) {
                alert('Paciente atualizado com sucesso!');
                fetchPatients();
                closeModal();
            } else {
                alert('Erro ao atualizar: ' + error.message);
            }
        } else {
            // Create
            const { error } = await supabase
                .from('pacientes')
                .insert([formData]);

            if (!error) {
                alert('Paciente criado com sucesso!');
                fetchPatients();
                closeModal();
            } else {
                alert('Erro ao criar: ' + error.message);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este paciente?')) return;

        const { error } = await supabase
            .from('pacientes')
            .delete()
            .eq('id', id);

        if (!error) {
            alert('Paciente excluído com sucesso!');
            fetchPatients();
        } else {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const openModal = (patient: any = null) => {
        if (patient) {
            setEditingPatient(patient);
            setFormData({
                full_name: patient.full_name || '',
                cpf: patient.cpf || '',
                phone: patient.phone || '',
                email: patient.email || '',
                birth_date: patient.birth_date || '',
                address: patient.address || '',
                medical_notes: patient.medical_notes || ''
            });
        } else {
            setEditingPatient(null);
            setFormData({
                full_name: '',
                cpf: '',
                phone: '',
                email: '',
                birth_date: '',
                address: '',
                medical_notes: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPatient(null);
        setFormData({
            full_name: '',
            cpf: '',
            phone: '',
            email: '',
            birth_date: '',
            address: '',
            medical_notes: ''
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Pacientes</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Gerencie o cadastro e histórico dos seus pacientes.</p>
                </div>
                <button
                    onClick={() => openModal()}
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
                    Novo Paciente
                </button>
            </div>

            <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar paciente por nome, CPF, telefone ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem 1rem 0.6rem 2.5rem',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)',
                                borderRadius: '10px',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Carregando pacientes...
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {searchTerm ? 'Nenhum paciente encontrado com esse critério.' : 'Nenhum paciente cadastrado. Clique em "Novo Paciente" para começar.'}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>NOME COMPLETO</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>CPF</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>CONTATO</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>EMAIL</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((p: any) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ fontWeight: 600 }}>{p.full_name}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{p.cpf || 'N/A'}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{p.phone}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{p.email || 'N/A'}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => openModal(p)}
                                                    style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
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
                    zIndex: 1000
                }}>
                    <div className="card" style={{
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
                            </h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                        CPF
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.cpf}
                                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
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

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                        Data de Nascimento
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                        Telefone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                    Endereço
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Rua, número, bairro, cidade"
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
                                    Observações Médicas
                                </label>
                                <textarea
                                    value={formData.medical_notes}
                                    onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                                    placeholder="Alergias, condições pré-existentes, etc."
                                    rows={4}
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

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
                                    {editingPatient ? 'Salvar Alterações' : 'Criar Paciente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Patients;
