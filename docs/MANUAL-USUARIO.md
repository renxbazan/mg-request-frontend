# Manual de usuario – MG Request

Sistema de gestión de solicitudes de MG Services Unlimited.

**URL de acceso:** https://request.mgservicesunlimited.com

---

## 1. Acceso e inicio de sesión

1. Abra en el navegador: **https://request.mgservicesunlimited.com**
2. En la pantalla de inicio de sesión:
   - **Usuario:** correo o nombre de usuario que le haya dado el administrador.
   - **Contraseña:** la contraseña asignada (cámbiela la primera vez desde **Configuración**).
3. Opcionalmente marque **Recordarme** para mantener la sesión.
4. Pulse **Entrar**.

Si no recuerda la contraseña, use **¿Olvidaste tu contraseña?**; el mensaje indica contactar al administrador de su empresa para recuperar el acceso.

---

## 2. Pantalla principal (Inicio)

Tras iniciar sesión verá:

- **Mensaje de bienvenida** con su nombre de usuario.
- **Enlaces rápidos:** Ver solicitudes, Nueva solicitud, Catálogos (según su perfil).
- **Panel de estadísticas** (si su perfil tiene acceso): gráficos por estado, prioridad, empresa/sitio y valoraciones por trabajador, con selector de período (mes actual, últimos 3 meses, etc.).

El **menú superior** depende de su perfil:

- **Principal:** Inicio, Solicitudes, Nueva solicitud (todos los perfiles que pueden entrar).
- **Catálogos:** Empresas, Sitios, Categorías de servicio, Subcategorías — **solo Super Administrador**.
- **Admin:** Perfiles, Personas, Usuarios — **solo Super Administrador**. El Administrador de empresa no ve Catálogos ni Admin.
- **Usuario (esquina derecha):** Mi cuenta, Configuración, Cerrar sesión.

---

## 3. Solicitudes

### 3.1 Ver listado de solicitudes

- En el menú, pulse **Solicitudes**.
- Puede ver **Mis solicitudes**, **Todas las solicitudes** o **Asignadas a mí** (según perfil y pestañas disponibles).
- Use los filtros: estado, prioridad, empresa.
- Ajuste **Elementos por página** y use la paginación si hay muchas solicitudes.
- Pulse el icono de **Ver** en una fila para abrir el detalle.

### 3.2 Crear una nueva solicitud

1. En el menú pulse **Nueva solicitud** (o el enlace correspondiente en Inicio).
2. Complete:
   - **Sitio:** sitio donde aplica la solicitud.
   - **Categoría:** categoría de servicio.
   - **Subcategoría:** opcional.
   - **Descripción:** detalle de la solicitud.
   - **Prioridad:** Baja, Media o Alta.
3. Opcional: pulse **Añadir fotos** para adjuntar hasta 5 imágenes (desde el móvil puede tomar foto directamente). Las fotos se comprimen antes de enviar.
4. Pulse **Crear solicitud**.

El estado inicial depende de su perfil y de si la empresa tiene aprobadores:

- **Solicitante (Requester):** la solicitud queda en **Pendiente de aprobación** hasta que un administrador la apruebe o rechace.
- **Administrador de empresa o Super Administrador:** la solicitud queda directamente en **Creada** (no pasa por aprobación).
- **Personal (Worker):** si la empresa tiene al menos un aprobador (usuario con perfil Administrador de empresa), la solicitud queda en **Pendiente de aprobación**; si la empresa no tiene aprobadores, queda en **Creada**.

### 3.3 Detalle de una solicitud y acciones

Al abrir una solicitud verá:

- Estado, prioridad, descripción, empresa, sitio, solicitante, personal asignado, fecha y fotos adjuntas (si las hay).
- **Historial** de cambios de estado y comentarios.

Las **acciones disponibles** dependen del estado y de su perfil. Solo verá los botones que le corresponden; si no tiene ninguna acción, aparecerá el mensaje «No hay más acciones».

| Estado               | Quién puede actuar | Acción |
|----------------------|-------------------|--------|
| Pendiente aprobación | Administrador de empresa o Super Administrador | **Aprobar** / **Rechazar** |
| Creada               | Solo Super Administrador | **Asignar a personal** (elegir trabajador) |
| Asignada             | El trabajador asignado a esa solicitud o Super Administrador | **En tránsito / Atender** |
| En tránsito          | El trabajador asignado o Super Administrador | **Cerrar / Completada** (con comentario opcional) |
| Completada           | Solicitante, Administrador de empresa o Super Administrador (no el Worker) | **Valorar** (puntuación y comentario) |
| Valorada / Rechazada | Nadie | Sin más acciones |

Los correos de notificación (nueva solicitud, asignación, aprobación, rechazo, cierre) incluyen un enlace para abrir la solicitud en la web.

---

## 4. Catálogos

Solo visibles para **Super Administrador**.

