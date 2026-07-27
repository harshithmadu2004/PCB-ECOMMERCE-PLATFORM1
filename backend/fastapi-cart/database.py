import logging
from config import settings

logger = logging.getLogger("fastapi_cart")

# In-memory storage fallback for standalone local dev when MongoDB is offline
IN_MEMORY_CARTS = {}
IN_MEMORY_LOGS = []

class MongoDatabaseWrapper:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_connected = False

    async def connect(self):
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            self.client = AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000)
            # Ping database
            await self.client.admin.command('ping')
            self.db = self.client[settings.DATABASE_NAME]
            self.is_connected = True
            logger.info(f"Connected to MongoDB at {settings.MONGO_URI}")
        except Exception as e:
            logger.warning(f"MongoDB connection failed: {e}. Falling back to in-memory store.")
            self.is_connected = False

    async def close(self):
        if self.client:
            self.client.close()

db_wrapper = MongoDatabaseWrapper()

async def get_cart_collection():
    if db_wrapper.is_connected and db_wrapper.db is not None:
        return db_wrapper.db["carts"]
    return None

async def get_logs_collection():
    if db_wrapper.is_connected and db_wrapper.db is not None:
        return db_wrapper.db["activity_logs"]
    return None
