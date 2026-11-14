from datetime import datetime, timezone

from fastapi import HTTPException
from sqlmodel import Session, col, select

from app.modules.categorias.model import Categoria
from app.modules.categorias.schema import CategoriaCreate, CategoriaUpdate


def _validar_nombre_unico_activo(
    session: Session, nombre: str, excluir_id: int | None = None
) -> None:
    """Verifica que no exista otra categoría activa con el mismo nombre (RN-02)."""
    stmt = select(Categoria).where(
        Categoria.nombre == nombre,
        Categoria.activo == True,  # noqa: E712
    )
    if excluir_id is not None:
        stmt = stmt.where(Categoria.id != excluir_id)

    existente = session.exec(stmt).first()
    if existente:
        raise HTTPException(
            status_code=409,
            detail="Ya existe una categoría activa con ese nombre",
        )


def crear_categoria(session: Session, data: CategoriaCreate) -> Categoria:
    _validar_nombre_unico_activo(session, data.nombre)

    nueva = Categoria(
        nombre=data.nombre,
        descripcion=data.descripcion,
    )
    session.add(nueva)
    session.commit()
    session.refresh(nueva)
    return nueva


def listar_categorias(
    session: Session,
    activo: bool | None = None,
    search: str | None = None,
) -> list[Categoria]:
    stmt = select(Categoria)

    # Omitido o true devuelve solo activas; false devuelve solo anuladas
    if activo is False:
        stmt = stmt.where(Categoria.activo == False)  # noqa: E712
    else:
        stmt = stmt.where(Categoria.activo == True)  # noqa: E712

    if search:
        stmt = stmt.where(col(Categoria.nombre).ilike(f"%{search}%"))

    return list(session.exec(stmt).all())


def obtener_categoria(session: Session, categoria_id: int) -> Categoria:
    categoria = session.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


def actualizar_categoria(
    session: Session, categoria_id: int, data: CategoriaUpdate
) -> Categoria:
    categoria = session.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # RN-05: Un registro anulado no admite modificación
    if not categoria.activo:
        raise HTTPException(
            status_code=409,
            detail="No se puede modificar una categoría anulada",
        )

    # RN-02: Nombre único entre activas
    _validar_nombre_unico_activo(session, data.nombre, excluir_id=categoria_id)

    categoria.nombre = data.nombre
    categoria.descripcion = data.descripcion

    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    return categoria


def anular_categoria(session: Session, categoria_id: int) -> None:
    categoria = session.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # RN-04: Anular un registro ya anulado se rechaza con 409
    if not categoria.activo:
        raise HTTPException(
            status_code=409,
            detail="La categoría ya se encuentra anulada",
        )

    # RN-06: Solo se anula la categoría; sus productos conservan su estado
    categoria.activo = False
    categoria.anulado_at = datetime.now(timezone.utc)
    session.add(categoria)
    session.commit()