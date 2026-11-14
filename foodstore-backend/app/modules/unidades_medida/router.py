from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.modules.unidades_medida.model import UnidadMedida, UnidadMedidaPublic

router = APIRouter(prefix="/api/v1/unidades-medida", tags=["Unidades de Medida"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("", response_model=list[UnidadMedidaPublic])
def listar_unidades_medida(session: SessionDep):
    return session.exec(select(UnidadMedida)).all()