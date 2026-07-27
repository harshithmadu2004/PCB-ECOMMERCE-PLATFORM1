import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import db_wrapper
from routers import cart, activity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi_cart")

app = FastAPI(
    title="PCB E-commerce Cart & Logging Microservice",
    description="High-performance MongoDB cart microservice and activity logging service with JWT authentication.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing FastAPI Cart Microservice...")
    await db_wrapper.connect()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down FastAPI Cart Microservice...")
    await db_wrapper.close()

@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "FastAPI Cart Microservice",
        "mongodb_connected": db_wrapper.is_connected
    }

app.include_router(cart.router)
app.include_router(activity.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
