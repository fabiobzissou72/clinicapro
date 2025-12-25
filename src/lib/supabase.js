import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utilitários para API (preparado para n8n)
export const apiConfig = {
    baseUrl: supabaseUrl,
    headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
}

// Funções helper para integração com n8n
export const n8nHelpers = {
    // Endpoint para webhook do n8n
    webhookUrl: '', // Será configurado posteriormente

    // Enviar dados para n8n
    async sendToN8n(eventType, data) {
        if (!this.webhookUrl) {
            console.warn('N8N webhook URL not configured')
            return null
        }

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventType,
                    timestamp: new Date().toISOString(),
                    data: data
                })
            })

            return await response.json()
        } catch (error) {
            console.error('Error sending to n8n:', error)
            return null
        }
    },

    // Configurar webhook URL
    setWebhookUrl(url) {
        this.webhookUrl = url
    }
}

// Configuração para acesso direto à API do Supabase (para n8n)
export const getDirectApiEndpoint = (table) => {
    return `${supabaseUrl}/rest/v1/${table}`
}
