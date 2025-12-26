"""
Vercel Serverless Entry Point
"""
from app.main import app

# Vercel expects a variable named 'app'
handler = app