- **Empresas:** listado de empresas; crear, editar o eliminar. Desde aquí el Super Administrador puede **gestionar aprobadores**: en cada empresa, el botón «Aprobadores» abre un cuadro donde se ven los usuarios de esa empresa que son aprobadores (perfil Administrador de empresa) y se puede agregar o quitar aprobadores. Esto define si las solicitudes creadas por Workers de esa empresa pasan por «Pendiente de aprobación» o van directo a «Creada».
- **Sitios:** listado de sitios por empresa; crear, editar o eliminar.
- **Categorías de servicio:** categorías para clasificar solicitudes; crear, editar o eliminar.
- **Subcategorías de servicio:** subcategorías asociadas a una categoría; filtrar por categoría, crear, editar o eliminar.

En cada pantalla, los botones de **Editar** y **Eliminar** están en la fila correspondiente (iconos con tooltip al pasar el ratón). Se pedirá confirmación antes de eliminar.

---

## 5. Admin

Solo visible para **Super Administrador** (el Administrador de empresa no tiene acceso a esta sección).

- **Perfiles:** perfiles de rol (Super Admin, Requester, Company Admin, Worker, etc.); crear, editar o eliminar.
- **Personas:** personas/contactos asociados a empresas; crear persona o usuario, editar o eliminar.
- **Usuarios:** usuarios del sistema (login, persona, perfil, sitio, idioma); crear usuario, editar, **Cambiar contraseña** o eliminar.

Al crear un usuario se asocia una persona, un perfil y un sitio; el administrador define la contraseña inicial.

---

## 6. Configuración y cuenta

- **Mi cuenta / Configuración:** desde el menú de usuario (esquina superior derecha) se accede a **Cambiar contraseña**.
- En **Cambiar mi contraseña** debe indicar:
  - Contraseña actual.
  - Nueva contraseña (mínimo 4 caracteres).
  - Confirmación de la nueva contraseña.
- Pulse **Cambiar contraseña**. Recibirá confirmación si el cambio fue correcto.

---

## 7. Idioma

El idioma (Español / English) se puede configurar en el perfil del usuario (en **Admin > Usuarios**, al crear o editar usuario). La pantalla de inicio de sesión puede mostrarse por defecto en inglés; tras iniciar sesión la aplicación usa el idioma configurado para su usuario.

---

## 8. Flujo de trabajo según su tipo de usuario

A continuación se explica **qué verá y qué podrá hacer** según el tipo de cuenta que tenga. No hace falta ser técnico: solo hay que seguir los pasos que apliquen a su perfil.

### Si usted es **Solicitante** (Requester)

Usted es quien **crea las solicitudes** (por ejemplo, reportar una avería o pedir un servicio).

- **Al entrar** verá la pantalla de Inicio y el menú con: Inicio, Solicitudes y Nueva solicitud. No verá Catálogos ni Admin.
- En **Solicitudes** solo verá **sus propias solicitudes** (las que usted ha creado). No verá las de otros ni las asignadas a otros trabajadores.
- Puede **crear una nueva solicitud** cuando quiera: elija sitio, categoría, descripción, prioridad y, si quiere, añada fotos. Al guardar, la solicitud queda en **Pendiente de aprobación** hasta que un administrador la apruebe o la rechace (recibirá un correo).
- En el detalle de una solicitud **solo podrá valorar** cuando esté completada (estado «Completada» y el sistema le permita valorar). No verá botones de Aprobar, Rechazar, Asignar, En tránsito ni Cerrar.
- Cuando un trabajador **complete** el trabajo, recibirá un correo. Entonces debe entrar en la solicitud y **valorar** el servicio (puntuación y comentario opcional). Con eso el proceso queda cerrado para usted.

**En resumen:** Crear solicitudes → Ver las suyas → Cuando estén completadas, valorar.

---

### Si usted es **Personal / Trabajador** (Worker)

Usted es quien **atiende las solicitudes en el sitio** (por ejemplo, técnico de mantenimiento o limpieza).

- **Al entrar** verá el menú con: Inicio, Solicitudes y **Nueva solicitud**. No verá Catálogos ni Admin. Lo importante para usted es **Solicitudes**.
- En **Solicitudes** verá la pestaña **Asignadas a mí**. **Solo aparecen las solicitudes que un Super Administrador le ha asignado a usted.** No verá las de otros trabajadores ni todas las de la empresa.
- Si **crea una solicitud** (Nueva solicitud): si su empresa tiene aprobadores (usuarios con perfil Administrador de empresa), la solicitud quedará en **Pendiente de aprobación**; si no tiene aprobadores, quedará en **Creada**. Usted **no puede** aprobar, rechazar ni asignar; solo atender las que le asignen.
- Cuando le asignen una solicitud, recibirá un **correo** con el detalle y un enlace para abrirla. También puede entrar en la aplicación y abrirla desde la lista.
- Al abrir una solicitud **asignada a usted**, solo verá las acciones que le corresponden: **En tránsito / Atender** (si está Asignada) y **Cerrar / Completada** (si está En tránsito). No verá Aprobar, Rechazar, Asignar ni Valorar.
- Cuando termine el trabajo, pulse **Cerrar / Completada** y, si quiere, escriba un comentario. Al guardar, el solicitante recibirá un correo y podrá valorar el servicio.

