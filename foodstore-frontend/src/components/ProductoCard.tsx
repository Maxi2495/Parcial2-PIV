import type { Producto } from '../types/catalogo';

interface ProductoCardProps {
  producto: Producto;
  onEditar: (producto: Producto) => void;
  onToggleDisponible: (producto: Producto) => void;
  onAnular: (id: number) => void;
}

export function ProductoCard({
  producto,
  onEditar,
  onToggleDisponible,
  onAnular,
}: ProductoCardProps) {
  const precioFormateado = Number(producto.precio_base).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const stockFormateado = Number(producto.stock_cantidad).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });

  const simbolo = producto.unidad_venta.simbolo;

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            {producto.nombre}
          </h2>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                producto.disponible
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {producto.disponible ? 'Disponible' : 'Venta pausada'}
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                producto.hay_stock
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {producto.hay_stock ? 'Hay stock' : 'Sin stock'}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-1 min-h-5">
          {producto.descripcion || 'Sin descripción'}
        </p>

        {producto.categorias && producto.categorias.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {producto.categorias.map((cat) => (
              <span
                key={cat.id}
                className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
              >
                {cat.nombre}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <span className="text-xl font-bold text-slate-900">
            $ {precioFormateado}{' '}
            <span className="text-sm font-normal text-slate-500">
              / {simbolo}
            </span>
          </span>
          <span className="text-sm font-medium text-slate-700">
            stock: {stockFormateado} {simbolo}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onEditar(producto)}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer"
        >
          Editar
        </button>
        <button
         type="button"
         onClick={() => onToggleDisponible(producto)}
         title={producto.disponible ? 'Pausar la venta' : 'Reanudar la venta'}
         className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer"
>
  Disponibilidad
</button>
        <button
          type="button"
          onClick={() => onAnular(producto.id)}
          className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer"
        >
          Anular
        </button>
      </div>
    </article>
  );
}