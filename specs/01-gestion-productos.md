# SPEC 01 — Gestión administrativa de productos

> **Estado:** Aprobado
> **Dependencias:** Ninguna
> **Fecha:** 2026-11-26
> **Objetivo:** Permitir a administradores gestionar los productos del restaurante desde el panel administrativo.

## Alcance

**Incluye:**

- Crear un layout administrativo con el sidebar compartido y acceso a Productos.
- Listar productos en una tabla paginada con búsqueda por nombre, filtro por tipo y acciones.
- Crear y editar productos en pantallas independientes con Signal Forms.
- Cambiar disponibilidad y dar de baja productos, con confirmación para la baja.
- Permitir imágenes opcionales al crear y agregar o reemplazar imágenes al editar.
- Consumir el API mediante TanStack Query y ampliar el API para consultar por ID y buscar por nombre.
- Identificar y reutilizar componentes compartidos y componentes propios de la funcionalidad.

**Fuera de alcance:**

- Gestión de categorías configurables, indicadores de totales y gestión de inventario.
- Modal de confirmación para guardar, cambiar disponibilidad o abandonar formularios.

## Modelo de datos

Se reutiliza el producto del API: `id`, `nombre`, `descripcion`, `precio`, `tipo`, `principal`, `disponible`, `imageUrl`, `createdAt` y `updatedAt`. Los tipos disponibles son `PLATO_FONDO`, `BEBIDA`, `EXTRA`, `POSTRE`, `MENU` y `BEBIDA_MENU`. Nombre, precio y tipo son obligatorios; la descripción y la imagen son opcionales. El precio se envía como cadena decimal, conforme al contrato existente. Las imágenes admitidas son JPG, PNG y WebP de hasta 5 MB.

La consulta administrativa paginada admite `page`, `limit`, `tipo` y búsqueda por nombre. La búsqueda se aplica antes de paginar. La consulta administrativa por ID devuelve el mismo producto que el listado o 404 si no existe o está dado de baja. Ambas requieren rol `ADMIN`.

## Plan de implementación

1. Ampliar el listado administrativo del API con búsqueda por nombre y añadir la consulta administrativa por ID, conservando la autorización y exclusión de productos dados de baja. Añadir pruebas de ambos contratos.
2. Incorporar TanStack Query al arranque de `front-app-restaurant` y crear `src/app/productos/` siguiendo la organización de `auth`. Implementar opciones de consulta y mutación para el contrato administrativo, usando el interceptor existente.
3. Integrar el layout administrativo y el sidebar compartido, con navegación a productos y rutas protegidas para listado, creación y edición. Manejar acceso denegado para usuarios sin rol `ADMIN`.
4. Adaptar la tabla compartida para contenido y acciones por fila y reutilizar sus componentes de entrada y paginación. Crear un modal de confirmación reutilizable en `shared/components`.
5. Implementar el listado con imagen, nombre, tipo, precio, disponibilidad, edición y baja. Incorporar búsqueda, filtro, paginación y estados de carga, vacío y error.
6. Crear un formulario de productos con Signal Forms compartido por las pantallas de creación y edición. Validar los campos y la imagen según el API, conservar los valores ante errores y permitir acceso directo a la edición por ID.
7. Conectar las mutaciones de creación, edición, disponibilidad y baja. Confirmar la baja en el modal, actualizar las consultas afectadas y mostrar el resultado de cada operación.

## Criterios de aceptación

- [ ] Un administrador accede a Productos desde el sidebar y un usuario sin rol `ADMIN` no puede gestionar productos.
- [ ] La tabla muestra imagen o marcador, nombre, tipo, precio, disponibilidad y acciones, y se adapta a pantallas pequeñas.
- [ ] La búsqueda por nombre y el filtro por cualquiera de los seis tipos operan sobre todos los resultados, no solo la página visible.
- [ ] El administrador crea un producto válido con o sin imagen y lo encuentra en el listado.
- [ ] La edición puede abrirse directamente por URL y tras recargar; permite modificar los campos y agregar o reemplazar la imagen.
- [ ] El formulario muestra errores de validación y conserva los datos si falla el guardado.
- [ ] Cambiar disponibilidad actualiza el estado visible. Cancelar la baja no modifica el producto y confirmarla lo retira del listado.
- [ ] El listado y la edición presentan estados de carga y error; el listado muestra un estado vacío cuando corresponda y la edición maneja productos inexistentes.
- [ ] Las pruebas pertinentes del frontend y del API, y sus compilaciones, pasan.

## Decisiones

- **Sí:** tabla paginada; la imagen proporcionada es una referencia visual, no una obligación de usar tarjetas.
- **Sí:** TanStack Query con `queryOptions` y `mutationOptions` para administrar consultas y mutaciones.
- **Sí:** consulta por ID y búsqueda en el API para permitir edición directa y búsqueda correcta con paginación.
- **Sí:** componentes genéricos en `shared/components` y componentes propios del dominio en `productos`.
- **Sí:** confirmación únicamente para la baja. La baja es lógica y sigue el comportamiento existente del API.
- **No:** estadísticas globales ni categorías configurables en esta entrega.

## Riesgos

- El API exige rol `ADMIN`; el frontend debe manejar errores de autorización sin depender exclusivamente de su protección de rutas.
- La imagen se guarda mediante el proveedor configurado en el API; los errores de almacenamiento deben mostrarse sin descartar el formulario.

## Qué no incluye esta especificación

- Gestión de inventario o categorías configurables.
- Indicadores globales de productos o categorías.
