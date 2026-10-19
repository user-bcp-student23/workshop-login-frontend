# Hallazgos del frontend

## Alcance y criterio

Revision estatica limitada a este repositorio, sin cambios de codigo. Esta matriz
es el unico registro de seguimiento; debe actualizarse aqui, hallazgo por hallazgo,
durante el refactor. El mapa de componentes, dependencias y flujo observado esta en
[docs/ENDPOINTS.md](docs/ENDPOINTS.md).

Las referencias usan lineas de los archivos originales, antes de refactorizar.
La severidad prioriza el riesgo potencial y el impacto funcional, no acredita
explotabilidad. **Pendiente** significa pendiente de tratamiento, no pendiente de
confirmar la presencia del patron descrito. Una ausencia se registraria como
**No encontrado**, sin inventar evidencia.

## Matriz de seguimiento

| id | hallazgo | tipo | explicacion | evidencia (archivo:linea) | severidad | estado |
|---|---|---|---|---|---|---|
| H-01 | Token de sesion persistido en `localStorage` | Vulnerabilidad | **Resuelto:** sesion centralizada en `sessionStorage`, limpieza legacy y preferencias conservadas; mitigacion de persistencia, no de XSS. [Diff propio](EVIDENCIAS/continuacion-JP/H-01.diff), [suite 118/118](EVIDENCIAS/continuacion-JP/suite-cierre.txt) y [navegador con bloqueos autorizados por JP corregidos](EVIDENCIAS/continuacion-JP/navegador-final.txt). | [src/app/services/session.service.ts](src/app/services/session.service.ts); [src/app/services/session.service.spec.ts](src/app/services/session.service.spec.ts); [src/app/auth-tasks-flow.spec.ts](src/app/auth-tasks-flow.spec.ts) | alta | Resuelto |
| H-02 | Dependencia directa `axios 0.31.0` en las llamadas HTTP | Sugerencia | La version declarada se usaba para autenticar y consultar tareas. **Resuelto:** `npm audit` reporto avisos de severidad alta para la version; se retiro Axios y ambas llamadas se migraron a servicios con `HttpClient` de Angular, sin agregar dependencias y conservando los contratos. La auditoria aun reporta vulnerabilidades de otras dependencias, fuera del alcance de H-02. | [package.json:13](package.json#L13); [src/app/services/auth.service.ts:13](src/app/services/auth.service.ts#L13); [src/app/services/tasks.service.ts:14](src/app/services/tasks.service.ts#L14) | media | Resuelto |
| H-03 | Dependencia directa `lodash 4.17.21` y uso de `merge` | Sugerencia | **Resuelto:** Lodash actualizado a 4.18.1 sin cambiar `merge` ni otras versiones; caracterizacion [10/10 antes](EVIDENCIAS/continuacion-JP/H03-caracterizacion-antes.txt) y [10/10 despues](EVIDENCIAS/continuacion-JP/H03-caracterizacion-despues.txt), [diff propio](EVIDENCIAS/continuacion-JP/H-03.diff). [Auditoria](EVIDENCIAS/continuacion-JP/H03-audit-despues.json) sin Lodash; persisten 25 vulnerabilidades ajenas. | [package.json:19](package.json#L19); [package-lock.json](package-lock.json); [src/app/login/login-preferences.spec.ts](src/app/login/login-preferences.spec.ts) | media | Resuelto |
| H-04 | Mensaje dinamico construido como HTML y mostrado con `[innerHTML]` | Refactor | El usuario ingresado y el mensaje del error se concatenan con marcado HTML. Texto no confiable puede interpretarse como marcado permitido y alterar la presentacion del error. Angular sanitiza este binding; no se observa una omision de esa proteccion ni se confirma XSS explotable. | [src/app/login/login.component.ts:57](src/app/login/login.component.ts#L57); [src/app/login/login.component.html:39](src/app/login/login.component.html#L39) | media | Pendiente |
| H-05 | Componentes acoplados al almacenamiento de sesion y la navegacion | Refactor | La separacion de H-02 retiro HTTP y URLs de los componentes; estos aun acceden directamente a `localStorage` y coordinan navegacion. Centralizar la sesion evitaria que el almacenamiento y su limpieza dependan de cada componente y facilitaria probar el flujo completo. | [src/app/login/login.component.ts:48](src/app/login/login.component.ts#L48); [src/app/login/login.component.ts:51](src/app/login/login.component.ts#L51); [src/app/dashboard/dashboard.component.ts:37](src/app/dashboard/dashboard.component.ts#L37); [src/app/dashboard/dashboard.component.ts:63](src/app/dashboard/dashboard.component.ts#L63); [src/app/dashboard/dashboard.component.ts:65](src/app/dashboard/dashboard.component.ts#L65) | media | Pendiente |
| H-06 | Uso de `any` en estado, tareas y utilidad | Refactor | Aunque login y tareas ahora tienen tipos de request y response en los servicios, el estado de los componentes y la utilidad de formato siguen usando `any`. Esto reduce la deteccion estatica de errores al filtrar o presentar tareas y al manejar el estado de la UI. | [src/app/login/login.component.ts:17](src/app/login/login.component.ts#L17); [src/app/login/login.component.ts:21](src/app/login/login.component.ts#L21); [src/app/dashboard/dashboard.component.ts:24](src/app/dashboard/dashboard.component.ts#L24); [src/app/dashboard/dashboard.component.ts:45](src/app/dashboard/dashboard.component.ts#L45); [src/app/dashboard/dashboard.component.ts:52](src/app/dashboard/dashboard.component.ts#L52); [src/app/utils/legacy-format.ts:1](src/app/utils/legacy-format.ts#L1) | media | Pendiente |
| H-07 | Pruebas de flujo y reglas de negocio | Sugerencia | **Resuelto:** se agregaron pruebas de caracterizacion para login, dashboard, contratos de ambos servicios HTTP, errores y arranque. `npm run test:coverage` informa 86.95% de cobertura global y mas de 85% en los componentes y servicios modificados. | [src/app/login/login.component.spec.ts:25](src/app/login/login.component.spec.ts#L25); [src/app/dashboard/dashboard.component.spec.ts:24](src/app/dashboard/dashboard.component.spec.ts#L24); [src/app/services/auth.service.spec.ts:7](src/app/services/auth.service.spec.ts#L7); [src/app/services/tasks.service.spec.ts:7](src/app/services/tasks.service.spec.ts#L7); [src/main.spec.ts:12](src/main.spec.ts#L12) | media | Resuelto |
| H-08 | Condicionales anidados en `login()` | Refactor | La validacion del usuario contiene la de la contrasena, y ambas envuelven la llamada HTTP y la validacion del token. Esta profundidad hace mas facil modificar una rama olvidando un mensaje o el estado `busy`. | [src/app/login/login.component.ts:34](src/app/login/login.component.ts#L34); [src/app/login/login.component.ts:37](src/app/login/login.component.ts#L37); [src/app/login/login.component.ts:38](src/app/login/login.component.ts#L38); [src/app/login/login.component.ts:47](src/app/login/login.component.ts#L47) | baja | Pendiente |
| H-09 | Duplicacion de la regla de campos vacios y de claves de sesion | Refactor | Usuario y contrasena repiten la comprobacion de null, undefined y texto vacio. La clave del token se repite al escribirlo, leerlo y borrarlo. Cambiar una sola copia puede producir validaciones inconsistentes o una sesion que no se recupere o elimine correctamente. Se confirman expresiones y literales repetidos, no un bloque completo identico entre componentes. | [src/app/login/login.component.ts:34](src/app/login/login.component.ts#L34); [src/app/login/login.component.ts:37](src/app/login/login.component.ts#L37); [src/app/login/login.component.ts:48](src/app/login/login.component.ts#L48); [src/app/dashboard/dashboard.component.ts:37](src/app/dashboard/dashboard.component.ts#L37); [src/app/dashboard/dashboard.component.ts:63](src/app/dashboard/dashboard.component.ts#L63) | baja | Pendiente |

## Correspondencia con el reto y limites de evidencia

- Dependencias: H-02 y H-03.
- Seguridad, token en `localStorage`: H-01.
- Seguridad, mensaje dinamico con `[innerHTML]`: H-04. Se clasifica como refactor
  porque la presencia del binding no demuestra una vulnerabilidad XSS.
- Arquitectura: H-05.
- Calidad, `any`, anidamiento y duplicacion: H-06, H-08 y H-09.
- Testing: H-07.

Todos los patrones de la tabla de [RETO.md](RETO.md) tienen evidencia en el codigo;
no fue necesario marcar ninguno como **No encontrado**. La existencia de las
versiones sembradas no demuestra por si sola que tengan CVEs explotables.
H-02 y H-03 se priorizan como analisis pendiente, no como vulnerabilidades
confirmadas.

No se ejecuto `npm audit`, ni pruebas, ni medicion de cobertura, ni llamadas a
backends. No se verificaron expiracion o revocacion del token, autorizacion real
del filtro `owner`, CORS ni esquemas internos de los servicios externos.
No se inspeccionaron otros componentes del workspace.
