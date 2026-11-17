# Food Store — Backend API (Parcial 2 - Programación IV)

API REST desarrollada con **FastAPI**, **SQLModel**, **Pydantic v2** y **PostgreSQL** para la administración del catálogo de productos y categorías de Food Store.

## Requisitos previos

- **Python** 3.12 o superior
- **PostgreSQL** 15 o superior ejecutándose localmente
- Base de datos creada en PostgreSQL con el nombre `foodstore_db`:
  ```sql
  CREATE DATABASE foodstore_db;
  ```

## Configuración de la conexión a PostgreSQL

La cadena de conexión se encuentra definida en el archivo `app/core/database.py`:

```python
DATABASE_URL = "postgresql+psycopg2://postgres:admin@localhost:5432/foodstore_db"
```

## Instalación y ejecución

1. Abrir una terminal dentro de la carpeta `foodstore-backend`.
2. Crear y activar el entorno virtual `.venv`:
   ```bash
   python -m venv .venv
   # En Windows (PowerShell):
   .venv\Scripts\activate
   ```
3. Instalar las dependencias del proyecto:
   ```bash
   pip install -r requirements.txt
   ```
4. Iniciar el servidor de desarrollo:
   ```bash
   fastapi dev app/main.py
   ```
5. Al iniciar, el `lifespan` creará automáticamente las 4 tablas del modelo (`unidadmedida`, `categoria`, `producto`, `productocategoria`) y ejecutará el "seed" con las 6 unidades de medida iniciales.

## Documentación y Pruebas

- **Swagger UI:** `http://localhost:8000/docs`
- **Pruebas con REST Client (VSCode):**
  - `tests/productos.http`: prueba los 5 endpoints de productos, los 4 filtros (`activo`, `disponible`, `categoria_id`, `search`), las validaciones 404/409/422 (incluyendo `RN-10` sobre unidades contables) y el cálculo dinámico de `hay_stock`.
  - `tests/relaciones.http`: prueba el CRUD de categorías, unicidad de nombres activos (`RN-02`), independencia de baja lógica (`RN-06`) y clasificación N:N con cambio de categoría principal (`RN-09`).