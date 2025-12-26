import { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Telemedicina = () => {
    const [inCall, setInCall] = useState(false);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        fetchTodayAppointments();
    }, []);

    const fetchTodayAppointments = async () => {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
            .from('agendamentos')
            .select('*, pacientes(full_name, phone)')
            .gte('appointment_date', today)
            .lte('appointment_date', today + 'T23:59:59')
            .eq('consultation_type', 'telemedicine')
            .order('start_time');

        if (data) setAppointments(data);
    };

    const startCall = async (appointment: any) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setLocalStream(stream);
            setSelectedAppointment(appointment);
            setInCall(true);

            // Criar sessão de telemedicina no backend
            await fetch('http://localhost:8000/telemedicine/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointment_id: appointment.id,
                    patient_id: appointment.patient_id
                })
            });
        } catch (error) {
            alert('Erro ao acessar câmera/microfone: ' + error);
        }
    };

    const endCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        setInCall(false);
        setSelectedAppointment(null);
        setLocalStream(null);
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setVideoEnabled(!videoEnabled);
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setAudioEnabled(!audioEnabled);
        }
    };

    if (inCall) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#000',
                zIndex: 9999
            }}>
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Remote Video (paciente) */}
                    <div style={{
                        flex: 1,
                        position: 'relative',
                        background: '#1a1a1a'
                    }}>
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />

                        <div style={{
                            position: 'absolute',
                            top: '2rem',
                            left: '2rem',
                            background: 'rgba(0,0,0,0.7)',
                            padding: '1rem 1.5rem',
                            borderRadius: '10px',
                            color: 'white'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                {selectedAppointment?.pacientes?.full_name}
                            </h3>
                            <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                                Teleconsulta em andamento
                            </p>
                        </div>
                    </div>

                    {/* Local Video (você) - Picture in Picture */}
                    <div style={{
                        position: 'absolute',
                        bottom: '120px',
                        right: '2rem',
                        width: '280px',
                        height: '210px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '3px solid var(--primary)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: 'scaleX(-1)'
                            }}
                        />
                    </div>

                    {/* Controls */}
                    <div style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'rgba(0,0,0,0.7)',
                        borderRadius: '999px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <button
                            onClick={toggleVideo}
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                border: 'none',
                                background: videoEnabled ? 'rgba(255,255,255,0.2)' : '#ef4444',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                        </button>

                        <button
                            onClick={toggleAudio}
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                border: 'none',
                                background: audioEnabled ? 'rgba(255,255,255,0.2)' : '#ef4444',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>

                        <button
                            onClick={endCall}
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                border: 'none',
                                background: '#ef4444',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <PhoneOff size={24} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Telemedicina</h2>
                <p style={{ color: 'var(--text-muted)' }}>Consultas online por vídeo com seus pacientes</p>
            </div>

            <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                    Teleconsultas Agendadas para Hoje
                </h3>

                {appointments.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Video size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>Nenhuma teleconsulta agendada para hoje</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {appointments.map((apt: any) => (
                            <div
                                key={apt.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1.5rem',
                                    background: 'var(--bg-main)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: 'var(--primary)15',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--primary)'
                                    }}>
                                        <Video size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                            {apt.pacientes?.full_name}
                                        </h4>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {apt.start_time} - {apt.end_time}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => startCall(apt)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Video size={20} />
                                    Iniciar Chamada
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Como funciona
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            flexShrink: 0
                        }}>
                            1
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Agendamento</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Paciente agenda teleconsulta pelo app ou WhatsApp
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            flexShrink: 0
                        }}>
                            2
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Notificação</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Paciente recebe link por WhatsApp 10 minutos antes
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            flexShrink: 0
                        }}>
                            3
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Consulta</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Você inicia a chamada aqui e o paciente entra pelo link
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            flexShrink: 0
                        }}>
                            4
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Prontuário Automático</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Grave observações por áudio e a IA transcreve para o prontuário
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Telemedicina;
