from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.categorias.router import router as categorias_router
from app.core.database import create_db_and_tables
from app.core.seed import seed_unidades_medida
from app.modules.categorias import model as categorias_model  # noqa: F401
from app.modules.productos import model as productos_model  # noqa: F401
from app.modules.productos.router import router as productos_router
from app.modules.unidades_medida import model as unidades_model  # noqa: F401
from app.modules.unidades_medida.router import router as unidades_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    seed_unidades_medida()
    yield


app = FastAPI(title="Food Store API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(unidades_router)
app.include_router(productos_router)
app.include_router(categorias_router)