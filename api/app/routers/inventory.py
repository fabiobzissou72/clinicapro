from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.core.supabase import supabase_admin

router = APIRouter()

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: int = 0
    sale_price: Optional[float] = None
    is_for_sale: bool = False

@router.get("/")
async def list_products(for_sale_only: bool = False):
    query = supabase_admin.table("estoque").select("*")
    if for_sale_only:
        query = query.eq("is_for_sale", True).eq("active", True)
    result = query.order("name").execute()
    return {"success": True, "products": result.data}

@router.post("/")
async def create_product(product: ProductCreate):
    result = supabase_admin.table("estoque").insert(product.dict()).execute()
    return {"success": True, "product": result.data[0]}

@router.get("/low-stock")
async def get_low_stock():
    result = supabase_admin.table("estoque")\
        .select("*")\
        .filter("quantity", "lte", "min_quantity")\
        .execute()
    return {"success": True, "products": result.data}
