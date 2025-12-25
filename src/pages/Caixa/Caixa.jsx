import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FiSearch, FiX, FiPlus, FiMinus } from 'react-icons/fi'
import './Caixa.css'

const Caixa = () => {
    const [caixaAberto, setCaixaAberto] = useState(null)
    const [ultimoCaixa, setUltimoCaixa] = useState(null)
    const [clientes, setClientes] = useState([])
    const [servicos, setServicos] = useState([])

    const [venda, setVenda] = useState({
        cliente_id: '',
        data_venda: new Date().toISOString().split('T')[0],
        itens: [],
        valor_total: 0,
        forma_pagamento: '',
        valor_pago: 0
    })

    const [clienteBusca, setClienteBusca] = useState('')
    const [servicoBusca, setServicoBusca] = useState('')
    const [servicoSelecionado, setServicoSelecionado] = useState(null)
    const [quantidade, setQuantidade] = useState(1)

    const [activeTab, setActiveTab] = useState({
        lembrete: 'hoje',
        vendas: 'hoje'
    })

    const [lembretes, setLembretes] = useState([])
    const [vendasRecebidas, setVendasRecebidas] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

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

            // Buscar último caixa
            const { data: caixaData } = await supabase
                .from('caixa')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            // Buscar vendas pendentes (lembretes)
            const { data: lembretesData } = await supabase
                .from('vendas')
                .select('*, clientes(nome)')
                .in('status', ['pendente', 'parcial'])
                .order('data_venda', { ascending: false })

            // Buscar vendas recebidas hoje
            const hoje = new Date().toISOString().split('T')[0]
            const { data: vendasData } = await supabase
                .from('vendas')
                .select('*, clientes(nome)')
                .eq('status', 'pago')
                .gte('data_venda', hoje)
                .order('data_venda', { ascending: false })

            setClientes(clientesData || [])
            setServicos(servicosData || [])
            setUltimoCaixa(caixaData || [])
            setLembretes(lembretesData || [])
            setVendasRecebidas(vendasData || [])

        } catch (error) {
            console.error('Erro ao buscar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAbrirCaixa = () => {
        setCaixaAberto({
            data_abertura: new Date(),
            saldo_inicial: 0,
            status: 'aberto'
        })
    }

    const handleAdicionarItem = () => {
        if (!servicoSelecionado) {
            alert('Selecione um serviço/produto')
            return
        }

        const novoItem = {
            servico_id: servicoSelecionado.id,
            nome: servicoSelecionado.nome,
            quantidade,
            preco_unitario: servicoSelecionado.preco,
            subtotal: servicoSelecionado.preco * quantidade
        }

        setVenda(prev => ({
            ...prev,
            itens: [...prev.itens, novoItem],
            valor_total: prev.valor_total + novoItem.subtotal
        }))

        setServicoSelecionado(null)
        setServicoBusca('')
        setQuantidade(1)
    }

    const handleRemoverItem = (index) => {
        const item = venda.itens[index]
        setVenda(prev => ({
            ...prev,
            itens: prev.itens.filter((_, i) => i !== index),
            valor_total: prev.valor_total - item.subtotal
        }))
    }

    const handleFinalizarVenda = async () => {
        try {
            if (!venda.cliente_id || venda.itens.length === 0) {
                alert('Selecione um cliente e adicione itens à venda')
                return
            }

            // Criar venda
            const { data: vendaData, error: vendaError } = await supabase
                .from('vendas')
                .insert([{
                    cliente_id: venda.cliente_id,
                    data_venda: venda.data_venda,
                    valor_total: venda.valor_total,
                    valor_pago: venda.valor_pago,
                    forma_pagamento: venda.forma_pagamento,
                    status: venda.valor_pago >= venda.valor_total ? 'pago' : 'parcial'
                }])
                .select()
                .single()

            if (vendaError) throw vendaError

            // Criar itens da venda
            const itensVenda = venda.itens.map(item => ({
                venda_id: vendaData.id,
                servico_id: item.servico_id,
                quantidade: item.quantidade,
                preco_unitario: item.preco_unitario,
                desconto: 0,
                subtotal: item.subtotal
            }))

            const { error: itensError } = await supabase
                .from('vendas_itens')
                .insert(itensVenda)

            if (itensError) throw itensError

            // Registrar no caixa
            const { error: caixaError } = await supabase
                .from('caixa')
                .insert([{
                    tipo: 'entrada',
                    valor: venda.valor_pago,
                    descricao: `Venda #${vendaData.id.slice(0, 8)}`,
                    categoria: 'venda',
                    venda_id: vendaData.id,
                    data_movimento: new Date().toISOString()
                }])

            if (caixaError) throw caixaError

            alert('Venda finalizada com sucesso!')
            resetVenda()
            fetchData()

        } catch (error) {
            console.error('Erro ao finalizar venda:', error)
            alert('Erro ao finalizar venda')
        }
    }

    const resetVenda = () => {
        setVenda({
            cliente_id: '',
            data_venda: new Date().toISOString().split('T')[0],
            itens: [],
            valor_total: 0,
            forma_pagamento: '',
            valor_pago: 0
        })
        setClienteBusca('')
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const clientesFiltrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(clienteBusca.toLowerCase())
    )

    const servicosFiltrados = servicos.filter(s =>
        s.nome.toLowerCase().includes(servicoBusca.toLowerCase())
    )

    if (loading) {
        return (
            <div className="caixa-loading">
                <div className="spinner"></div>
                <p>Carregando caixa...</p>
            </div>
        )
    }

    return (
        <div className="caixa">
            <div className="caixa-main">
                {/* Cliente */}
                <section className="caixa-section">
                    <div className="section-header blue">
                        <h3>👤 Cliente</h3>
                    </div>
                    <div className="section-content">
                        <div className="search-group">
                            <input
                                type="text"
                                placeholder="Cliente..."
                                value={clienteBusca}
                                onChange={(e) => setClienteBusca(e.target.value)}
                                className="search-input"
                            />
                            <button className="btn-search">
                                <FiSearch />
                            </button>
                        </div>
                        {clienteBusca && (
                            <div className="search-results">
                                {clientesFiltrados.slice(0, 5).map(c => (
                                    <div
                                        key={c.id}
                                        className="result-item"
                                        onClick={() => {
                                            setVenda(prev => ({ ...prev, cliente_id: c.id }))
                                            setClienteBusca(c.nome)
                                        }}
                                    >
                                        {c.nome}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="form-row">
                            <input type="text" placeholder="[...]" className="small-input" />
                            <select className="small-select">
                                <option>Selecione...</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Produtos/Serviços */}
                <section className="caixa-section">
                    <div className="section-header blue">
                        <h3>📦 Produtos / Serviços</h3>
                    </div>
                    <div className="section-content">
                        <div className="search-group">
                            <input
                                type="text"
                                placeholder="Informe Produto/Serviço..."
                                value={servicoBusca}
                                onChange={(e) => setServicoBusca(e.target.value)}
                                className="search-input"
                            />
                            <button className="btn-search">
                                <FiSearch />
                            </button>
                        </div>
                        {servicoBusca && (
                            <div className="search-results">
                                {servicosFiltrados.slice(0, 5).map(s => (
                                    <div
                                        key={s.id}
                                        className="result-item"
                                        onClick={() => {
                                            setServicoSelecionado(s)
                                            setServicoBusca(s.nome)
                                        }}
                                    >
                                        {s.nome} - {formatCurrency(s.preco)}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="form-row">
                            <select className="small-select">
                                <option>Fabio Zinni</option>
                            </select>
                        </div>
                        <div className="quantity-group">
                            <label>Preço</label>
                            <div className="qty-control">
                                <button
                                    className="btn-qty"
                                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                                >
                                    <FiMinus />
                                </button>
                                <input
                                    type="number"
                                    value={quantidade}
                                    onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="qty-input"
                                />
                                <button
                                    className="btn-qty"
                                    onClick={() => setQuantidade(quantidade + 1)}
                                >
                                    <FiPlus />
                                </button>
                            </div>
                        </div>
                        <textarea placeholder="Observações" rows="2" />
                        <button className="btn btn-teal" onClick={handleAdicionarItem}>
                            + INCLUIR NA VENDA
                        </button>
                    </div>
                </section>

                {/* Informações da Venda */}
                <section className="caixa-section">
                    <div className="section-header light">
                        <h3>ℹ️ Informações da Venda</h3>
                        <button className="btn btn-info">+ NOVA VENDA</button>
                    </div>
                    <div className="section-content">
                        <div className="info-row">
                            <div className="info-group">
                                <label>Código *</label>
                                <input type="text" value="Novo" readOnly />
                            </div>
                            <div className="info-group">
                                <label>Data *</label>
                                <input
                                    type="date"
                                    value={venda.data_venda}
                                    onChange={(e) => setVenda(prev => ({ ...prev, data_venda: e.target.value }))}
                                />
                            </div>
                            <div className="info-group">
                                <label>Total</label>
                                <input type="text" value={formatCurrency(venda.valor_total)} readOnly />
                            </div>
                        </div>
                        <button className="btn btn-orange">
                            💳 FORMAS DE PAGAMENTO
                        </button>
                    </div>
                </section>

                {/* Item de Venda */}
                <section className="caixa-section">
                    <div className="section-header blue-dark">
                        <h3>📋 Item de Venda</h3>
                    </div>
                    <div className="section-content">
                        {venda.itens.length === 0 ? (
                            <p className="empty-message">Nenhuma venda registrada.</p>
                        ) : (
                            <div className="items-list">
                                {venda.itens.map((item, idx) => (
                                    <div key={idx} className="item-row">
                                        <span>{item.nome}</span>
                                        <span>Qtd: {item.quantidade}</span>
                                        <span>{formatCurrency(item.subtotal)}</span>
                                        <button
                                            className="btn-remove"
                                            onClick={() => handleRemoverItem(idx)}
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Painel Lateral Direito */}
            <div className="caixa-sidebar">
                {/* Status do Caixa */}
                <div className="caixa-status">
                    <h4>Caixa - {caixaAberto ? 'Caixa Aberto' : 'Nenhum caixa aberto'}</h4>
                    {!caixaAberto && (
                        <button className="btn btn-green" onClick={handleAbrirCaixa}>
                            + ABRIR NOVO CAIXA
                        </button>
                    )}
                    {caixaAberto && (
                        <button className="btn btn-danger">
                            FECHAR CAIXA
                        </button>
                    )}
                </div>

                {/* Informações do Último Caixa */}
                <div className="ultimo-caixa">
                    <h5>INFORMAÇÕES DO ÚLTIMO CAIXA</h5>
                    <table className="caixa-table">
                        <thead>
                            <tr>
                                <th>Caixa</th>
                                <th>Abertura</th>
                                <th>Fechamento</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ultimoCaixa.slice(0, 3).map((c, idx) => (
                                <tr key={idx}>
                                    <td>#{idx + 1}</td>
                                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                                    <td>-</td>
                                    <td>{formatCurrency(c.valor)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="btn btn-pink">
                        SANGRIA/ULTIMO CAIXA
                    </button>
                </div>

                {/* Lembrete a Receber */}
                <div className="lembrete-box">
                    <h5>Lembrete a receber</h5>
                    <div className="tabs-small">
                        <button
                            className={activeTab.lembrete === 'hoje' ? 'active' : ''}
                            onClick={() => setActiveTab(prev => ({ ...prev, lembrete: 'hoje' }))}
                        >
                            HOJE
                        </button>
                        <button
                            className={activeTab.lembrete === 'ontem' ? 'active' : ''}
                            onClick={() => setActiveTab(prev => ({ ...prev, lembrete: 'ontem' }))}
                        >
                            ONTEM
                        </button>
                        <button
                            className={activeTab.lembrete === 'semana' ? 'active' : ''}
                            onClick={() => setActiveTab(prev => ({ ...prev, lembrete: 'semana' }))}
                        >
                            SEMANA
                        </button>
                        <button
                            className={activeTab.lembrete === 'mes' ? 'active' : ''}
                            onClick={() => setActiveTab(prev => ({ ...prev, lembrete: 'mes' }))}
                        >
                            MÊS
                        </button>
                    </div>
                    <div className="lembrete-content">
                        {lembretes.length === 0 ? (
                            <p className="empty">Nenhum lembrete pendente</p>
                        ) : (
                            lembretes.slice(0, 5).map(l => (
                                <div key={l.id} className="lembrete-item">
                                    <strong>{l.clientes?.nome}</strong>
                                    <span>{formatCurrency(l.valor_total - l.valor_pago)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Vendas Recebidas */}
                <div className="vendas-recebidas">
                    <h5>Vendas Recebidas</h5>
                    <div className="tabs-small">
                        <button
                            className={activeTab.vendas === 'hoje' ? 'active' : ''}
                            onClick={() => setActiveTab(prev => ({ ...prev, vendas: 'hoje' }))}
                        >
                            HOJE
                        </button>
                        <button
                            className={activeTab.vendas === 'ontem' ? 'active' : ''}
                            onClick={() => setActiveTab(prev => ({ ...prev, vendas: 'ontem' }))}
                        >
                            ONTEM
                        </button>
                        <button
                            className={activeTab.vendas === 'semana' ? 'active' : ''}
                            onClick={() => setActiveTab(prev => ({ ...prev, vendas: 'semana' }))}
                        >
                            SEMANA
                        </button>
                        <button
                            className={activeTab.vendas === 'mes' ? 'active' : ''}
                            onClick={() => setActiveTab(prev => ({ ...prev, vendas: 'mes' }))}
                        >
                            MÊS
                        </button>
                    </div>
                    <div className="vendas-content">
                        {vendasRecebidas.length === 0 ? (
                            <p className="empty">Nenhuma venda recebida</p>
                        ) : (
                            vendasRecebidas.slice(0, 5).map(v => (
                                <div key={v.id} className="venda-item">
                                    <strong>{v.clientes?.nome}</strong>
                                    <span>{formatCurrency(v.valor_total)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Caixa
