from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from app.routers import (
    auth,
    patients,
    appointments,
    procedures,
    financial,
    inventory,
    whatsapp,
    ai,
    telemedicine,
    orders,
    automation,
    integrations,
    dashboard
)

load_dotenv()

app = FastAPI(
    title="Clínica Estética Pro API",
    description="API completa para gestão de clínica estética com IA, WhatsApp e PWA",
    version="1.0.0"
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(procedures.router, prefix="/api/procedures", tags=["Procedures"])
app.include_router(financial.router, prefix="/api/financial", tags=["Financial"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["WhatsApp"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Services"])
app.include_router(telemedicine.router, prefix="/api/telemedicine", tags=["Telemedicine"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(automation.router, prefix="/api/automation", tags=["Automation"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["Integrations"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

# Static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {
        "message": "Clínica Estética Pro API",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
