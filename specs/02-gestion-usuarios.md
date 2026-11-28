# SPEC 02 — Gestión administrativa de usuarios

> **Estado:** Aprobado
> **Dependencias:** SPEC 01
> **Fecha:** 2026-11-27
> **Objetivo:** Permitir a administradores listar y crear usuarios con sus datos personales desde el panel administrativo.

## Alcance

**Incluye:**

- Agregar Usuarios al sidebar administrativo y proteger el acceso al módulo para el rol `ADMIN`.
- Listar usuarios en una tabla paginada con búsqueda por nombre o correo y filtro por rol.
- Mostrar nombre completo, correo, teléfono, rol y estado de verificación del correo.
- Crear usuarios y sus personas en una página independiente con todos los campos admitidos por el API y selección de rol.
- Ampliar y proteger el API para que solo un administrador pueda crear usuarios con el rol elegido.
- Reutilizar los patrones, componentes compartidos y mecanismos de consultas y formularios del frontend existente.

**Fuera de alcance:**

- Editar o dar de baja usuarios o personas.
- Filtrar por estado de verificación del correo.
- Modificar el flujo público de registro o implementar nuevos flujos de verificación de correo.

## Modelo de datos

El listado reutiliza `GET /users` con `page`, `limit`, `search` y `role`. El resultado contiene `items`, `page`, `limit`, `total` y `totalPages`. Cada elemento incluye `id`, `email`, `role`, `emailVerified` y `person`, que puede ser nulo y contiene `name`, `lastName` y `phone`. La búsqueda y el filtro se aplican en el servidor antes de paginar.

La creación utiliza `POST /users` con `name`, `email`, `password`, `lastName`, `phone`, `document`, `birthDate`, `residence` y `role`. Nombre, correo y contraseña son obligatorios; los datos personales restantes son opcionales. La contraseña admite entre 8 y 128 caracteres y la fecha utiliza `YYYY-MM-DD`. Los roles disponibles son `ADMIN`, `COCINA`, `ATENCION`, `MOZO` y `CLIENTE`. El formulario exige seleccionar un rol. El API acepta el rol seleccionado y conserva `CLIENTE` como valor predeterminado cuando no se envía, para mantener la compatibilidad del contrato existente. La creación persiste usuario y persona en una misma transacción.

## Plan de implementación

1. Ampliar el contrato y el comando de creación de `app-api-resturante/src/users/` para aceptar los roles existentes y conservar el valor predeterminado `CLIENTE`. Proteger `POST /users` mediante autenticación y autorización de administrador. Mantener intacto el registro público en `POST /auth/register` y actualizar las pruebas pertinentes.
2. Crear en `app-front-restaurante/src/app/usuarios/` los tipos y el servicio para el listado y la creación, siguiendo los patrones de `productos` y el interceptor de autenticación existente.
3. Agregar las rutas protegidas de listado y creación y el enlace Usuarios al sidebar administrativo. Reutilizar el control de acceso para `ADMIN`.
4. Implementar la tabla con búsqueda, filtro por los cinco roles y paginación del servidor. Reutilizar los componentes compartidos y mostrar estados de carga, vacío y error, incluidos datos personales ausentes.
5. Crear la página y el formulario de usuario y persona con los campos y validaciones del API. Conectar la creación, mostrar los errores sin perder los datos ingresados y actualizar el listado tras guardar.

## Criterios de aceptación

- [ ] Un administrador accede a Usuarios desde el sidebar; un usuario sin rol `ADMIN` no puede acceder al módulo ni crear usuarios mediante el API.
- [ ] La tabla muestra nombre completo, correo, teléfono, rol y verificación de correo, con una representación clara de los datos ausentes.
- [ ] La búsqueda por nombre o correo y el filtro por cualquiera de los cinco roles se aplican al conjunto completo antes de paginar y funcionan conjuntamente.
- [ ] La paginación permite navegar por los resultados y refleja el total devuelto por el API. Al cambiar la búsqueda o el rol se vuelve a la primera página.
- [ ] La página de creación permite registrar nombre, correo, contraseña, apellido, teléfono, documento, fecha de nacimiento, residencia y cualquiera de los cinco roles.
- [ ] La creación guarda el usuario con el rol elegido y su persona; los campos opcionales pueden omitirse y las restricciones del API se presentan en el formulario.
- [ ] El API mantiene `CLIENTE` como rol predeterminado si un administrador omite el rol y rechaza roles inválidos.
- [ ] El correo duplicado y otros errores de creación se muestran sin borrar los datos ingresados; una creación exitosa actualiza el listado.
- [ ] El listado muestra estados de carga, resultados vacíos y error, y la tabla se puede utilizar en pantallas pequeñas.
- [ ] Las pruebas pertinentes del frontend y del API, y sus compilaciones, pasan.

## Decisiones

- **Sí:** tabla paginada; la imagen aportada sirve de referencia visual y no obliga a usar tarjetas.
- **Sí:** listado y creación en esta entrega, con formulario en una página independiente como Productos.
- **Sí:** selección de rol y ampliación del API, porque el comportamiento actual crea únicamente usuarios `CLIENTE`.
- **Sí:** acceso exclusivo de administradores en frontend y API, incluida la creación de cuentas con privilegios.
- **Sí:** reutilizar la búsqueda y paginación existentes del servidor para filtrar todos los resultados.
- **No:** edición, baja y filtro por verificación de correo en esta entrega.

## Riesgos

- Restringir `POST /users` a administradores cambia el acceso para consumidores que actualmente no tengan ese rol; el registro público conserva su endpoint independiente.
- Algunos usuarios pueden no tener una persona asociada o un teléfono registrado; el listado debe mostrarlos sin fallar.

## Qué no incluye esta especificación

- Edición o baja de usuarios y personas.
- Filtro por verificación de correo o cambios al registro y verificación públicos.
