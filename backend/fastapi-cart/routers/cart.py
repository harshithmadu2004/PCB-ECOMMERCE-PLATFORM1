import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from auth import get_current_user
from database import get_cart_collection, get_logs_collection, IN_MEMORY_CARTS, IN_MEMORY_LOGS

router = APIRouter(prefix="/cart", tags=["Cart Microservice"])

class PCBSpecs(BaseModel):
    layers: int = Field(default=2, ge=1, le=32)
    thickness: str = Field(default="1.6mm")
    copper_weight: str = Field(default="1oz")
    surface_finish: str = Field(default="HASL with lead")
    solder_mask_color: str = Field(default="Green")
    silkscreen_color: str = Field(default="White")

class CartItemCreate(BaseModel):
    product_id: int
    product_name: str
    quantity: int = Field(default=1, ge=1)
    unit_price: float
    specs: Optional[PCBSpecs] = Field(default_factory=PCBSpecs)

class CartItemUpdate(BaseModel):
    quantity: Optional[int] = Field(default=None, ge=1)
    specs: Optional[PCBSpecs] = None

@router.get("/")
async def get_cart(user: dict = Depends(get_current_user)):
    user_id = user["user_id"]
    collection = await get_cart_collection()
    
    if collection is not None:
        cart_doc = await collection.find_one({"user_id": user_id})
        if not cart_doc:
            return {"user_id": user_id, "items": [], "total_price": 0.0, "updated_at": datetime.utcnow().isoformat()}
        cart_doc["_id"] = str(cart_doc["_id"])
        return cart_doc
    else:
        cart = IN_MEMORY_CARTS.get(user_id, {"user_id": user_id, "items": [], "total_price": 0.0, "updated_at": datetime.utcnow().isoformat()})
        return cart

@router.post("/items")
async def add_item_to_cart(item: CartItemCreate, user: dict = Depends(get_current_user)):
    user_id = user["user_id"]
    collection = await get_cart_collection()
    logs_collection = await get_logs_collection()

    item_dict = item.dict()
    item_dict["item_id"] = str(uuid.uuid4())
    item_dict["subtotal"] = round(item.unit_price * item.quantity, 2)

    log_entry = {
        "user_id": user_id,
        "username": user["username"],
        "action": "ADD_TO_CART",
        "product_name": item.product_name,
        "timestamp": datetime.utcnow().isoformat()
    }

    if collection is not None:
        cart_doc = await collection.find_one({"user_id": user_id})
        if not cart_doc:
            items = [item_dict]
            total_price = item_dict["subtotal"]
            new_cart = {
                "user_id": user_id,
                "items": items,
                "total_price": round(total_price, 2),
                "updated_at": datetime.utcnow().isoformat()
            }
            await collection.insert_one(new_cart)
        else:
            items = cart_doc.get("items", [])
            items.append(item_dict)
            total_price = sum(i["subtotal"] for i in items)
            await collection.update_one(
                {"user_id": user_id},
                {"$set": {"items": items, "total_price": round(total_price, 2), "updated_at": datetime.utcnow().isoformat()}}
            )
        if logs_collection is not None:
            await logs_collection.insert_one(log_entry)
    else:
        cart = IN_MEMORY_CARTS.get(user_id, {"user_id": user_id, "items": [], "total_price": 0.0})
        cart["items"].append(item_dict)
        cart["total_price"] = round(sum(i["subtotal"] for i in cart["items"]), 2)
        cart["updated_at"] = datetime.utcnow().isoformat()
        IN_MEMORY_CARTS[user_id] = cart
        IN_MEMORY_LOGS.append(log_entry)

    return {"message": "Item added to cart successfully", "item_id": item_dict["item_id"]}

@router.put("/items/{item_id}")
async def update_cart_item(item_id: str, update: CartItemUpdate, user: dict = Depends(get_current_user)):
    user_id = user["user_id"]
    collection = await get_cart_collection()

    if collection is not None:
        cart_doc = await collection.find_one({"user_id": user_id})
        if not cart_doc:
            raise HTTPException(status_code=404, detail="Cart not found")
        items = cart_doc.get("items", [])
        found = False
        for item in items:
            if item.get("item_id") == item_id:
                found = True
                if update.quantity is not None:
                    item["quantity"] = update.quantity
                    item["subtotal"] = round(item["unit_price"] * update.quantity, 2)
                if update.specs is not None:
                    item["specs"] = update.specs.dict()
                break
        if not found:
            raise HTTPException(status_code=404, detail="Item not found in cart")
        total_price = sum(i["subtotal"] for i in items)
        await collection.update_one(
            {"user_id": user_id},
            {"$set": {"items": items, "total_price": round(total_price, 2), "updated_at": datetime.utcnow().isoformat()}}
        )
    else:
        cart = IN_MEMORY_CARTS.get(user_id)
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        found = False
        for item in cart["items"]:
            if item.get("item_id") == item_id:
                found = True
                if update.quantity is not None:
                    item["quantity"] = update.quantity
                    item["subtotal"] = round(item["unit_price"] * update.quantity, 2)
                if update.specs is not None:
                    item["specs"] = update.specs.dict()
                break
        if not found:
            raise HTTPException(status_code=404, detail="Item not found in cart")
        cart["total_price"] = round(sum(i["subtotal"] for i in cart["items"]), 2)

    return {"message": "Cart item updated successfully"}

@router.delete("/items/{item_id}")
async def remove_cart_item(item_id: str, user: dict = Depends(get_current_user)):
    user_id = user["user_id"]
    collection = await get_cart_collection()

    if collection is not None:
        cart_doc = await collection.find_one({"user_id": user_id})
        if not cart_doc:
            raise HTTPException(status_code=404, detail="Cart not found")
        items = [i for i in cart_doc.get("items", []) if i.get("item_id") != item_id]
        total_price = sum(i["subtotal"] for i in items)
        await collection.update_one(
            {"user_id": user_id},
            {"$set": {"items": items, "total_price": round(total_price, 2), "updated_at": datetime.utcnow().isoformat()}}
        )
    else:
        cart = IN_MEMORY_CARTS.get(user_id)
        if cart:
            cart["items"] = [i for i in cart["items"] if i.get("item_id") != item_id]
            cart["total_price"] = round(sum(i["subtotal"] for i in cart["items"]), 2)

    return {"message": "Item removed from cart"}

@router.delete("/")
async def clear_cart(user: dict = Depends(get_current_user)):
    user_id = user["user_id"]
    collection = await get_cart_collection()

    if collection is not None:
        await collection.delete_one({"user_id": user_id})
    else:
        if user_id in IN_MEMORY_CARTS:
            del IN_MEMORY_CARTS[user_id]

    return {"message": "Cart cleared successfully"}
