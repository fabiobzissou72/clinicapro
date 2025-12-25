-- =============================================
-- FBZ SISTEMAS IA - DASHBOARD DATABASE SCHEMA
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA DE CLIENTES
-- =============================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  celular VARCHAR(20),
  cpf VARCHAR(14),
  data_nascimento DATE,
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- TABELA DE SERVIÇOS/PRODUTOS
-- =============================================
CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) CHECK (tipo IN ('servico', 'produto')) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL DEFAULT 0,
  duracao_minutos INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- TABELA DE PROFISSIONAIS
-- =============================================
CREATE TABLE IF NOT EXISTS profissionais (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  especialidade VARCHAR(255),
  cor_agenda VARCHAR(7) DEFAULT '#3B82F6',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- TABELA DE AGENDAMENTOS
-- =============================================
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_minutos INTEGER DEFAULT 60,
  valor DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) CHECK (status IN ('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado')) DEFAULT 'agendado',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- TABELA DE VENDAS
-- =============================================
CREATE TABLE IF NOT EXISTS vendas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  valor_pago DECIMAL(10, 2) DEFAULT 0,
  forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN ('dinheiro', 'debito', 'credito', 'pix', 'transferencia', 'outro')),
  status VARCHAR(50) CHECK (status IN ('pendente', 'pago', 'parcial', 'cancelado')) DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- TABELA DE ITENS DE VENDA
-- =============================================
CREATE TABLE IF NOT EXISTS vendas_itens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
  quantidade INTEGER DEFAULT 1,
  preco_unitario DECIMAL(10, 2) NOT NULL,
  desconto DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- TABELA DE CAIXA
-- =============================================
CREATE TABLE IF NOT EXISTS caixa (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tipo VARCHAR(50) CHECK (tipo IN ('entrada', 'saida')) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  venda_id UUID REFERENCES vendas(id) ON DELETE SET NULL,
  data_movimento TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- INDEXES PARA PERFORMANCE
-- =============================================
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_data_nascimento ON clientes(data_nascimento);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_vendas_data ON vendas(data_venda);
CREATE INDEX idx_vendas_status ON vendas(status);
CREATE INDEX idx_caixa_data ON caixa(data_movimento);
CREATE INDEX idx_caixa_tipo ON caixa(tipo);

-- =============================================
-- FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGERS PARA ATUALIZAR updated_at
-- =============================================
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profissionais_updated_at BEFORE UPDATE ON profissionais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- POLÍTICAS RLS (Row Level Security)
-- =============================================
-- Habilitar RLS nas tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para começar (ajustar conforme necessário)
CREATE POLICY "Permitir todas operações em clientes" ON clientes FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em servicos" ON servicos FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em profissionais" ON profissionais FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em agendamentos" ON agendamentos FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em vendas" ON vendas FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em vendas_itens" ON vendas_itens FOR ALL USING (true);
CREATE POLICY "Permitir todas operações em caixa" ON caixa FOR ALL USING (true);

-- =============================================
-- DADOS DE EXEMPLO
-- =============================================
-- Inserir alguns clientes de exemplo
INSERT INTO clientes (nome, email, telefone, data_nascimento) VALUES
('João Silva', 'joao@email.com', '(11) 98888-8888', '1990-01-15'),
('Maria Santos', 'maria@email.com', '(11) 97777-7777', '1985-03-20'),
('Pedro Oliveira', 'pedro@email.com', '(11) 96666-6666', '1992-07-12'),
('Ana Costa', 'ana@email.com', '(11) 95555-5555', '1988-12-25');

-- Inserir alguns serviços de exemplo
INSERT INTO servicos (nome, tipo, preco, duracao_minutos) VALUES
('Corte de Cabelo', 'servico', 50.00, 30),
('Manicure', 'servico', 35.00, 45),
('Massagem', 'servico', 80.00, 60),
('Shampoo Premium', 'produto', 45.00, 0);

-- Inserir alguns profissionais de exemplo
INSERT INTO profissionais (nome, especialidade, cor_agenda) VALUES
('Carlos Barbeiro', 'Cabelo e Barba', '#EF4444'),
('Juliana Manicure', 'Unhas', '#10B981'),
('Roberto Massagista', 'Massoterapia', '#3B82F6');

-- =============================================
-- VIEWS ÚTEIS PARA O DASHBOARD
-- =============================================

-- View para aniversariantes de hoje
CREATE OR REPLACE VIEW aniversariantes_hoje AS
SELECT 
  id, 
  nome, 
  telefone,
  data_nascimento,
  EXTRACT(YEAR FROM AGE(data_nascimento)) as idade
FROM clientes
WHERE EXTRACT(MONTH FROM data_nascimento) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(DAY FROM data_nascimento) = EXTRACT(DAY FROM CURRENT_DATE)
  AND ativo = true
ORDER BY nome;

-- View para saldo em aberto
CREATE OR REPLACE VIEW saldo_aberto AS
SELECT 
  COALESCE(SUM(valor_total - valor_pago), 0) as saldo_em_aberto,
  COALESCE(SUM(valor_pago), 0) as balanc_parcial
FROM vendas
WHERE status IN ('pendente', 'parcial');

-- View para vendas do mês atual
CREATE OR REPLACE VIEW vendas_mes_atual AS
SELECT 
  COUNT(*) as total_vendas,
  COALESCE(SUM(valor_total), 0) as total_geral
FROM vendas
WHERE EXTRACT(MONTH FROM data_venda) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM data_venda) = EXTRACT(YEAR FROM CURRENT_DATE);

-- View para total de cadastros
CREATE OR REPLACE VIEW total_cadastros AS
SELECT 
  (SELECT COUNT(*) FROM clientes WHERE ativo = true) as total_clientes,
  (SELECT COUNT(*) FROM agendamentos WHERE status != 'cancelado') as total_agendamentos,
  (SELECT COUNT(*) FROM servicos WHERE ativo = true) as total_servicos,
  (SELECT COUNT(*) FROM profissionais WHERE ativo = true) as total_profissionais;

-- =============================================
-- FIM DO SCHEMA
-- =============================================
