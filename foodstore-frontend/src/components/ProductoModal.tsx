import { useState } from 'react';
import type {
  Producto,
  ProductoFormPayload,
  UnidadMedida,
} from '../types/catalogo';

interface ProductoModalProps {
  productoEditar: Producto | null;
  unidades: UnidadMedida[];
  onGuardar: (payload: ProductoFormPayload) => Promise<void>;
  onCerrar: () => void;
}

export function ProductoModal({
  productoEditar,
  unidades,
  onGuardar,
  onCerrar,
}: ProductoModalProps) {
  const [nombre, setNombre] = useState<string>(
    productoEditar ? productoEditar.nombre : ''
  );
  const [descripcion, setDescripcion] = useState<string>(
    productoEditar?.descripcion ?? ''
  );
  const [precioBase, setPrecioBase] = useState<string>(
    productoEditar ? String(Number(productoEditar.precio_base)) : ''
  );
  const [unidadVentaId, setUnidadVentaId] = useState<number>(
    productoEditar
      ? productoEditar.unidad_venta_id
      : unidades[0]?.id ?? 1
  );
  const [stockCantidad, setStockCantidad] = useState<string>(
    productoEditar ? String(Number(productoEditar.stock_cantidad)) : '0'
  );
  const [disponible, setDisponible] = useState<boolean>(
    productoEditar ? productoEditar.disponible : true
  );

  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorModal(null);
    setGuardando(true);

    const payload: ProductoFormPayload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() === '' ? null : descripcion.trim(),
      precio_base: Number(precioBase),
      unidad_venta_id: Number(unidadVentaId),
      stock_cantidad: Number(stockCantidad),
      disponible,
    };

    try {
      await onGuardar(payload);
    } catch (err) {
      if (err instanceof Error) {
        setErrorModal(err.message);
      } else {
        setErrorModal('Ocurrió un error al guardar el producto.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            {productoEditar ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-600 text-sm font-medium cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorModal && (
          <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">
            {errorModal}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre (mín. 3 caracteres) *
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: Ravioles de Ricota"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Opcional"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Precio Base ($) *
              </label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={precioBase}
                onChange={(e) => setPrecioBase(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unidad de Venta *
              </label>
              <select
                value={unidadVentaId}
                onChange={(e) => setUnidadVentaId(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.simbolo}) - {u.tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stock en unidad de venta *
            </label>
            <input
              type="number"
              required
              min={0}
              step="0.001"
              value={stockCantidad}
              onChange={(e) => setStockCantidad(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="chk-disponible"
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label
              htmlFor="chk-disponible"
              className="text-sm text-slate-700 select-none"
            >
              Disponible para la venta
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}