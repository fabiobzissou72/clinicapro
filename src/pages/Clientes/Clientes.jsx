import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiDownload } from 'react-icons/fi'
import './Clientes.css'

const Clientes = () => {
    const [clientes, setClientes] = useState([])
    const [clientesFiltrados, setClientesFiltrados] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('geral')

    const [formData, setFormData] = useState({
        id: null,
        nome: '',
        cpf: '',
        rg: '',
        cnpj: '',
        data_nascimento: '',
        telefone: '',
        email: '',
        celular: '',
        endereco: '',
        complemento: '',
        observacoes: '',
        ativo: true
    })

    useEffect(() => {
        fetchClientes()
    }, [])

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setClientesFiltrados(clientes)
        } else {
            const filtered = clientes.filter(cliente =>
                cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.cpf?.includes(searchTerm) ||
                cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.telefone?.includes(searchTerm)
            )
            setClientesFiltrados(filtered)
        }
    }, [searchTerm, clientes])

    const fetchClientes = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .order('nome')

            if (error) throw error
            setClientes(data || [])
            setClientesFiltrados(data || [])
        } catch (error) {
            console.error('Erro ao buscar clientes:', error)
            alert('Erro ao buscar clientes')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            if (!formData.nome || !formData.nome.trim()) {
                alert('Nome é obrigatório')
                return
            }

            if (formData.id) {
                // Atualizar
                const { error } = await supabase
                    .from('clientes')
                    .update({
                        nome: formData.nome,
                        cpf: formData.cpf,
                        rg: formData.rg,
                        cnpj: formData.cnpj,
                        data_nascimento: formData.data_nascimento,
                        telefone: formData.telefone,
                        email: formData.email,
                        celular: formData.celular,
                        endereco: formData.endereco,
                        complemento: formData.complemento,
                        observacoes: formData.observacoes,
                        ativo: formData.ativo
                    })
                    .eq('id', formData.id)

                if (error) throw error
                alert('Cliente atualizado com sucesso!')
            } else {
                // Criar novo
                const { error } = await supabase
                    .from('clientes')
                    .insert([{
                        nome: formData.nome,
                        cpf: formData.cpf,
                        rg: formData.rg,
                        cnpj: formData.cnpj,
                        data_nascimento: formData.data_nascimento,
                        telefone: formData.telefone,
                        email: formData.email,
                        celular: formData.celular,
                        endereco: formData.endereco,
                        complemento: formData.complemento,
                        observacoes: formData.observacoes,
                        ativo: true
                    }])

                if (error) throw error
                alert('Cliente cadastrado com sucesso!')
            }

            resetForm()
            fetchClientes()
            setShowForm(false)
        } catch (error) {
            console.error('Erro ao salvar cliente:', error)
            alert('Erro ao salvar cliente')
        }
    }

    const handleEdit = (cliente) => {
        setFormData({
            id: cliente.id,
            nome: cliente.nome || '',
            cpf: cliente.cpf || '',
            rg: cliente.rg || '',
            cnpj: cliente.cnpj || '',
            data_nascimento: cliente.data_nascimento || '',
            telefone: cliente.telefone || '',
            email: cliente.email || '',
            celular: cliente.celular || '',
            endereco: cliente.endereco || '',
            complemento: cliente.complemento || '',
            observacoes: cliente.observacoes || '',
            ativo: cliente.ativo
        })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Deseja realmente excluir este cliente?')) return

        try {
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', id)

            if (error) throw error
            alert('Cliente excluído com sucesso!')
            fetchClientes()
        } catch (error) {
            console.error('Erro ao excluir cliente:', error)
            alert('Erro ao excluir cliente')
        }
    }

    const resetForm = () => {
        setFormData({
            id: null,
            nome: '',
            cpf: '',
            rg: '',
            cnpj: '',
            data_nascimento: '',
            telefone: '',
            email: '',
            celular: '',
            endereco: '',
            complemento: '',
            observacoes: '',
            ativo: true
        })
    }

    const handleNewCliente = () => {
        resetForm()
        setShowForm(true)
    }

    if (loading) {
        return (
            <div className="clientes-loading">
                <div className="spinner"></div>
                <p>Carregando clientes...</p>
            </div>
        )
    }

    if (showForm) {
        return (
            <div className="clientes">
                {/* Formulário de Cadastro */}
                <div className="clientes-form-container">
                    <div className="form-header-clientes">
                        <h2>📋 CADASTRO DE CLIENTES ℹ️</h2>
                    </div>

                    <div className="form-tabs">
                        <button
                            className={`tab ${activeTab === 'geral' ? 'active' : ''}`}
                            onClick={() => setActiveTab('geral')}
                        >
                            ❤️ Geral
                        </button>
                        <button
                            className={`tab ${activeTab === 'endereco' ? 'active' : ''}`}
                            onClick={() => setActiveTab('endereco')}
                        >
                            📍 Endereço
                        </button>
                        <button
                            className={`tab ${activeTab === 'extras' ? 'active' : ''}`}
                            onClick={() => setActiveTab('extras')}
                        >
                            📝 Extras
                        </button>
                        <button
                            className={`tab ${activeTab === 'carteira' ? 'active' : ''}`}
                            onClick={() => setActiveTab('carteira')}
                        >
                            💳 Carteira do Cliente
                        </button>
                    </div>

                    <div className="form-content">
                        {activeTab === 'geral' && (
                            <div className="tab-panel">
                                <div className="form-group">
                                    <label>Nome*</label>
                                    <input
                                        type="text"
                                        value={formData.nome}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                        placeholder="Nome completo"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>CPF</label>
                                        <input
                                            type="text"
                                            value={formData.cpf}
                                            onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                                            placeholder="000.000.000-00"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>RG</label>
                                        <input
                                            type="text"
                                            value={formData.rg}
                                            onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>CNPJ</label>
                                        <input
                                            type="text"
                                            value={formData.cnpj}
                                            onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Data Nascimento ℹ️</label>
                                        <input
                                            type="date"
                                            value={formData.data_nascimento}
                                            onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="form-subtitle">Contatos*</div>

                                <div className="contatos-grid">
                                    <div className="contato-row">
                                        <select className="tipo-contato">
                                            <option>Celular</option>
                                            <option>Telefone</option>
                                            <option>Email</option>
                                            <option>Residencial</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Número"
                                            value={formData.telefone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Outro"
                                        />
                                        <textarea placeholder="Observações" />
                                        <div className="contato-actions">
                                            <button className="btn-icon-action">❤️</button>
                                            <button className="btn-icon-action">🗑️</button>
                                        </div>
                                    </div>

                                    <div className="contato-row">
                                        <select className="tipo-contato">
                                            <option>Email</option>
                                        </select>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                        <input type="text" placeholder="Outro" />
                                        <textarea placeholder="Observações" />
                                        <div className="contato-actions">
                                            <button className="btn-icon-action">❤️</button>
                                            <button className="btn-icon-action">🗑️</button>
                                        </div>
                                    </div>

                                    <div className="contato-row">
                                        <select className="tipo-contato">
                                            <option>Residencial</option>
                                        </select>
                                        <input type="text" placeholder="Número" />
                                        <input type="text" placeholder="Complemento" />
                                        <textarea placeholder="Observações" />
                                        <div className="contato-actions">
                                            <button className="btn-icon-action">❤️</button>
                                            <button className="btn-icon-action">🗑️</button>
                                        </div>
                                    </div>
                                </div>

                                <button className="btn btn-add-contato">📞CONTATO</button>
                            </div>
                        )}

                        {activeTab === 'endereco' && (
                            <div className="tab-panel">
                                <div className="form-group">
                                    <label>Endereço</label>
                                    <input
                                        type="text"
                                        value={formData.endereco}
                                        onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                                        placeholder="Rua, Número, Bairro, Cidade, Estado, CEP"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Complemento</label>
                                    <input
                                        type="text"
                                        value={formData.complemento}
                                        onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                                        placeholder="Apartamento, Bloco, etc"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'extras' && (
                            <div className="tab-panel">
                                <div className="form-group">
                                    <label>Observações</label>
                                    <textarea
                                        rows="5"
                                        value={formData.observacoes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                                        placeholder="Informações adicionais sobre o cliente"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'carteira' && (
                            <div className="tab-panel">
                                <p className="info-message">Funcionalidade de carteira do cliente em desenvolvimento</p>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button className="btn btn-success" onClick={handleSave}>
                            <FiCheck /> SALVAR
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
                            <FiX /> NOVO CLIENTE
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="clientes">
            {/* Banner de Importação */}
            <div className="import-banner">
                <div className="import-content">
                    <h3>📥 Importação de Clientes</h3>
                    <p>
                        Envie sua lista de clientes no formato <strong>Excel</strong> para{' '}
                        <a href="mailto:importacao@simplesagenda.com.br">importacao@simplesagenda.com.br</a>{' '}
                        que faremos a primeira importação gratuitamente. A segunda importação possui uma taxa.
                    </p>
                    <a href="#" className="link-modelo">Clique aqui para baixar o modelo</a>
                </div>
            </div>

            {/* Header com Botões e Busca */}
            <div className="clientes-header">
                <div className="header-info">
                    <h2>CLIENTES ℹ️</h2>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={handleNewCliente}>
                        <FiPlus /> NOVO CLIENTE
                    </button>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Pesquisar por..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn-search">
                            <FiSearch /> BUSCAR
                        </button>
                    </div>
                    <select className="status-filter">
                        <option>Ativo</option>
                        <option>Inativo</option>
                        <option>Todos</option>
                    </select>
                    <button className="btn btn-export">
                        <FiDownload /> EXPORTAR P/ EXCEL
                    </button>
                    <div className="total-badge">
                        TOTAL: <strong>{clientesFiltrados.length} cliente(s)</strong>
                    </div>
                </div>
            </div>

            {/* Tabela de Clientes */}
            <div className="clientes-table-container">
                <table className="clientes-table">
                    <thead>
                        <tr>
                            <th>NOME DO CLIENTE</th>
                            <th>CADASTRO</th>
                            <th>DATA NASCIMENTO</th>
                            <th>BAIRRO</th>
                            <th>CIDADE</th>
                            <th>CONTATO</th>
                            <th>STATUS</th>
                            <th>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-row">
                                    Nenhum cliente encontrado
                                </td>
                            </tr>
                        ) : (
                            clientesFiltrados.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td>
                                        <strong>{cliente.nome}</strong>
                                        {cliente.cpf && <div className="badge-cpf">{cliente.cpf.slice(0, 14)}</div>}
                                    </td>
                                    <td>{new Date(cliente.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        {cliente.data_nascimento ? (
                                            <>
                                                {new Date(cliente.data_nascimento).toLocaleDateString('pt-BR')}
                                                <br />
                                                <small className="idade-text">
                                                    {Math.floor((new Date() - new Date(cliente.data_nascimento)) / (365.25 * 24 * 60 * 60 * 1000))} anos
                                                </small>
                                            </>
                                        ) : '-'}
                                    </td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>
                                        {cliente.telefone && (
                                            <div>{cliente.telefone}</div>
                                        )}
                                        {cliente.email && (
                                            <div className="email-text">{cliente.email}</div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${cliente.ativo ? 'ativo' : 'inativo'}`}>
                                            {cliente.ativo ? 'ATIVO' : 'INATIVO'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon-table" onClick={() => handleEdit(cliente)}>
                                                👤
                                            </button>
                                            <button className="btn-icon-table edit" onClick={() => handleEdit(cliente)}>
                                                <FiEdit />
                                            </button>
                                            <button className="btn-icon-table delete" onClick={() => handleDelete(cliente.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            <div className="pagination">
                <select className="items-per-page">
                    <option>10 por página</option>
                    <option>25 por página</option>
                    <option>50 por página</option>
                </select>
                <div className="pagination-controls">
                    <button className="btn-page">‹</button>
                    <span className="page-number">1</span>
                    <button className="btn-page">›</button>
                </div>
            </div>
        </div>
    )
}

export default Clientes
