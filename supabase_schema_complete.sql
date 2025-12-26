-- ========================================
-- SCHEMA COMPLETO - CLÍNICA ESTÉTICA PRO
-- Sistema integrado: Dashboard + WhatsApp + PWA Cliente
-- ========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- USERS & AUTHENTICATION
-- ========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'professional' CHECK (role IN ('admin', 'professional', 'receptionist', 'client')),
  avatar_url TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  specialty TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  actions TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PATIENTS (PACIENTES)
-- ========================================

CREATE TABLE IF NOT EXISTS public.pacientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  cpf TEXT UNIQUE,
  rg TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('M', 'F', 'Outro', 'Prefiro não informar')),
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  observations TEXT,
  medical_history TEXT,
  allergies TEXT,
  medications TEXT,
  tags TEXT[],
  profile_id UUID REFERENCES public.profiles(id),
  whatsapp_chat_id TEXT,
  preferred_contact TEXT DEFAULT 'whatsapp' CHECK (preferred_contact IN ('whatsapp', 'sms', 'email', 'phone')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ANAMNESE COM ÁUDIO E IA
-- ========================================

CREATE TABLE IF NOT EXISTS public.anamnese (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.profiles(id),
  complaint TEXT,
  previous_treatments TEXT,
  expectations TEXT,
  skin_type TEXT,
  lifestyle TEXT,
  photos JSONB,
  custom_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para áudios de prontuário
CREATE TABLE IF NOT EXISTS public.medical_audio_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.profiles(id),
  agendamento_id UUID REFERENCES public.agendamentos(id),
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes INTEGER,
  transcription TEXT,
  ai_summary TEXT,
  transcription_status TEXT DEFAULT 'pending' CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),
  summary_status TEXT DEFAULT 'pending' CHECK (summary_status IN ('pending', 'processing', 'completed', 'failed')),
  source TEXT DEFAULT 'web' CHECK (source IN ('web', 'whatsapp', 'mobile')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PROCEDURES & CATALOG
-- ========================================

CREATE TABLE IF NOT EXISTS public.procedimentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration INTEGER,
  price DECIMAL(10,2),
  cost DECIMAL(10,2),
  requires_anamnese BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  instructions TEXT,
  contraindications TEXT,
  available_for_online_booking BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.treatment_executions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES public.pacientes(id),
  professional_id UUID REFERENCES public.profiles(id),
  procedimento_id UUID REFERENCES public.procedimentos(id),
  status TEXT CHECK (status IN ('in_progress', 'completed', 'cancelled')) DEFAULT 'in_progress',
  notes TEXT,
  before_photos JSONB,
  after_photos JSONB,
  products_used JSONB,
  duration_minutes INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SCHEDULING (AGENDAMENTOS)
-- ========================================

CREATE TABLE IF NOT EXISTS public.agendamentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  procedimento_id UUID REFERENCES public.procedimentos(id),
  professional_id UUID REFERENCES public.profiles(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  confirmation_sent BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'online', 'whatsapp', 'pwa')),
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.availability_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blocked_times (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- FINANCIAL
-- ========================================

CREATE TABLE IF NOT EXISTS public.financeiro (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category TEXT,
  amount DECIMAL(10,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT,
  description TEXT,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  payment_link TEXT,
  payment_id TEXT,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  professional_id UUID REFERENCES public.profiles(id),
  agendamento_id UUID REFERENCES public.agendamentos(id),
  financeiro_id UUID REFERENCES public.financeiro(id),
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2),
  status TEXT CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INVENTORY & PRODUCTS
-- ========================================

CREATE TABLE IF NOT EXISTS public.estoque (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  unit TEXT,
  min_quantity INTEGER DEFAULT 5,
  cost_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  supplier TEXT,
  image_url TEXT,
  images JSONB,
  is_for_sale BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  estoque_id UUID REFERENCES public.estoque(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('in', 'out', 'adjustment')) NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- E-COMMERCE / VIRTUAL STORE (PWA)
-- ========================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paciente_id UUID REFERENCES public.pacientes(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT,
  payment_id TEXT,
  payment_link TEXT,
  shipping_address TEXT,
  tracking_code TEXT,
  notes TEXT,
  source TEXT DEFAULT 'pwa' CHECK (source IN ('pwa', 'whatsapp', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  estoque_id UUID REFERENCES public.estoque(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CAMPAIGNS & LOYALTY
-- ========================================

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('discount', 'points', 'gift', 'package')) NOT NULL,
  discount_percentage DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  target_audience TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE UNIQUE,
  points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_redeemed INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paciente_id UUID REFERENCES public.pacientes(id),
  points INTEGER NOT NULL,
  type TEXT CHECK (type IN ('earned', 'redeemed', 'expired')) NOT NULL,
  reason TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- WHATSAPP INTEGRATION
-- ========================================

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id TEXT UNIQUE,
  chat_id TEXT NOT NULL,
  from_number TEXT,
  to_number TEXT,
  message_type TEXT CHECK (message_type IN ('text', 'audio', 'image', 'video', 'document', 'button', 'list')),
  content TEXT,
  media_url TEXT,
  status TEXT CHECK (status IN ('sent', 'delivered', 'read', 'failed')) DEFAULT 'sent',
  direction TEXT CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
  paciente_id UUID REFERENCES public.pacientes(id),
  professional_id UUID REFERENCES public.profiles(id),
  automation_rule_id UUID REFERENCES public.automation_rules(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  session_name TEXT NOT NULL,
  qr_code TEXT,
  status TEXT CHECK (status IN ('disconnected', 'connecting', 'connected', 'error')) DEFAULT 'disconnected',
  instance_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_connected TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- AUTOMATION & WEBHOOKS
-- ========================================

CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_time_offset INTEGER,
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms', 'email', 'push')),
  message_template TEXT,
  webhook_url TEXT,
  webhook_headers JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rule_id UUID REFERENCES public.automation_rules(id),
  recipient TEXT,
  channel TEXT,
  message TEXT,
  status TEXT CHECK (status IN ('sent', 'failed', 'pending')) DEFAULT 'pending',
  error_message TEXT,
  reference_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- API INTEGRATIONS & CREDENTIALS
-- ========================================

CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'calendar', 'whatsapp', 'nfe', 'ai', 'sms', 'email')),
  provider TEXT,
  credentials JSONB,
  settings JSONB,
  is_active BOOLEAN DEFAULT FALSE,
  last_sync TIMESTAMP WITH TIME ZONE,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('openai', 'claude', 'elevenlabs', 'mercadopago', 'asaas', 'nfe', 'google', 'evolution_api')),
  api_key TEXT NOT NULL,
  api_secret TEXT,
  additional_config JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TELEMEDICINE
-- ========================================

CREATE TABLE IF NOT EXISTS public.telemedicine_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agendamento_id UUID REFERENCES public.agendamentos(id),
  paciente_id UUID REFERENCES public.pacientes(id),
  professional_id UUID REFERENCES public.profiles(id),
  room_id TEXT UNIQUE NOT NULL,
  access_token_patient TEXT,
  access_token_professional TEXT,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- DOCUMENTS & FILES
-- ========================================

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- NOTIFICATIONS (PWA)
-- ========================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  paciente_id UUID REFERENCES public.pacientes(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('appointment', 'payment', 'promotion', 'system', 'reminder')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  paciente_id UUID REFERENCES public.pacientes(id),
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- AUDIT & LOGS (LGPD)
-- ========================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- REPORTS
-- ========================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  filters JSONB,
  generated_by UUID REFERENCES public.profiles(id),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_pacientes_cpf ON public.pacientes(cpf);
CREATE INDEX idx_pacientes_phone ON public.pacientes(phone);
CREATE INDEX idx_pacientes_whatsapp ON public.pacientes(whatsapp_number);
CREATE INDEX idx_pacientes_email ON public.pacientes(email);
CREATE INDEX idx_agendamentos_start_time ON public.agendamentos(start_time);
CREATE INDEX idx_agendamentos_professional ON public.agendamentos(professional_id);
CREATE INDEX idx_agendamentos_paciente ON public.agendamentos(paciente_id);
CREATE INDEX idx_agendamentos_status ON public.agendamentos(status);
CREATE INDEX idx_financeiro_date ON public.financeiro(date);
CREATE INDEX idx_financeiro_status ON public.financeiro(status);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at);
CREATE INDEX idx_whatsapp_messages_chat_id ON public.whatsapp_messages(chat_id);
CREATE INDEX idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at);
CREATE INDEX idx_medical_audio_status ON public.medical_audio_records(transcription_status);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_paciente ON public.notifications(paciente_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnese ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_audio_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Authenticated users full access" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON public.pacientes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON public.agendamentos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON public.financeiro FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON public.procedimentos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON public.estoque FOR ALL USING (auth.role() = 'authenticated');

-- Public access for PWA
CREATE POLICY "Public can view active products" ON public.estoque FOR SELECT USING (is_for_sale = TRUE AND active = TRUE);
CREATE POLICY "Public can view active procedures" ON public.procedimentos FOR SELECT USING (active = TRUE AND available_for_online_booking = TRUE);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_procedimentos_updated_at BEFORE UPDATE ON public.procedimentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financeiro_updated_at BEFORE UPDATE ON public.financeiro FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estoque_updated_at BEFORE UPDATE ON public.estoque FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_audio_updated_at BEFORE UPDATE ON public.medical_audio_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.orders
    SET total_amount = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM public.order_items
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_total
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION calculate_order_total();
