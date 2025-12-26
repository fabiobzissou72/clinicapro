import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, Play, Pause, Download, FileText, Mic } from 'lucide-react';

const Prontuarios = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [recordsRes, patientsRes] = await Promise.all([
            supabase.from('medical_audio_records').select('*, pacientes(full_name)').order('created_at', { ascending: false }),
            supabase.from('pacientes').select('id, full_name').order('full_name')
        ]);

        if (!recordsRes.error) setRecords(recordsRes.data || []);
        if (!patientsRes.error) setPatients(patientsRes.data || []);
        setLoading(false);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
                setAudioFile(file);
            };

            setMediaRecorder(recorder);
            setAudioChunks(chunks);
            recorder.start();
            setIsRecording(true);
        } catch (error) {
            alert('Erro ao acessar microfone: ' + error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient || !audioFile) {
            alert('Selecione um paciente e grave/envie um áudio!');
            return;
        }

        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('patient_id', selectedPatient);

        try {
            const response = await fetch('http://localhost:8000/ai/transcribe-medical-record', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Prontuário criado e processado com IA!');
                fetchData();
                closeModal();
            } else {
                alert('Erro ao processar áudio');
            }
        } catch (error) {
            alert('Erro: ' + error);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPatient('');
        setAudioFile(null);
        setIsRecording(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Prontuários com IA</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Grave áudios e a IA transcreve e resume automaticamente</p>
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
                    <Mic size={20} />
                    Novo Prontuário
                </button>
            </div>

            <div className="card" style={{ padding: '0' }}>
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Carregando prontuários...
                    </div>
                ) : records.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nenhum prontuário ainda. Grave seu primeiro!
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>PACIENTE</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>DATA</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>RESUMO IA</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>STATUS</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r: any) => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                                            {r.pacientes?.full_name || 'N/A'}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            {new Date(r.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {r.summary || 'Processando...'}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: r.status === 'completed' ? '#10b98115' : '#f59e0b15',
                                                color: r.status === 'completed' ? '#10b981' : '#f59e0b'
                                            }}>
                                                {r.status === 'completed' ? 'Completo' : 'Processando'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {r.audio_url && (
                                                    <button style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                        <Play size={18} />
                                                    </button>
                                                )}
                                                <button style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    <FileText size={18} />
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
                    <div className="card" style={{ width: '90%', maxWidth: '500px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                            Novo Prontuário com IA
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    Selecione o Paciente *
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
                                    <option value="">Escolha um paciente</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Grave o Prontuário por Áudio</p>

                                {!isRecording && !audioFile && (
                                    <button
                                        type="button"
                                        onClick={startRecording}
                                        style={{
                                            padding: '1rem 2rem',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '9999px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Mic size={20} />
                                        Iniciar Gravação
                                    </button>
                                )}

                                {isRecording && (
                                    <div>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: '#ef4444',
                                            margin: '0 auto 1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            animation: 'pulse 1.5s infinite'
                                        }}>
                                            <Mic size={40} color="white" />
                                        </div>
                                        <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '1rem' }}>
                                            Gravando...
                                        </p>
                                        <button
                                            type="button"
                                            onClick={stopRecording}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                background: 'var(--bg-main)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            Parar Gravação
                                        </button>
                                    </div>
                                )}

                                {audioFile && !isRecording && (
                                    <div>
                                        <p style={{ color: '#10b981', fontWeight: 600, marginBottom: '1rem' }}>
                                            ✓ Áudio gravado com sucesso!
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setAudioFile(null)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'none',
                                                border: '1px solid var(--border)',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            Gravar Novamente
                                        </button>
                                    </div>
                                )}

                                <div style={{ margin: '1rem 0' }}>OU</div>

                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => e.target.files && setAudioFile(e.target.files[0])}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-main)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '10px'
                                    }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Formatos aceitos: MP3, WAV, M4A, WebM
                                </p>
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
                                    disabled={!audioFile || !selectedPatient}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: audioFile && selectedPatient ? 'var(--primary)' : 'var(--bg-main)',
                                        color: audioFile && selectedPatient ? 'white' : 'var(--text-muted)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: audioFile && selectedPatient ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Processar com IA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Prontuarios;
