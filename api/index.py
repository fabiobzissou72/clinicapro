"""
Vercel Serverless Entry Point
"""
import os

# Debug: verificar se env vars estão disponíveis
SUPABASE_URL = os.getenv("SUPABASE_URL", "NOT_SET")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "NOT_SET")

print(f"[DEBUG] SUPABASE_URL: {SUPABASE_URL[:30]}..." if SUPABASE_URL != "NOT_SET" else "[DEBUG] SUPABASE_URL: NOT_SET")
print(f"[DEBUG] SUPABASE_KEY: {SUPABASE_KEY[:20]}..." if SUPABASE_KEY != "NOT_SET" else "[DEBUG] SUPABASE_KEY: NOT_SET")

from app.main import app

# Vercel expects a variable named 'app'
handler = app
