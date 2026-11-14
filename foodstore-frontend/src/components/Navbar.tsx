interface NavbarProps {
  onNuevoProducto: () => void;
}

export function Navbar({ onNuevoProducto }: NavbarProps) {
  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Food Store</h1>
          <p className="text-xs text-slate-300">
            Administración del Catálogo de Productos
          </p>
        </div>
        <button
          type="button"
          onClick={onNuevoProducto}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
        >
          + Nuevo Producto
        </button>
      </div>
    </header>
  );
}