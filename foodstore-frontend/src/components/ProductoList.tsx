import type { Producto } from '../types/catalogo';
import { ProductoCard } from './ProductoCard';

interface ProductoListProps {
  productos: Producto[];
  onEditar: (producto: Producto) => void;
  onToggleDisponible: (producto: Producto) => void;
  onAnular: (id: number) => void;
}

export function ProductoList({
  productos,
  onEditar,
  onToggleDisponible,
  onAnular,
}: ProductoListProps) {
  if (productos.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
        <p className="text-slate-600 font-medium">
          No hay productos activos en el catálogo.
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Usá el botón "+ Nuevo Producto" para dar de alta el primero.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {productos.map((prod) => (
        <ProductoCard
          key={prod.id}
          producto={prod}
          onEditar={onEditar}
          onToggleDisponible={onToggleDisponible}
          onAnular={onAnular}
        />
      ))}
    </div>
  );
}