import {
    Calendar as CalendarIcon,
    TrendingUp,
    Users as UsersIcon,
    Ticket,
    ArrowUpRight
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const Dashboard = () => {
    const stats = [
        { title: 'Agendamentos Hoje', value: '15', change: '+3 vs ontem', icon: CalendarIcon, color: '#3b82f6' },
        { title: 'Faturamento Mensal', value: 'R$ 45.200,00', change: '+8%', icon: TrendingUp, color: '#10b981' },
        { title: 'Novos Pacientes', value: '22', change: '+5%', icon: UsersIcon, color: '#8b5cf6' },
        { title: 'Ticket Médio', value: 'R$ 420,00', change: '', icon: Ticket, color: '#f59e0b' },
    ];

    const revenueData = [
        { name: 'Jan', value: 10000 },
        { name: 'Fev', value: 25000 },
        { name: 'Mar', value: 38000 },
        { name: 'Abr', value: 34000 },
        { name: 'Mai', value: 55000 },
        { name: 'Jun', value: 85000 },
    ];

    const procedureData = [
        { name: 'Limpeza de Pele', value: 300, color: '#10b981' },
        { name: 'Botox', value: 250, color: '#8b5cf6' },
        { name: 'Depilação Laser', value: 210, color: '#f59e0b' },
        { name: 'Peeling', value: 150, color: '#3b82f6' },
        { name: 'Outros', value: 240, color: '#f43f5e' },
    ];

    const pieData = [
        { name: 'Recebido', value: 38, color: '#10b981' },
        { name: 'A Receber', value: 7, color: '#f59e0b' },
        { name: 'Despesas', value: 12, color: '#ef4444' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Dashboard Principal</h2>
                <p style={{ color: 'var(--text-muted)' }}>Bem-vindo de volta! Aqui está o resumo da sua clínica.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: `${stat.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: stat.color
                        }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{stat.title}</p>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stat.value}</h3>
                            {stat.change && (
                                <p style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    {stat.change}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ height: '400px' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Evolução do Faturamento (Jan-Jun)</h4>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--primary)' }}
                            />
                            <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card" style={{ height: '400px' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Procedimentos Mais Populares</h4>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={procedureData} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {procedureData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
                <div className="card" style={{ height: '400px' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Status Financeiro</h4>
                    <ResponsiveContainer width="100%" height="70%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        {pieData.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                                    <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
                                </div>
                                <span style={{ fontWeight: 600 }}>R$ {item.value}k</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ fontWeight: 600 }}>Próximos Agendamentos</h4>
                        <button style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600 }}>Ver todos</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                        {[
                            { time: '14:00', patient: 'Maria Silva', proc: 'Limpeza de Pele' },
                            { time: '15:30', patient: 'João Costa', proc: 'Depilação' },
                            { time: '16:45', patient: 'Ana Lima', proc: 'Botox' },
                            { time: '18:00', patient: 'Carlos Santos', proc: 'Peeling' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ width: '60px', fontWeight: 600, color: 'var(--primary)' }}>{item.time}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{item.patient}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.proc}</div>
                                </div>
                                <ArrowUpRight size={18} color="var(--text-muted)" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
