from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.core.supabase import supabase_admin

router = APIRouter()

class OrderItem(BaseModel):
    estoque_id: str
    quantity: int
    unit_price: float

class OrderCreate(BaseModel):
    paciente_id: str
    items: List[OrderItem]
    shipping_address: Optional[str] = None
    source: str = "pwa"

@router.post("/")
async def create_order(order: OrderCreate):
    # Criar order
    order_result = supabase_admin.table("orders").insert({
        "paciente_id": order.paciente_id,
        "total_amount": 0,
        "shipping_address": order.shipping_address,
        "source": order.source,
        "status": "pending"
    }).execute()

    order_id = order_result.data[0]["id"]

    # Criar itens
    for item in order.items:
        supabase_admin.table("order_items").insert({
            "order_id": order_id,
            "estoque_id": item.estoque_id,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": item.quantity * item.unit_price
        }).execute()

        # Atualizar estoque
        product = supabase_admin.table("estoque").select("quantity").eq("id", item.estoque_id).single().execute()
        new_qty = product.data["quantity"] - item.quantity
        supabase_admin.table("estoque").update({"quantity": new_qty}).eq("id", item.estoque_id).execute()

    return {"success": True, "order_id": order_id}

@router.get("/{order_id}")
async def get_order(order_id: str):
    order = supabase_admin.table("orders")\
        .select("*, pacientes(*), order_items(*, estoque(*))")\
        .eq("id", order_id)\
        .single()\
        .execute()
    return {"success": True, "order": order.data}

@router.get("/patient/{paciente_id}")
async def get_patient_orders(paciente_id: str):
    orders = supabase_admin.table("orders")\
        .select("*, order_items(*, estoque(*))")\
        .eq("paciente_id", paciente_id)\
        .order("created_at", desc=True)\
        .execute()
    return {"success": True, "orders": orders.data}