**En resumen:** Ver solo lo que le asignan → Marcar «En tránsito» cuando vaya → Marcar «Completada» cuando termine. No valora; quien valora es el solicitante.

---

### Si usted es **Administrador de empresa** (Company Admin)

Usted **aprueba o rechaza solicitudes** de su empresa y puede **crear solicitudes** que quedan directo en Creada. **No** tiene acceso a Catálogos ni a Admin (eso solo lo ve el Super Administrador). **No** puede asignar trabajadores a las solicitudes; eso solo lo hace el Super Administrador.

- **Al entrar** verá solo: Inicio, Solicitudes y Nueva solicitud. No verá el menú Catálogos ni Admin.
- En **Solicitudes** puede ver **todas las solicitudes** de su empresa. Use las pestañas y filtros para encontrar lo que necesite.
- **Solicitudes pendientes de aprobación:** las solicitudes creadas por Solicitantes (Requester) o por Workers en empresas con aprobadores quedan en este estado. Aquí verá las que están “Pendiente aprobación”. Abra cada una y pulse **Aprobar** o **Rechazar**. El solicitante o el worker recibirán un correo. Una vez aprobada, la solicitud pasa a **Creada**; para asignar un trabajador debe hacerlo el Super Administrador.
- Si **crea una solicitud** (Nueva solicitud), quedará directamente en **Creada** (no pasa por aprobación). En el detalle de una solicitud en estado Creada **no** verá el botón «Asignar a personal»; verá el mensaje «No hay más acciones» en ese caso.
- Cuando una solicitud esté **Completada** y usted sea quien pueda valorar, podrá **Valorar** el servicio (puntuación y comentario).

**En resumen:** Aprobar o rechazar solicitudes pendientes → Crear solicitudes si lo necesita → Valorar cuando corresponda. No asigna trabajadores ni gestiona catálogos ni usuarios (eso es del Super Administrador).

---

### Si usted es **Super Administrador** (Super Admin)

Tiene **acceso completo** al sistema: todas las solicitudes de todas las empresas, todos los catálogos (Empresas, Sitios, Categorías, Subcategorías) y la administración (Perfiles, Personas, Usuarios).

- **Menú:** verá Principal, **Catálogos** y **Admin** (el Administrador de empresa no ve estos menús).
- **Solicitudes:** puede ver todas las solicitudes de todas las empresas. Solo usted puede **Asignar a personal** cuando una solicitud está en estado Creada: abra la solicitud, pulse «Asignar a personal», elija el trabajador y guarde. Ese trabajador recibirá un correo y verá la solicitud en «Asignadas a mí».
- **Empresas (Catálogos):** además de crear/editar empresas, en cada empresa puede abrir **Aprobadores** para agregar o quitar usuarios como aprobadores (perfil Administrador de empresa). Así se define si las solicitudes creadas por Workers de esa empresa pasan por «Pendiente de aprobación» o van directo a «Creada».
- **Admin:** gestiona Perfiles, Personas y Usuarios. En **Inicio** verá el **panel de estadísticas** (gráficos por estado, prioridad, empresa/sitio, valoraciones por trabajador) para distintos períodos.

**En resumen:** Visión global del sistema, asignación de trabajadores a solicitudes, gestión de aprobadores por empresa y control total de configuración y usuarios.

---

## 9. Resumen rápido por perfil

| Perfil        | Menú que ve | Qué ve en Solicitudes | Qué hace en el día a día |
|---------------|-------------|------------------------|---------------------------|
| **Solicitante (Requester)** | Solo Principal (Inicio, Solicitudes, Nueva solicitud) | Solo sus propias solicitudes | Crear solicitudes (quedan en Pendiente de aprobación) y valorar cuando estén completadas. |
| **Personal (Worker)** | Solo Principal | Solo las asignadas a usted (+ puede crear solicitudes) | Atender las asignadas: «En tránsito» y «Completada». No valora. |
| **Administrador de empresa (Company Admin)** | Solo Principal (no Catálogos ni Admin) | Todas las de su empresa | Aprobar/rechazar solicitudes pendientes. Crear solicitudes (quedan en Creada). Valorar cuando corresponda. No asigna trabajadores. |
| **Super Administrador** | Principal + Catálogos + Admin | Todas las solicitudes y estadísticas | Asignar trabajadores a solicitudes Creadas, gestionar aprobadores por empresa, catálogos, perfiles, personas y usuarios. |

---

## 10. Soporte

Para incidencias o solicitud de acceso, contacte al administrador de su empresa o a MG Services Unlimited.

**Aplicación:** https://request.mgservicesunlimited.com  
**API:** https://api.mgservicesunlimited.com
