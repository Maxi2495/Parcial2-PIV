from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException
from sqlmodel import Session, col, select

from app.modules.productos.model import Producto, ProductoCategoria
from app.modules.productos.schema import (
    CategoriaNested,
    ProductoCreate,
    ProductoPublic,
    ProductoUpdate,
    UnidadMedidaNested,
)
from app.modules.unidades_medida.model import TipoUnidad, UnidadMedida


def _to_public(producto: Producto) -> ProductoPublic:
    """Convierte el modelo Producto a ProductoPublic calculando hay_stock (RN-11)."""
    return ProductoPublic(
        id=producto.id,  # type: ignore[arg-type]
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio_base=producto.precio_base,
        unidad_venta_id=producto.unidad_venta_id,
        stock_cantidad=producto.stock_cantidad,
        hay_stock=producto.stock_cantidad > Decimal("0"),
        disponible=producto.disponible,
        activo=producto.activo,
        anulado_at=producto.anulado_at,
        unidad_venta=UnidadMedidaNested.model_validate(producto.unidad_venta),
        categorias=[CategoriaNested.model_validate(c) for c in producto.categorias],
    )


def _validar_unidad_y_stock(
    session: Session, unidad_venta_id: int, stock_cantidad: Decimal
) -> UnidadMedida:
    """Verifica que la unidad exista (RN-03) y que si es contable el stock sea entero (RN-10)."""
    unidad = session.get(UnidadMedida, unidad_venta_id)
    if not unidad:
        raise HTTPException(
            status_code=404, detail="La unidad de medida indicada no existe"
        )
    if unidad.tipo == TipoUnidad.contable and stock_cantidad % 1 != 0:
        raise HTTPException(
            status_code=422,
            detail="Para unidades de tipo contable, stock_cantidad debe ser un número entero",
        )
    return unidad


def _validar_nombre_unico_activo(
    session: Session, nombre: str, excluir_id: int | None = None
) -> None:
    """Verifica que no exista otro producto activo con el mismo nombre (RN-02)."""
    stmt = select(Producto).where(
        Producto.nombre == nombre,
        Producto.activo == True,  # noqa: E712
    )
    if excluir_id is not None:
        stmt = stmt.where(Producto.id != excluir_id)

    existente = session.exec(stmt).first()
    if existente:
        raise HTTPException(
            status_code=409,
            detail="Ya existe un producto activo con ese nombre",
        )


def crear_producto(session: Session, data: ProductoCreate) -> ProductoPublic:
    # 1. Validar FK de unidad y regla RN-10 (stock entero en contables)
    _validar_unidad_y_stock(session, data.unidad_venta_id, data.stock_cantidad)

    # 2. Validar RN-02 (nombre único entre activos)
    _validar_nombre_unico_activo(session, data.nombre)

    # 3. Persistir recién cuando todo es válido (RN-13)
    nuevo = Producto(
        nombre=data.nombre,
        descripcion=data.descripcion,
        precio_base=data.precio_base,
        unidad_venta_id=data.unidad_venta_id,
        stock_cantidad=data.stock_cantidad,
        disponible=data.disponible,
    )
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return _to_public(nuevo)


def listar_productos(
    session: Session,
    skip: int = 0,
    limit: int = 10,
    activo: bool | None = None,
    disponible: bool | None = None,
    categoria_id: int | None = None,
    search: str | None = None,
) -> list[ProductoPublic]:
    stmt = select(Producto)

    # Filtro categoria_id sin duplicar filas
    if categoria_id is not None:
        stmt = (
            stmt.join(
                ProductoCategoria,
                Producto.id == ProductoCategoria.producto_id,  # type: ignore[arg-type]
            )
            .where(ProductoCategoria.categoria_id == categoria_id)
            .distinct()
        )

    # Filtro activo: omitido o true -> solo activos; false -> solo anulados
    if activo is False:
        stmt = stmt.where(Producto.activo == False)  # noqa: E712
    else:
        stmt = stmt.where(Producto.activo == True)  # noqa: E712

    # Filtro disponible: omitido no filtra
    if disponible is not None:
        stmt = stmt.where(Producto.disponible == disponible)

    # Filtro search: coincidencia parcial sobre el nombre, sin distinguir mayúsculas
    if search:
        stmt = stmt.where(col(Producto.nombre).ilike(f"%{search}%"))

    stmt = stmt.offset(skip).limit(limit)
    productos = session.exec(stmt).all()
    return [_to_public(p) for p in productos]


def obtener_producto(session: Session, producto_id: int) -> ProductoPublic:
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _to_public(producto)


def actualizar_producto(
    session: Session, producto_id: int, data: ProductoUpdate
) -> ProductoPublic:
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # RN-05: Un registro anulado no admite modificación
    if not producto.activo:
        raise HTTPException(
            status_code=409,
            detail="No se puede modificar un producto anulado",
        )

    # RN-03 y RN-10: Validar unidad y stock entero si es contable
    _validar_unidad_y_stock(session, data.unidad_venta_id, data.stock_cantidad)

    # RN-02: Validar nombre único entre activos excluyendo el propio producto
    _validar_nombre_unico_activo(session, data.nombre, excluir_id=producto_id)

    producto.nombre = data.nombre
    producto.descripcion = data.descripcion
    producto.precio_base = data.precio_base
    producto.unidad_venta_id = data.unidad_venta_id
    producto.stock_cantidad = data.stock_cantidad
    producto.disponible = data.disponible

    session.add(producto)
    session.commit()
    session.refresh(producto)
    return _to_public(producto)


def anular_producto(session: Session, producto_id: int) -> None:
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # RN-04: Anular un registro ya anulado se rechaza con 409
    if not producto.activo:
        raise HTTPException(
            status_code=409, detail="El producto ya se encuentra anulado"
        )

    producto.activo = False
    producto.anulado_at = datetime.now(timezone.utc)
    session.add(producto)
    session.commit()