# Food Store — Frontend Web (Parcial 2 - Programación IV)

Interfaz web de administración del catálogo de productos de Food Store, construida con **React**, **TypeScript** , **Vite** y **Tailwind CSS 4**.

## Requisitos previos

- **Node.js** 18+ y **npm**
- El backend (`foodstore-backend`) debe estar en ejecución en `http://localhost:8000`.

## Instalación y ejecución

1. Abrir una terminal dentro de la carpeta `foodstore-frontend`.
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador la URL indicada en consola (por defecto `http://localhost:5173`).

## Funcionalidades implementadas

- Listado de productos activos mostrando precio y stock acompañados del símbolo de la unidad de venta (`$ 8.500,50 / kg`, `stock: 4,5 kg`).
- Indicadores visuales independientes para `disponible` (*Disponible* / *Venta pausada*) y `hay_stock` (*Hay stock* / *Sin stock*).
- Alta y edición de productos mediante ventana modal con selector de unidad de venta alimentado desde `GET /api/v1/unidades-medida`.
- Visualización de errores de negocio (`409 Conflict` por nombre repetido o `422` por stock decimal en unidad contable) dentro del modal sin cerrarlo.
- Pausa/activación rápida de disponibilidad (`PUT`) y baja lógica (`DELETE`) con refresco automático del estado levantado en `App.tsx`.