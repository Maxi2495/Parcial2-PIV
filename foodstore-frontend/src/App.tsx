import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { ProductoList } from './components/ProductoList';
import { ProductoModal } from './components/ProductoModal';
import type {
  Producto,
  ProductoFormPayload,
  UnidadMedida,
} from './types/catalogo';

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function fetchCatalogo(): Promise<{
  productos: Producto[];
  unidades: UnidadMedida[];
}> {
  const [resProd, resUnid] = await Promise.all([
    fetch(`${API_BASE_URL}/productos?limit=50`),
    fetch(`${API_BASE_URL}/unidades-medida`),
  ]);

  if (!resProd.ok || !resUnid.ok) {
    throw new Error('No se pudo conectar con la API de Food Store.');
  }

  const productos: Producto[] = await resProd.json();
  const unidades: UnidadMedida[] = await resUnid.json();
  return { productos, unidades };
}

export function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargarCatalogo = async () => {
    try {
      const data = await fetchCatalogo();
      setProductos(data.productos);
      setUnidades(data.unidades);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error inesperado al cargar el catálogo.');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;

    const iniciar = async () => {
      try {
        const data = await fetchCatalogo();
        if (!cancelado) {
          setProductos(data.productos);
          setUnidades(data.unidades);
          setError(null);
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error inesperado al cargar el catálogo.'
          );
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    void iniciar();

    return () => {
      cancelado = true;
    };
  }, []);

  const handleAbrirAlta = () => {
    setProductoSeleccionado(null);
    setModalAbierto(true);
  };

  const handleAbrirEdicion = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
  };

  const handleGuardarProducto = async (payload: ProductoFormPayload) => {
    const esEdicion = productoSeleccionado !== null;
    const url = esEdicion
      ? `${API_BASE_URL}/productos/${productoSeleccionado.id}`
      : `${API_BASE_URL}/productos`;
    const method = esEdicion ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as {
        detail?: string;
      } | null;
      const mensaje =
        typeof errorData?.detail === 'string'
          ? errorData.detail
          : `Error HTTP ${response.status} al guardar el producto.`;
      throw new Error(mensaje);
    }

    await recargarCatalogo();
    handleCerrarModal();
  };

  const handleToggleDisponible = async (producto: Producto) => {
    setError(null);
    try {
      const payload: ProductoFormPayload = {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio_base: Number(producto.precio_base),
        unidad_venta_id: producto.unidad_venta_id,
        stock_cantidad: Number(producto.stock_cantidad),
        disponible: !producto.disponible,
      };

      const response = await fetch(`${API_BASE_URL}/productos/${producto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('No se pudo actualizar la disponibilidad.');
      }

      await recargarCatalogo();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleAnularProducto = async (id: number) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('No se pudo anular el producto.');
      }

      await recargarCatalogo();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar onNuevoProducto={handleAbrirAlta} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setCargando(true);
                void recargarCatalogo();
              }}
              className="text-xs font-semibold underline cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {cargando ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
            Cargando catálogo de productos...
          </div>
        ) : (
          <ProductoList
            productos={productos}
            onEditar={handleAbrirEdicion}
            onToggleDisponible={handleToggleDisponible}
            onAnular={handleAnularProducto}
          />
        )}
      </main>

      {modalAbierto && (
        <ProductoModal
          key={productoSeleccionado ? `edit-${productoSeleccionado.id}` : 'new'}
          productoEditar={productoSeleccionado}
          unidades={unidades}
          onGuardar={handleGuardarProducto}
          onCerrar={handleCerrarModal}
        />
      )}
    </div>
  );
}

export default App;