import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FiSearch, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi'
import './Profissional.css'

const Profissional = () => {
    const [profissionais, setProfissionais] = useState([])
    const [profissionaisFiltrados, setProfissionaisFiltrados] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({
        id: null,
        nome: '',
        email: '',
        senha: '',
        ordem_agenda: 0,
        grupo_acesso: 'Selecione...',
        cor_agenda: '#3B82F6',
        receber_agendamento: true,
        ver_todos_agendamentos: false,
        receber_email_agendamento: false,
        permitir_alterar_classes: false,
        ativo: true
    })

    useEffect(() => {
        fetchProfissionais()
    }, [])

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setProfissionaisFiltrados(profissionais)
        } else {
            const filtered = profissionais.filter(prof =>
                prof.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prof.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setProfissionaisFiltrados(filtered)
        }
    }, [searchTerm, profissionais])

    const fetchProfissionais = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profissionais')
                .select('*')
                .order('ordem_agenda')

            if (error) throw error
            setProfissionais(data || [])
            setProfissionaisFiltrados(data || [])
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error)
            alert('Erro ao buscar profissionais')
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

            if (!formData.email || !formData.email.trim()) {
                alert('E-mail é obrigatório')
                return
            }

            if (formData.id) {
                // Atualizar
                const { error } = await supabase
                    .from('profissionais')
                    .update({
                        nome: formData.nome,
                        email: formData.email,
                        ordem_agenda: formData.ordem_agenda,
                        cor_agenda: formData.cor_agenda,
                        receber_agendamento: formData.receber_agendamento,
                        ver_todos_agendamentos: formData.ver_todos_agendamentos,
                        receber_email_agendamento: formData.receber_email_agendamento,
                        permitir_alterar_classes: formData.permitir_alterar_classes,
                        ativo: formData.ativo
                    })
                    .eq('id', formData.id)

                if (error) throw error
                alert('Profissional atualizado com sucesso!')
            } else {
                // Criar novo
                const { error } = await supabase
                    .from('profissionais')
                    .insert([{
                        nome: formData.nome,
                        email: formData.email,
                        ordem_agenda: formData.ordem_agenda,
                        cor_agenda: formData.cor_agenda,
                        receber_agendamento: formData.receber_agendamento,
                        ver_todos_agendamentos: formData.ver_todos_agendamentos,
                        receber_email_agendamento: formData.receber_email_agendamento,
                        permitir_alterar_classes: formData.permitir_alterar_classes,
                        ativo: true
                    }])

                if (error) throw error
                alert('Profissional cadastrado com sucesso!')
            }

            resetForm()
            fetchProfissionais()
            setShowForm(false)
        } catch (error) {
            console.error('Erro ao salvar profissional:', error)
            alert('Erro ao salvar profissional')
        }
    }

    const handleEdit = (prof) => {
        setFormData({
            id: prof.id,
            nome: prof.nome || '',
            email: prof.email || '',
            senha: '',
            ordem_agenda: prof.ordem_agenda || 0,
            grupo_acesso: 'Administrador',
            cor_agenda: prof.cor_agenda || '#3B82F6',
            receber_agendamento: prof.receber_agendamento ?? true,
            ver_todos_agendamentos: prof.ver_todos_agendamentos ?? false,
            receber_email_agendamento: prof.receber_email_agendamento ?? false,
            permitir_alterar_classes: prof.permitir_alterar_classes ?? false,
            ativo: prof.ativo ?? true
        })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Deseja realmente excluir este profissional?')) return

        try {
            const { error } = await supabase
                .from('profissionais')
                .delete()
                .eq('id', id)

            if (error) throw error
            alert('Profissional excluído com sucesso!')
            fetchProfissionais()
        } catch (error) {
            console.error('Erro ao excluir profissional:', error)
            alert('Erro ao excluir profissional')
        }
    }

    const resetForm = () => {
        setFormData({
            id: null,
            nome: '',
            email: '',
            senha: '',
            ordem_agenda: 0,
            grupo_acesso: 'Selecione...',
            cor_agenda: '#3B82F6',
            receber_agendamento: true,
            ver_todos_agendamentos: false,
            receber_email_agendamento: false,
            permitir_alterar_classes: false,
            ativo: true
        })
    }

    const handleNewProfissional = () => {
        resetForm()
        setShowForm(true)
    }

    if (loading) {
        return (
            <div className="profissional-loading">
                <div className="spinner"></div>
                <p>Carregando profissionais...</p>
            </div>
        )
    }

    if (showForm) {
        return (
            <div className="profissional">
                <div className="profissional-form-container">
                    <div className="form-header-prof">
                        <h2>📋 CADASTRO DO PROFISSIONAL ℹ️</h2>
                    </div>

                    <div className="form-content-prof">
                        <div className="form-tabs-prof">
                            <button className="tab-prof active">
                                ❤️ Geral
                            </button>
                        </div>

                        <div className="form-body-prof">
                            <div className="photo-section">
                                <div className="photo-placeholder">
                                    <span>no image</span>
                                </div>
                                <button className="btn btn-add-photo">+ ADICIONAR</button>
                            </div>

                            <div className="fields-section">
                                <div className="form-row-prof">
                                    <div className="form-group-prof">
                                        <label>Nome do Profissional*</label>
                                        <input
                                            type="text"
                                            value={formData.nome}
                                            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                            placeholder="Nome completo"
                                        />
                                    </div>
                                    <div className="form-group-prof">
                                        <label>Ordem na Agenda</label>
                                        <input
                                            type="number"
                                            value={formData.ordem_agenda}
                                            onChange={(e) => setFormData(prev => ({ ...prev, ordem_agenda: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                </div>

                                <div className="form-row-prof">
                                    <div className="form-group-prof">
                                        <label>E-mail</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>
                                    <div className="form-group-prof">
                                        <label>Senha</label>
                                        <input
                                            type="password"
                                            value={formData.senha}
                                            onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                                            placeholder="******"
                                        />
                                    </div>
                                </div>

                                <div className="form-group-prof">
                                    <label>Grupo de Acesso ℹ️</label>
                                    <select
                                        value={formData.grupo_acesso}
                                        onChange={(e) => setFormData(prev => ({ ...prev, grupo_acesso: e.target.value }))}
                                    >
                                        <option>Selecione...</option>
                                        <option>Administrador</option>
                                        <option>Profissional</option>
                                        <option>Recepcionista</option>
                                    </select>
                                </div>

                                <div className="options-grid">
                                    <div className="option-item">
                                        <label>Receber Agendamento? ℹ️</label>
                                        <div className="toggle-buttons">
                                            <button
                                                className={`toggle-btn ${formData.receber_agendamento ? 'active' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, receber_agendamento: true }))}
                                            >
                                                SIM
                                            </button>
                                            <button
                                                className={`toggle-btn ${!formData.receber_agendamento ? 'active' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, receber_agendamento: false }))}
                                            >
                                                NÃO
                                            </button>
                                        </div>
                                    </div>

                                    <div className="option-item">
                                        <label>Ver todos Agendamentos? ℹ️</label>
                                        <div className="toggle-buttons">
                                            <button
                                                className={`toggle-btn ${formData.ver_todos_agendamentos ? 'active' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, ver_todos_agendamentos: true }))}
                                            >
                                                SIM
                                            </button>
                                            <button
                                                className={`toggle-btn ${!formData.ver_todos_agendamentos ? 'active' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, ver_todos_agendamentos: false }))}
                                            >
                                                NÃO
                                            </button>
                                        </div>
                                    </div>

                                    <div className="option-item">
                                        <label>Receber E-mail ao Agendamento? ℹ️</label>
                                        <div className="toggle-buttons">
                                            <button
                                                className={`toggle-btn ${formData.receber_email_agendamento ? 'active' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, receber_email_agendamento: true }))}
                                            >
                                                SIM
                                            </button>
                                            <button
                                                className={`toggle-btn ${!formData.receber_email_agendamento ? 'active' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, receber_email_agendamento: false }))}
                                            >
                                                NÃO
                                            </button>
                                        </div>
                                    </div>

                                    <div className="option-item">
                                        <label>Permite alterar entre as Clases? ℹ️</label>
                                        <div className="toggle-buttons">
                                            <button
                                                className={`toggle-btn ${formData.permitir_alterar_classes ? 'active' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, permitir_alterar_classes: true }))}
                                            >
                                                SIM
                                            </button>
                                            <button
                                                className={`toggle-btn ${!formData.permitir_alterar_classes ? 'active' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, permitir_alterar_classes: false }))}
                                            >
                                                NÃO
                                            </button>
                                        </div>
                                    </div>

                                    <div className="option-item">
                                        <label>Último Acesso</label>
                                        <input type="text" value="-" readOnly />
                                    </div>
                                </div>

                                <div className="status-section">
                                    <label>Status</label>
                                    <div className="toggle-buttons large">
                                        <button
                                            className={`toggle-btn ${formData.ativo ? 'active success' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, ativo: true }))}
                                        >
                                            ATIVO
                                        </button>
                                        <button
                                            className={`toggle-btn ${!formData.ativo ? 'active danger' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, ativo: false }))}
                                        >
                                            INATIVO
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions-prof">
                        <button className="btn btn-success-prof" onClick={handleSave}>
                            ✓ SALVAR
                        </button>
                        <button className="btn btn-secondary-prof" onClick={() => setShowForm(false)}>
                            + NOVO
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="profissional">
            {/* Header */}
            <div className="profissional-header">
                <h2>PROFISSIONAL</h2>
                <div className="header-actions-prof">
                    <button className="btn btn-primary-prof" onClick={handleNewProfissional}>
                        <FiPlus /> NOVO PROFISSIONAL
                    </button>
                    <div className="search-box-prof">
                        <input
                            type="text"
                            placeholder="Pesquisar por..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn-search-prof">
                            <FiSearch /> PESQUISAR
                        </button>
                    </div>
                    <select className="status-filter-prof">
                        <option>Ativo</option>
                        <option>Inativo</option>
                        <option>Todos</option>
                    </select>
                    <div className="total-badge-prof">
                        TOTAL: <strong>{profissionaisFiltrados.length} profissional(is)</strong>
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="profissional-table-container">
                <table className="profissional-table">
                    <thead>
                        <tr>
                            <th>NOME</th>
                            <th>E-MAIL</th>
                            <th>GRUPOS DE ACESSO</th>
                            <th>ÚLTIMO ACESSO</th>
                            <th>COR</th>
                            <th>ORDEM</th>
                            <th>STATUS</th>
                            <th>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profissionaisFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-row-prof">
                                    Nenhum profissional encontrado
                                </td>
                            </tr>
                        ) : (
                            profissionaisFiltrados.map((prof) => (
                                <tr key={prof.id}>
                                    <td><strong>{prof.nome}</strong></td>
                                    <td>{prof.email}</td>
                                    <td>Administrador</td>
                                    <td>
                                        {prof.ultimo_acesso ?
                                            new Date(prof.ultimo_acesso).toLocaleString('pt-BR') :
                                            '-'
                                        }
                                    </td>
                                    <td>
                                        <div
                                            className="color-indicator"
                                            style={{ backgroundColor: prof.cor_agenda || '#3B82F6' }}
                                        ></div>
                                    </td>
                                    <td>{prof.ordem_agenda || 0}</td>
                                    <td>
                                        <span className={`status-badge-prof ${prof.ativo ? 'ativo' : 'inativo'}`}>
                                            {prof.ativo ? 'ATIVO' : 'INATIVO'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons-prof">
                                            <button className="btn-icon-prof edit" onClick={() => handleEdit(prof)}>
                                                <FiEdit />
                                            </button>
                                            <button className="btn-icon-prof delete" onClick={() => handleDelete(prof.id)}>
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
            <div className="pagination-prof">
                <select className="items-per-page-prof">
                    <option>10 por página</option>
                    <option>25 por página</option>
                    <option>50 por página</option>
                </select>
                <div className="pagination-controls-prof">
                    <button className="btn-page-prof">‹</button>
                    <span className="page-number-prof">1</span>
                    <button className="btn-page-prof">›</button>
                </div>
            </div>
        </div>
    )
}

export default Profissional
