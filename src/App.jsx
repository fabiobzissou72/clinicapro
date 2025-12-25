import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import Header from './components/Header/Header'
import Dashboard from './pages/Dashboard/Dashboard'
import Financeiro from './pages/Financeiro/Financeiro'
import GraficoGeral from './pages/GraficoGeral/GraficoGeral'
import GraficoFinanceiro from './pages/GraficoFinanceiro/GraficoFinanceiro'
import Agendamento from './pages/Agendamento/Agendamento'
import Caixa from './pages/Caixa/Caixa'
import './App.css'

// Placeholder pages para depois
const Clientes = () => <div className="page-placeholder">Página Clientes - Aguardando imagem</div>
const Profissional = () => <div className="page-placeholder">Página Profissional - Aguardando imagem</div>
const ProdutosServicos = () => <div className="page-placeholder">Página Produtos e Serviços - Aguardando imagem</div>
const Financeira = () => <div className="page-placeholder">Página Financeira - Aguardando imagem</div>
const Analise = () => <div className="page-placeholder">Página Análise - Aguardando imagem</div>
const Compras = () => <div className="page-placeholder">Página Compras - Aguardando imagem</div>
const CadastrosGerais = () => <div className="page-placeholder">Página Cadastros Gerais - Aguardando imagem</div>
const Consulta = () => <div className="page-placeholder">Página Consulta - Aguardando imagem</div>
const Permissoes = () => <div className="page-placeholder">Página Permissões - Aguardando imagem</div>
const Configuracoes = () => <div className="page-placeholder">Página Configurações - Aguardando imagem</div>
const Misc = () => <div className="page-placeholder">Página Misc - Aguardando imagem</div>
const Ajuda = () => <div className="page-placeholder">Página Ajuda - Aguardando imagem</div>
const Sair = () => <div className="page-placeholder">Página Sair - Aguardando imagem</div>

function App() {
    const getPageTitle = (pathname) => {
        const titles = {
            '/': 'Dashboard',
            '/financeiro': 'Financeiro',
            '/grafico-geral': 'Gráfico Geral',
            '/grafico-agenda-vendas': 'Gráfico Agenda e Vendas',
            '/grafico-financeiro': 'Gráfico do Financeiro',
            '/agendamento': 'Agendamento',
            '/caixa': 'Caixa',
            '/clientes': 'Clientes',
            '/profissional': 'Profissional',
            '/produtos-servicos': 'Produtos e Serviços',
            '/financeira': 'Financeira',
            '/analise': 'Análise',
            '/compras': 'Compras',
            '/cadastros-gerais': 'Cadastros Gerais',
            '/consulta': 'Consulta',
            '/permissoes': 'Permissões',
            '/configuracoes': 'Configurações',
            '/misc': 'Misc',
            '/ajuda': 'Ajuda',
            '/sair': 'Sair'
        }
        return titles[pathname] || 'Dashboard'
    }

    return (
        <div className="app">
            <Sidebar />
            <div className="app-content">
                <Routes>
                    <Route path="/" element={
                        <>
                            <Header title={getPageTitle('/')} />
                            <main className="main-content">
                                <Dashboard />
                            </main>
                        </>
                    } />
                    <Route path="/financeiro" element={
                        <>
                            <Header title={getPageTitle('/financeiro')} />
                            <main className="main-content">
                                <Financeiro />
                            </main>
                        </>
                    } />
                    <Route path="/grafico-geral" element={
                        <>
                            <Header title={getPageTitle('/grafico-geral')} />
                            <main className="main-content">
                                <GraficoGeral />
                            </main>
                        </>
                    } />
                    <Route path="/grafico-agenda-vendas" element={
                        <>
                            <Header title={getPageTitle('/grafico-agenda-vendas')} />
                            <main className="main-content">
                                <GraficoGeral />
                            </main>
                        </>
                    } />
                    <Route path="/grafico-financeiro" element={
                        <>
                            <Header title={getPageTitle('/grafico-financeiro')} />
                            <main className="main-content">
                                <GraficoFinanceiro />
                            </main>
                        </>
                    } />
                    <Route path="/agendamento" element={
                        <>
                            <Header title={getPageTitle('/agendamento')} />
                            <main className="main-content">
                                <Agendamento />
                            </main>
                        </>
                    } />
                    <Route path="/caixa" element={
                        <>
                            <Header title={getPageTitle('/caixa')} />
                            <main className="main-content">
                                <Caixa />
                            </main>
                        </>
                    } />
                    <Route path="/clientes" element={
                        <>
                            <Header title={getPageTitle('/clientes')} />
                            <main className="main-content">
                                <Clientes />
                            </main>
                        </>
                    } />
                    <Route path="/profissional" element={
                        <>
                            <Header title={getPageTitle('/profissional')} />
                            <main className="main-content">
                                <Profissional />
                            </main>
                        </>
                    } />
                    <Route path="/produtos-servicos" element={
                        <>
                            <Header title={getPageTitle('/produtos-servicos')} />
                            <main className="main-content">
                                <ProdutosServicos />
                            </main>
                        </>
                    } />
                    <Route path="/financeira" element={
                        <>
                            <Header title={getPageTitle('/financeira')} />
                            <main className="main-content">
                                <Financeira />
                            </main>
                        </>
                    } />
                    <Route path="/analise" element={
                        <>
                            <Header title={getPageTitle('/analise')} />
                            <main className="main-content">
                                <Analise />
                            </main>
                        </>
                    } />
                    <Route path="/compras" element={
                        <>
                            <Header title={getPageTitle('/compras')} />
                            <main className="main-content">
                                <Compras />
                            </main>
                        </>
                    } />
                    <Route path="/cadastros-gerais" element={
                        <>
                            <Header title={getPageTitle('/cadastros-gerais')} />
                            <main className="main-content">
                                <CadastrosGerais />
                            </main>
                        </>
                    } />
                    <Route path="/consulta" element={
                        <>
                            <Header title={getPageTitle('/consulta')} />
                            <main className="main-content">
                                <Consulta />
                            </main>
                        </>
                    } />
                    <Route path="/permissoes" element={
                        <>
                            <Header title={getPageTitle('/permissoes')} />
                            <main className="main-content">
                                <Permissoes />
                            </main>
                        </>
                    } />
                    <Route path="/configuracoes" element={
                        <>
                            <Header title={getPageTitle('/configuracoes')} />
                            <main className="main-content">
                                <Configuracoes />
                            </main>
                        </>
                    } />
                    <Route path="/misc" element={
                        <>
                            <Header title={getPageTitle('/misc')} />
                            <main className="main-content">
                                <Misc />
                            </main>
                        </>
                    } />
                    <Route path="/ajuda" element={
                        <>
                            <Header title={getPageTitle('/ajuda')} />
                            <main className="main-content">
                                <Ajuda />
                            </main>
                        </>
                    } />
                    <Route path="/sair" element={
                        <>
                            <Header title={getPageTitle('/sair')} />
                            <main className="main-content">
                                <Sair />
                            </main>
                        </>
                    } />
                </Routes>
            </div>
        </div>
    )
}

export default App
