from datetime import datetime
from decimal import Decimal
from typing import Annotated

from sqlmodel import Field, SQLModel

from app.modules.unidades_medida.model import TipoUnidad


class UnidadMedidaNested(SQLModel):
    id: int
    nombre: str
    simbolo: str
    tipo: TipoUnidad


class CategoriaNested(SQLModel):
    id: int
    nombre: str
    descripcion: str | None = None
    activo: bool


class ProductoBase(SQLModel):
    nombre: Annotated[str, Field(min_length=3)]
    descripcion: str | None = None
    precio_base: Annotated[Decimal, Field(ge=0, max_digits=12, decimal_places=2)]
    unidad_venta_id: int
    stock_cantidad: Annotated[
        Decimal, Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=3)
    ] = Decimal("0")
    disponible: bool = True


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(ProductoBase):
    pass


class ProductoPublic(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    precio_base: Decimal
    unidad_venta_id: int
    stock_cantidad: Decimal
    hay_stock: bool
    disponible: bool
    activo: bool
    anulado_at: datetime | None
    unidad_venta: UnidadMedidaNested
    categorias: list[CategoriaNested] = []
    
class ProductoCategoriaCreate(SQLModel):
    categoria_id: int
    es_principal: bool = False


class ProductoCategoriaPublic(SQLModel):
    categoria_id: int
    nombre: str
    descripcion: str | None = None
    activo: bool
    es_principal: bool