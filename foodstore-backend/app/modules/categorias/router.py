from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.categorias import service
from app.modules.categorias.schema import (
    CategoriaCreate,
    CategoriaPublic,
    CategoriaUpdate,
)

router = APIRouter(prefix="/api/v1/categorias", tags=["Categorías"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("", response_model=CategoriaPublic, status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, session: SessionDep):
    return service.crear_categoria(session, data)


@router.get("", response_model=list[CategoriaPublic])
def listar_categorias(
    session: SessionDep,
    activo: Annotated[bool | None, Query()] = None,
    search: Annotated[str | None, Query()] = None,
):
    return service.listar_categorias(session=session, activo=activo, search=search)


@router.get("/{id}", response_model=CategoriaPublic)
def obtener_categoria(
    id: Annotated[int, Path(ge=1)],
    session: SessionDep,
):
    return service.obtener_categoria(session, id)


@router.put("/{id}", response_model=CategoriaPublic)
def actualizar_categoria(
    id: Annotated[int, Path(ge=1)],
    data: CategoriaUpdate,
    session: SessionDep,
):
    return service.actualizar_categoria(session, id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def anular_categoria(
    id: Annotated[int, Path(ge=1)],
    session: SessionDep,
) -> None:
    service.anular_categoria(session, id)