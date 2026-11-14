export type TipoUnidad = 'peso' | 'volumen' | 'contable';

export interface UnidadMedida {
  id: number;
  nombre: string;
  simbolo: string;
  tipo: TipoUnidad;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  anulado_at?: string | null;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number | string;
  unidad_venta_id: number;
  stock_cantidad: number | string;
  hay_stock: boolean;
  disponible: boolean;
  activo: boolean;
  anulado_at: string | null;
  unidad_venta: UnidadMedida;
  categorias: Categoria[];
}

export interface ProductoFormPayload {
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  unidad_venta_id: number;
  stock_cantidad: number;
  disponible: boolean;
}