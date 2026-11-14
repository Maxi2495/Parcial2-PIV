from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel

from app.modules.productos.model import Producto, ProductoCategoria


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str
    descripcion: str | None = None
    activo: bool = Field(default=True)
    anulado_at: datetime | None = None

    productos: list[Producto] = Relationship(
        back_populates="categorias", link_model=ProductoCategoria
    )