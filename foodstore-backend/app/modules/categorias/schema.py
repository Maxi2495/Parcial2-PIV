from datetime import datetime
from typing import Annotated

from sqlmodel import Field, SQLModel


class CategoriaBase(SQLModel):
    nombre: Annotated[str, Field(min_length=3)]
    descripcion: str | None = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(CategoriaBase):
    pass


class CategoriaPublic(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
    anulado_at: datetime | None