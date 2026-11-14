from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.productos import service
from app.modules.productos.schema import (
    ProductoCreate,
    ProductoPublic,
    ProductoUpdate,
    ProductoCategoriaCreate,
    ProductoCategoriaPublic
)

router = APIRouter(prefix="/api/v1/productos", tags=["Productos"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("", response_model=ProductoPublic, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, session: SessionDep):
    return service.crear_producto(session, data)


@router.get("", response_model=list[ProductoPublic])
def listar_productos(
    session: SessionDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
    activo: Annotated[bool | None, Query()] = None,
    disponible: Annotated[bool | None, Query()] = None,
    categoria_id: Annotated[int | None, Query()] = None,
    search: Annotated[str | None, Query()] = None,
):
    return service.listar_productos(
        session=session,
        skip=skip,
        limit=limit,
        activo=activo,
        disponible=disponible,
        categoria_id=categoria_id,
        search=search,
    )


@router.get("/{id}", response_model=ProductoPublic)
def obtener_producto(
    id: Annotated[int, Path(ge=1)],
    session: SessionDep,
):
    return service.obtener_producto(session, id)


@router.put("/{id}", response_model=ProductoPublic)
def actualizar_producto(
    id: Annotated[int, Path(ge=1)],
    data: ProductoUpdate,
    session: SessionDep,
):
    return service.actualizar_producto(session, id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def anular_producto(
    id: Annotated[int, Path(ge=1)],
    session: SessionDep,
) -> None:
    service.anular_producto(session, id)
    
@router.post(
    "/{id}/categorias",
    response_model=ProductoCategoriaPublic,
    status_code=status.HTTP_201_CREATED,
)
def clasificar_producto(
    id: Annotated[int, Path(ge=1)],
    data: ProductoCategoriaCreate,
    session: SessionDep,
):
    return service.clasificar_producto(session, id, data)


@router.get(
    "/{id}/categorias",
    response_model=list[ProductoCategoriaPublic],
)
def listar_categorias_de_producto(
    id: Annotated[int, Path(ge=1)],
    session: SessionDep,
):
    return service.listar_categorias_de_producto(session, id)