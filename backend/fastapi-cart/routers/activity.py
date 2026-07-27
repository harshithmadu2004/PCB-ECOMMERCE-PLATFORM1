from typing import List
from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user
from database import get_logs_collection, IN_MEMORY_LOGS

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])

@router.get("/")
async def get_activity_logs(user: dict = Depends(get_current_user)):
    # Restrict activity logs to admin/staff if desired, or return user's own logs
    logs_collection = await get_logs_collection()
    
    if logs_collection is not None:
        if user["role"] in ["admin", "staff"]:
            cursor = logs_collection.find().sort("timestamp", -1).limit(50)
        else:
            cursor = logs_collection.find({"user_id": user["user_id"]}).sort("timestamp", -1).limit(20)
        
        logs = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            logs.append(doc)
        return logs
    else:
        if user["role"] in ["admin", "staff"]:
            return IN_MEMORY_LOGS[-50:]
        return [l for l in IN_MEMORY_LOGS if l.get("user_id") == user["user_id"]][-20:]
