from fastapi import APIRouter
from datetime import datetime, timedelta
from app.core.supabase import supabase_admin

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    """
    Retorna estatísticas principais para o dashboard
    """
    today = datetime.now().date()
    month_start = today.replace(day=1)

    # Agendamentos hoje
    appointments_today = supabase_admin.table("agendamentos")\
        .select("*", count="exact")\
        .gte("start_time", f"{today}T00:00:00")\
        .lte("start_time", f"{today}T23:59:59")\
        .neq("status", "cancelled")\
        .execute()

    # Faturamento do mês
    revenue_month = supabase_admin.table("financeiro")\
        .select("amount")\
        .eq("type", "income")\
        .eq("status", "paid")\
        .gte("date", str(month_start))\
        .execute()

    total_revenue = sum([r["amount"] for r in revenue_month.data])

    # Novos pacientes do mês
    new_patients = supabase_admin.table("pacientes")\
        .select("*", count="exact")\
        .gte("created_at", f"{month_start}T00:00:00")\
        .execute()

    # Próximos agendamentos
    upcoming = supabase_admin.table("agendamentos")\
        .select("*, pacientes(*), procedimentos(*)")\
        .gte("start_time", datetime.now().isoformat())\
        .order("start_time")\
        .limit(5)\
        .execute()

    return {
        "success": True,
        "stats": {
            "appointments_today": appointments_today.count,
            "revenue_month": total_revenue,
            "new_patients_month": new_patients.count,
            "upcoming_appointments": upcoming.data
        }
    }

@router.get("/revenue-chart")
async def get_revenue_chart(months: int = 6):
    """
    Dados para gráfico de faturamento
    """
    today = datetime.now().date()
    start_date = today - timedelta(days=months * 30)

    revenue = supabase_admin.table("financeiro")\
        .select("date, amount")\
        .eq("type", "income")\
        .eq("status", "paid")\
        .gte("date", str(start_date))\
        .order("date")\
        .execute()

    # Agrupar por mês
    monthly_data = {}
    for r in revenue.data:
        month = r["date"][:7]  # YYYY-MM
        monthly_data[month] = monthly_data.get(month, 0) + r["amount"]

    chart_data = [{"month": k, "value": v} for k, v in monthly_data.items()]

    return {"success": True, "data": chart_data}

@router.get("/top-procedures")
async def get_top_procedures(limit: int = 5):
    """
    Procedimentos mais populares
    """
    # Contar agendamentos por procedimento
    appointments = supabase_admin.table("agendamentos")\
        .select("procedimento_id, procedimentos(name)")\
        .neq("status", "cancelled")\
        .execute()

    procedure_count = {}
    for a in appointments.data:
        pid = a["procedimento_id"]
        name = a["procedimentos"]["name"]
        procedure_count[name] = procedure_count.get(name, 0) + 1

    sorted_procedures = sorted(procedure_count.items(), key=lambda x: x[1], reverse=True)[:limit]

    data = [{"name": name, "count": count} for name, count in sorted_procedures]

    return {"success": True, "data": data}
